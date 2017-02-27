import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
export default function RoutePlanner({ pickPointMode, routePlannerPoints: { start, finish }, onChangePickPointMode, onCancel }) {

  return (  
    <Nav>
      <NavItem onClick={onCancel}><Glyphicon glyph="remove"/> Zavrieť plánovač</NavItem>
      <NavItem onClick={onChangePickPointMode.bind(null, 'start')} active={pickPointMode === 'start'}>
        <Glyphicon glyph="record" style={{color: '#32CD32'}}/>
        {start.lat ? ' Zmeniť' : ' Pridať'} štart
      </NavItem>
      <NavItem onClick={onChangePickPointMode.bind(null, 'finish')} active={pickPointMode === 'finish'}>
          <Glyphicon glyph="record" style={{color: '#FF6347'}}/>
        {finish.lat ? ' Zmeniť' : ' Pridať'} cieľ
      </NavItem>
    </Nav>
  );
}

RoutePlanner.propTypes = {
  pickPointMode: React.PropTypes.string,
  routePlannerPoints: React.PropTypes.object.isRequired,
  onChangePickPointMode: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};
