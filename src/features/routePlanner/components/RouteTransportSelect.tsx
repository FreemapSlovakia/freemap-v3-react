import { Text } from '@features/l10n/Text.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  routePlannerChangeTransport,
  routePlannerSetTransportType,
} from '../model/actions.js';
import {
  lastSection,
  legTransports,
  type TransportScope,
} from '../model/legTransports.js';
import {
  directLegsSelector,
  multimodalEditingSelector,
} from '../model/reducer.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

type Scope = Exclude<TransportScope, { leg: number }>['type'];

/** The toolbar's transport: the one the next added leg takes. */
export function RouteTransportSelect(): ReactElement {
  const dispatch = useDispatch();

  const rpm = useRoutePlannerMessages();

  const transportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const points = useAppSelector((state) => state.routePlanner.points);

  const multimodal = useAppSelector(multimodalEditingSelector);

  const directLegs = useAppSelector(directLegsSelector);

  const scopes = useMemo(() => {
    const legs = legTransports(points, transportType);

    if (!multimodal || legs.length === 0) {
      return undefined;
    }

    const [from] = lastSection(legs, transportType) ?? [legs.length];

    const options: [Scope, ReactElement][] = [
      ['route', <Text key="route" m={rpm} k="transportScope.route" />],
    ];

    if (from > 0 && from < legs.length) {
      options.push([
        'last-section',
        <Text key="last" m={rpm} k="transportScope.lastSection" />,
      ]);
    }

    options.push(['next', <Text key="next" m={rpm} k="transportScope.next" />]);

    const initial: Scope =
      from === 0 ? 'route' : from === legs.length ? 'next' : 'last-section';

    return { options, initial };
  }, [points, transportType, multimodal, rpm]);

  return (
    <RoutePlannerTransportType
      value={transportType}
      scopes={scopes?.options}
      defaultScope={scopes?.initial}
      shiftForManual={directLegs}
      onChange={(transport, scope) => {
        if (scope) {
          trackMatomo(['trackEvent', 'RoutePlanner', 'transportScope', scope]);

          dispatch(
            routePlannerChangeTransport({ transport, scope: { type: scope } }),
          );
        } else {
          dispatch(routePlannerSetTransportType(transport));
        }
      }}
    />
  );
}
