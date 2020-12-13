import {
  saveSettings,
  setActiveModal,
  setSelectingHomeLocation,
} from 'fm3/actions/mainActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { latLonToString } from 'fm3/geoutils';
import { useMessages } from 'fm3/l10nInjector';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';
import { overlayLayers } from 'fm3/mapDefinitions';
import { RootState } from 'fm3/storeCreator';
import { LeafletMouseEvent } from 'leaflet';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Tooltip from 'react-bootstrap/Tooltip';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import { useDispatch, useSelector } from 'react-redux';

type Props = { show: boolean };

export function SettingsModal({ show }: Props): ReactElement {
  const init = {
    homeLocation: useSelector((state: RootState) => state.main.homeLocation),
    overlayOpacity: useSelector((state: RootState) => state.map.overlayOpacity),
    overlayPaneOpacity: useSelector(
      (state: RootState) => state.map.overlayPaneOpacity,
    ),
    expertMode: useSelector((state: RootState) => state.main.expertMode),
    eleSmoothingFactor: useSelector(
      (state: RootState) => state.main.eleSmoothingFactor,
    ),
    preventTips: useSelector((state: RootState) => state.tips.preventTips),
  };

  const selectingHomeLocation = useSelector(
    (state: RootState) => state.main.selectingHomeLocation,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const language = useSelector((state: RootState) => state.l10n.language);

  const m = useMessages();

  const [homeLocation, setHomeLocation] = useState(init.homeLocation);

  const [overlayOpacity, setOverlayOpacity] = useState(init.overlayOpacity);

  const [overlayPaneOpacity, setOverlayPaneOpacity] = useState(
    init.overlayPaneOpacity,
  );

  const [expertMode, setExpertMode] = useState<boolean>(init.expertMode);

  const [eleSmoothingFactor, setEleSmoothingFactor] = useState(
    init.eleSmoothingFactor,
  );

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [preventTips, setPreventTips] = useState(init.preventTips);

  const [selectedOverlay, setSelectedOverlay] = useState('t');

  const dispatch = useDispatch();

  useEffect(() => {
    const map = getMapLeafletElement();

    if (!map) {
      return;
    }

    const handleMapClick = ({ latlng }: LeafletMouseEvent) => {
      setHomeLocation({ lat: latlng.lat, lon: latlng.lng });
      dispatch(setSelectingHomeLocation(false));
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [dispatch]);

  const userMadeChanges =
    homeLocation !== init.homeLocation ||
    expertMode !== init.expertMode ||
    eleSmoothingFactor !== init.eleSmoothingFactor ||
    preventTips !== init.preventTips ||
    overlayPaneOpacity !== init.overlayPaneOpacity ||
    (user && (name !== (user.name ?? '') || email !== (user.email ?? ''))) ||
    overlayLayers.some(
      ({ type }) =>
        (overlayOpacity[type] || 1) !== (init.overlayOpacity[type] || 1),
    );

  const selectedOverlayDetails = overlayLayers.find(
    ({ type }) => type === selectedOverlay,
  );

  const nf0 = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  return (
    <Modal show={show && !selectingHomeLocation} onHide={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(
            saveSettings({
              homeLocation,
              overlayOpacity,
              overlayPaneOpacity,
              expertMode,
              trackViewerEleSmoothingFactor: eleSmoothingFactor,
              user: user
                ? {
                    name: name.trim() || null,
                    email: email.trim() || null,
                  }
                : null,
              preventTips,
            }),
          );
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="cog" /> {m?.more.settings}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <FormCheck
              type="checkbox"
              onChange={(e) => {
                setExpertMode(e.currentTarget.checked);
              }}
              checked={expertMode}
              label={
                <>
                  {m?.settings.expert.switch}{' '}
                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="tooltip">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: m?.settings.expertInfo ?? '…',
                          }}
                        />
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon icon="question-circle-o" />
                  </OverlayTrigger>
                </>
              }
            />
          </FormGroup>
          <Tabs id="setting-tabs">
            <Tab title={m?.settings.tab.map} eventKey="1">
              <div>
                <p>
                  {m?.settings.map.overlayPaneOpacity}{' '}
                  {nf0.format(overlayPaneOpacity * 100)}
                  {' %'}
                </p>
                <Slider
                  value={overlayPaneOpacity}
                  min={0}
                  max={1}
                  step={0.05}
                  tooltip={false}
                  onChange={(newValue) => setOverlayPaneOpacity(newValue)}
                />
              </div>
              {expertMode && selectedOverlayDetails && (
                <>
                  <hr />
                  <div>
                    <p>{m?.settings.expert.overlayOpacity}</p>
                    <DropdownButton
                      rootCloseEvent="mousedown"
                      variant="secondary"
                      id="overlayOpacity"
                      onSelect={(o: unknown) => {
                        if (typeof o === 'string') {
                          setSelectedOverlay(o);
                        }
                      }}
                      title={
                        <>
                          <FontAwesomeIcon icon={selectedOverlayDetails.icon} />{' '}
                          {m?.mapLayers.letters[selectedOverlayDetails.type]}{' '}
                          {nf0.format(
                            (overlayOpacity[selectedOverlay] || 1) * 100,
                          )}{' '}
                          %
                        </>
                      }
                    >
                      {overlayLayers.map(({ type, icon }) => (
                        <Dropdown.Item key={type} eventKey={type}>
                          {icon && <FontAwesomeIcon icon={icon} />}{' '}
                          {m?.mapLayers.letters[type]}{' '}
                          {nf0.format((overlayOpacity[type] || 1) * 100)} %
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                    <Slider
                      value={overlayOpacity[selectedOverlay] || 1}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      tooltip={false}
                      onChange={(newOpacity) => {
                        setOverlayOpacity({
                          ...overlayOpacity,
                          [selectedOverlay]: newOpacity,
                        });
                      }}
                    />
                  </div>
                </>
              )}
              {expertMode && (
                <>
                  <hr />
                  <div>
                    <p>
                      {m?.settings.expert.trackViewerEleSmoothing.label(
                        eleSmoothingFactor,
                      )}
                    </p>
                    <Slider
                      value={eleSmoothingFactor}
                      min={1}
                      max={10}
                      step={1}
                      tooltip={false}
                      onChange={(newValue) => setEleSmoothingFactor(newValue)}
                    />
                  </div>
                  <Alert>
                    {m?.settings.expert.trackViewerEleSmoothing.info}
                  </Alert>
                </>
              )}
              <hr />
              <p>
                {m?.settings.map.homeLocation.label}{' '}
                {homeLocation
                  ? latLonToString(homeLocation, language)
                  : m?.settings.map.homeLocation.undefined}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch(setSelectingHomeLocation(true));
                }}
              >
                <FontAwesomeIcon icon="crosshairs" />{' '}
                {m?.settings.map.homeLocation.select}
              </Button>
            </Tab>
            <Tab title={m?.settings.tab.account} eventKey="2">
              {user ? (
                <>
                  <FormGroup>
                    <FormLabel>{m?.settings.account.name}</FormLabel>
                    <FormControl
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                      required
                      maxLength={255}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>{m?.settings.account.email}</FormLabel>
                    <FormControl
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      maxLength={255}
                    />
                  </FormGroup>
                </>
              ) : (
                <Alert>{m?.settings.account.noAuthInfo}</Alert>
              )}
            </Tab>
            <Tab title={m?.settings.tab.general} eventKey="3">
              <FormCheck
                type="checkbox"
                onChange={(e) => {
                  setPreventTips(!e.currentTarget.checked);
                }}
                checked={!preventTips}
                label={m?.settings.general.tips}
              />
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" type="submit" disabled={!userMadeChanges}>
            <FontAwesomeIcon icon="floppy-o" /> {m?.general.save}
          </Button>
          <Button variant="dark" type="button" onClick={close}>
            <FontAwesomeIcon icon="close" /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
