import { useCopyButton } from '@shared/hooks/useCopyButton.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { is } from 'typia';

type Props = {
  length: number;
  lengthLabel: string;
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

function identity<T>(value: T): T {
  return value;
}

export function DistanceInfo(props: Props) {
  return (
    <div
      className="d-inline-grid gap-2 align-items-center"
      style={{ gridTemplateColumns: 'auto 1fr' }}
    >
      <InnerDistanceInfo {...props} />
    </div>
  );
}

const toUnit = (value: string | null) => (is<Units>(value) ? value : 'km');

export function InnerDistanceInfo({ length, lengthLabel }: Props) {
  const [unit, setUnit] = usePersistentState<Units>(
    'fm.dist.unit',
    identity,
    toUnit,
  );

  const handleUnitClick = () => {
    setUnit((prev) => units[(units.indexOf(prev) + 1) % units.length]);
  };

  const num = length / lengthUnits[unit];

  const fractionDigits = Math.max(
    0,
    Math.min(20, Math.floor(4 - (num ? Math.log10(num) : 0))),
  );

  const nf = useNumberFormat({
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });

  const value = nf.format(num);

  const copyButton = useCopyButton(value);

  return (
    <>
      <label htmlFor="length" className="text-nowrap">
        {lengthLabel}
      </label>

      <InputGroup size="sm" className="flex-nowrap">
        <Form.Control
          id="length"
          readOnly
          className="fm-fs-content"
          value={value}
        />

        <Button type="button" onClick={handleUnitClick} className="w-10">
          {unit}
        </Button>

        {copyButton}
      </InputGroup>
    </>
  );
}
