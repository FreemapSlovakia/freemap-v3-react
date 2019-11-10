import React, { useEffect, useCallback } from 'react';
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

const GalleryShowPositionMenu: React.FC<Props> = ({
  onClose,
  showPosition,
  t,
}) => {
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.keyCode === 27 /* escape key */) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    // can't use keydown because it would close themodal
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp]);

  if (!showPosition) {
    return null;
  }

  return (
    <Panel className="fm-toolbar">
      <Button onClick={onClose}>
        <FontAwesomeIcon icon="chevron-left" />
        <span className="hidden-xs"> {t('general.back')}</span> <kbd>Esc</kbd>
      </Button>
    </Panel>
  );
};

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
