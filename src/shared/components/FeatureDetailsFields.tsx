import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import {
  type DetailKind,
  detailKeysOf,
  type FeatureDetails,
  isValidDetailEle,
  isValidDetailNumber,
} from '@shared/featureDetails.js';
import { isInputNumber } from '@shared/numberValidator.js';
import type { ReactElement } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

/** What other software writes into `<type>`, by kind; any text is allowed. */
const TYPE_SUGGESTIONS: Record<DetailKind, string[]> = {
  line: [
    'hiking',
    'walking',
    'running',
    'cycling',
    'mountain_biking',
    'skiing',
    'driving',
  ],
  point: ['summit', 'spring', 'shelter', 'viewpoint', 'parking', 'campsite'],
};

type Field = {
  key: 'desc' | 'cmt' | 'type' | 'src' | 'number' | 'time' | 'ele';
  label: string | undefined;
  as?: 'textarea' | 'datetime' | 'number';
  unit?: string;
  hint?: string;
  invalid?: string;
};

type Props = {
  kind: DetailKind;
  details: FeatureDetails;
  onChange: (details: FeatureDetails) => void;
};

/** A waypoint's, a track's or a route's own GPX fields, as named fields. */
export function FeatureDetailsFields({
  kind,
  details,
  onChange,
}: Props): ReactElement {
  const dm = useDrawingMessages();

  const e = dm?.edit;

  const fields: Field[] = [
    { key: 'desc', label: e?.desc, as: 'textarea' },
    { key: 'cmt', label: e?.cmt, as: 'textarea' },
    { key: 'type', label: kind === 'point' ? e?.pointType : e?.activityType },
    ...(kind === 'point'
      ? ([
          { key: 'time', label: e?.time, as: 'datetime' },
          {
            key: 'ele',
            label: e?.elevation,
            as: 'number',
            unit: 'm',
            invalid: isValidDetailEle(details.ele) ? undefined : e?.eleInvalid,
          },
        ] satisfies Field[])
      : []),
    { key: 'src', label: e?.source, hint: e?.sourceHint },
    ...(kind === 'line'
      ? ([
          {
            key: 'number',
            label: e?.number,
            as: 'number',
            invalid: isValidDetailNumber(details.number)
              ? undefined
              : e?.numberInvalid,
          },
        ] satisfies Field[])
      : []),
  ];

  const set = (key: Field['key'], value: string) =>
    onChange({ ...details, [key]: value });

  return (
    <>
      {fields.map(({ key, label, as, unit, hint, invalid }) => (
        <Form.Group key={key} controlId={`detail-${key}`} className="mt-3">
          <Form.Label>{label}</Form.Label>

          <InputGroup hasValidation>
            <Form.Control
              as={as === 'textarea' ? 'textarea' : undefined}
              rows={as === 'textarea' ? 2 : undefined}
              type={
                as === 'datetime'
                  ? 'datetime-local'
                  : // A number input blanks what it can't show, so other text
                    // stays a text input, to be seen and fixed.
                    as === 'number' &&
                      (details[key] === '' || isInputNumber(details[key]))
                    ? 'number'
                    : 'text'
              }
              step={
                as === 'datetime'
                  ? 0.001
                  : as === 'number'
                    ? key === 'number'
                      ? 1
                      : 'any'
                    : undefined
              }
              min={key === 'number' ? 0 : undefined}
              list={key === 'type' ? `detail-type-${kind}` : undefined}
              value={details[key]}
              onChange={(event) => set(key, event.currentTarget.value)}
              // Wheeling a focused number input steps it; let it scroll.
              onWheel={
                as === 'number'
                  ? (event) => event.currentTarget.blur()
                  : undefined
              }
              isInvalid={invalid !== undefined}
            />

            {unit && <InputGroup.Text>{unit}</InputGroup.Text>}

            <Form.Control.Feedback type="invalid">
              {invalid}
            </Form.Control.Feedback>
          </InputGroup>

          {key === 'type' && (
            <datalist id={`detail-type-${kind}`}>
              {TYPE_SUGGESTIONS[kind].map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
          )}

          {hint && (
            <Form.Text as="div" muted>
              {hint}
            </Form.Text>
          )}
        </Form.Group>
      ))}
    </>
  );
}

/** How many details have a value, for the collapsed panel's title. */
export function filledDetailCount(
  kind: DetailKind,
  details: FeatureDetails,
): number {
  const keys = [
    ...detailKeysOf(kind),
    ...(kind === 'point' ? (['ele'] as const) : []),
  ];

  return keys.filter((key) => details[key].trim()).length;
}
