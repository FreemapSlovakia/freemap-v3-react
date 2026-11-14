import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Alert } from 'react-bootstrap';

type Props = {
  /** What to do with the list, e.g. "credit these when sharing". */
  prompt: ReactNode;
  credits: { name: string; url?: string }[];
  /** Shown where the source named no datasets at all. */
  noneReported?: ReactNode;
  /** Codes no dictionary names, after their label; never mixed into the list. */
  unknown?: { label: ReactNode; codes: string[] };
};

/** What an exported file must be credited with, ready to copy. */
export function ShareCreditsAlert({
  prompt,
  credits,
  noneReported,
  unknown,
}: Props): ReactElement {
  const notes = [
    noneReported,
    unknown?.codes.length ? (
      <>
        {unknown.label} {unknown.codes.join(', ')}
      </>
    ) : null,
  ].filter(Boolean);

  return (
    <Alert variant="warning">
      {/* A prompt with nothing after it would read as a list gone missing. */}
      {credits.length > 0 && (
        <>
          <p>{prompt}</p>

          <p className="user-select-all mb-0">
            {credits.map(({ name, url }, i) => (
              <Fragment key={name}>
                {i > 0 && ', '}
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                ) : (
                  name
                )}
              </Fragment>
            ))}
          </p>
        </>
      )}

      {notes.map((note, i) => (
        <p
          key={i}
          className={`mb-0 small${credits.length > 0 || i > 0 ? ' mt-2' : ''}`}
        >
          {note}
        </p>
      ))}
    </Alert>
  );
}
