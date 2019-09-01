import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Panel from 'react-bootstrap/lib/Panel';

import { galleryCancelShowOnTheMap } from 'fm3/actions/galleryActions';
import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

class GalleryShowPositionMenu extends React.Component<Props> {
  componentDidMount() {
    // can't use keydown because it would close themodal
    document.addEventListener('keyup', this.handleKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleKeyUp = (event: KeyboardEvent) => {
    if (event.keyCode === 27 /* escape key */) {
      this.props.onClose();
    }
  };

  render() {
    const { onClose, showPosition, t } = this.props;

    if (!showPosition) {
      return null;
    }

    return (
      <Panel className="fm-toolbar">
        <Button onClick={onClose}>
          <FontAwesomeIcon icon="chevron-left" />
          <span className="hidden-xs"> {t('general.back')}</span>
        </Button>
      </Panel>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  showPosition: state.gallery.showPosition,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onClose() {
    dispatch(galleryCancelShowOnTheMap());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(GalleryShowPositionMenu));
