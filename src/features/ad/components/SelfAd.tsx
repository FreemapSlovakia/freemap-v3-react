import { DocumentLink } from '@features/documents/components/DocumentLink.js';
import type { ReactElement } from 'react';
import { FaBullhorn } from 'react-icons/fa';

type Props = { head: string; sub: string; cta: string };

export function SelfAd({ head, sub, cta }: Props): ReactElement {
  return (
    <div
      className="border rounded w-100 px-3 py-2 bg-body text-body"
      style={{ maxWidth: '400px' }}
    >
      <div className="d-flex align-items-center gap-3">
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle bg-primary-subtle text-primary"
          style={{ width: '40px', height: '40px' }}
        >
          <FaBullhorn size={20} />
        </span>

        <div className="lh-sm">
          <div className="fw-bold">{head}</div>

          <small className="text-secondary">
            {sub} <DocumentLink doc="advertise">{cta} ›</DocumentLink>
          </small>
        </div>
      </div>
    </div>
  );
}
