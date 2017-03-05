import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { connect } from 'react-redux';

import { setTransportType, setPickMode } from 'fm3/actions/routePlannerActions';

class RoutePlanner extends React.Component {

  render() {
    const { pickPointMode, transportType, onChangeTransportType, start, finish, onChangePickPointMode, onCancel } = this.props;

    return (
      <div>
        <Nav>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť plánovač</NavItem>
          <NavItem onClick={onChangePickPointMode.bind(null, 'start')} active={pickPointMode === 'start'} disabled={!!start}>
            <Glyphicon glyph="triangle-right" style={{color: '#32CD32'}}/> Pridať štart
          </NavItem>
          <NavItem onClick={onChangePickPointMode.bind(null, 'midpoint')} active={pickPointMode === 'midpoint'}>
            <Glyphicon glyph="flag" style={{color: 'grey'}}/> Pridať zastávku
          </NavItem>
          <NavItem onClick={onChangePickPointMode.bind(null, 'finish')} active={pickPointMode === 'finish'} disabled={!!finish}>
            <Glyphicon glyph="record" style={{color: '#FF6347'}}/> Pridať cieľ
          </NavItem>
        </Nav>
        <ButtonGroup>
          {
            [ [ 'car', 'car' ], [ 'walk', 'male' ], [ 'bicycle', 'bicycle' ] ].map(([ type, icon ], i) => (
              <Button key={i} className="navbar-btn" active={transportType === type} onClick={onChangeTransportType.bind(null, type)}>
                <i className={`fa fa-${icon}`} aria-hidden="true"/>
              </Button>
            ))
          }
        </ButtonGroup>
      </div>
    );
  }
}

RoutePlanner.propTypes = {
  transportType: React.PropTypes.string,
  pickPointMode: React.PropTypes.string,
  start: React.PropTypes.object,
  finish: React.PropTypes.object,
  onChangeTransportType: React.PropTypes.func.isRequired,
  onChangePickPointMode: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      start: state.routePlanner.start,
      finish: state.routePlanner.finish,
      transportType: state.routePlanner.transportType,
      pickPointMode: state.routePlanner.pickMode
    };
  },
  function (dispatch) {
    return {
      onChangeTransportType(transportType) {
        dispatch(setTransportType(transportType));
      },
      onChangePickPointMode(pickMode) {
        dispatch(setPickMode(pickMode));
      }
    };
  }
)(RoutePlanner);
