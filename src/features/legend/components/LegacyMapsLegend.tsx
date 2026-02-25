import { type ReactElement } from 'react';
import { Accordion } from 'react-bootstrap';
import legend from '../legacyMaps/index.json' with { type: 'json' };

interface LegendItem {
  n: string;
  items: {
    i: string;
    n: string;
  }[];
}

export default LegacyMapsLegend;

export function LegacyMapsLegend(): ReactElement {
  return (
    <Accordion>
      {legend.map((legendItem: LegendItem, i: number) => (
        <Accordion.Item key={legendItem.n} eventKey={String(i)}>
          <Accordion.Header>{legendItem.n}</Accordion.Header>

          <Accordion.Body>
            {legendItem.items.map((item) => (
              <div key={item.n} className="fm-legend-item">
                <div>
                  <div>
                    <img
                      src={require(`../legacyMaps/${item.i}`)}
                      alt={item.n}
                    />
                  </div>
                </div>

                <div>{item.n}</div>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
