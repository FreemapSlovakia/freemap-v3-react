import type { ReactElement } from 'react';
import {
  MdForkLeft,
  MdForkRight,
  MdMerge,
  MdRampLeft,
  MdRampRight,
  MdRoundaboutLeft,
  MdRoundaboutRight,
  MdStraight,
  MdTripOrigin,
  MdTurnLeft,
  MdTurnRight,
  MdTurnSharpLeft,
  MdTurnSharpRight,
  MdTurnSlightLeft,
  MdTurnSlightRight,
  MdUTurnLeft,
} from 'react-icons/md';
import type { Maneuver } from '../model/maneuvers.js';

/**
 * The glyph of a turn-by-turn maneuver; `left` picks the hand where both are
 * drawn. A bare react-icons element, as `RichMarker` wants its `faIcon`.
 */
export function maneuverIcon(maneuver: Maneuver, left: boolean): ReactElement {
  switch (maneuver) {
    case 'depart':
      return <MdTripOrigin />;
    case 'continue':
    case 'straight':
      return <MdStraight />;
    case 'left':
      return <MdTurnLeft />;
    case 'right':
      return <MdTurnRight />;
    case 'slightLeft':
      return <MdTurnSlightLeft />;
    case 'slightRight':
      return <MdTurnSlightRight />;
    case 'sharpLeft':
      return <MdTurnSharpLeft />;
    case 'sharpRight':
      return <MdTurnSharpRight />;
    case 'uturn':
      return <MdUTurnLeft />;
    case 'keepLeft':
      return <MdForkLeft />;
    case 'keepRight':
      return <MdForkRight />;
    case 'merge':
      return <MdMerge />;
    case 'rampOn':
    case 'rampOff':
      return left ? <MdRampLeft /> : <MdRampRight />;
    case 'roundabout':
    case 'exitRoundabout':
      return left ? <MdRoundaboutLeft /> : <MdRoundaboutRight />;
  }
}
