import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import {
  setActiveModal,
  setSelectingHomeLocation,
  saveSettings,
} from 'fm3/actions/mainActions';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { latLonToString } from 'fm3/geoutils';
import { overlayLayers } from 'fm3/mapDefinitions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { LeafletMouseEvent } from 'leaflet';
import { getMapLeafletElement } from 'fm3/leafletElementHolder';

export function Settings(): ReactElement {
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
    <Modal show={!selectingHomeLocation} onHide={close}>
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
          <Checkbox
            onChange={(e) => {
              setExpertMode((e.target as HTMLInputElement).checked);
            }}
            checked={expertMode}
          >
            {m?.settings.expert.switch}{' '}
            <OverlayTrigger
              placement="right"
              overlay={
                m && (
                  <Tooltip id="tooltip">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: m.settings.expertInfo,
                      }}
                    />
                  </Tooltip>
                )
              }
            >
              <FontAwesomeIcon icon="question-circle-o" />
            </OverlayTrigger>
          </Checkbox>
          <Tabs id="setting-tabs">
            <Tab title={m?.settings.tab.map} eventKey={1}>
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
                        <MenuItem key={type} eventKey={type}>
                          {icon && <FontAwesomeIcon icon={icon} />}{' '}
                          {m?.mapLayers.letters[type]}{' '}
                          {nf0.format((overlayOpacity[type] || 1) * 100)} %
                        </MenuItem>
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
                onClick={() => {
                  dispatch(setSelectingHomeLocation(true));
                }}
              >
                <FontAwesomeIcon icon="crosshairs" />{' '}
                {m?.settings.map.homeLocation.select}
              </Button>
            </Tab>
            <Tab title={m?.settings.tab.account} eventKey={2}>
              {user ? (
                <>
                  <FormGroup>
                    <ControlLabel>{m?.settings.account.name}</ControlLabel>
                    <FormControl
                      value={name}
                      onChange={(e) => {
                        setName((e.target as HTMLInputElement).value);
                      }}
                      required
                      maxLength={255}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>{m?.settings.account.email}</ControlLabel>
                    <FormControl
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail((e.target as HTMLInputElement).value);
                      }}
                      maxLength={255}
                    />
                  </FormGroup>
                </>
              ) : (
                <Alert>{m?.settings.account.noAuthInfo}</Alert>
              )}
            </Tab>
            <Tab title={m?.settings.tab.general} eventKey={3}>
              <Checkbox
                onChange={(e) => {
                  setPreventTips(!(e.target as HTMLInputElement).checked);
                }}
                checked={!preventTips}
              >
                {m?.settings.general.tips}
              </Checkbox>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="info" type="submit" disabled={!userMadeChanges}>
            <Glyphicon glyph="floppy-disk" /> {m?.general.save}
          </Button>
          <Button type="button" onClick={close}>
            <Glyphicon glyph="remove" /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
