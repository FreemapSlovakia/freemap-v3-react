import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

export default function RoutePlanner({ pickPointMode, transportType, onChangeTransportType, routePlannerPoints: { start, finish }, onChangePickPointMode, onCancel }) {
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

RoutePlanner.propTypes = {
  transportType: React.PropTypes.string,
  onChangeTransportType: React.PropTypes.func.isRequired,
  pickPointMode: React.PropTypes.string,
  routePlannerPoints: React.PropTypes.object.isRequired,
  onChangePickPointMode: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};
