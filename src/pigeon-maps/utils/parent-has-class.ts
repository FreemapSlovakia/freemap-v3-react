export default function parentHasClass(
  element: Element | null,
  className: string,
) {
  while (element) {
    if (element.classList && element.classList.contains(className)) {
      return true;
    }
    element = element instanceof HTMLElement ? element.offsetParent : null;
  }

  return false;
}
