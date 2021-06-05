import { ReactElement } from 'react';
import Table from 'react-bootstrap/Table';

export type ObjectDetailBasicProps = {
  id: number;
  type: 'node' | 'way' | 'relation';
  tags: Record<string, string>;
};

type Props = ObjectDetailBasicProps & {
  openText: string;
  historyText: string;
};

export function ObjectDetails({
  id,
  tags,
  type,
  openText,
  historyText,
}: Props): ReactElement {
  return (
    <>
      <p>
        <a href={`https://www.openstreetmap.org/${type}/${id}`}>{openText}</a> (
        <a href={`https://www.openstreetmap.org/${type}/${id}/history`}>
          {historyText}
        </a>
        )
      </p>

      <Table striped bordered size="sm">
        <tbody>
          {Object.entries(tags).map(([k, v]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
