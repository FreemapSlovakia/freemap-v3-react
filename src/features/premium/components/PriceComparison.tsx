import type { ReactElement, ReactNode } from 'react';
import { Table } from 'react-bootstrap';

export type PriceComparisonRow = {
  label: ReactNode;
  /** One cell per column, in the order of `columns`. */
  values: ReactNode[];
  /** The better deal, marked so it is visible without reading. */
  recommended?: boolean;
};

type Props = {
  columns: ReactNode[];
  rows: PriceComparisonRow[];
};

/**
 * Puts what each buying option costs now and later side by side. Prose about
 * two conditional futures doesn't get read at the moment of the decision; a
 * two-row table does.
 */
export function PriceComparison({ columns, rows }: Props): ReactElement {
  return (
    <Table size="sm" className="mb-0 align-middle text-center">
      <thead>
        <tr>
          <th />

          {columns.map((column, i) => (
            <th key={i} className="fw-normal text-body-secondary">
              {column}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className={
              row.recommended ? 'table-success fw-semibold' : undefined
            }
          >
            <td className="text-start">{row.label}</td>

            {row.values.map((value, j) => (
              <td key={j}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
