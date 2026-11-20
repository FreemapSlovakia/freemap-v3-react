import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaBan, FaBed, FaMugHot } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { routePlannerSetStop } from '../model/actions.js';
import { routePremiumUnlockedSelector } from '../model/reducer.js';
import { type RouteStop, RouteStopSchema } from '../model/schedule.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

const DEFAULT_STOPS: Record<RouteStop['kind'], RouteStop> = {
  pause: { kind: 'pause', minutes: 30 },
  overnight: { kind: 'overnight', resume: '08:00', nights: 1 },
};

/**
 * The stop at an inner waypoint, with its length or its nights. Premium to set
 * or change; a shared route's stops stay as they came, and anyone may remove
 * one.
 */
export function RouteStopControl({
  index,
  stop,
}: {
  index: number;
  stop: RouteStop | undefined;
}): ReactElement {
  const dispatch = useDispatch();

  const rpm = useRoutePlannerMessages();

  const unlocked = useAppSelector(routePremiumUnlockedSelector);

  const becomePremium = useBecomePremium();

  const set = (next: unknown) => {
    const parsed = RouteStopSchema.safeParse(next);

    if (parsed.success) {
      dispatch(routePlannerSetStop({ index, stop: parsed.data }));
    }

    return parsed.success;
  };

  if (!unlocked) {
    return (
      <>
        <Button variant="secondary" onClick={becomePremium}>
          <FaMugHot /> {rpm?.waypointStop.label} <PremiumGem nested />
        </Button>

        {stop && (
          <Button
            variant="secondary"
            onClick={() => dispatch(routePlannerSetStop({ index, stop: null }))}
          >
            <FaBan /> {rpm?.waypointStop.none}
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      <SelectDropdown
        value={stop?.kind ?? 'none'}
        name={rpm?.waypointStop.label}
        breakpoint="sm"
        onSelect={(kind) => {
          trackMatomo(['trackEvent', 'RoutePlanner', 'stop', kind ?? 'none']);

          dispatch(
            routePlannerSetStop({
              index,
              stop:
                kind === 'pause' || kind === 'overnight'
                  ? DEFAULT_STOPS[kind]
                  : null,
            }),
          );
        }}
        options={[
          { value: 'none', label: rpm?.waypointStop.none, icon: <FaBan /> },
          {
            value: 'pause',
            label: rpm?.waypointStop.pause,
            icon: <FaMugHot />,
          },
          {
            value: 'overnight',
            label: rpm?.waypointStop.overnight,
            icon: <FaBed />,
          },
        ]}
      />

      {stop?.kind === 'pause' && (
        <NumberField
          key={`${index}-pause`}
          value={stop.minutes}
          min={5}
          step={5}
          width="5em"
          after={rpm?.waypointStop.minutes}
          onValue={(minutes) => set({ ...stop, minutes })}
        />
      )}

      {stop?.kind === 'overnight' && (
        <>
          <InputGroup className="w-auto flex-nowrap">
            <InputGroup.Text>{rpm?.waypointStop.continueAt}</InputGroup.Text>
            <Form.Control
              type="time"
              value={stop.resume}
              onChange={(e) => set({ ...stop, resume: e.currentTarget.value })}
            />
          </InputGroup>

          <NumberField
            key={`${index}-nights`}
            value={stop.nights}
            min={1}
            max={30}
            width="4.5em"
            before={rpm?.waypointStop.nights}
            onValue={(nights) => set({ ...stop, nights })}
          />
        </>
      )}
    </>
  );
}

/** A number taken once it is one the stop accepts; until then, what is typed. */
function NumberField({
  value,
  min,
  max,
  step,
  width,
  before,
  after,
  onValue,
}: {
  value: number;
  min: number;
  max?: number;
  step?: number;
  width: string;
  before?: ReactNode;
  after?: ReactNode;
  onValue: (value: number) => boolean;
}): ReactElement {
  const [typing, setTyping] = useState<string | null>(null);

  return (
    <InputGroup className="w-auto flex-nowrap">
      {before && <InputGroup.Text>{before}</InputGroup.Text>}

      <Form.Control
        type="number"
        min={min}
        max={max}
        step={step}
        value={typing ?? value}
        style={{ width }}
        onChange={(e) => {
          const text = e.currentTarget.value;

          setTyping(onValue(Number(text)) ? null : text);
        }}
        onBlur={() => setTyping(null)}
      />

      {after && <InputGroup.Text>{after}</InputGroup.Text>}
    </InputGroup>
  );
}
