import { Text } from '@features/l10n/Text.js';
import { useObjectsMessages } from '@features/objects/translations/useObjectsMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { Fragment, type ReactElement, type ReactNode, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { useCached } from '../hooks/useCached.js';
import { getJson } from '../model/article.js';
import {
  fetchLabels,
  referencedIds,
  type WikidataFact,
  type WikidataItem,
  type WikidataValue,
} from '../model/wikidata.js';

// Symbols where Wikidata's unit label would read "438 metre".
const UNIT_SYMBOLS: Record<string, string> = {
  Q11573: 'm',
  Q828224: 'km',
  Q174728: 'cm',
  Q174789: 'mm',
  Q25343: 'm²',
  Q712226: 'km²',
  Q35852: 'ha',
  Q794261: 'm³/s',
};

function useLabels(facts: WikidataFact[]): Record<string, string> {
  const language = useAppSelector((state) => state.l10n.language);

  const ids = referencedIds(facts);

  const loaded = useCached(
    ids.length ? `labels:${language}:${ids.join('|')}` : null,
    () => fetchLabels(getJson, ids, language),
  );

  return loaded.state === 'done' ? loaded.data : {};
}

function formatTime(
  { time, precision }: { time: string; precision: number },
  language: string,
): string {
  const m = /^([+-]\d+)-(\d\d)-(\d\d)/.exec(time);

  if (!m) {
    return time;
  }

  const year = Number(m[1]);

  // Coarser than a millennium, or beyond what a Date holds: the bare number.
  if ((precision < 9 && year <= 0) || precision < 6 || Math.abs(year) > 9999) {
    return String(year);
  }

  // A decade, century or millennium (precision 8, 7, 6) as the years it spans.
  if (precision < 9) {
    const span = 10 ** (9 - precision);

    // Wikidata's century 1301–1400 is stored as 1301 or 1400; its decade as 1290.
    const from =
      precision === 8
        ? Math.floor(year / span) * span
        : Math.floor((year - 1) / span) * span + 1;

    return `${from}–${from + span - 1}`;
  }

  // A year alone is sent as `-00-00`.
  const date = new Date(
    Date.UTC(2000, (Number(m[2]) || 1) - 1, Number(m[3]) || 1),
  );

  // Wikidata counts 1 BC as -1, the Date as 0.
  date.setUTCFullYear(year < 0 ? year + 1 : year);

  return date.toLocaleDateString(language, {
    timeZone: 'UTC',
    year: 'numeric',
    era: year < 0 ? 'short' : undefined,
    ...(precision >= 11
      ? { month: 'long', day: 'numeric' }
      : precision === 10
        ? { month: 'long' }
        : {}),
  });
}

/** Whether `WikidataFacts` shows anything for it. */
export function hasFacts(item: WikidataItem | undefined): boolean {
  return Boolean(item?.curated.length || item?.other.length);
}

/** Wikidata statements: a chosen few, the rest behind "Show more". */
export function WikidataFacts({
  item,
}: {
  item: WikidataItem;
}): ReactElement | null {
  const [more, setMore] = useState(false);

  const om = useObjectsMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const nf = useNumberFormat({ maximumFractionDigits: 2 });

  const curatedLabels = useLabels(item.curated);

  const otherLabels = useLabels(more ? item.other : []);

  const labels = { ...curatedLabels, ...otherLabels };

  const renderValue = (value: WikidataValue): ReactNode => {
    switch (value.type) {
      case 'item':
        return (
          <a
            href={`https://www.wikidata.org/wiki/${value.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {labels[value.id] ?? value.id}
          </a>
        );

      case 'quantity': {
        const unit =
          value.unit && (UNIT_SYMBOLS[value.unit] ?? labels[value.unit]);

        return unit
          ? `${nf.format(value.amount)} ${unit}`
          : nf.format(value.amount);
      }

      case 'time':
        return formatTime(value, language);

      case 'text':
        return value.text;

      case 'url':
        // Linked only where it is a web or mail address.
        return !/^(https?:|mailto:)/i.test(value.url) ? (
          value.url
        ) : (
          <a href={value.url} target="_blank" rel="noopener noreferrer">
            {value.url
              .replace(/^(https?:\/\/(www\.)?|mailto:)/, '')
              .replace(/\/$/, '')}
          </a>
        );
    }
  };

  const facts = more ? [...item.curated, ...item.other] : item.curated;

  if (!hasFacts(item)) {
    return null;
  }

  return (
    <div>
      {facts.length > 0 && (
        <Table
          striped
          bordered
          size="sm"
          className="mb-3 text-break"
          // Auto layout widens a column past the panel for a link's icon.
          style={{ tableLayout: 'fixed' }}
        >
          <tbody>
            {facts.map(({ property, statements }) => (
              <tr key={property}>
                <th>{labels[property] ?? property}</th>

                <td>
                  {statements.map(({ value, pointInTime }, i) => (
                    <Fragment key={i}>
                      {i > 0 && ', '}
                      {renderValue(value)}
                      {pointInTime && <> ({renderValue(pointInTime)})</>}
                    </Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Laid out as an OSM object's History and source. */}
      {!more && item.other.length > 0 && (
        <p className="mb-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setMore(true);

              trackMatomo(['trackEvent', 'Wiki', 'moreFacts']);
            }}
          >
            <Text k="general.showMore" />
          </Button>
        </p>
      )}

      <p className="mb-3">
        <Text m={om} k="source" />:{' '}
        <a
          href={`https://www.wikidata.org/wiki/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Wikidata
        </a>
      </p>

      {/* Ends what the Wikidata link credits. */}
      <hr />
    </div>
  );
}
