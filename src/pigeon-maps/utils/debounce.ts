export default function debounce(func: () => void, wait: number) {
  let timeout: number;
  return function(...args: any[]) {
    // eslint-disable-next-line
    const context = this;
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(context, args), wait);
  };
}
