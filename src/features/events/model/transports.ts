import {
  type TransportType,
  type TransportTypeMsgKey,
  transportTypeDefs,
} from '@shared/transportTypeDefs.js';
import type { ReactElement } from 'react';

/**
 * What an event says it suits: a kind of transport (`bike`, `hiking`), not a
 * router's profile — several routers' variants of one share a kind.
 */
export const TRANSPORT_KINDS: {
  kind: TransportTypeMsgKey;
  icon: ReactElement;
}[] = [
  ...new Map(
    Object.values(transportTypeDefs)
      // `manual` draws straight lines; no way of travelling.
      .filter((def) => !def.hidden && def.msgKey !== 'manual')
      .map((def) => [def.msgKey, { kind: def.msgKey, icon: def.icon }]),
  ).values(),
];

/** The kind a route planner's transport type is. */
export const kindOf = (type: string): TransportTypeMsgKey | undefined =>
  transportTypeDefs[type as TransportType]?.msgKey;

export const iconOfKind = (kind: string): ReactElement | undefined =>
  TRANSPORT_KINDS.find((k) => k.kind === kind)?.icon;
