let timers: Map<
  number,
  { repeat: boolean; fn: Function; ms: number; exp: number }
> | null;

class CoroutineTimerError extends Error {
  constructor() {
    super();
    this.name = 'CoroutineTimerError';
    this.message =
      'Cannot call coroutine timer functions outside of coroutines.';
  }
}

const nextTimerId = (function () {
  let _i = 0;
  return function () {
    return _i++;
  };
})();

export function crClearTimeout(handle: number) {
  if (!timers) {
    throw new CoroutineTimerError();
  }
  return timers.delete(handle);
}
export const crClearInterval = crClearTimeout;

export function crTimeout(fn: Function, ms: number) {
  if (!timers) {
    throw new CoroutineTimerError();
  }
  // TODO: Use world time?
  const now = performance.now();
  const handle = nextTimerId();
  timers.set(handle, { repeat: false, fn, ms, exp: now + ms });
  return handle;
}

export function crInterval(fn: Function, ms: number) {
  if (!timers) {
    throw new CoroutineTimerError();
  }
  const now = performance.now();
  const handle = nextTimerId();
  timers.set(handle, { repeat: true, fn, ms, exp: now + ms });
  return handle;
}

const nextFramePromise = Promise.resolve();
export function crNextFrame() {
  return nextFramePromise;
}

function isPromise(p: any) {
  return p.__proto__ === Promise.prototype;
}

export function coroutine(iter: Generator<Promise<any>>, rollbacks?: any[]) {
  let waiting = false;
  let doThrow = false;
  let nextValue;

  const _timers = new Map();

  const i = (function* () {
    while (true) {
      const now = performance.now();
      _timers.forEach(({ repeat, fn, ms, exp }, handle) => {
        if (now > exp) {
          fn();
          if (repeat) {
            // TODO: Do not create new object every time
            _timers.set(handle, { repeat, fn, exp: exp + ms, ms });
          } else {
            _timers.delete(handle);
          }
        }
      });

      if (waiting) {
        yield;
        continue;
      }
      timers = _timers;
      const v = doThrow ? iter.throw(nextValue) : iter.next(nextValue);
      const done = v.done;
      let value = v.value;

      doThrow = false;
      timers = null;
      if (done) {
        return value;
      }

      if (isCancelablePromise(value) && rollbacks) {
        rollbacks.push(value.rollback);
        value = value.promise;
      }

      if (isPromise(value)) {
        waiting = true;
        value
          .then((v: any) => {
            waiting = false;
            nextValue = v;
          })
          .catch((e: any) => {
            waiting = false;
            doThrow = true;
            nextValue = e;
          });
      } else {
        console.error(
          `Coroutine yielded value that was not a promise or cancelable.`,
          value,
          iter,
        );
        throw new Error(
          `Coroutine yielded value that was not a promise or cancelable.`,
        );
      }
    }
  })();
  return function () {
    return i.next();
  };
}

// TODO Write a better type for coroutine
type Coroutine = () => IteratorResult<undefined, any>;
// TODO: A better type for this
type RollbackFunction = () => void;
export type ClearFunction = () => void;
type JobStartCallback = (
  clearRollbacks: ClearFunction,
  abortSignal: AbortSignal,
) => Generator<Promise<any> | CancelablePromise<any>, any, any>;
export type Job = {
  coroutine?: Coroutine;
  startCallback: JobStartCallback;
  abortController: AbortController;
  rollbacks: RollbackFunction[];
};

export class JobRunner<T> {
  jobs = new Map<T, Job>();

  add(key: T, startCallback: JobStartCallback) {
    if (this.jobs.has(key)) {
      throw new Error(`Job already exists for key ${key}`);
    }
    this.jobs.set(key, {
      startCallback,
      abortController: new AbortController(),
      rollbacks: [],
    });
  }

  has(key: T) {
    return this.jobs.has(key);
  }

  stop(key: T) {
    const job = this.jobs.get(key);
    if (!job) return false;
    job.abortController.abort();
    for (let i = job.rollbacks.length - 1; i >= 0; i--) {
      job.rollbacks[i]();
    }
    this.jobs.delete(key);
    return true;
  }

  tick() {
    this.jobs.forEach((job, eid) => {
      if (!job.coroutine) {
        const clearRollbacks = () => {
          job.rollbacks.length = 0;
        };
        job.coroutine = coroutine(
          job.startCallback(clearRollbacks, job.abortController.signal),
          job.rollbacks,
        );
      }

      if (job.coroutine!().done) {
        this.jobs.delete(eid);
      }
    });
  }
}

const $rollbackSymbol = Symbol('rollback');
class CancelablePromise<T> {
  promise: Promise<T>;
  rollback: RollbackFunction;
  $rollback = $rollbackSymbol;
  constructor(promise: Promise<T>, rollback: RollbackFunction) {
    this.promise = promise;
    this.rollback = rollback;
  }
}

export function isCancelablePromise<T>(c: any): c is CancelablePromise<T> {
  return c.$rollback === $rollbackSymbol;
}

export function withRollback<T>(
  promise: Promise<T>,
  rollback: RollbackFunction,
) {
  return new CancelablePromise(promise, rollback);
}
