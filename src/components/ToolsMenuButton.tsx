import { useDispatch, useSelector } from 'react-redux';
import { useState, useCallback, useRef, ReactElement } from 'react';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { selectFeature, Tool, clearMap } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { is } from 'typescript-is';
import { Button, Overlay, Popover } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';

export function ToolsMenuButton(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const tool = useSelector((state: RootState) => state.main.selection?.type);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const [show, setShow] = useState(false);

  const button = useRef<HTMLButtonElement | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
  }, []);

  const handleToolSelect = useCallback(
    (tool: unknown) => {
      if (is<Tool | null>(tool)) {
        setShow(false);

        dispatch(selectFeature(tool ? { type: tool } : null));
      }
    },
    [dispatch],
  );

  const handleMapClear = useCallback(() => {
    setShow(false);
    dispatch(clearMap());
  }, [dispatch]);

  const toolDef = toolDefinitions.find(
    (t) =>
      t.tool ===
      (tool === 'draw-polygons' || tool === 'draw-points'
        ? 'draw-lines'
        : tool),
  ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

  const ref = useRef(null);

  return (
    <>
      <Button
        ref={button}
        onClick={handleButtonClick}
        title={m?.tools.tools}
        id="tools-button"
        variant="primary"
      >
        <FontAwesomeIcon icon={toolDef ? toolDef.icon : 'briefcase'} />
        <span className="d-none d-sm-inline">
          {' '}
          {m?.tools[tool && toolDef ? toolDef.msgKey : 'tools']}
        </span>
      </Button>
      {tool && (
        <FontAwesomeIcon icon="chevron-right" className="align-self-center" />
      )}
      <Overlay
        rootClose
        rootCloseEvent="mousedown"
        placement="bottom"
        show={show}
        onHide={handleHide}
        target={button.current}
        container={ref.current}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <Popover.Content>
            {tool && (
              <Dropdown.Item onSelect={handleToolSelect}>
                <FontAwesomeIcon icon="briefcase" /> {m?.tools.none}{' '}
                <kbd>Esc</kbd>
              </Dropdown.Item>
            )}

            <Dropdown.Item onSelect={handleMapClear}>
              <FontAwesomeIcon icon="eraser" /> {m?.main.clearMap} <kbd>g</kbd>{' '}
              <kbd>c</kbd>
            </Dropdown.Item>

            <Dropdown.Divider />

            {toolDefinitions
              .filter(({ expertOnly }) => expertMode || !expertOnly)
              .map(
                ({ tool: newTool, icon, msgKey, kbd }) =>
                  newTool && (
                    <Dropdown.Item
                      key={newTool}
                      eventKey={newTool}
                      onSelect={handleToolSelect}
                      active={toolDef?.tool === newTool}
                    >
                      <FontAwesomeIcon icon={icon} /> {m?.tools[msgKey]}{' '}
                      {kbd && (
                        <>
                          <kbd>g</kbd>{' '}
                          <kbd>{kbd.replace(/Key/, '').toLowerCase()}</kbd>
                        </>
                      )}
                    </Dropdown.Item>
                  ),
              )}
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
}
