const qs = new URLSearchParams(location.search);

export function qsTruthy(param: string) {
  const val = qs.get(param);
  if (!val) return false;
  // if the param exists but is not set (e.g. "?foo&bar"), its value is the empty string.
  return val === '' || /1|on|true|yes/i.test(val);
}

export function qsGet(param: string) {
  return qs.get(param);
}
