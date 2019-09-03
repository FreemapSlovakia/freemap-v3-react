import { connect } from 'react-redux';
import * as React from 'react';

import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Device } from 'fm3/types/trackingTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    device: Device;
    language: string;
    t: Translator;
  };

const Device: React.FC<Props> = ({
  onDelete,
  onModify,
  device,
  language,
  onShowAccessTokens,
  onView,
  t,
}) => {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = React.useCallback(() => {
    onModify(device.id);
  }, [device.id, onModify]);

  const handleDelete = React.useCallback(() => {
    onDelete(device.id);
  }, [device.id, onDelete]);

  const handleShowAccessTokens = React.useCallback(() => {
    onShowAccessTokens(device.id);
  }, [device.id, onShowAccessTokens]);

  const handleView = React.useCallback(() => {
    onView(device.id);
  }, [device.id, onView]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>
        {device.token}
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="right"
          overlay={
            <Tooltip id={device.token}>
              <span style={{ overflowWrap: 'break-word' }}>
                {process.env.API_URL}/tracking/track/{device.token}
              </span>
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon="question-circle-o" />
        </OverlayTrigger>
      </td>
      <td>{device.maxCount}</td>
      <td>{device.maxAge}</td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <Button
          bsSize="small"
          type="button"
          onClick={handleModify}
          title={t('general.modify')}
        >
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          bsSize="small"
          type="button"
          bsStyle="primary"
          onClick={handleShowAccessTokens}
          title={t('tracking.devices.watchTokens')}
        >
          <FontAwesomeIcon icon="key" />
        </Button>{' '}
        <Button
          bsSize="small"
          type="button"
          onClick={handleView}
          title={t('tracking.devices.watchPrivately')}
        >
          <FontAwesomeIcon icon="eye" />
        </Button>{' '}
        <Button
          bsStyle="danger"
          bsSize="small"
          type="button"
          onClick={handleDelete}
          title={t('general.delete')}
        >
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
};

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onModify(id: number | null | undefined) {
    dispatch(trackingActions.modifyDevice(id));
  },
  onDelete(id: number) {
    dispatch(trackingActions.deleteDevice(id));
  },
  onShowAccessTokens(id: number | null | undefined) {
    dispatch(trackingActions.showAccessTokens(id));
  },
  onView(id: number) {
    dispatch(trackingActions.view(id));
    dispatch(trackingActions.setActive(id));
    dispatch(setActiveModal(null));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(Device));
