import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import React, { useCallback, useState, useRef } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import { mapRefocus, MapViewState } from 'fm3/actions/mapActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const MapSwitchButtonInt: React.FC<Props> = ({
  isAdmin,
  t,
  mapType,
  overlays,
  expertMode,
  zoom,
  pictureFilterIsActive,
  stravaAuth,
  onMapRefocus,
}) => {
  const [show, setShow] = useState(false);

  const buttonRef = useRef<Button | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
  }, []);

  const handleMapSelect = useCallback(
    (mapType1: string) => {
      setShow(false);

      if (mapType !== mapType1) {
        onMapRefocus({ mapType: mapType1 });
      }
    },
    [onMapRefocus, mapType],
  );

  const handleOverlaySelect = useCallback(
    (overlay: any, e: React.SyntheticEvent<{}>) => {
      const { dataset } = e.target as HTMLElement;

      if (dataset && dataset.strava) {
        window.open('https://www.strava.com/heatmap');
        return;
      }

      const s = new Set(overlays);

      if (s.has(overlay)) {
        s.delete(overlay);
      } else {
        s.add(overlay);
      }
      onMapRefocus({ overlays: [...s] });
    },
    [onMapRefocus, overlays],
  );

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={handleButtonClick}
        title={t('mapLayers.layers')}
        bsStyle="primary"
      >
        <FontAwesomeIcon icon="map-o" />
      </Button>
      <Overlay
        rootClose
        placement="top"
        show={show}
        onHide={handleHide}
        target={buttonRef.current ?? undefined}
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
                <MenuItem key={type} onClick={() => handleMapSelect(type)}>
                  <FontAwesomeIcon
                    icon={mapType === type ? 'check-circle-o' : 'circle-o'}
                  />{' '}
                  <FontAwesomeIcon icon={icon || 'map-o'} />{' '}
                  <span
                    style={{
                      textDecoration:
                        minZoom !== undefined && zoom < minZoom
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {t(`mapLayers.base.${type}`)}
                  </span>
                  {key && ' '}
                  {key && <kbd>{key}</kbd>}
                  {minZoom !== undefined && zoom < minZoom && (
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
                  eventKey={type}
                  onSelect={handleOverlaySelect as any}
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
                        (minZoom !== undefined && zoom < minZoom) ||
                        (strava && !stravaAuth)
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {t(`mapLayers.overlay.${type}`)}
                  </span>
                  {key && ' '}
                  {key && <kbd>{key}</kbd>}
                  {minZoom !== undefined && zoom < minZoom && (
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
};

const mapStateToProps = (state: RootState) => ({
  zoom: state.map.zoom,
  mapType: state.map.mapType,
  overlays: state.map.overlays,
  expertMode: state.main.expertMode,
  pictureFilterIsActive: Object.keys(state.gallery.filter).some(
    (key) => state.gallery.filter[key],
  ),
  isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
  stravaAuth: state.map.stravaAuth,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMapRefocus(changes: Partial<MapViewState>) {
    dispatch(mapRefocus(changes));
  },
});

export const MapSwitchButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MapSwitchButtonInt));
