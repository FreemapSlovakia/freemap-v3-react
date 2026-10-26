import { Text } from '@features/l10n/Text.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useMemo } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerChangeTransport } from '../model/actions.js';
import {
  legTransports,
  sectionBounds,
  sectionCount,
  type TransportScope,
} from '../model/legTransports.js';
import { multimodalEditingSelector } from '../model/reducer.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';
import { RoutePlannerToggleButton } from './RoutePlannerToggleButton.js';
import { RoutePlannerTransportType } from './RoutePlannerTransportType.js';

type Scope = Extract<TransportScope, { leg: number }>['type'];

export default function RouteLegSelection(): ReactElement | undefined | false {
  const id = useAppSelector((state) =>
    state.main.selection?.type === 'route-leg'
      ? state.main.selection.id
      : undefined,
  );

  const points = useAppSelector((state) => state.routePlanner.points);

  const transportType = useAppSelector(
    (state) => state.routePlanner.transportType,
  );

  const canBeManual = useAppSelector(
    (state) =>
      state.main.selection?.type === 'route-leg' &&
      state.routePlanner.mode === 'route',
  );

  const rpm = useRoutePlannerMessages();

  const dispatch = useDispatch();

  const legs = useMemo(
    () => legTransports(points, transportType),
    [points, transportType],
  );

  // A leg leaving an absent point has nowhere to store a transport.
  const transport = id === undefined || !points[id] ? undefined : legs[id];

  // The transports are premium only, so is choosing what they apply to.
  const multimodal = useAppSelector(multimodalEditingSelector);

  const scopes = useMemo(() => {
    if (!multimodal || id === undefined || transport === undefined) {
      return [];
    }

    const [from, to] = sectionBounds(legs, id);

    const options: [Scope, ReactElement][] = [
      ['leg', <Text key="leg" m={rpm} k="transportScope.leg" />],
    ];

    if (from < to) {
      options.push([
        'section',
        <Text key="section" m={rpm} k="transportScope.section" />,
      ]);
    }

    if (sectionCount(legs, transport) > 1) {
      options.push([
        'same-transport',
        <Text key="same" m={rpm} k="transportScope.sameTransport" />,
      ]);
    }

    return options;
  }, [multimodal, id, legs, transport, rpm]);

  return (
    id !== undefined &&
    transport && (
      <Selection
        control={<RoutePlannerToggleButton />}
        icon={<FaMapMarkerAlt />}
        label={rpm?.leg}
      >
        {canBeManual && (
          <RoutePlannerTransportType
            premiumOnly
            value={transport}
            scopes={scopes}
            defaultScope="leg"
            onChange={(transport, scope = 'leg') => {
              if (scope !== 'leg') {
                trackMatomo([
                  'trackEvent',
                  'RoutePlanner',
                  'transportScope',
                  scope,
                ]);
              }

              dispatch(
                routePlannerChangeTransport({
                  transport,
                  scope: { type: scope, leg: id },
                }),
              );
            }}
          />
        )}
      </Selection>
    )
  );
}
