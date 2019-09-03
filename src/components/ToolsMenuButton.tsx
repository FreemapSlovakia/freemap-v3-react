import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setTool, Tool } from 'fm3/actions/mainActions';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface State {
  show: boolean;
}

class ToolsMenuButton extends React.Component<Props, State> {
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

  handleToolSelect(tool: Tool) {
    this.setState({ show: false });
    this.props.onToolSet(tool);
  }

  render() {
    const { t, tool, expertMode } = this.props;

    const tools: [Tool, string, string][] = [
      ['route-planner', 'map-signs', 'routePlanner'],
      ['objects', 'map-marker', 'objects'],
      ['gallery', 'picture-o', 'gallery'],
      ['measure-dist', '!icon-ruler', 'measurement'],
      ['track-viewer', 'road', 'trackViewer'],
      ['info-point', 'thumb-tack', 'infoPoint'],
      ['map-details', 'info', 'mapDetails'],
      ['tracking', 'bullseye', 'tracking'],
    ];

    if (expertMode) {
      tools.push(['changesets', 'pencil', 'changesets']);
    }

    return (
      <>
        <Button
          ref={this.setButton}
          onClick={this.handleButtonClick}
          title={t('tools.tools')}
          id="tools-button"
        >
          <FontAwesomeIcon icon="briefcase" />
        </Button>
        <Overlay
          rootClose
          placement="bottom"
          show={this.state.show}
          onHide={this.handleHide}
          target={() => this.button}
        >
          <Popover id="popover-trigger-click-root-close" className="fm-menu">
            <ul>
              {tools.map(([newTool, icon, name]) => (
                <MenuItem
                  key={newTool}
                  onClick={() => this.handleToolSelect(newTool)}
                  active={tool === newTool}
                >
                  <FontAwesomeIcon icon={icon} /> {t(`tools.${name}`)}
                </MenuItem>
              ))}
            </ul>
          </Popover>
        </Overlay>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  tool: state.main.tool,
  expertMode: state.main.expertMode,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onToolSet(tool: Tool) {
    dispatch(setTool(tool));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ToolsMenuButton));
