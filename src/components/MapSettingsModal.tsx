import { saveSettings, setActiveModal } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { overlayLayers } from 'fm3/mapDefinitions';
import { ReactElement, useCallback, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Modal from 'react-bootstrap/Modal';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function MapSettingsModal({ show }: Props): ReactElement {
  const initOverlayOpacity = useSelector((state) => state.map.overlayOpacity);

  const initOverlayPaneOpacity = useSelector(
    (state) => state.map.overlayPaneOpacity,
  );

  const language = useSelector((state) => state.l10n.language);

  const m = useMessages();

  const [overlayOpacity, setOverlayOpacity] = useState(initOverlayOpacity);

  const [overlayPaneOpacity, setOverlayPaneOpacity] = useState(
    initOverlayPaneOpacity,
  );

  const [selectedOverlay, setSelectedOverlay] = useState('t');

  const dispatch = useDispatch();

  const userMadeChanges =
    overlayPaneOpacity !== initOverlayPaneOpacity ||
    overlayLayers.some(
      ({ type }) =>
        (overlayOpacity[type] || 1) !== (initOverlayOpacity[type] || 1),
    );

  const selectedOverlayDetails = overlayLayers.find(
    ({ type }) => type === selectedOverlay,
  );

  const nf = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show} onHide={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              overlayOpacity,
              overlayPaneOpacity,
            }),
          );
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mapLayers.settings}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <FormGroup>
            <FormLabel>
              {m?.settings.map.overlayPaneOpacity}{' '}
              {nf.format(overlayPaneOpacity * 100)}
              {' %'}
            </FormLabel>

            <FormControl
              type="range"
              custom
              value={overlayPaneOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(e) =>
                setOverlayPaneOpacity(Number(e.currentTarget.value))
              }
            />
          </FormGroup>

          {selectedOverlayDetails && (
            <>
              <hr />
              <FormGroup>
                <FormLabel>
                  <p>{m?.settings.expert.overlayOpacity}</p>

                  <DropdownButton
                    variant="secondary"
                    id="overlayOpacity"
                    onSelect={(o) => {
                      if (o !== null) {
                        setSelectedOverlay(o);
                      }
                    }}
                    title={
                      <>
                        {selectedOverlayDetails.icon}{' '}
                        {m?.mapLayers.letters[selectedOverlayDetails.type]}{' '}
                        {nf.format(
                          (overlayOpacity[selectedOverlay] || 1) * 100,
                        )}{' '}
                        %
                      </>
                    }
                  >
                    {overlayLayers.map(({ type, icon }) => (
                      <Dropdown.Item key={type} eventKey={type}>
                        {icon} {m?.mapLayers.letters[type]}{' '}
                        {nf.format((overlayOpacity[type] || 1) * 100)} %
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                </FormLabel>

                <FormControl
                  type="range"
                  custom
                  value={overlayOpacity[selectedOverlay] || 1}
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  onChange={(e) => {
                    setOverlayOpacity({
                      ...overlayOpacity,
                      [selectedOverlay]: Number(e.currentTarget.value),
                    });
                  }}
                />
              </FormGroup>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!userMadeChanges}>
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
