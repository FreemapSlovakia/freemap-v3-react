import { connect } from 'react-redux';
import React, { useCallback } from 'react';

import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Device as DeviceType } from 'fm3/types/trackingTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    device: DeviceType;
    language: string;
    t: Translator;
  };

const DeviceInt: React.FC<Props> = ({
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

  const handleModify = useCallback(() => {
    onModify(device.id);
  }, [device.id, onModify]);

  const handleDelete = useCallback(() => {
    onDelete(device.id);
  }, [device.id, onDelete]);

  const handleShowAccessTokens = useCallback(() => {
    onShowAccessTokens(device.id);
  }, [device.id, onShowAccessTokens]);

  const handleView = useCallback(() => {
    onView(device.id);
  }, [device.id, onView]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(
      `${process.env.API_URL}/tracking/track/${device.token}`,
    );
  }, [device.token]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>
        {device.token.startsWith('did:')
          ? `${device.token.slice(4)} (TK102B Device ID)`
          : device.token.startsWith('imei:')
          ? `${device.token.slice(5)} (TK102B IMEI)`
          : device.token}
        {!device.token.includes(':') && (
          <>
            {' '}
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
              <span>
                {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? (
                  <Button
                    onClick={handleCopyClick}
                    bsSize="xs"
                    title={t('external.copy')}
                    type="button"
                  >
                    <FontAwesomeIcon icon="clipboard" />
                  </Button>
                ) : (
                  <FontAwesomeIcon icon="mobile" />
                )}
              </span>
            </OverlayTrigger>
          </>
        )}
      </td>
      <td>{device.maxCount}</td>
      <td>
        {typeof device.maxAge === 'number'
          ? `${device.maxAge / 60} ${t('general.minutes')}`
          : ''}
      </td>
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
    dispatch(
      toastsAdd({
        id: 'tracking.deleteDevice',
        messageKey: 'tracking.devices.delete',
        style: 'warning',
        cancelType: [
          getType(trackingActions.modifyDevice),
          getType(trackingActions.modifyTrackedDevice),
          getType(trackingActions.showAccessTokens),
          getType(setActiveModal),
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteDevice(id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  },
  onShowAccessTokens(id: number | null | undefined) {
    dispatch(trackingActions.showAccessTokens(id));
  },
  onView(id: number) {
    dispatch(setActiveModal('tracking-watched'));
    dispatch(trackingActions.modifyTrackedDevice(id));
  },
});

export const Device = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(DeviceInt));
