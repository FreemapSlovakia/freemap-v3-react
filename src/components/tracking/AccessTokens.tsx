import { useDispatch, useSelector } from 'react-redux';
import React, { ReactElement, useEffect } from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken } from 'fm3/components/tracking/AccessToken';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function AccessTokens(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const accessTokens = useSelector(
    (state: RootState) => state.tracking.accessTokens,
  );

  const deviceName = useSelector(
    (state: RootState) =>
      (
        state.tracking.devices.find(
          (device) => device.id === state.tracking.accessTokensDeviceId,
        ) || { name: '???' }
      ).name,
  );

  useEffect(() => {
    dispatch(trackingActions.loadAccessTokens());
  }, [dispatch]);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {t('tracking.accessTokens.modalTitle', { deviceName })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert bsStyle="info">
          {t('tracking.accessTokens.desc', { deviceName })}
        </Alert>
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>{t('tracking.accessToken.token')}</th>
              <th>{t('general.createdAt')}</th>
              <th>{t('tracking.accessToken.timeFrom')}</th>
              <th>{t('tracking.accessToken.timeTo')}</th>
              {/* <th>{t('tracking.accessToken.listingLabel')}</th> */}
              <th>{t('tracking.accessToken.note')}</th>
              <th>{t('general.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {accessTokens.map((accessToken) => (
              <AccessToken key={accessToken.id} accessToken={accessToken} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyAccessToken(null));
          }}
        >
          {t('general.add')}
        </Button>
        <Button
          type="button"
          onClick={() => {
            dispatch(trackingActions.showAccessTokens(undefined));
          }}
        >
          {t('general.back')}
        </Button>
      </Modal.Footer>
    </>
  );
}
