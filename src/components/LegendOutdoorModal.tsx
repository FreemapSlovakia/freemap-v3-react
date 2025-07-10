import { type ReactElement, useCallback, useEffect, useState } from 'react';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { useMessages } from '../l10nInjector.js';

import { Accordion, Button, Modal } from 'react-bootstrap';
import { FaRegMap, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { assert } from 'typia';

type Item = { name: string; items: { name: string; id: number }[] };

const fmMapserverUrl = process.env['FM_MAPSERVER_URL'];

type Props = { show: boolean };

type Res = {
  categories: { id: string; name: string }[];
  items: { categoryId: string; name: string }[];
};

export default LegendOutdoorModal;

export function LegendOutdoorModal({ show }: Props): ReactElement {
  const m = useMessages();

  const [legend, setLegend] = useState<Item[]>([]);

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${fmMapserverUrl}/legend?language=${language}`)
      .then((response) =>
        response.status === 200 ? response.json() : undefined,
      )
      .then((data) => {
        const { categories, items } = assert<Res>(data);

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
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch, language]);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaRegMap /> {m?.mainMenu.mapLegend}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{m?.legend.body}</p>

        <Accordion>
          {[...legend].map((c: Item, i: number) => (
            <Accordion.Item key={c.name} eventKey={String(i)}>
              <Accordion.Header>{c.name}</Accordion.Header>

              <Accordion.Body>
                {c.items.map(({ id, name }) => (
                  <div key={id} className="fm-legend-item">
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
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
