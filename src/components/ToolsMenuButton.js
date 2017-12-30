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
  };

  state = {
    show: false,
  }

  setButton = (button) => {
    this.button = button;
  };

  handleButtonClick = () => {
    this.setState({ show: true });
  }

  handleHide = () => {
    this.setState({ show: false });
  }

  handleToolSelect(tool) {
    this.setState({ show: false });
    this.props.onToolSet(tool);
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <Button ref={this.setButton} onClick={this.handleButtonClick} title={t('tools.tools')} id="tools-button">
          <FontAwesomeIcon icon="briefcase" />
        </Button>
        <Overlay rootClose placement="bottom" show={this.state.show} onHide={this.handleHide} target={() => this.button}>
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
                  ['changesets', 'pencil', 'changesets'],
                  ['map-details', 'info', 'mapDetails'],
                ].map(([tool, icon, name]) => (
                  <MenuItem key={tool} onClick={() => this.handleToolSelect(tool)}>
                    <FontAwesomeIcon icon={icon} /> {t(`tools.${name}`)}
                  </MenuItem>
                ))
              }
            </ul>
          </Popover>
        </Overlay>
      </React.Fragment>
    );
  }
}

export default compose(
  connect(
    () => ({
    }),
    dispatch => ({
      onToolSet(tool) {
        dispatch(setTool(tool));
      },
    }),
  ),
  injectL10n(),
)(ToolsMenuButton);
