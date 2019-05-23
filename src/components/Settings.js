import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
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

import { setActiveModal, setSelectingHomeLocation, saveSettings } from 'fm3/actions/mainActions';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { formatGpsCoord } from 'fm3/geoutils';
import mapEventEmitter from 'fm3/emitters/mapEventEmitter';
import * as FmPropTypes from 'fm3/propTypes';
import { overlayLayers } from 'fm3/mapDefinitions';
import injectL10n from 'fm3/l10nInjector';

class Settings extends React.Component {
  static propTypes = {
    homeLocation: PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
    }),
    tileFormat: FmPropTypes.tileFormat.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onHomeLocationSelect: PropTypes.func.isRequired,
    onHomeLocationSelectionFinish: PropTypes.func.isRequired,
    overlayOpacity: PropTypes.shape({}).isRequired,
    overlayPaneOpacity: PropTypes.number.isRequired,
    expertMode: PropTypes.bool.isRequired,
    eleSmoothingFactor: PropTypes.number.isRequired,
    selectingHomeLocation: PropTypes.bool,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
    }),
    preventTips: PropTypes.bool,
    language: PropTypes.string,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      tileFormat: props.tileFormat,
      homeLocation: props.homeLocation,
      overlayOpacity: props.overlayOpacity,
      overlayPaneOpacity: props.overlayPaneOpacity,
      expertMode: props.expertMode,
      eleSmoothingFactor: props.eleSmoothingFactor,
      name: props.user && props.user.name || '',
      email: props.user && props.user.email || '',
      preventTips: props.preventTips,
      selectedOverlay: 't',
    };
  }

  componentDidMount() {
    mapEventEmitter.on('mapClick', this.onHomeLocationSelected);
  }

  componentWillUnmount() {
    mapEventEmitter.removeListener('mapClick', this.onHomeLocationSelected);
  }

  onHomeLocationSelected = (lat, lon) => {
    this.setState({ homeLocation: { lat, lon } });
    this.props.onHomeLocationSelectionFinish();
  }

  handleSave = (e) => {
    e.preventDefault();

    this.props.onSave(
      this.state.tileFormat,
      this.state.homeLocation,
      this.state.overlayOpacity,
      this.state.overlayPaneOpacity,
      this.state.expertMode,
      this.state.eleSmoothingFactor,
      this.props.user ? { name: this.state.name.trim() || null, email: this.state.email.trim() || null } : null,
      this.state.preventTips,
    );
  }

  handleNameChange = (e) => {
    this.setState({ name: e.target.value });
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  }

  handleShowTipsChange = (e) => {
    this.setState({
      preventTips: !e.target.checked,
    });
  }

  handleOverlaySelect = (o) => {
    this.setState({
      selectedOverlay: o,
    });
  }

  handleOverlayOpacityChange = (newOpacity) => {
    this.setState(state => ({
      overlayOpacity: {
        ...state.overlayOpacity,
        [state.selectedOverlay]: newOpacity,
      },
    }));
  }

  handleExpertModeChange = (e) => {
    this.setState({
      expertMode: e.target.checked,
    });
  }

  render() {
    const { onClose, onHomeLocationSelect, selectingHomeLocation, user, language, t } = this.props;
    const { homeLocation, tileFormat, expertMode,
      overlayOpacity, overlayPaneOpacity, eleSmoothingFactor,
      name, email, preventTips, selectedOverlay } = this.state;

    const userMadeChanges = ['tileFormat', 'homeLocation', 'expertMode',
      'eleSmoothingFactor', 'preventTips', 'overlayPaneOpacity']
      .some(prop => this.state[prop] !== this.props[prop])
      || user && (name !== (user.name || '') || email !== (user.email || ''))
      || overlayLayers.some(({ type }) => (overlayOpacity[type] || 1) !== (this.props.overlayOpacity[type] || 1));

    const selectedOverlayDetails = overlayLayers.find(({ type }) => type === selectedOverlay);

    const nf0 = Intl.NumberFormat(language, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
      <Modal show={!selectingHomeLocation} onHide={onClose}>
        <form onSubmit={this.handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon="cog" /> {t('more.settings')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Checkbox onChange={this.handleExpertModeChange} checked={expertMode}>
              {t('settings.expert.switch')}
              {' '}
              <OverlayTrigger
                placement="right"
                overlay={(
                  <Tooltip id="tooltip">
                    <div dangerouslySetInnerHTML={{ __html: t('settings.expertInfo') }} />
                  </Tooltip>
                )}
              >
                <FontAwesomeIcon icon="question-circle-o" />
              </OverlayTrigger>
            </Checkbox>
            <Tabs id="setting-tabs">
              <Tab title={t('settings.tab.map')} eventKey={1}>
                <p>{t('settings.map.imgFormat.label')}</p>
                <ButtonGroup>
                  <Button
                    active={tileFormat === 'png'}
                    onClick={() => this.setState({ tileFormat: 'png' })}
                  >
                    PNG
                  </Button>
                  <Button
                    active={tileFormat === 'jpeg'}
                    onClick={() => this.setState({ tileFormat: 'jpeg' })}
                  >
                    JPEG
                  </Button>
                </ButtonGroup>
                <br />
                <br />
                <Alert>{t('settings.map.imgFormat.hint')}</Alert>
                <hr />
                <div>
                  <p>
                    {t('settings.map.overlayPaneOpacity')}
                    {' '}
                    {nf0.format(overlayPaneOpacity * 100)}
                    {' %'}
                  </p>
                  <Slider
                    value={overlayPaneOpacity}
                    min={0}
                    max={1}
                    step={0.05}
                    tooltip={false}
                    onChange={newValue => this.setState({ overlayPaneOpacity: newValue })}
                  />
                </div>
                {expertMode && (
                  <>
                    <hr />
                    <div>
                      <p>{t('settings.expert.overlayOpacity')}</p>
                      <DropdownButton
                        id="overlayOpacity"
                        onSelect={this.handleOverlaySelect}
                        title={(
                          <>
                            <FontAwesomeIcon icon={selectedOverlayDetails.icon} />
                            {' '}
                            {t(`mapLayers.overlay.${selectedOverlayDetails.type}`)}
                            {' '}
                            {nf0.format((overlayOpacity[selectedOverlay] || 1) * 100)} %
                          </>
                        )}
                      >
                        {
                          overlayLayers.map(({ type, icon }) => (
                            <MenuItem key={type} eventKey={type}>
                              {icon && <FontAwesomeIcon icon={icon} />}
                              {' '}
                              {t(`mapLayers.overlay.${type}`)}
                              {' '}
                              {nf0.format((overlayOpacity[type] || 1) * 100)} %
                            </MenuItem>
                          ))
                        }
                      </DropdownButton>
                      <Slider
                        value={overlayOpacity[selectedOverlay] || 1}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        tooltip={false}
                        onChange={this.handleOverlayOpacityChange}
                      />
                    </div>
                  </>
                )}
                {expertMode && (
                  <>
                    <hr />
                    <div>
                      <p>
                        {t('settings.expert.trackViewerEleSmoothing.label', { value: eleSmoothingFactor })}
                      </p>
                      <Slider
                        value={eleSmoothingFactor}
                        min={1}
                        max={10}
                        step={1}
                        tooltip={false}
                        onChange={newValue => this.setState({ eleSmoothingFactor: newValue })}
                      />
                    </div>
                    <Alert>
                      {t('settings.expert.trackViewerEleSmoothing.info')}
                    </Alert>
                  </>
                )}
                <hr />
                <p>
                  {t('settings.map.homeLocation.label')}
                  {' '}
                  {homeLocation
                    ? `${formatGpsCoord(homeLocation.lat, 'SN', 'DMS', language)} ${formatGpsCoord(homeLocation.lon, 'WE', 'DMS', language)}`
                    : t('settings.map.homeLocation.undefined')
                  }
                </p>
                <Button onClick={() => onHomeLocationSelect()}>
                  <FontAwesomeIcon icon="crosshairs" />
                  {' '}
                  {t('settings.map.homeLocation.select')}
                </Button>
              </Tab>
              <Tab title={t('settings.tab.account')} eventKey={2}>
                {user ? (
                  <>
                    <FormGroup>
                      <ControlLabel>{t('settings.account.name')}</ControlLabel>
                      <FormControl value={name} onChange={this.handleNameChange} required maxlength={255} />
                    </FormGroup>
                    <FormGroup>
                      <ControlLabel>{t('settings.account.email')}</ControlLabel>
                      <FormControl type="email" value={email} onChange={this.handleEmailChange} maxlength={255} />
                    </FormGroup>
                  </>
                ) : (
                  <Alert>{t('settings.account.noAuthInfo')}</Alert>
                )}
              </Tab>
              <Tab title={t('settings.tab.general')} eventKey={3}>
                <Checkbox onChange={this.handleShowTipsChange} checked={!preventTips}>
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
              <Glyphicon glyph="remove" /> {t('general.cancel')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      tileFormat: state.map.tileFormat,
      homeLocation: state.main.homeLocation,
      overlayOpacity: state.map.overlayOpacity,
      overlayPaneOpacity: state.map.overlayPaneOpacity,
      expertMode: state.main.expertMode,
      eleSmoothingFactor: state.main.eleSmoothingFactor,
      selectingHomeLocation: state.main.selectingHomeLocation,
      user: state.auth.user,
      preventTips: state.tips.preventTips,
      language: state.l10n.language,
    }),
    dispatch => ({
      onSave(tileFormat, homeLocation, overlayOpacity, overlayPaneOpacity, expertMode,
        eleSmoothingFactor, user, preventTips) {
        dispatch(saveSettings(tileFormat, homeLocation, overlayOpacity, overlayPaneOpacity, expertMode,
          eleSmoothingFactor, user, preventTips));
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
    }),
  ),
)(Settings);
