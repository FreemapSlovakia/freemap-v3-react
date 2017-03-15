export function setActivePopup(activePopup) {
  return { type: 'SET_ACTIVE_POPUP', activePopup };
}
export function closePopup() {
  return { type: 'CLOSE_POPUP' };
}