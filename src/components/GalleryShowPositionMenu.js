import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';

import { galleryShowOnTheMap } from 'fm3/actions/galleryActions';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

class GalleryShowPositionMenu extends React.Component {
  static propTypes = {
    showPosition: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
  };

  componentDidMount() {
    // can't use keydown because it would close themodal
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyUp = (event) => {
    if (event.keyCode === 27 /* escape key */) {
      this.props.onClose();
    }
  }

  render() {
    const { onClose, showPosition } = this.props;

    if (!showPosition) {
      return null;
    }

    return (
      <Panel className="fm-toolbar">
        <Button onClick={onClose}>
          <FontAwesomeIcon icon="chevron-left" />
          <span className="hidden-xs"> Späť</span>
        </Button>
      </Panel>
    );
  }
}

export default connect(
  state => ({
    showPosition: state.gallery.showPosition,
  }),
  dispatch => ({
    onClose() {
      dispatch(galleryShowOnTheMap(false));
    },
  }),
)(GalleryShowPositionMenu);
