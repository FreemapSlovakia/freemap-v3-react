import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaClock } from 'react-icons/fa';
import { useDepartureInput } from '../hooks/useDepartureInput.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

/** The route's departure, turned on and off by its label; off, it has none. */
export function RouteDepartureControl({
  className,
}: {
  className?: string;
}): ReactElement {
  const rpm = useRoutePlannerMessages();

  const input = useDepartureInput();

  const on = input.departure !== null;

  return (
    <InputGroup className={className ?? 'w-auto flex-nowrap'}>
      <LongPressTooltip
        breakpoint="sm"
        label={rpm?.departureLabel}
        hint={rpm?.departureHint}
      >
        {({ props, label, labelClassName }) => (
          <Button
            {...props}
            variant="outline-primary"
            active={on}
            onClick={input.toggle}
          >
            <FaClock />
            <span className={labelClassName}>&ensp;{label}</span>
          </Button>
        )}
      </LongPressTooltip>

      {on ? (
        <Form.Control
          type="datetime-local"
          value={input.value}
          isInvalid={input.past}
          onChange={(e) => input.onChange(e.currentTarget.value)}
          // Not on change: a half-edited date reads as empty too.
          onBlur={(e) =>
            input.onBlur(
              e.currentTarget.value,
              e.currentTarget.validity.badInput,
            )
          }
        />
      ) : (
        <InputGroup.Text className="text-muted flex-grow-1">
          {rpm?.departureOff}
        </InputGroup.Text>
      )}
    </InputGroup>
  );
}
