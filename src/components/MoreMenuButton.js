import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { setActiveModal, setLocation } from 'fm3/actions/mainActions';
import { authStartLogout } from 'fm3/actions/authActions';

class MoreMenuButton extends React.Component {
  static propTypes = {
    onSettingsShow: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onEmbed: PropTypes.func.isRequired,
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

  handleEmbedClick = () => {
    this.setState({ show: false });
    this.props.onEmbed();
  }

  render() {
    const { user } = this.props;

    return (
      <Button bsSize="small" ref={this.setButton} onClick={this.handleButtonClick} title="Ďalšie">
        <FontAwesomeIcon icon="ellipsis-v" />
        <Overlay rootClose placement="right" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" title="Nástroje">
            <ListGroup>
              {
                user ?
                  <ListGroupItem onClick={this.handleLogoutClick}>
                    <FontAwesomeIcon icon="sign-out" /> Odhlás {user.name}
                  </ListGroupItem>
                  :
                  <ListGroupItem onClick={this.handleLoginClick}>
                    <FontAwesomeIcon icon="sign-in" /> Prihlásenie
                  </ListGroupItem>
              }
              <ListGroupItem onClick={this.handleSettingsShowClick}>
                <FontAwesomeIcon icon="cog" /> Nastavenia
              </ListGroupItem>
              <ListGroupItem onClick={this.handleItemClick} href="http://wiki.freemap.sk/FileDownload" target="_blank">
                <FontAwesomeIcon icon="mobile" /> Exporty mapy
              </ListGroupItem>
              <ListGroupItem onClick={this.handleShareClick}>
                <FontAwesomeIcon icon="share-alt" /> Zdieľať mapu
              </ListGroupItem>
              <ListGroupItem onClick={this.handleEmbedClick}>
                <FontAwesomeIcon icon="code" /> Vložiť do webstránky
              </ListGroupItem>
              <ListGroupItem onClick={this.handleItemClick} href="http://wiki.freemap.sk/StarterGuide" target="_blank">
                <FontAwesomeIcon icon="book" /> Pre začiatočníkov
              </ListGroupItem>
              <ListGroupItem onClick={this.handleItemClick} href="https://github.com/FreemapSlovakia/freemap-v3-react" target="_blank">
                <FontAwesomeIcon icon="github" /> Projekt na GitHub-e
              </ListGroupItem>
              <ListGroupItem onClick={this.handleItemClick} href="http://wiki.freemap.sk/NahlasenieChyby" target="_blank">
                <FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu zobrazenia v mape
              </ListGroupItem>
              <ListGroupItem onClick={this.handleItemClick} href="https://github.com/FreemapSlovakia/freemap-v3-react/issues" target="_blank">
                <FontAwesomeIcon icon="exclamation-triangle" /> Nahlás chybu v portáli
              </ListGroupItem>
            </ListGroup>
          </Popover>
        </Overlay>
      </Button>
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
    onShare() {
      dispatch(setActiveModal('share'));
    },
    onEmbed() {
      dispatch(setActiveModal('embed'));
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
