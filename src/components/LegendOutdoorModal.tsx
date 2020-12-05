import axios from 'axios';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Panel from 'react-bootstrap/lib/Panel';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { RootState } from 'fm3/storeCreator';
import { useMessages } from 'fm3/l10nInjector';

type Item = { name: string; items: { name: string; id: number }[] };

const fmMapserverUrl =
  process.env.FM_MAPSERVER_URL || 'https://outdoor.tiles.freemap.sk';

export function LegendOutdoorModal(): ReactElement {
  const m = useMessages();

  const [legend, setLegend] = useState<Item[]>([]);

  const language = useSelector((state: RootState) => state.l10n.language);

  useEffect(() => {
    axios
      .get(`${fmMapserverUrl}/legend?language=${language}`)
      .then((response) => {
        const { categories, items } = response.data;

        const catMap = new Map<string, Item>();

        for (const category of categories) {
          catMap.set(category.id, { name: category.name, items: [] });
        }

        for (let i = 0; i < items.length; i++) {
          catMap
            .get(items[i].categoryId)
            ?.items.push({ name: items[i].name, id: i });
        }

        setLegend([...catMap.values()]);
      });
  }, [language]);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> {m?.more.mapLegend}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{m?.legend.body}</p>
        <PanelGroup accordion id="pg1">
          {[...legend].map((c: Item, i: number) => (
            <Panel key={c.name} eventKey={i}>
              <Panel.Heading>
                <Panel.Title toggle>{c.name}</Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible>
                {c.items.map(({ id, name }) => (
                  <div key={id} className="legend-item">
                    <div>
                      <img
                        src={`${fmMapserverUrl}/legend-image/${id}`}
                        srcSet={[1, 2, 3]
                          .map(
                            (s) =>
                              `${fmMapserverUrl}/legend-image/${id}?scale=${s}${
                                s > 1 ? ` ${s}x` : ''
                              }`,
                          )
                          .join(', ')}
                      />
                    </div>
                    <div>{name}</div>
                  </div>
                ))}
              </Panel.Body>
            </Panel>
          ))}
        </PanelGroup>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={close}>
            <Glyphicon glyph="remove" /> {m?.general.close}
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
}
