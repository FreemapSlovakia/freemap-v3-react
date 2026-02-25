import { type ReactElement, ReactNode } from 'react';

type Props = { rovasDesc: string; children: ReactNode };

export function RovasAd({ rovasDesc, children }: Props): ReactElement | null {
  return (
    <a
      href="https://rovas.app/freemap-web"
      target="_blank"
      rel="noreferrer"
      className="border rounded w-100 px-3 py-1 text-decoration-none"
      style={{ maxWidth: '400px' }}
    >
      <small className="d-flex gap-3 lh-sm align-items-center">
        <svg width={39} height={52} className="flex-shrink-0">
          <path d="M 20.67,51.78 H 38.91 V 36.92 A 101.62,101.62 0 0 1 20.67,38.72 Z M 20.67,27.9 V 34.7 C 27.05,34.76 33.19,35.39 38.91,36.5 V 26.1 A 101.74,101.74 0 0 1 20.67,27.9 Z M 18.24,27.9 C 11.85,27.82 5.72,27.17 0,26.04 V 36.56 A 101.1,101.1 0 0 1 18.24,34.71 V 27.91 Z M 0,51.78 H 18.24 V 38.72 C 11.85,38.64 5.72,37.99 0,36.86 Z M 20.67,17.09 V 23.89 C 27.05,23.94 33.19,24.57 38.91,25.69 V 15.29 A 101.28,101.28 0 0 1 20.67,17.09 Z M 18.24,17.09 C 11.85,17.01 5.72,16.36 0,15.23 V 25.74 A 101.18,101.18 0 0 1 18.24,23.89 Z M 18.24,0.01 H 0.01 V 14.87 A 101.43,101.43 0 0 1 18.26,13.07 V 0 Z M 38.91,0.01 H 20.68 V 13.07 C 27.06,13.15 33.2,13.8 38.92,14.93 V 0.01 Z" />
        </svg>
        <div className="text-secondary">
          <div className="fw-bold">Rovas</div>
          <div>{rovasDesc}</div>
        </div>
        <div className="text-body">{children}</div>
      </small>
    </a>
  );
}
