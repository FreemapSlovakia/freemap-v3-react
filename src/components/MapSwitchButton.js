import { connect } from 'react-redux';
import { compose } from 'redux';
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
import injectL10n from 'fm3/l10nInjector';

class MapSwitchButton extends React.Component {
  static propTypes = {
    zoom: PropTypes.number.isRequired,
    overlays: FmPropTypes.overlays.isRequired,
    mapType: FmPropTypes.mapType.isRequired,
    onMapRefocus: PropTypes.func.isRequired,
    expertMode: PropTypes.bool,
    pictureFilterIsActive: PropTypes.bool,
    isAdmin: PropTypes.bool,
    stravaAuth: PropTypes.bool,
    t: PropTypes.func.isRequired,
  };

  state = {
    show: false,
  };

  setButton = button => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  handleMapSelect = mapType => {
    this.setState({ show: false });
    if (this.props.mapType !== mapType) {
      this.props.onMapRefocus({ mapType });
    }
  };

  handleOverlaySelect = (e, overlay) => {
    if (e.target.dataset && e.target.dataset.strava) {
      window.open('https://www.strava.com/heatmap');
      return;
    }
    const s = new Set(this.props.overlays);
    if (s.has(overlay)) {
      s.delete(overlay);
    } else {
      s.add(overlay);
    }
    this.props.onMapRefocus({ overlays: [...s] });
  };

  render() {
    const {
      isAdmin,
      t,
      mapType,
      overlays,
      expertMode,
      zoom,
      pictureFilterIsActive,
      stravaAuth,
    } = this.props;

    return (
      <>
        <Button
          ref={this.setButton}
          onClick={this.handleButtonClick}
          title={t('mapLayers.layers')}
        >
          <FontAwesomeIcon icon="map-o" />
        </Button>
        <Overlay
          rootClose
          placement="top"
          show={this.state.show}
          onHide={this.handleHide}
          target={() => this.button}
        >
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              {// TODO base and overlay layers have too much duplicate code
              baseLayers
                .filter(
                  ({ showOnlyInExpertMode }) =>
                    !showOnlyInExpertMode || expertMode,
                )
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .map(({ type, icon, minZoom, key }) => (
                  <MenuItem
                    key={type}
                    onClick={() => this.handleMapSelect(type)}
                  >
                    <FontAwesomeIcon
                      icon={mapType === type ? 'check-circle-o' : 'circle-o'}
                    />{' '}
                    <FontAwesomeIcon icon={icon || 'map-o'} />{' '}
                    <span
                      style={{
                        textDecoration:
                          zoom < minZoom ? 'line-through' : 'none',
                      }}
                    >
                      {t(`mapLayers.base.${type}`)}
                    </span>
                    {key && ' '}
                    {key && <kbd>{key}</kbd>}
                    {zoom < minZoom && (
                      <>
                        {' '}
                        <FontAwesomeIcon
                          icon="exclamation-triangle"
                          title={t('mapLayers.minZoomWarning', {
                            minZoom: minZoom.toString(),
                          })}
                          className="text-warning"
                        />
                      </>
                    )}
                  </MenuItem>
                ))}
              <MenuItem divider />
              {overlayLayers
                .filter(
                  ({ showOnlyInExpertMode }) =>
                    !showOnlyInExpertMode || expertMode,
                )
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .map(({ type, icon, minZoom, key, strava }) => (
                  <MenuItem
                    key={type}
                    onClick={e => this.handleOverlaySelect(e, type)}
                  >
                    <FontAwesomeIcon
                      icon={
                        overlays.includes(type) ? 'check-square-o' : 'square-o'
                      }
                    />{' '}
                    <FontAwesomeIcon icon={icon || 'map-o'} />{' '}
                    <span
                      style={{
                        textDecoration:
                          zoom < minZoom || (strava && !stravaAuth)
                            ? 'line-through'
                            : 'none',
                      }}
                    >
                      {t(`mapLayers.overlay.${type}`)}
                    </span>
                    {key && ' '}
                    {key && <kbd>{key}</kbd>}
                    {zoom < minZoom && (
                      <>
                        {' '}
                        <FontAwesomeIcon
                          icon="exclamation-triangle"
                          title={t('mapLayers.minZoomWarning', {
                            minZoom: minZoom.toString(),
                          })}
                          className="text-warning"
                        />
                      </>
                    )}
                    {strava && !stravaAuth && (
                      <>
                        {' '}
                        <FontAwesomeIcon
                          data-strava
                          icon="exclamation-triangle"
                          title={t('mapLayers.missingStravaAuth')}
                          className="text-warning"
                        />
                      </>
                    )}
                    {type === 'I' && pictureFilterIsActive && (
                      <>
                        {' '}
                        <FontAwesomeIcon
                          icon="filter"
                          title={t('mapLayers.photoFilterWarning')}
                          className="text-warning"
                        />
                      </>
                    )}
                  </MenuItem>
                ))}
            </ul>
          </Popover>
        </Overlay>
      </>
    );
  }
}

const mapStateToProps = state => ({
  zoom: state.map.zoom,
  mapType: state.map.mapType,
  overlays: state.map.overlays,
  expertMode: state.main.expertMode,
  pictureFilterIsActive: Object.keys(state.gallery.filter).some(
    key => state.gallery.filter[key],
  ),
  isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
  stravaAuth: state.map.stravaAuth,
});

const mapDispatchToProps = dispatch => ({
  onMapRefocus(changes) {
    dispatch(mapRefocus(changes));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(MapSwitchButton);
