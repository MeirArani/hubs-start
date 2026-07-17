// TODO: Sanity check this

interface Binding {
  event: string;
  ref: number;
  callback: (payload: any) => void;
}

export function emitter() {
  let bindings: Binding[] = [];
  let bindingRef = 0;
  const on = (event: string, callback: (payload: any) => void) => {
    const ref = bindingRef++;
    bindings.push({ event, ref, callback });
    return ref;
  };
  const off = (event: string, ref?: number) => {
    bindings = bindings.filter((bind) => {
      return !(
        bind.event === event &&
        (typeof ref === 'undefined' || ref === bind.ref)
      );
    });
  };
  const trigger = (event: string, payload: any) => {
    bindings
      .filter((bind) => bind.event === event)
      .forEach((bind) => {
        bind.callback(payload);
      });
  };
  const getBindings = () => {
    return bindings;
  };
  return {
    on,
    off,
    trigger,
    getBindings,
  };
}
