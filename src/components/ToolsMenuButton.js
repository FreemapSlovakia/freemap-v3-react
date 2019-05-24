import { compose } from 'redux';
import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setTool } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

function ToolsMenuButton({ t, tool, expertMode, onToolSet }) {
  const handleToolSelect = useCallback((tool1) => {
    onToolSet(tool1);
  }, [onToolSet]);

  return (
    <OverlayTrigger
      placement="bottom"
      trigger="focus"
      overlay={(
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            {
              [
                ['route-planner', 'map-signs', 'routePlanner'],
                ['objects', 'map-marker', 'objects'],
                ['gallery', 'picture-o', 'gallery'],
                ['measure-dist', '!icon-ruler', 'measurement'],
                ['track-viewer', 'road', 'trackViewer'],
                ['info-point', 'thumb-tack', 'infoPoint'],
                ['map-details', 'info', 'mapDetails'],
                expertMode && ['changesets', 'pencil', 'changesets'],
              ].filter(x => x).map(([newTool, icon, name]) => (
                <MenuItem
                  key={newTool}
                  onClick={() => handleToolSelect(newTool)}
                  active={tool === newTool}
                >
                  <FontAwesomeIcon icon={icon} /> {t(`tools.${name}`)}
                </MenuItem>
              ))
            }
          </ul>
        </Popover>
      )}
    >
      <Button title={t('tools.tools')} id="tools-button">
        <FontAwesomeIcon icon="briefcase" />
      </Button>
    </OverlayTrigger>
  );
}

ToolsMenuButton.propTypes = {
  t: PropTypes.func.isRequired,
  onToolSet: PropTypes.func.isRequired,
  tool: PropTypes.string,
  expertMode: PropTypes.bool,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      tool: state.main.tool,
      expertMode: state.main.expertMode,
    }),
    dispatch => ({
      onToolSet(tool) {
        dispatch(setTool(tool));
      },
    }),
  ),
)(ToolsMenuButton);
