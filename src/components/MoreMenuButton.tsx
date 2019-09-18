import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import tips from 'fm3/tips/index.json';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  authStartLogout,
  authChooseLoginMethod,
} from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import OpenInExternalAppMenuItems from './OpenInExternalAppMenuItems';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface State {
  show: boolean;
  submenu: string | null;
}

class MoreMenuButton extends React.Component<Props, State> {
  state: State = {
    show: false,
    submenu: null,
  };

  button: Button | null = null;
  setButton = (button: Button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.close();
  };

  handleItemClick = () => {
    this.close();
  };

  handleLoginClick = () => {
    this.close();
    this.props.onLogin();
  };

  handleLogoutClick = () => {
    this.close();
    this.props.onLogout();
  };

  handleShareClick = () => {
    this.close();
    this.props.onShare();
  };

  handleSettingsShowClick = () => {
    this.close();
    this.props.onSettingsShow();
  };

  handleGpxExportClick = () => {
    this.close();
    this.props.onGpxExport();
  };

  handlePdfExportClick = () => {
    this.close();
    this.props.onPdfExport();
  };

  handleEmbedClick = () => {
    this.close();
    this.props.onEmbed();
  };

  handleSupportUsClick = () => {
    this.close();
    this.props.onSupportUs();
  };

  handleAboutClick = () => {
    this.close();
    this.props.onAbout();
  };

  handleLegendClick = () => {
    this.close();
    this.props.onLegend();
  };

  handleAutoLanguageClick = () => {
    this.close();
    this.props.onLanguageChange(null);
  };

  handleEnglishClick = () => {
    this.close();
    this.props.onLanguageChange('en');
  };

  handleSlovakClick = () => {
    this.close();
    this.props.onLanguageChange('sk');
  };

  handleCzechClick = () => {
    this.close();
    this.props.onLanguageChange('cs');
  };

  handleHungarianClick = () => {
    this.close();
    this.props.onLanguageChange('hu');
  };

  handleLanguageClick = () => {
    this.setState({ submenu: 'language' });
  };

  handleHelpClick = () => {
    this.setState({ submenu: 'help' });
  };

  handleBackClick = () => {
    this.setState({ submenu: null });
  };

  close = () => {
    this.setState({
      show: false,
      submenu: null,
    });
  };

  handleTipSelect = (tip: any) => {
    this.props.onTip(tip);
    this.close();
  };

  handleOpenExternally = () => {
    this.setState({ submenu: 'openExternally' });
  };

  render() {
    const {
      user,
      t,
      chosenLanguage,
      lat,
      lon,
      zoom,
      expertMode,
      mapType,
    } = this.props;
    const { submenu } = this.state;

    return (
      <>
        <Button
          ref={this.setButton}
          onClick={this.handleButtonClick}
          title={t('more.more')}
        >
          <FontAwesomeIcon icon="bars" />
        </Button>
        <Overlay
          rootClose
          placement="bottom"
          show={this.state.show}
          onHide={this.handleHide}
          target={() => this.button}
          shouldUpdatePosition
        >
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              {submenu === null ? (
                <>
                  <MenuItem onClick={this.handleLanguageClick}>
                    <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv{' '}
                    <FontAwesomeIcon icon="chevron-right" />
                  </MenuItem>
                  {user ? (
                    <MenuItem onClick={this.handleLogoutClick}>
                      <FontAwesomeIcon icon="sign-out" />{' '}
                      {t('more.logOut', { name: user.name })}
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={this.handleLoginClick}>
                      <FontAwesomeIcon icon="sign-in" /> {t('more.logIn')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={this.handleSettingsShowClick}>
                    <FontAwesomeIcon icon="cog" /> {t('more.settings')}
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={this.handleOpenExternally}>
                    <FontAwesomeIcon icon="external-link" />{' '}
                    {t('external.openInExternal')}{' '}
                    <FontAwesomeIcon icon="chevron-right" />
                  </MenuItem>
                  <MenuItem onClick={this.handlePdfExportClick}>
                    <FontAwesomeIcon icon="file-pdf-o" /> {t('more.pdfExport')}
                  </MenuItem>
                  <MenuItem onClick={this.handleGpxExportClick}>
                    <FontAwesomeIcon icon="share" /> {t('more.gpxExport')}
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleItemClick}
                    href="http://wiki.freemap.sk/FileDownload"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon="!icon-gps-device" />{' '}
                    {t('more.mapExports')}
                  </MenuItem>
                  <MenuItem onClick={this.handleShareClick}>
                    <FontAwesomeIcon icon="share-alt" /> {t('more.shareMap')}
                  </MenuItem>
                  <MenuItem onClick={this.handleEmbedClick}>
                    <FontAwesomeIcon icon="code" /> {t('more.embedMap')}
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem
                    onClick={this.handleItemClick}
                    href="http://wiki.freemap.sk/NahlasenieChyby"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon="exclamation-triangle" />{' '}
                    {t('more.reportMapError')}
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleItemClick}
                    href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new"
                    target="_blank"
                  >
                    <FontAwesomeIcon icon="!icon-bug" />{' '}
                    {t('more.reportAppError')}
                  </MenuItem>
                  <MenuItem divider />
                  {['sk', 'cs'].includes(this.props.language) && (
                    <MenuItem onClick={this.handleHelpClick}>
                      <FontAwesomeIcon icon="book" /> {t('more.help')}{' '}
                      <FontAwesomeIcon icon="chevron-right" />
                    </MenuItem>
                  )}
                  <MenuItem onClick={this.handleSupportUsClick}>
                    <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />{' '}
                    {t('more.supportUs')}{' '}
                    <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
                  </MenuItem>
                </>
              ) : submenu === 'help' ? (
                <>
                  <MenuItem header>
                    <FontAwesomeIcon icon="book" /> {t('more.help')}
                  </MenuItem>
                  <MenuItem onClick={this.handleBackClick}>
                    <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}
                  </MenuItem>
                  <MenuItem divider />
                  {['A', 'K', 'T', 'C'].includes(this.props.mapType) && (
                    <MenuItem onClick={this.handleLegendClick}>
                      <FontAwesomeIcon icon="map-o" /> {t('more.mapLegend')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={this.handleAboutClick}>
                    <FontAwesomeIcon icon="address-card-o" />{' '}
                    {t('more.contacts')}
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem header>
                    <FontAwesomeIcon icon="lightbulb-o" /> {t('more.tips')}
                  </MenuItem>
                  {tips.map(([key, name, icon]) => (
                    <MenuItem
                      key={key}
                      onSelect={this.handleTipSelect}
                      eventKey={key}
                    >
                      <FontAwesomeIcon icon={icon} /> {name}
                    </MenuItem>
                  ))}
                </>
              ) : submenu === 'openExternally' ? (
                <>
                  <MenuItem header>
                    <FontAwesomeIcon icon="external-link" />{' '}
                    {t('external.openInExternal')}
                  </MenuItem>
                  <MenuItem onClick={this.handleBackClick}>
                    <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}
                  </MenuItem>
                  <MenuItem divider />
                  <OpenInExternalAppMenuItems
                    lat={lat}
                    lon={lon}
                    zoom={zoom}
                    mapType={mapType}
                    expertMode={expertMode}
                    onSelect={this.close}
                  />
                </>
              ) : submenu === 'language' ? (
                <>
                  <MenuItem header>
                    <FontAwesomeIcon icon="language" /> Language / Jazyk / Nyelv
                  </MenuItem>
                  <MenuItem onClick={this.handleBackClick}>
                    <FontAwesomeIcon icon="chevron-left" /> {t('more.back')}
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem
                    onClick={this.handleAutoLanguageClick}
                    active={chosenLanguage === null}
                  >
                    {t('more.automaticLanguage')}
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleEnglishClick}
                    active={chosenLanguage === 'en'}
                  >
                    English
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleSlovakClick}
                    active={chosenLanguage === 'sk'}
                  >
                    Slovensky
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleCzechClick}
                    active={chosenLanguage === 'cs'}
                  >
                    Česky
                  </MenuItem>
                  <MenuItem
                    onClick={this.handleHungarianClick}
                    active={chosenLanguage === 'hu'}
                  >
                    Magyar
                  </MenuItem>
                </>
              ) : null}
            </ul>
            {submenu === null && (
              <div style={{ margin: '4px 18px', fontSize: '18px' }}>
                <a
                  onClick={this.handleItemClick}
                  href="https://www.facebook.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b5998' }}
                  title={t('more.facebook')}
                >
                  <FontAwesomeIcon icon="facebook-official" />
                </a>{' '}
                <a
                  onClick={this.handleItemClick}
                  href="https://twitter.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0084b4' }}
                  title={t('more.twitter')}
                >
                  <FontAwesomeIcon icon="twitter" />
                </a>{' '}
                <a
                  onClick={this.handleItemClick}
                  href="https://github.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#333' }}
                  title={t('more.github')}
                >
                  <FontAwesomeIcon icon="github" />
                </a>
              </div>
            )}
          </Popover>
        </Overlay>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  user: state.auth.user,
  chosenLanguage: state.l10n.chosenLanguage,
  language: state.l10n.language,
  mapType: state.map.mapType,
  lat: state.map.lat,
  lon: state.map.lon,
  zoom: state.map.zoom,
  expertMode: state.main.expertMode,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onSettingsShow() {
    dispatch(setActiveModal('settings'));
  },
  onGpxExport() {
    dispatch(setActiveModal('export-gpx'));
  },
  onPdfExport() {
    dispatch(setActiveModal('export-pdf'));
  },
  onShare() {
    dispatch(setActiveModal('share'));
  },
  onEmbed() {
    dispatch(setActiveModal('embed'));
  },
  onSupportUs() {
    dispatch(setActiveModal('supportUs'));
  },
  onAbout() {
    dispatch(setActiveModal('about'));
  },
  onLegend() {
    dispatch(setActiveModal('legend'));
  },
  onLogin() {
    dispatch(authChooseLoginMethod());
  },
  onLogout() {
    dispatch(authStartLogout());
  },
  onTip(which: string) {
    dispatch(tipsShow(which));
  },
  onLanguageChange(lang: string | null) {
    dispatch(l10nSetChosenLanguage(lang));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MoreMenuButton));
