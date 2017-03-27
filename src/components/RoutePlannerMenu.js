import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import { routePlannerSetStart, routePlannerSetFinish, routePlannerSetTransportType, routePlannerSetPickMode, routePlannerToggleItineraryVisibility } from 'fm3/actions/routePlannerActions';
import { setTool, setActivePopup } from 'fm3/actions/mainActions';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { getCurrentPosition } from 'fm3/geoutils';

import 'fm3/styles/routePlanner.scss';

function RoutePlannerMenu({ onSetStart, onSetFinish, onShowToast, pickPointMode, transportType,
    onChangeTransportType, onChangePickPointMode, onCancel, homeLocation, onLaunchSettingsPopup,
    onToggleItineraryVisibility, itineraryIsVisible }) {
  function setFromCurrentPosition(pointType) {
    getCurrentPosition().then(({ lat, lon }) => {
      if (pointType === 'start') {
        onSetStart({ lat, lon });
      } else if (pointType === 'finish') {
        onSetFinish({ lat, lon });
      } // else fail
    }).catch(() => {
      onShowToast('error', null, 'Nepodarilo sa získať aktuálnu polohu');
    });
  }

  function setFromHomeLocation(pointType) {
    const { lat, lon } = homeLocation;
    if (!lat) {
      const line1 = null;
      const line2 = [
        'Najpr si musíte nastaviť domovskú polohu cez',
        ' ',
        <Button key="settings" onClick={onLaunchSettingsPopup}>
          Nastavenia
        </Button>,
      ];
      onShowToast('info', line1, line2);
    } else if (pointType === 'start') {
      onSetStart({ lat, lon });
    } else if (pointType === 'finish') {
      onSetFinish({ lat, lon });
    }
  }

  // FIXME wrapper element can't be used
  return (
    <div>
      <Navbar.Form pullLeft>
        <ButtonGroup>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="play" color="#409a40" /> Štart</span>}
            id="add-start-dropdown"
            onClick={() => onChangePickPointMode('start')}
            active={pickPointMode === 'start'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={() => setFromCurrentPosition('start')}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={() => setFromHomeLocation('start')}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
          <Button onClick={() => onChangePickPointMode('midpoint')} active={pickPointMode === 'midpoint'}>
            <FontAwesomeIcon icon="pause" color="#247dc9" /> Zastávka
          </Button>
          <DropdownButton
            title={<span><FontAwesomeIcon icon="stop" color="#d9534f" /> Cieľ</span>}
            id="add-finish-dropdown"
            onClick={() => onChangePickPointMode('finish')}
            active={pickPointMode === 'finish'}
          >
            <MenuItem><FontAwesomeIcon icon="map-marker" /> Vybrať na mape</MenuItem>
            <MenuItem onClick={() => setFromCurrentPosition('finish')}><FontAwesomeIcon icon="bullseye" /> Aktuálna poloha</MenuItem>
            <MenuItem onClick={() => setFromHomeLocation('finish')}><FontAwesomeIcon icon="home" /> Domov</MenuItem>
          </DropdownButton>
        </ButtonGroup>
        {' '}
        <ButtonGroup>
          {
            [['car', 'car'], ['walk', 'male'], ['bicycle', 'bicycle']].map(([type, icon]) => (
              <Button key={type} active={transportType === type} onClick={() => onChangeTransportType(type)}>
                <FontAwesomeIcon icon={icon} />
              </Button>
            ))
          }
        </ButtonGroup>
        {' '}
        <Button onClick={() => onToggleItineraryVisibility()} active={itineraryIsVisible}>
          <FontAwesomeIcon icon="list-ol" /> Itinerár
        </Button>
      </Navbar.Form>
      <Nav>
        <NavItem onClick={onCancel}>
          <Glyphicon glyph="remove" /> Zavrieť
        </NavItem>
      </Nav>
    </div>
  );
}

RoutePlannerMenu.propTypes = {
  onSetStart: React.PropTypes.func.isRequired,
  onSetFinish: React.PropTypes.func.isRequired,
  transportType: React.PropTypes.string,
  pickPointMode: React.PropTypes.string,
  onChangeTransportType: React.PropTypes.func.isRequired,
  onChangePickPointMode: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  onShowToast: React.PropTypes.func.isRequired,
  homeLocation: React.PropTypes.shape({
    lat: React.PropTypes.number,
    lon: React.PropTypes.number,
  }),
  onLaunchSettingsPopup: React.PropTypes.func.isRequired,
  onToggleItineraryVisibility: React.PropTypes.func.isRequired,
  itineraryIsVisible: React.PropTypes.bool.isRequired,
};

export default connect(
  state => ({
    homeLocation: state.main.homeLocation,
    transportType: state.routePlanner.transportType,
    pickPointMode: state.routePlanner.pickMode,
    itineraryIsVisible: state.routePlanner.itineraryIsVisible,
  }),
  dispatch => ({
    onSetStart(start) {
      dispatch(routePlannerSetStart(start));
    },
    onSetFinish(finish) {
      dispatch(routePlannerSetFinish(finish));
    },
    onToggleItineraryVisibility() {
      dispatch(routePlannerToggleItineraryVisibility());
    },
    onChangeTransportType(transportType) {
      dispatch(routePlannerSetTransportType(transportType));
    },
    onChangePickPointMode(pickMode) {
      dispatch(routePlannerSetPickMode(pickMode));
    },
    onCancel() {
      dispatch(setTool(null));
    },
    onLaunchSettingsPopup() {
      dispatch(setActivePopup('settings'));
    },
  }),
)(RoutePlannerMenu);
