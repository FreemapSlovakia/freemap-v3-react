import { ChangeEvent, ReactElement, useCallback } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import { FaCalendar, FaClock } from 'react-icons/fa';

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

export function DateTime({
  value,
  onChange,
  placeholders,
}: Props): ReactElement {
  const [, datePart, timePart] = /(.*)T(.*)/.exec(value ?? '') || ['', '', ''];

  const propagateChange = useCallback(
    (date, time) => {
      onChange(date ? `${date}T${time || '00:00:00'}` : '');
    },
    [onChange],
  );

  const handleDateChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      propagateChange(e.target.value, timePart);
    },
    [timePart, propagateChange],
  );

  const handleTimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      propagateChange(datePart, e.target.value);
    },
    [datePart, propagateChange],
  );

  const handleDatetimeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
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
      <InputGroup.Append>
        <InputGroup.Text>
          <FaCalendar />
        </InputGroup.Text>
      </InputGroup.Append>
      <FormControl
        type="date"
        placeholder={placeholders?.date ?? 'YYY-MM-DD'}
        value={datePart}
        onChange={handleDateChange}
        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
        required={!!timePart}
      />
      <InputGroup.Append>
        <InputGroup.Text>
          <FaClock />
        </InputGroup.Text>
      </InputGroup.Append>
      <FormControl
        type="time"
        placeholder={placeholders?.time ?? 'HH:MM[:SS]'}
        value={timePart}
        onChange={handleTimeChange}
        pattern="[0-9]{2}:[0-9]{2}(:[0-9]{2})?"
        required={!!datePart}
        step="1"
      />
    </InputGroup>
  );
}
