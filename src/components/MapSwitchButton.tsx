import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import React, { useCallback, useState, useRef } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { baseLayers, overlayLayers, LayerDef } from 'fm3/mapDefinitions';
import { mapRefocus, MapViewState } from 'fm3/actions/mapActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';
import useMedia from 'use-media';

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
  onMapRefocus,
  language,
}) => {
  const [show, setShow] = useState(false);

  const buttonRef = useRef<Button | null>(null);

  const button2Ref = useRef<Button | null>(null);

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
    (overlay: any) => {
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

  const handleBaseClick = (e: React.MouseEvent<Button>) => {
    onMapRefocus({
      mapType: (e.currentTarget as any).dataset.type,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent<Button>) => {
    const overlay = (e.currentTarget as any).dataset.type as string;

    const s = new Set(overlays);

    if (s.has(overlay)) {
      s.delete(overlay);
    } else {
      s.add(overlay);
    }

    onMapRefocus({ overlays: [...s] });
  };

  const isWide = useMedia({ minWidth: '768px' });

  const isPrimary = (layer: LayerDef) =>
    layer.primary === true ||
    layer.primary === language ||
    (typeof layer.primary === 'string' &&
      layer.primary.startsWith('!') &&
      layer.primary !== `!${language}`);

  return (
    <>
      <ButtonGroup className="dropup hidden-xs">
        {baseLayers.filter(isPrimary).map(({ type, icon }) => (
          <Button
            title={t(`mapLayers.base.${type}`)}
            key={type}
            data-type={type}
            active={mapType === type}
            onClick={handleBaseClick}
          >
            <FontAwesomeIcon icon={icon} />
          </Button>
        ))}
        {overlayLayers.filter(isPrimary).map(({ type, icon }) => (
          <Button
            title={t(`mapLayers.overlay.${type}`)}
            key={type}
            data-type={type}
            active={overlays.includes(type)}
            onClick={handleOverlayClick}
          >
            <FontAwesomeIcon icon={icon} />
          </Button>
        ))}
        <Button
          className="dropdown-toggle"
          ref={buttonRef}
          onClick={handleButtonClick}
          title={t('mapLayers.layers')}
        >
          <span className="caret" />
        </Button>
      </ButtonGroup>
      <Button
        className="hidden-sm hidden-md hidden-lg"
        ref={button2Ref}
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
        target={(isWide ? buttonRef.current : button2Ref.current) ?? undefined}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            {
              // TODO base and overlay layers have too much duplicate code
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
                ))
            }
            <MenuItem divider />
            {overlayLayers
              .filter(
                ({ showOnlyInExpertMode }) =>
                  !showOnlyInExpertMode || expertMode,
              )
              .filter(({ adminOnly }) => isAdmin || !adminOnly)
              .map(({ type, icon, minZoom, key }) => (
                <MenuItem
                  key={type}
                  eventKey={type}
                  onSelect={handleOverlaySelect as any}
                >
                  <FontAwesomeIcon
                    icon={
                      (
                        type === 'i'
                          ? !overlays.includes(type)
                          : overlays.includes(type)
                      )
                        ? 'check-square-o'
                        : 'square-o'
                    }
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
  language: state.l10n.language,
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
