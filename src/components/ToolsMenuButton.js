import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setTool } from 'fm3/actions/mainActions';

class ToolsMenuButton extends React.Component {
  static propTypes = {
    onToolSet: PropTypes.func.isRequired,
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

  handleToolSelect(tool) {
    this.setState({ show: false });
    this.props.onToolSet(tool);
  }

  render() {
    return (
      <Button bsSize="small" ref={this.setButton} onClick={this.handleButtonClick} title="Nástroje">
        <FontAwesomeIcon icon="briefcase" />
        <Overlay rootClose placement="right" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" title="Nástroje">
            <ListGroup>
              <ListGroupItem onClick={() => this.handleToolSelect('search')}><FontAwesomeIcon icon="search" /> Hľadanie na mape</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('route-planner')}><FontAwesomeIcon icon="map-signs" /> Plánovač</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('objects')}><FontAwesomeIcon icon="map-marker" /> Miesta</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('gallery')}><FontAwesomeIcon icon="picture-o" /> Fotografie</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('measure-dist')}><FontAwesomeIcon icon="arrows-h" /> Meranie</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('track-viewer')}><FontAwesomeIcon icon="road" /> Prehliadač trás</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('info-point')}><FontAwesomeIcon icon="thumb-tack" /> Bod v mape</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('changesets')}><FontAwesomeIcon icon="pencil" /> Zmeny v mape</ListGroupItem>
              <ListGroupItem onClick={() => this.handleToolSelect('map-details')}><FontAwesomeIcon icon="info" /> Detaily v mape</ListGroupItem>
            </ListGroup>
          </Popover>
        </Overlay>
      </Button>
    );
  }
}

export default connect(
  () => ({
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
  }),
)(ToolsMenuButton);
