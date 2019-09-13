import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import Panel from 'react-bootstrap/lib/Panel';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import OpenInExternalAppMenuButton from 'fm3/components/OpenInExternalAppMenuButton';
import ToolsMenuButton from 'fm3/components/ToolsMenuButton';
import MoreMenuButton from 'fm3/components/MoreMenuButton';

import { clearMap } from 'fm3/actions/mainActions';

import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const MenuInt: React.FC<Props> = ({
  lat,
  lon,
  zoom,
  mapType,
  tool,
  expertMode,
  onMapClear,
  t,
}) => {
  const handleFullscreenClick = useCallback(() => {
    if (!document.exitFullscreen) {
      // unsupported
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }, []);

  return (
    <Panel className={`fm-toolbar${tool ? ' hidden-xs' : ''}`}>
      <ButtonToolbar>
        <ButtonGroup>
          <ToolsMenuButton />
          <Button onClick={onMapClear} title={t('main.clearMap')}>
            <FontAwesomeIcon icon="eraser" />
          </Button>
          {document.exitFullscreen && (
            <Button
              onClick={handleFullscreenClick}
              title={
                document.fullscreenElement
                  ? t('general.exitFullscreen')
                  : t('general.fullscreen')
              }
            >
              <FontAwesomeIcon
                icon={document.fullscreenElement ? 'compress' : 'expand'}
              />
            </Button>
          )}
          <OpenInExternalAppMenuButton
            lat={lat}
            lon={lon}
            zoom={zoom}
            mapType={mapType}
            expertMode={expertMode}
          >
            <FontAwesomeIcon icon="external-link" />
          </OpenInExternalAppMenuButton>
          <MoreMenuButton />
        </ButtonGroup>
      </ButtonToolbar>
    </Panel>
  );
};

const mapStateToProps = (state: RootState) => ({
  lat: state.map.lat,
  lon: state.map.lon,
  zoom: state.map.zoom,
  mapType: state.map.mapType,
  tool: state.main.tool,
  expertMode: state.main.expertMode,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMapClear() {
    dispatch(clearMap());
  },
});

export const Menu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MenuInt));
