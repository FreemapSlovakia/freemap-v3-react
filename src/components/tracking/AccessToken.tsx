import { connect } from 'react-redux';
import React, { useCallback } from 'react';

import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken as AccessTokenType } from 'fm3/types/trackingTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Tooltip } from 'react-bootstrap';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
    accessToken: AccessTokenType;
  };

const AccessTokenInt: React.FC<Props> = ({
  onDelete,
  onModify,
  onView,
  accessToken,
  language,
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
    onModify(accessToken.id);
  }, [accessToken.id, onModify]);

  const handleDelete = useCallback(() => {
    onDelete(accessToken.id);
  }, [accessToken.id, onDelete]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(
      `${location.origin}/?track=${encodeURIComponent(
        accessToken.token,
      )}&follow=${encodeURIComponent(accessToken.token)}`,
    );
  }, [accessToken.token]);

  const handleView = useCallback(() => {
    onView(accessToken.token);
  }, [accessToken.token, onView]);

  return (
    <tr>
      <td>
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="right"
          overlay={
            <Tooltip id={accessToken.token}>
              <span style={{ overflowWrap: 'break-word' }}>
                {location.origin}/?track={encodeURIComponent(accessToken.token)}
                &amp;follow={encodeURIComponent(accessToken.token)}
              </span>
            </Tooltip>
          }
        >
          <span>
            {accessToken.token}{' '}
            <Button
              onClick={handleCopyClick}
              bsSize="xs"
              title={t('external.copy')}
              type="button"
            >
              <FontAwesomeIcon icon="clipboard" />
            </Button>
          </span>
        </OverlayTrigger>
      </td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      {/* <td>{accessToken.listingLabel}</td> */}
      <td>{accessToken.note}</td>
      <td>
        <Button
          bsSize="small"
          type="button"
          onClick={handleView}
          title={t('tracking.devices.watch')}
        >
          <FontAwesomeIcon icon="eye" />
        </Button>{' '}
        <Button
          bsSize="small"
          type="button"
          onClick={handleModify}
          title={t('general.modify')}
        >
          <FontAwesomeIcon icon="edit" />
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
  onModify(id: number) {
    dispatch(trackingActions.modifyAccessToken(id));
  },
  onDelete(id: number) {
    dispatch(
      toastsAdd({
        collapseKey: 'tracking.deleteAccessToken',
        messageKey: 'tracking.accessToken.delete',
        style: 'warning',
        cancelType: [
          getType(trackingActions.modifyAccessToken),
          getType(trackingActions.showAccessTokens),
          getType(setActiveModal),
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteAccessToken(id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  },
  onView(id: string) {
    dispatch(setActiveModal('tracking-watched'));
    dispatch(trackingActions.modifyTrackedDevice(id));
  },
});

export const AccessToken = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(AccessTokenInt));
