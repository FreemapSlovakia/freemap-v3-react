import type { ReactNode } from 'react';
import type { PanoramaLook } from '../model/settingsReducer.js';

export type PanoramaMessages = {
  /** Shown in the empty panel, before anywhere has been picked. */
  pickHint: string;
  rendering: string;
  /** Said while a wait runs longer than the tier usually takes. */
  slow: string;
  /** Said when the last render had to queue behind others. */
  busy: string;
  cancel: string;
  /** Renders what the moved viewpoint and changed settings now ask for. */
  update: string;
  /** Says the picture no longer answers for what the controls say. */
  outdated: string;
  /** The button that stands the viewer on the user's own position. */
  locate: string;
  /** The set-once settings, which all cost a render to change. */
  settings: {
    title: string;
    eye: string;
    /** Says what the height is measured from, and that it is not the elevation. */
    eyeHint: string;
    /** Says what the vertical band is, which its name alone does not. */
    tiltHint: string;
    /** The vertical band given as its two angles rather than by name. */
    custom: string;
    look: string;
    /** One per `PANORAMA_LOOKS`, so adding a look without a name won't compile. */
    looks: Record<PanoramaLook, string>;
    ridgeStrength: string;
    ridgeWidth: string;
    ridgeColor: string;
    groundColor: string;
  };
  /** Marks the fast pass while the detailed one is still rendering. */
  preview: string;
  /** Where the eye stands, metres above sea level. */
  eyeElevation: string;
  quality: {
    label: string;
    /** Coarsest to finest; everything past the first is premium's. */
    superfast: string;
    fast: string;
    standard: string;
    detailed: string;
    finest: string;
    /** Why the finer tiers are premium's. */
    premiumHint: string;
  };
  tilt: {
    label: string;
    standard: string;
    wide: string;
    flat: string;
  };
  labels: {
    /** Names the menu the two sliders share. */
    title: string;
    /** How many names fit — a count, beside the dominance threshold. */
    density: string;
    /** The choice that turns them off altogether. */
    none: string;
    few: string;
    normal: string;
    many: string;
  };
  dominance: {
    /** Names the control: how much a summit must stand out to be named. */
    label: string;
    /** The step that filters nothing. */
    all: string;
  };
  autoPan: string;
  fullscreen: string;
  /**
   * What a picked summit says, in two halves so each place can put them where
   * it has room: the panel's footer runs them along one line, the map marker's
   * tooltip stacks them.
   */
  peak: {
    /** Its name, with its elevation where the terrain model knows one. */
    title: (params: { name: string; ele: string | null }) => ReactNode;
    /** How far off it stands, and which way. */
    figures: (params: { distance: string; azimuth: string }) => ReactNode;
  };
  errors: {
    offline: string;
    /** The request never reached the server, and the browser is not offline. */
    unreachable: string;
    busy: string;
    tooMany: string;
    noData: string;
    failed: string;
  };
  caveats: {
    title: string;
    /** The big one: the terrain model has no trees or buildings on it. */
    bareEarth: string;
    coverage: string;
    viewpoint: string;
  };
  /** Credits the terrain models the picture was rendered from. */
  terrainSource: string;
};
