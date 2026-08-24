import type { ReactNode } from 'react';
import type { PanoramaLook } from '../model/settingsReducer.js';

export type PanoramaMessages = {
  /**
   * Shown in the empty panel, before anywhere has been picked. The button's
   * icon is passed in rather than named, so a locale needs no imports.
   */
  pickHint: (params: { icon: ReactNode }) => ReactNode;
  rendering: string;
  /** Said while the render waits its turn; `ahead` is how many go first. */
  queued: (params: { ahead: number }) => string;
  cancel: string;
  /** Renders what the moved viewpoint and changed settings now ask for. */
  update: string;
  /** Says the picture no longer answers for what the controls say. */
  outdated: string;
  /** The button that stands the viewer on the user's own position. */
  locate: string;
  /** Its other way round: hand the map over to a click that says where. */
  pickViewpoint: string;
  /** Title of the toolbar that owns the map while that click is awaited. */
  pickViewpointPrompt: string;
  /** Turns the picture into a toposcope: its viewpoint, its names as rays. */
  createToposcope: string;
  /** Asked when that would land the summits among drawings already on the map. */
  toposcopeMergeModal: {
    title: string;
    message: string;
    append: string;
    replace: string;
  };
  /** The set-once settings, which all cost a render to change. */
  settings: {
    title: string;
    /** Says what the vertical band is, which its name alone does not. */
    tiltHint: string;
    /** The vertical band given as its two angles rather than by name. */
    custom: string;
    /** Raises far terrain, unfolding the distance the projection compresses. */
    depthLift: string;
    /** The step that leaves the view true. */
    depthLiftOff: string;
    /** Says what it buys, and that it draws what cannot actually be seen. */
    depthLiftHint: string;
    /** The gem's tooltip: what a farther view costs, and why it is premium's. */
    rangeHint: string;
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
    /** Names the menu the four sliders share. */
    title: string;
    /** How many names fit — a count, beside the dominance threshold. */
    density: string;
    /** The choice that turns them off altogether. */
    none: string;
    few: string;
    normal: string;
    many: string;
    /** What the rank measures: a summit's real size, or how big it looks. */
    weight: string;
    weightHint: string;
    /** One per `LABEL_DISTANCE_WEIGHTS`, so a step without a name won't compile. */
    weights: readonly [string, string, string, string, string];
    /** How far a name has to carry before haze outweighs the summit. */
    haze: string;
    /** The step with no falloff and no cut. */
    hazeOff: string;
    hazeHint: string;
    /** Whether summits only the unfolding brings into view are named at all. */
    showRevealed: string;
    /** Says what such a summit is, and how its name is marked. */
    showRevealedHint: string;
  };
  dominance: {
    /** Names the control: how much a summit must stand out to be named. */
    label: string;
    /** The step that filters nothing. */
    all: string;
  };
  autoPan: string;
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
    /** Said only while the picture is unfolded, which it takes back. */
    depthLift: string;
  };
  /** Credits the terrain models the picture was rendered from. */
  terrainSource: string;
};
