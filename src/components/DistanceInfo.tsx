import { Button, Form, InputGroup } from 'react-bootstrap';
import { is } from 'typia';
import { useCopyButton } from '../hooks/useCopyButton.js';
import { usePersistentState } from '../hooks/usePersistentState.js';

type Props = {
  length: number;
  lengthLabel: string;
  nf33: Intl.NumberFormat;
};

const lengthUnits = {
  km: 1,
  m: 0.001,
  mi: 1.609344,
  yd: 0.0009144,
  ft: 0.0003048,
  nmi: 1.852, // nautical mile
};

type Units = keyof typeof lengthUnits;

const units = Object.keys(lengthUnits) as Units[];

export function DistanceInfo({ length, lengthLabel, nf33 }: Props) {
  const [unit, setUnit] = usePersistentState<Units>(
    'fm.dist.unit',
    (value) => value,
    (value) => (is<Units>(value) ? value : 'km'),
  );

  const handleNextFormatClick = () => {
    setUnit((prev) => units[(units.indexOf(prev) + 1) % units.length]);
  };

  const value = nf33.format(length / lengthUnits[unit]);

  const copyButton = useCopyButton(value);

  return (
    <>
      <Form.Label htmlFor="length">{lengthLabel}</Form.Label>

      <InputGroup size="sm">
        <Form.Control
          id="length"
          readOnly
          className="fm-fs-content"
          value={value}
        />

        <Button type="button" onClick={handleNextFormatClick} className="w-10">
          {unit}
        </Button>

        {copyButton}
      </InputGroup>
    </>
  );
}
