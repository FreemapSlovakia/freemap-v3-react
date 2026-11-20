import type { TransportTypeMsgKey } from '@shared/transportTypeDefs.js';
import type { JSX } from 'react';
import type { RoutingMode } from '../model/actions.js';
import type { Maneuver } from '../model/maneuvers.js';

type Err = { err: string };

export type RoutePlannerMessages = {
  /** Which legs a transport chosen in the transport menu applies to. */
  transportScope: {
    title: string;
    route: string;
    /** The trailing run of legs sharing a transport. */
    lastSection: string;
    /** Legs added from now on, leaving the drawn ones. */
    next: string;
    leg: string;
    /** The run of neighbouring legs sharing the selected leg's transport. */
    section: string;
    /** Every leg sharing the selected leg's transport. */
    sameTransport: string;
  };
  leg: string;
  manualTooltip: string;
  ghParams: {
    tripParameters: string;
    seed: string;
    distance: string;
    isochroneParameters: string;
    buckets: string;
    timeLimit: string;
    distanceLimit: string;
    reverseFlow: string;
    reverseFlowHint: string;
  };
  milestones: string;
  /** The milestone setting's third state, beside the km and % ones. */
  milestonesOff: string;
  /** Discards the route a saved map carried and asks the router again. */
  recompute: string;
  /** How many routes to ask for — a ceiling, not a promise. */
  maxAlternatives: string;
  style: {
    menuItem: string;
    title: string;
    lineWidth: string;
    lineOpacity: string;
    markerOpacity: string;
  };
  optimize: {
    label: string;
    fixedStart: string;
    fixedStartEnd: string;
    roundtrip: string;
    free: string;
  };
  start: string;
  stop: string;
  finish: string;
  swap: string;
  point: {
    point: string;
    pick: string;
    current: string;
    fromStart: string;
    fromFinish: string;
  };
  itinerary: {
    title: string;
    /** The toolbar's button opening the panel, whatever its view. */
    button: string;
    /** The panel's other view. */
    weather: string;
    /** The weather view without a departure. */
    noDeparture: string;
  };
  turnByTurn: {
    label: string;
    maneuvers: Record<Maneuver, string>;
  };
  shaping: {
    label: string;
    hint: string;
    turnsBack: string;
  };
  /** A waypoint's stop: a pause, or nights spent there. */
  waypointStop: {
    label: string;
    none: string;
    pause: string;
    overnight: string;
    /** After the pause's length. */
    minutes: string;
    continueAt: string;
    nights: string;
  };
  transportType: Record<TransportTypeMsgKey, string>;
  transportTypeLabel: string;
  development: string;
  mode: Record<RoutingMode | 'routndtrip-gh', string>;
  modeLabel: string;
  alternative: string;
  /** Singular label of one isochrone ring, numbered in exports. */
  isochroneRing: string;
  distance: ({ value, diff }: { value: string; diff?: string }) => JSX.Element;
  /** How much of the route runs on road the driver pays for. */
  tolled: ({ value }: { value: string }) => JSX.Element;
  /** The whole trip with its waypoints' stops, `duration` already formatted. */
  withStops: ({ duration }: { duration: string }) => JSX.Element;
  /** At the finish or a waypoint, from the set departure. */
  arrival: ({ time }: { time: string }) => JSX.Element;
  /** From the start, or on from a stop. */
  departure: ({ time }: { time: string }) => JSX.Element;
  departureLabel: string;
  /** In place of the field while there is no departure. */
  departureOff: string;
  /** What the departure's toggle being off means. */
  departureHint: string;
  /** The start menu's item selecting the start, where it is set. */
  departureTime: string;
  /** `value` and `diff` already formatted. */
  duration: ({ value, diff }: { value: string; diff?: string }) => JSX.Element;
  showMidpointHint: string;
  gpsError: string;
  routeNotFound: string;
  fetchingError: (props: Err) => string;
};
