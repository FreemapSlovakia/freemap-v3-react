import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaClock } from 'react-icons/fa';
import { useDepartureInput } from '../hooks/useDepartureInput.js';
import { useRoutePlannerMessages } from '../translations/useRoutePlannerMessages.js';

/** The route's departure, on its start; unset, the next quarter hour. */
export function RouteDepartureControl(): ReactElement {
  const rpm = useRoutePlannerMessages();

  const input = useDepartureInput();

  return (
    <InputGroup className="w-auto flex-nowrap">
      <LongPressTooltip
        breakpoint="sm"
        label={rpm?.departureLabel}
        toggleOnClick
      >
        {({ props, label, labelClassName }) => (
          <InputGroup.Text {...props}>
            <FaClock />
            <span className={labelClassName}>&ensp;{label}</span>
          </InputGroup.Text>
        )}
      </LongPressTooltip>

      <Form.Control
        type="datetime-local"
        value={input.value}
        isInvalid={input.past}
        onChange={(e) => input.onChange(e.currentTarget.value)}
      />

      {input.departure !== null && (
        <Button variant="secondary" onClick={input.clear}>
          {rpm?.departureNow}
        </Button>
      )}
    </InputGroup>
  );
}
