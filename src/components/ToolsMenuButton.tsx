import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import React, { useState, useCallback, useRef } from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import {
  selectFeature,
  Tool,
  clearMap,
  Selection,
} from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { toolDefinitions } from 'fm3/toolDefinitions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ToolsMenuButtonInt: React.FC<Props> = ({
  t,
  tool,
  expertMode,
  onSelect,
  onMapClear,
}) => {
  const [show, setShow] = useState(false);

  const button = useRef<Button | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
  }, []);

  const handleToolSelect = useCallback(
    (tool0: any) => {
      const tool = tool0 as Tool | null;

      setShow(false);

      onSelect(tool ? { type: tool } : null);
    },
    [onSelect],
  );

  const handleMapClear = useCallback(() => {
    setShow(false);
    onMapClear();
  }, [onMapClear]);

  const toolDef = toolDefinitions.find(
    (t) =>
      t.tool ===
      (tool === 'draw-polygons' || tool === 'draw-points'
        ? 'draw-lines'
        : tool),
  ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

  return (
    <>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={t('tools.tools')}
        id="tools-button"
        bsStyle="primary"
      >
        <FontAwesomeIcon icon={toolDef ? toolDef.icon : 'briefcase'} />
        <span className="hidden-xs">
          {' '}
          {t(`tools.${tool && toolDef ? toolDef.msgKey : 'tools'}`)}
        </span>
      </Button>
      {tool && <FontAwesomeIcon icon="chevron-right" />}
      <Overlay
        rootClose
        placement="bottom"
        show={show}
        onHide={handleHide}
        target={button.current ?? undefined}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <ul>
            {tool && (
              <MenuItem eventKey={null} onSelect={handleToolSelect}>
                <FontAwesomeIcon icon="briefcase" /> {t('tools.none')}{' '}
                <kbd>Esc</kbd>
              </MenuItem>
            )}

            <MenuItem onSelect={handleMapClear}>
              <FontAwesomeIcon icon="eraser" /> {t('main.clearMap')}{' '}
              <kbd>g</kbd> <kbd>c</kbd>
            </MenuItem>
            <MenuItem divider />

            {toolDefinitions
              .filter(({ expertOnly }) => expertMode || !expertOnly)
              .map(
                ({ tool: newTool, icon, msgKey, kbd }) =>
                  newTool && (
                    <MenuItem
                      key={newTool}
                      eventKey={newTool}
                      onSelect={handleToolSelect}
                      active={toolDef?.tool === newTool}
                    >
                      <FontAwesomeIcon icon={icon} /> {t(`tools.${msgKey}`)}{' '}
                      {kbd && (
                        <>
                          <kbd>g</kbd> <kbd>{kbd}</kbd>
                        </>
                      )}
                    </MenuItem>
                  ),
              )}
          </ul>
        </Popover>
      </Overlay>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  tool: state.main.selection?.type,
  expertMode: state.main.expertMode,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMapClear() {
    dispatch(clearMap());
  },
  onSelect(selection: Selection | null) {
    dispatch(selectFeature(selection));
  },
});

export const ToolsMenuButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ToolsMenuButtonInt));
