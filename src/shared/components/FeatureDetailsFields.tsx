import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { Text } from '@features/l10n/Text.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  type DetailKind,
  detailKeysOf,
  type FeatureDetails,
  isValidDetailEle,
  isValidDetailNumber,
} from '@shared/featureDetails.js';
import type { ReactElement } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

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

  const setLinks = (links: FeatureDetails['links']) =>
    onChange({ ...details, links });

  return (
    <>
      {fields.map(({ key, label, as, unit, hint, invalid }) => (
        <Form.Group key={key} controlId={`detail-${key}`} className="mt-3">
          <Form.Label>{label}</Form.Label>

          <InputGroup hasValidation>
            <Form.Control
              as={as === 'textarea' ? 'textarea' : undefined}
              rows={as === 'textarea' ? 2 : undefined}
              type={as === 'datetime' ? 'datetime-local' : 'text'}
              step={as === 'datetime' ? 0.001 : undefined}
              inputMode={as === 'number' ? 'decimal' : undefined}
              list={key === 'type' ? `detail-type-${kind}` : undefined}
              value={details[key]}
              onChange={(event) => set(key, event.currentTarget.value)}
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

      <Form.Group className="mt-3">
        <Form.Label>
          <Text m={dm} k="edit.links" />
        </Form.Label>

        {details.links.map((link, i) => (
          <InputGroup key={i} className="mb-2">
            <Form.Control
              type="url"
              placeholder="https://…"
              value={link.href}
              onChange={(event) =>
                setLinks(
                  details.links.with(i, {
                    ...link,
                    href: event.currentTarget.value,
                  }),
                )
              }
            />

            <Form.Control
              placeholder={e?.linkText}
              value={link.text}
              onChange={(event) =>
                setLinks(
                  details.links.with(i, {
                    ...link,
                    text: event.currentTarget.value,
                  }),
                )
              }
            />

            <LongPressTooltip label={e?.removeLink}>
              {({ props }) => (
                <Button
                  variant="danger"
                  onClick={() => setLinks(details.links.toSpliced(i, 1))}
                  {...props}
                >
                  <FaTrash />
                </Button>
              )}
            </LongPressTooltip>
          </InputGroup>
        ))}

        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLinks([...details.links, { href: '', text: '' }])}
          >
            <FaPlus /> <Text m={dm} k="edit.addLink" />
          </Button>
        </div>
      </Form.Group>
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

  return (
    keys.filter((key) => details[key].trim()).length +
    details.links.filter(({ href }) => href.trim()).length
  );
}
