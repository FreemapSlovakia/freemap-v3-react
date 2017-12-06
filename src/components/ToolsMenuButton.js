import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
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
      <React.Fragment>
        <Button ref={this.setButton} onClick={this.handleButtonClick} title="Nástroje" id="tools-button">
          <FontAwesomeIcon icon="briefcase" />
        </Button>
        <Overlay rootClose placement="bottom" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              <MenuItem onClick={() => this.handleToolSelect('route-planner')}><FontAwesomeIcon icon="map-signs" /> Vyhľadávač trás</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('objects')}><FontAwesomeIcon icon="map-marker" /> Miesta</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('gallery')}><FontAwesomeIcon icon="picture-o" /> Fotografie</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('measure-dist')}><FontAwesomeIcon icon="arrows-h" /> Meranie</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('track-viewer')}><FontAwesomeIcon icon="road" /> Prehliadač trás (GPX)</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('info-point')}><FontAwesomeIcon icon="thumb-tack" /> Bod v mape</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('changesets')}><FontAwesomeIcon icon="pencil" /> Zmeny v mape</MenuItem>
              <MenuItem onClick={() => this.handleToolSelect('map-details')}><FontAwesomeIcon icon="info" /> Detaily v mape</MenuItem>
            </ul>
          </Popover>
        </Overlay>
      </React.Fragment>
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
