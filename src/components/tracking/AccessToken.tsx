import { useDispatch, useSelector } from 'react-redux';
import React, { ReactElement, useCallback } from 'react';

import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken as AccessTokenType } from 'fm3/types/trackingTypes';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { setActiveModal } from 'fm3/actions/mainActions';
import { Tooltip } from 'react-bootstrap';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getType } from 'typesafe-actions';

type Props = {
  accessToken: AccessTokenType;
};

export function AccessToken({ accessToken }: Props): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyAccessToken(accessToken.id));
  }, [accessToken.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'tracking.deleteAccessToken',
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
            action: trackingActions.deleteAccessToken(accessToken.id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }, [accessToken.id, dispatch]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(
      `${location.origin}/?track=${encodeURIComponent(
        accessToken.token,
      )}&follow=${encodeURIComponent(accessToken.token)}`,
    );
  }, [accessToken.token]);

  const handleView = useCallback(() => {
    dispatch(setActiveModal('tracking-watched'));
    dispatch(trackingActions.modifyTrackedDevice(accessToken.token));
  }, [accessToken.token, dispatch]);

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
}
