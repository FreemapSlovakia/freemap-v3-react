import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal, setLocation } from 'fm3/actions/mainActions';
import { authStartLogout } from 'fm3/actions/authActions';

class MoreMenuButton extends React.Component {
  static propTypes = {
    onSettingsShow: PropTypes.func.isRequired,
    onGpxExport: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onEmbed: PropTypes.func.isRequired,
    onSupportUs: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  };

  state = {
    show: false,
  }

  setButton = (button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  }

  handleHide = () => {
    this.setState({ show: false });
  }

  handleItemClick = () => {
    this.setState({ show: false });
  }

  handleLoginClick = () => {
    this.setState({ show: false });
    this.props.onLogin();
  }

  handleLogoutClick = () => {
    this.setState({ show: false });
    this.props.onLogout();
  }

  handleShareClick = () => {
    this.setState({ show: false });
    this.props.onShare();
  }

  handleSettingsShowClick = () => {
    this.setState({ show: false });
    this.props.onSettingsShow();
  }

  handleGpxExportClick = () => {
    this.setState({ show: false });
    this.props.onGpxExport();
  }

  handleEmbedClick = () => {
    this.setState({ show: false });
    this.props.onEmbed();
  }

  handleDonateClick = () => {
    this.setState({ show: false });
    this.props.onSupportUs();
  }

  render() {
    const { user } = this.props;

    return [
      <Button key="UfBjLTRVQp" ref={this.setButton} onClick={this.handleButtonClick} title="Ďalšie">
        <FontAwesomeIcon icon="ellipsis-v" />
      </Button>,
      <Overlay key="34pm2d9CaA" rootClose placement="bottom" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
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
              <FontAwesomeIcon icon="mobile" /> Exporty mapy
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
            <MenuItem onClick={this.handleItemClick} href="https://github.com/FreemapSlovakia/freemap-v3-react/issues" target="_blank">
              <FontAwesomeIcon icon="exclamation-triangle" /> Nahlásiť chybu v portáli
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={this.handleDonateClick}>
              <FontAwesomeIcon icon="heart" style={{ color: 'red' }} /> Podporiť Freemap <FontAwesomeIcon icon="heart" style={{ color: 'red' }} />
            </MenuItem>
          </ul>
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
        </Popover>
      </Overlay>,
    ];
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
    onLocationSet(lat, lon, accuracy) {
      dispatch(setLocation(lat, lon, accuracy));
    },
    onLogin() {
      dispatch({ type: 'AUTH_CHOOSE_LOGIN_METHOD' }); // TODO to actions
      // dispatch(authLogin());
    },
    onLogout() {
      dispatch(authStartLogout());
    },
  }),
)(MoreMenuButton);
