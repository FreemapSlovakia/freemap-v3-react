/** Below it the tools' features count as hidden: warned about, not persisted. */
const HIDDEN_BELOW = 0.2;

export const areFeaturesHidden = (opacity: number) => opacity < HIDDEN_BELOW;

/** What Shift+D switches to: shown from faint, hidden from visible. */
export const toggledFeaturesOpacity = (opacity: number) =>
  opacity < 0.5 ? 1 : 0;
