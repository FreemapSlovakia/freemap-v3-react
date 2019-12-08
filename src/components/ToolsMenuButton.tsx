import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
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

interface State {
  show: boolean;
}

class ToolsMenuButtonInt extends React.Component<Props, State> {
  state: State = {
    show: false,
  };

  button?: Button;

  setButton = (button: Button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  };

  handleHide = () => {
    this.setState({ show: false });
  };

  handleToolSelect(tool: Tool | null) {
    this.setState({ show: false });
    this.props.onSelectionSet(tool && { type: tool });
  }

  handleMapClear = () => {
    this.setState({ show: false });
    this.props.onMapClear();
  };

  render() {
    const { t, tool, expertMode } = this.props;

    const toolDef = toolDefinitions.find(
      t => t.tool === (tool ? tool.replace(/-area|-ele/, '-dist') : null),
    ) || { tool: null, icon: 'briefcase', msgKey: 'none' };

    return (
      <>
        <Button
          ref={this.setButton}
          onClick={this.handleButtonClick}
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
          show={this.state.show}
          onHide={this.handleHide}
          target={() => this.button}
        >
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              {tool && (
                <MenuItem onClick={() => this.handleToolSelect(null)}>
                  <FontAwesomeIcon icon="briefcase" /> {t('tools.none')}{' '}
                  <kbd>Esc</kbd>
                </MenuItem>
              )}

              <MenuItem onClick={this.handleMapClear}>
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
                        onClick={() => this.handleToolSelect(newTool)}
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
  }
}

const mapStateToProps = (state: RootState) => ({
  tool: state.main.selection?.type,
  expertMode: state.main.expertMode,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMapClear() {
    dispatch(clearMap());
  },
  onSelectionSet(tool: Selection | null) {
    dispatch(selectFeature(tool));
  },
});

export const ToolsMenuButton = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ToolsMenuButtonInt));
