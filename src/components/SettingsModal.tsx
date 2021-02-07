import {
  saveSettings,
  setActiveModal,
  setSelectingHomeLocation,
} from 'fm3/actions/mainActions';
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
import {
  FaCheck,
  FaCog,
  FaCrosshairs,
  FaRegQuestionCircle,
  FaTimes,
} from 'react-icons/fa';
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
            <FaCog /> {m?.more.settings}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormGroup>
            <FormCheck
              id="chk-expert"
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
                    <FaRegQuestionCircle />
                  </OverlayTrigger>
                </>
              }
            />
          </FormGroup>
          <Tabs id="setting-tabs">
            <Tab title={m?.settings.tab.map} eventKey="1" className="pt-2">
              <FormGroup>
                <FormLabel>
                  {m?.settings.map.overlayPaneOpacity}{' '}
                  {nf0.format(overlayPaneOpacity * 100)}
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
              {expertMode && selectedOverlayDetails && (
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
                            {nf0.format(
                              (overlayOpacity[selectedOverlay] || 1) * 100,
                            )}{' '}
                            %
                          </>
                        }
                      >
                        {overlayLayers.map(({ type, icon }) => (
                          <Dropdown.Item key={type} eventKey={type}>
                            {icon} {m?.mapLayers.letters[type]}{' '}
                            {nf0.format((overlayOpacity[type] || 1) * 100)} %
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
              {expertMode && (
                <>
                  <hr />
                  <FormGroup>
                    <FormLabel>
                      {m?.settings.expert.trackViewerEleSmoothing.label(
                        eleSmoothingFactor,
                      )}
                    </FormLabel>
                    <FormControl
                      type="range"
                      custom
                      value={eleSmoothingFactor}
                      min={1}
                      max={10}
                      step={1}
                      onChange={(e) =>
                        setEleSmoothingFactor(Number(e.currentTarget.value))
                      }
                    />
                  </FormGroup>
                  <Alert variant="secondary">
                    {m?.settings.expert.trackViewerEleSmoothing.info}
                  </Alert>
                </>
              )}
              <hr />
              <FormGroup>
                <FormLabel>
                  {m?.settings.map.homeLocation.label}{' '}
                  {homeLocation
                    ? latLonToString(homeLocation, language)
                    : m?.settings.map.homeLocation.undefined}
                </FormLabel>
                <Button
                  className="d-block"
                  variant="secondary"
                  onClick={() => {
                    dispatch(setSelectingHomeLocation(true));
                  }}
                >
                  <FaCrosshairs /> {m?.settings.map.homeLocation.select}
                </Button>
              </FormGroup>
            </Tab>
            <Tab title={m?.settings.tab.account} eventKey="2" className="pt-2">
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
                <Alert variant="warning">
                  {m?.settings.account.noAuthInfo}
                </Alert>
              )}
            </Tab>
            <Tab title={m?.settings.tab.general} eventKey="3" className="pt-2">
              <FormCheck
                id="chk-preventTips"
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
