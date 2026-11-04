/**
 * Whether a dropdown menu is open. Asked of the menu, not of
 * `[aria-expanded=true]`, which an accordion's open section carries too — and
 * keeps inside a modal hidden for a pick on the map.
 */
export function isDropdownOpen(): boolean {
  return document.querySelector('.dropdown-menu.show') !== null;
}
