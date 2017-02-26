import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

export default function RoutePlanner({routePlannerPoints, onPickPointMode, onCancel}) {
  return (
      <Nav>
        <NavItem onClick={onCancel}>Zrušiť plánovač</NavItem>  
        <NavItem onClick={onPickPointMode.bind(null, 'start')}>{routePlannerPoints.start.lat ? 'Zmeniť' : 'Pridať'} štart</NavItem>    
        <NavItem onClick={onPickPointMode.bind(null, 'finish')}>{routePlannerPoints.finish.lat ? 'Zmeniť' : 'Pridať'} cieľ</NavItem> 
      </Nav>
  );
}

RoutePlanner.propTypes = {
  routePlannerPoints: React.PropTypes.object,
  onPickPointMode:  React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};
