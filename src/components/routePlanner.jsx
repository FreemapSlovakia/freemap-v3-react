import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

export default function RoutePlanner({onCancel}) {

  return (
      <Nav>
        <NavItem onClick={onCancel}>Zrušiť plánovač</NavItem>  
        <NavItem >Pridať štart</NavItem>    
        <NavItem >Pridať cieľ</NavItem> 
      </Nav>
  );
}

RoutePlanner.propTypes = {
  onCancel: React.PropTypes.func.isRequired
};
