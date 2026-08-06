export default function nextTick() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}
