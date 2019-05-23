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

const supportsDatetimeLocal = checkDatetimeLocalInput();

export default function DateTime({ value, onChange, placeholders }) {
  const [, datePart, timePart] = /(.*)T(.*)/.exec(value || '') || ['', '', ''];

  console.log('AAAAAAA', datePart, timePart);

  const propagateChange = useCallback((date, time) => {
    console.log('DDDDDDDDDDDDDD', date || time ? `${date}T${time}` : '');
    onChange(date || time ? `${date}T${time}` : '');
  }, [onChange]);

  const handleDateChange = useCallback((e) => {
    propagateChange(e.target.value, timePart);
  }, [timePart, propagateChange]);

  const handleTimeChange = useCallback((e) => {
    propagateChange(datePart, e.target.value);
  }, [datePart, propagateChange]);

  const handleDatetimeChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return supportsDatetimeLocal ? (
    <FormControl
      type="datetime-local"
      placeholder={placeholders && placeholders.datetime}
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
        placeholder={placeholders && placeholders.date || 'YYY-MM-DD'}
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
        placeholder={placeholders && placeholders.time || 'HH:MM[:SS]'}
        value={timePart}
        onChange={handleTimeChange}
        pattern="[0-9]{2}:[0-9]{2}(:[0-9]{2})?"
        required={!!datePart}
      />
    </InputGroup>
  );
}

DateTime.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholders: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
    datetime: PropTypes.string,
  }),
};
