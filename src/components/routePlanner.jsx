import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

export default function RoutePlanner({ pickPointMode, transportType, onChangeTransportType, routePlannerPoints: { start, finish }, onChangePickPointMode, onCancel }) {
  return (  
    <div>
      <Nav>
        <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť plánovač</NavItem>
        <NavItem onClick={onChangePickPointMode.bind(null, 'start')} active={pickPointMode === 'start'}  disabled={!!start.lat}>
          <Glyphicon glyph="triangle-right" style={{color: '#32CD32'}}/>
          &nbsp;Pridať štart
        </NavItem>
        <NavItem onClick={onChangePickPointMode.bind(null, 'midpoint')} active={pickPointMode === 'midpoint'}>
          <Glyphicon glyph="flag" style={{color: 'grey'}}/>
          &nbsp;Pridať zastávku
        </NavItem>
        <NavItem onClick={onChangePickPointMode.bind(null, 'finish')} active={pickPointMode === 'finish'} disabled={!!finish.lat}>
          <Glyphicon glyph="record" style={{color: '#FF6347'}}/>
          &nbsp;Pridať cieľ
        </NavItem>
      </Nav>
      <Nav pullRight={true}>
        <NavItem active={transportType === 'car'} onClick={onChangeTransportType.bind(null, 'car')}>
          <i className="fa fa-car" aria-hidden="true"></i>
        </NavItem>
        <NavItem active={transportType === 'walk'} onClick={onChangeTransportType.bind(null, 'walk')}>
          <i className="fa fa-male" aria-hidden="true"></i>
        </NavItem>
        <NavItem active={transportType === 'bicycle'} onClick={onChangeTransportType.bind(null, 'bicycle')}>
          <i className="fa fa-bicycle" aria-hidden="true"></i>
        </NavItem>
      </Nav>
    </div>
  );
}

RoutePlanner.propTypes = {
  transportType: React.PropTypes.string,
  onChangeTransportType: React.PropTypes.func.isRequired,
  pickPointMode: React.PropTypes.string,
  routePlannerPoints: React.PropTypes.object.isRequired,
  onChangePickPointMode: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};
