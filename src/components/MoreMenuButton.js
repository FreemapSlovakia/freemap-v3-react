import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import tips from 'fm3/tips/index.json';

import { setActiveModal, setLocation } from 'fm3/actions/mainActions';
import { authStartLogout, authChooseLoginMethod } from 'fm3/actions/authActions';
import { tipsShow } from 'fm3/actions/tipsActions';

class MoreMenuButton extends React.Component {
  static propTypes = {
    onSettingsShow: PropTypes.func.isRequired,
    onGpxExport: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onEmbed: PropTypes.func.isRequired,
    onSupportUs: PropTypes.func.isRequired,
    onAbout: PropTypes.func.isRequired,
    onLegend: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
    onTip: PropTypes.func.isRequired,
  };

  state = {
    show: false,
    submenu: null,
  }

  setButton = (button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  }

  handleHide = () => {
    this.close();
  }

  handleItemClick = () => {
    this.close();
  }

  handleLoginClick = () => {
    this.close();
    this.props.onLogin();
  }

  handleLogoutClick = () => {
    this.close();
    this.props.onLogout();
  }

  handleShareClick = () => {
    this.close();
    this.props.onShare();
  }

  handleSettingsShowClick = () => {
    this.close();
    this.props.onSettingsShow();
  }

  handleGpxExportClick = () => {
    this.close();
    this.props.onGpxExport();
  }

  handleEmbedClick = () => {
    this.close();
    this.props.onEmbed();
  }

  handleSupportUsClick = () => {
    this.close();
    this.props.onSupportUs();
  }

  handleAboutClick = () => {
    this.close();
    this.props.onAbout();
  }

  handleLegendClick = () => {
    this.close();
    this.props.onLegend();
  }

  handleHelpClick = () => {
    this.setState({ submenu: 'help' });
  }

  handleBackClick = () => {
    this.setState({ submenu: null });
  }

  close = () => {
    this.setState({
      show: false,
      submenu: null,
    });
  }

  handleTipSelect = (tip) => {
    this.props.onTip(tip);
    this.close();
  }

  render() {
    const { user } = this.props;
    const { submenu } = this.state;

    return (
      <React.Fragment>
        <Button ref={this.setButton} onClick={this.handleButtonClick} title="Ďalšie">
          <FontAwesomeIcon icon="ellipsis-v" />
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
              {submenu === null ?
                <React.Fragment>
                  {
                    user ?
                      <MenuItem onClick={this.handleLogoutClick}>
                        <FontAwesomeIcon icon="sign-out" /> Odhlásiť {user.name}
                      </MenuItem>
                      :
                      <MenuItem onClick={this.handleLoginClick}>
                        <FontAwesomeIcon icon="sign-in" /> Prihlásenie
                      </MenuItem>
                  }
                  <MenuItem onClick={this.handleSettingsShowClick}>
                    <FontAwesomeIcon icon="cog" /> Nastavenia
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={this.handleGpxExportClick}>
                    <FontAwesomeIcon icon="share" /> Exportovať do GPX
                  </MenuItem>
                  <MenuItem onClick={this.handleItemClick} href="http://wiki.freemap.sk/FileDownload" target="_blank">
                    <FontAwesomeIcon icon="!icon-gps-device" /> Exporty mapy
                  </MenuItem>
                  <MenuItem onClick={this.handleShareClick}>
                    <FontAwesomeIcon icon="share-alt" /> Zdieľať mapu
                  </MenuItem>
                  <MenuItem onClick={this.handleEmbedClick}>
                    <FontAwesomeIcon icon="code" /> Vložiť do webstránky
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={this.handleItemClick} href="http://wiki.freemap.sk/NahlasenieChyby" target="_blank">
                    <FontAwesomeIcon icon="exclamation-triangle" /> Nahlásiť chybu zobrazenia v mape
                  </MenuItem>
                  <MenuItem onClick={this.handleItemClick} href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank">
                    <FontAwesomeIcon icon="!icon-bug" /> Nahlásiť chybu v portáli
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={this.handleHelpClick}>
                    <FontAwesomeIcon icon="book" /> Pomoc <FontAwesomeIcon icon="chevron-right" />
                  </MenuItem>
                  <MenuItem onClick={this.handleSupportUsClick}>
                    <FontAwesomeIcon icon="heart" style={{ color: 'red' }} /> Podporiť Freemap <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
                  </MenuItem>
                </React.Fragment>
                :
                <React.Fragment>
                  <MenuItem header>
                    <FontAwesomeIcon icon="book" /> Pomoc
                  </MenuItem>
                  <MenuItem onClick={this.handleBackClick}>
                    <FontAwesomeIcon icon="chevron-left" /> Naspäť
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={this.handleLegendClick}>
                    <FontAwesomeIcon icon="map-o" /> Legenda mapy
                  </MenuItem>
                  <MenuItem onClick={this.handleAboutClick}>
                    <FontAwesomeIcon icon="address-card-o" /> Kontakty
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem header>
                    <FontAwesomeIcon icon="lightbulb-o" /> Tipy
                  </MenuItem>
                  {
                    tips.map(([key, name, icon]) => (
                      <MenuItem key={key} onSelect={this.handleTipSelect} eventKey={key}>
                        <FontAwesomeIcon icon={icon} /> {name}
                      </MenuItem>
                    ))
                  }
                </React.Fragment>
              }
            </ul>
            {submenu === null &&
              <div style={{ margin: '4px 18px', fontSize: '18px' }}>
                <a
                  onClick={this.handleItemClick}
                  href="https://www.facebook.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b5998' }}
                  title="Freemap na Facebooku"
                >
                  <FontAwesomeIcon icon="facebook-official" />
                </a>
                {' '}
                <a
                  onClick={this.handleItemClick}
                  href="https://twitter.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0084b4' }}
                  title="Freemap na Twitteri"
                >
                  <FontAwesomeIcon icon="twitter" />
                </a>
                {' '}
                <a
                  onClick={this.handleItemClick}
                  href="https://github.com/FreemapSlovakia"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#333' }}
                  title="Freemap na GitHub-e"
                >
                  <FontAwesomeIcon icon="github" />
                </a>
              </div>
            }
          </Popover>
        </Overlay>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    user: state.auth.user,
  }),
  dispatch => ({
    onSettingsShow() {
      dispatch(setActiveModal('settings'));
    },
    onGpxExport() {
      dispatch(setActiveModal('export-gpx'));
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
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onLogin() {
      dispatch(authChooseLoginMethod());
    },
    onLogout() {
      dispatch(authStartLogout());
    },
    onTip(which) {
      dispatch(tipsShow(which));
    },
  }),
)(MoreMenuButton);
