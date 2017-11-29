import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';
import { mapRefocus } from 'fm3/actions/mapActions';

class MapSwitchButton extends React.Component {
  static propTypes = {
    zoom: PropTypes.number.isRequired,
    overlays: FmPropTypes.overlays.isRequired,
    mapType: FmPropTypes.mapType.isRequired,
    onMapRefocus: PropTypes.func.isRequired,
    expertMode: PropTypes.bool,
    pictureFilterIsActive: PropTypes.bool,
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

  handleMapSelect = (mapType) => {
    this.setState({ show: false });
    if (this.props.mapType !== mapType) {
      this.props.onMapRefocus({ mapType });
    }
  }

  handleOverlaySelect = (overlay) => {
    const s = new Set(this.props.overlays);
    if (s.has(overlay)) {
      s.delete(overlay);
    } else {
      s.add(overlay);
    }
    this.props.onMapRefocus({ overlays: [...s] });
  }

  render() {
    return (
      <React.Fragment>
        <Button ref={this.setButton} onClick={this.handleButtonClick} title="Vrstvy">
          <FontAwesomeIcon icon="map-o" />
        </Button>
        <Overlay rootClose placement="top" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              {
                baseLayers
                  .filter(({ showOnlyInExpertMode }) => !showOnlyInExpertMode || this.props.expertMode)
                  .map(({ name, type, icon, minZoom, key }) => (
                    <MenuItem
                      key={type}
                      onClick={() => this.handleMapSelect(type)}
                    >
                      <FontAwesomeIcon icon={this.props.mapType === type ? 'check-circle-o' : 'circle-o'} />
                      {' '}
                      <FontAwesomeIcon icon={icon || 'map-o'} />
                      {' '}
                      <span style={{ textDecoration: this.props.zoom < minZoom ? 'line-through' : 'none' }}>
                        {name}
                      </span>
                      {key && ' '}
                      {key && <kbd>{key}</kbd>}
                    </MenuItem>
                  ))
              }
              <MenuItem divider />
              {
                overlayLayers
                  .filter(({ showOnlyInExpertMode }) => !showOnlyInExpertMode || this.props.expertMode)
                  .map(({ name, type, icon, minZoom, key }) => (
                    <MenuItem
                      key={type}
                      onClick={() => this.handleOverlaySelect(type)}
                    >
                      <FontAwesomeIcon icon={this.props.overlays.includes(type) ? 'check-square-o' : 'square-o'} />
                      {' '}
                      <FontAwesomeIcon icon={icon || 'map-o'} />
                      {' '}
                      <span style={{ textDecoration: this.props.zoom < minZoom ? 'line-through' : 'none' }}>
                        {name}
                      </span>
                      {key && ' '}
                      {key && <kbd>{key}</kbd>}
                      {this.props.zoom < minZoom &&
                        <React.Fragment>
                          {' '}
                          <FontAwesomeIcon
                            icon="exclamation-triangle"
                            title={`Dostupné až od priblíženia ${minZoom}`}
                            className="text-warning"
                          />
                        </React.Fragment>
                      }
                      {type === 'I' && this.props.pictureFilterIsActive &&
                        <React.Fragment>
                          {' '}
                          <FontAwesomeIcon
                            icon="filter"
                            title="Filter fotografií je aktívny"
                            className="text-warning"
                          />
                        </React.Fragment>
                      }
                    </MenuItem>
                  ))
              }
            </ul>
          </Popover>
        </Overlay>
      </React.Fragment>
    );
  }
}

export default connect(
  state => ({
    zoom: state.map.zoom,
    mapType: state.map.mapType,
    overlays: state.map.overlays,
    expertMode: state.main.expertMode,
    pictureFilterIsActive: Object.keys(state.gallery.filter).some(key => state.gallery.filter[key]),
  }),
  dispatch => ({
    onMapRefocus(changes) {
      dispatch(mapRefocus(changes));
    },
  }),
)(MapSwitchButton);
