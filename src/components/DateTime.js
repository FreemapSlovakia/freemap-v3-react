import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';

function checkDatetimeLocalInput() {
  const input = document.createElement('input');
  input.setAttribute('type', 'datetime-local');

  const notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);

  return input.value !== notADateValue;
}

function zeropad(v, n = 2) {
  const raw = `0000${v}`;
  return raw.substring(raw.length - n, raw.length);
}

const supportsDatetimeLocal = checkDatetimeLocalInput();

export default function DateTime({ value, onChange, placeholders }) {
  const handleTakenAtChange = useCallback((e) => {
    onChange(e.target.value ? new Date(e.target.value) : null);
  }, [onChange]);

  const handleTakenAtDateChange = useCallback((e) => {
    if (e.target.value) {
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
      if (m) {
        if (value && e.target.value) {
          const d = new Date(value.getTime());
          d.setFullYear(parseInt(m[1], 10));
          d.setMonth(parseInt(m[2], 10), parseInt(m[3], 10));
          onChange(d);
        } else {
          onChange(new Date(e.target.value));
        }
      }
    } else {
      onChange(null);
    }
  }, [value, onChange]);

  const handleTakenAtTimeChange = useCallback((e) => {
    const m = e.target.value ? /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(e.target.value) : ['00', '00', '00'];
    if (m && value) {
      const d = new Date(value.getTime());
      d.setHours(parseInt(m[1], 10));
      d.setMinutes(parseInt(m[2], 10));
      d.setSeconds(parseInt(m[3], 10) || 0);
      d.setMilliseconds(0);
      onChange(d);
    }
  }, [value, onChange]);

  return supportsDatetimeLocal ? (
    <FormControl
      type="datetime-local"
      placeholder={placeholders && placeholders.datetime}
      value={value ? `${zeropad(value.getFullYear(), 4)}-${zeropad(value.getMonth() + 1)}-${zeropad(value.getDate())}T${zeropad(value.getHours())}:${zeropad(value.getMinutes())}:${zeropad(value.getSeconds())}` : ''}
      onChange={handleTakenAtChange}
    />
  ) : (
    <InputGroup>
      <InputGroup.Addon>
        <FontAwesomeIcon icon="calendar" />
      </InputGroup.Addon>
      <FormControl
        type="date"
        placeholder={placeholders && placeholders.date}
        value={value ? `${zeropad(value.getFullYear(), 4)}-${zeropad(value.getMonth() + 1)}-${zeropad(value.getDate())}` : ''}
        onChange={handleTakenAtDateChange}
      />
      <InputGroup.Addon>
        <FontAwesomeIcon icon="clock-o" />
      </InputGroup.Addon>
      <FormControl
        type="time"
        placeholder={placeholders && placeholders.time}
        value={value ? `${zeropad(value.getHours())}:${zeropad(value.getMinutes())}:${zeropad(value.getSeconds())}` : ''}
        onChange={handleTakenAtTimeChange}
      />
    </InputGroup>
  );
}

DateTime.propTypes = {
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  placeholders: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
    datetime: PropTypes.string,
  }),
};
