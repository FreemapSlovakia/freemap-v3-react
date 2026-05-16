import { Button } from '@mantine/core';
import { useCopyButton } from '@shared/hooks/useCopyButton.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { is } from 'typia';
import { InnerDistanceInfo } from './DistanceInfo.js';

type Props = {
  area: number;
  areaLabel: string;
  perimeter: number;
  perimeterLabel: string;
};

const areaUnits = {
  'm²': 1,
  'km²': 1e6,
  a: 100, // are
  ha: 10000, // hectare
  'mi²': 2_589_988.11,
  'yd²': 0.836127,
  'ft²': 0.092903,
  ac: 4046.86, // acre
};

type Units = keyof typeof areaUnits;

const units = Object.keys(areaUnits) as Units[];

const toUnit = (value: string | null) => (is<Units>(value) ? value : 'km²');

function identity<T>(value: T): T {
  return value;
}

export function AreaInfo({
  area: length,
  areaLabel,
  perimeter,
  perimeterLabel,
}: Props) {
  const [unit, setUnit] = usePersistentState<Units>(
    'fm.area.unit',
    identity,
    toUnit,
  );

  const handleUnitClick = () => {
    setUnit((prev) => units[(units.indexOf(prev) + 1) % units.length]);
  };

  const num = length / areaUnits[unit];

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
    <div
      className="d-inline-grid gap-2 align-items-center"
      style={{ gridTemplateColumns: 'auto 1fr' }}
    >
      <span className="text-nowrap">{areaLabel}</span>

      <Button.Group>
        <Button.GroupSection variant="default" size="xs">
          {value}
        </Button.GroupSection>

        <Button
          type="button"
          size="xs"
          variant="filled"
          onClick={handleUnitClick}
        >
          {unit}
        </Button>

        {copyButton}
      </Button.Group>

      <InnerDistanceInfo length={perimeter} lengthLabel={perimeterLabel} />
    </div>
  );
}
