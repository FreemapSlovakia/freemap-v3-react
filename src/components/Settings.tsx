import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

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
import { mapEventEmitter } from 'fm3/mapEventEmitter';
import { overlayLayers } from 'fm3/mapDefinitions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { LatLon } from 'fm3/types/common';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const SettingsInt: React.FC<Props> = ({
  onClose,
  onHomeLocationSelect,
  selectingHomeLocation,
  user,
  language,
  t,
  onSave,
  onHomeLocationSelectionFinish,
  ...props
}) => {
  const [homeLocation, setHomeLocation] = useState(props.homeLocation);

  const [overlayOpacity, setOverlayOpacity] = useState(props.overlayOpacity);

  const [overlayPaneOpacity, setOverlayPaneOpacity] = useState(
    props.overlayPaneOpacity,
  );

  const [expertMode, setExpertMode] = useState<boolean>(props.expertMode);

  const [eleSmoothingFactor, setEleSmoothingFactor] = useState(
    props.eleSmoothingFactor,
  );

  const [name, setName] = useState(user?.name ?? '');

  const [email, setEmail] = useState(user?.email ?? '');

  const [preventTips, setPreventTips] = useState(props.preventTips);

  const [selectedOverlay, setSelectedOverlay] = useState('t');

  useEffect(() => {
    const onHomeLocationSelected = (lat: number, lon: number) => {
      setHomeLocation({ lat, lon });
      onHomeLocationSelectionFinish();
    };

    mapEventEmitter.on('mapClick', onHomeLocationSelected);

    return () => {
      mapEventEmitter.removeListener('mapClick', onHomeLocationSelected);
    };
  }, [onHomeLocationSelectionFinish]);

  const userMadeChanges =
    homeLocation !== props.homeLocation ||
    expertMode !== props.expertMode ||
    eleSmoothingFactor !== props.eleSmoothingFactor ||
    preventTips !== props.preventTips ||
    overlayPaneOpacity !== props.overlayPaneOpacity ||
    (user && (name !== (user.name ?? '') || email !== (user.email ?? ''))) ||
    overlayLayers.some(
      ({ type }) =>
        (overlayOpacity[type] || 1) !== (props.overlayOpacity[type] || 1),
    );

  const selectedOverlayDetails = overlayLayers.find(
    ({ type }) => type === selectedOverlay,
  );

  const nf0 = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <Modal show={!selectingHomeLocation} onHide={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          onSave(
            homeLocation,
            overlayOpacity,
            overlayPaneOpacity,
            expertMode,
            eleSmoothingFactor,
            user
              ? {
                  name: name.trim() || null,
                  email: email.trim() || null,
                }
              : null,
            preventTips,
          );
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon="cog" /> {t('more.settings')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Checkbox
            onChange={(e) => {
              setExpertMode((e.target as HTMLInputElement).checked);
            }}
            checked={expertMode}
          >
            {t('settings.expert.switch')}{' '}
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tooltip">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: t('settings.expertInfo'),
                    }}
                  />
                </Tooltip>
              }
            >
              <FontAwesomeIcon icon="question-circle-o" />
            </OverlayTrigger>
          </Checkbox>
          <Tabs id="setting-tabs">
            <Tab title={t('settings.tab.map')} eventKey={1}>
              <div>
                <p>
                  {t('settings.map.overlayPaneOpacity')}{' '}
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
                    <p>{t('settings.expert.overlayOpacity')}</p>
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
                          {t(
                            `mapLayers.overlay.${selectedOverlayDetails.type}`,
                          )}{' '}
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
                          {t(`mapLayers.overlay.${type}`)}{' '}
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
                      {t('settings.expert.trackViewerEleSmoothing.label', {
                        value: eleSmoothingFactor,
                      })}
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
                    {t('settings.expert.trackViewerEleSmoothing.info')}
                  </Alert>
                </>
              )}
              <hr />
              <p>
                {t('settings.map.homeLocation.label')}{' '}
                {homeLocation
                  ? latLonToString(homeLocation, language)
                  : t('settings.map.homeLocation.undefined')}
              </p>
              <Button onClick={() => onHomeLocationSelect()}>
                <FontAwesomeIcon icon="crosshairs" />{' '}
                {t('settings.map.homeLocation.select')}
              </Button>
            </Tab>
            <Tab title={t('settings.tab.account')} eventKey={2}>
              {user ? (
                <>
                  <FormGroup>
                    <ControlLabel>{t('settings.account.name')}</ControlLabel>
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
                    <ControlLabel>{t('settings.account.email')}</ControlLabel>
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
                <Alert>{t('settings.account.noAuthInfo')}</Alert>
              )}
            </Tab>
            <Tab title={t('settings.tab.general')} eventKey={3}>
              <Checkbox
                onChange={(e) => {
                  setPreventTips(!(e.target as HTMLInputElement).checked);
                }}
                checked={!preventTips}
              >
                {t('settings.general.tips')}
              </Checkbox>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="info" type="submit" disabled={!userMadeChanges}>
            <Glyphicon glyph="floppy-disk" /> {t('general.save')}
          </Button>
          <Button type="button" onClick={onClose}>
            <Glyphicon glyph="remove" /> {t('general.cancel')} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  homeLocation: state.main.homeLocation,
  overlayOpacity: state.map.overlayOpacity,
  overlayPaneOpacity: state.map.overlayPaneOpacity,
  expertMode: state.main.expertMode,
  eleSmoothingFactor: state.main.eleSmoothingFactor,
  selectingHomeLocation: state.main.selectingHomeLocation,
  user: state.auth.user,
  preventTips: state.tips.preventTips,
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSave(
    homeLocation: LatLon | null,
    overlayOpacity: { [type: string]: number },
    overlayPaneOpacity: number,
    expertMode: boolean,
    trackViewerEleSmoothingFactor: number,
    user: { name: string | null; email: string | null } | null,
    preventTips: boolean,
  ) {
    dispatch(
      saveSettings({
        homeLocation,
        overlayOpacity,
        overlayPaneOpacity,
        expertMode,
        trackViewerEleSmoothingFactor,
        user,
        preventTips,
      }),
    );
  },
  onClose() {
    dispatch(setActiveModal(null));
  },
  onHomeLocationSelect() {
    dispatch(setSelectingHomeLocation(true));
  },
  onHomeLocationSelectionFinish() {
    dispatch(setSelectingHomeLocation(false));
  },
});

export const Settings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(SettingsInt));
