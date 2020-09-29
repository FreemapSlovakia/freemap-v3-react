import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import PanelGroup from 'react-bootstrap/lib/PanelGroup';
import Panel from 'react-bootstrap/lib/Panel';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type Item = { name: string; items: { name: string; id: number }[] };

const LegendOutdoorModalInt: React.FC<Props> = ({ language, onModalClose }) => {
  const [legend, setLegend] = useState<Item[]>([]);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/legend?language=${language}`)
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

  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="map-o" /> Legenda mapy
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Legenda k vrstvám Automapa, Turistická, Cyklomapa a Lyžiarska.</p>
        <PanelGroup accordion id="pg1">
          {[...legend].map((c: Item, i: number) => (
            <Panel key={c.name} eventKey={i}>
              <Panel.Heading>
                <Panel.Title toggle>{c.name}</Panel.Title>
              </Panel.Heading>
              <Panel.Body collapsible>
                {c.items.map(({ id, name }) => (
                  <div key={id}>
                    <div className="legend-item">
                      <img src={`http://localhost:4000/legend-image/${id}`} />
                    </div>
                    {` ${name}`}
                  </div>
                ))}
              </Panel.Body>
            </Panel>
          ))}
        </PanelGroup>
      </Modal.Body>
      <Modal.Footer>
        <FormGroup>
          <Button onClick={onModalClose}>
            <Glyphicon glyph="remove" /> Zavrieť
          </Button>
        </FormGroup>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModalClose() {
    dispatch(setActiveModal(null));
  },
});

export const LegendOutdoorModal = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LegendOutdoorModalInt);
