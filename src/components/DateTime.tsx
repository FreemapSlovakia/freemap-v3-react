import * as React from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';

function checkDatetimeLocalInput(): boolean {
  const input = document.createElement('input');
  input.setAttribute('type', 'datetime-local');

  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);

  return input.value !== notADateValue;
}

const supportsDatetimeLocal: boolean = checkDatetimeLocalInput();

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholders?: {
    date: string;
    time: string;
    datetime: string;
  };
}

export const DateTime: React.FC<Props> = ({
  value,
  onChange,
  placeholders,
}) => {
  const [, datePart, timePart] = /(.*)T(.*)/.exec(value ?? '') || ['', '', ''];

  const propagateChange = React.useCallback(
    (date, time) => {
      onChange(date ? `${date}T${time || '00:00:00'}` : '');
    },
    [onChange],
  );

  const handleDateChange = React.useCallback(
    e => {
      propagateChange(e.target.value, timePart);
    },
    [timePart, propagateChange],
  );

  const handleTimeChange = React.useCallback(
    e => {
      propagateChange(datePart, e.target.value);
    },
    [datePart, propagateChange],
  );

  const handleDatetimeChange = React.useCallback(
    e => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return supportsDatetimeLocal ? (
    <FormControl
      type="datetime-local"
      placeholder={placeholders?.datetime}
      value={value}
      onChange={handleDatetimeChange}
    />
  ) : (
    <InputGroup>
      <InputGroup.Addon>
        <FontAwesomeIcon icon="calendar" />
      </InputGroup.Addon>
      <FormControl
        type="date"
        placeholder={placeholders?.date ?? 'YYY-MM-DD'}
        value={datePart}
        onChange={handleDateChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        required={!!timePart}
      />
      <InputGroup.Addon>
        <FontAwesomeIcon icon="clock-o" />
      </InputGroup.Addon>
      <FormControl
        type="time"
        placeholder={placeholders?.time ?? 'HH:MM[:SS]'}
        value={timePart}
        onChange={handleTimeChange}
        pattern="[0-9]{2}:[0-9]{2}(:[0-9]{2})?"
        required={!!datePart}
      />
    </InputGroup>
  );
};
