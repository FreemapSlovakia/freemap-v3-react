import React from 'react';
import { connect } from 'react-redux';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Navbar from 'react-bootstrap/lib/Navbar';
import { resetMap } from 'fm3/actions/mapActions';
import 'fm3/styles/navbarHeader.scss';

class NavbarHeader extends React.Component {
  toolLabel() {
    if (this.props.tool === 'route-planner') {
      return (<span><FontAwesomeIcon icon="map-signs"/> Plánovač</span>);
    }
  }

  render() {
    const { tool } = this.props;
    const doDisplayToolLabel = tool === 'route-planner';

    return (            
      <Navbar.Header>
        <Navbar.Brand>
          <img onClick={() => this.props.onResetMap}
            className="freemap-logo"
            src={require('fm3/images/freemap-logo.png')}/>
        </Navbar.Brand>
        {doDisplayToolLabel && 
          <Navbar.Text style={{ display: 'inline-block', paddingLeft: '10px' }}>
            {this.toolLabel()}
          </Navbar.Text>}
        <Navbar.Toggle/>
      </Navbar.Header>
    );
  }
}

NavbarHeader.propTypes = {
  tool: React.PropTypes.string,
  onResetMap: React.PropTypes.func.isRequired
};

export default connect(
  function (state) {
    return {
      tool: state.main.tool
    };
  },
  function (dispatch) {
    return {
      onResetMap() {
        dispatch(resetMap());
      }
    };
  }
)(NavbarHeader);
