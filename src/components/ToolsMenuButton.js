import { compose } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { setTool } from 'fm3/actions/mainActions';
import injectL10n from 'fm3/l10nInjector';

class ToolsMenuButton extends React.Component {
  static propTypes = {
    t: PropTypes.func.isRequired,
    onToolSet: PropTypes.func.isRequired,
    tool: PropTypes.string,
    expertMode: PropTypes.bool,
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

  handleToolSelect(tool) {
    this.setState({ show: false });
    this.props.onToolSet(tool);
  }

  render() {
    const { t, tool, expertMode } = this.props;

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
              {[
                ['route-planner', 'map-signs', 'routePlanner'],
                ['objects', 'map-marker', 'objects'],
                ['gallery', 'picture-o', 'gallery'],
                ['measure-dist', '!icon-ruler', 'measurement'],
                ['track-viewer', 'road', 'trackViewer'],
                ['info-point', 'thumb-tack', 'infoPoint'],
                ['map-details', 'info', 'mapDetails'],
                ['tracking', 'bullseye', 'tracking'],
                expertMode && ['changesets', 'pencil', 'changesets'],
              ]
                .filter(x => x)
                .map(([newTool, icon, name]) => (
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
