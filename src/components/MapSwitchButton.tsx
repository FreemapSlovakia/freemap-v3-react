import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback, useState, useRef, ReactElement } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { baseLayers, overlayLayers, LayerDef } from 'fm3/mapDefinitions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import useMedia from 'use-media';

export function MapSwitchButton(): ReactElement {
  const t = useTranslator();

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const overlays = useSelector((state: RootState) => state.map.overlays);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const pictureFilterIsActive = useSelector(
    (state: RootState) => Object.keys(state.gallery.filter).length > 0,
  );

  const isAdmin = useSelector(
    (state: RootState) => !!(state.auth.user && state.auth.user.isAdmin),
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const dispatch = useDispatch();

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
        dispatch(mapRefocus({ mapType: mapType1 }));
      }
    },
    [dispatch, mapType],
  );

  const handleOverlaySelect = useCallback(
    (overlay: unknown) => {
      const s = new Set(overlays);

      if (typeof overlay !== 'string') {
        // uh-oh
      } else if (s.has(overlay)) {
        s.delete(overlay);
      } else {
        s.add(overlay);
      }

      dispatch(mapRefocus({ overlays: [...s] }));
    },
    [dispatch, overlays],
  );

  const handleBaseClick = (e: React.MouseEvent<Button>) => {
    dispatch(
      mapRefocus({
        mapType: (e.currentTarget as any).dataset.type,
      }),
    );
  };

  const handleOverlayClick = (e: React.MouseEvent<Button>) => {
    const overlay = (e.currentTarget as any).dataset.type as string;

    const s = new Set(overlays);

    if (s.has(overlay)) {
      s.delete(overlay);
    } else {
      s.add(overlay);
    }

    dispatch(mapRefocus({ overlays: [...s] }));
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
                  onSelect={handleOverlaySelect}
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
}
