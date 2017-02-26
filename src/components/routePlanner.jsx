import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

export default function RoutePlanner({ pickPointMode, routePlannerPoints: { start, finish }, onChangePickPointMode, onCancel }) {
  return (
    <Nav>
      <NavItem onClick={onCancel}>Zavrieť plánovač</NavItem>
      <NavItem
          onClick={onChangePickPointMode.bind(null, 'start')}
          active={pickPointMode === 'start'}>
        {start.lat ? 'Zmeniť' : 'Pridať'} štart
      </NavItem>
      <NavItem
          onClick={onChangePickPointMode.bind(null, 'finish')}
          active={pickPointMode === 'finish'}>
        {finish.lat ? 'Zmeniť' : 'Pridať'} cieľ
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
