import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { AccessToken } from 'fm3/components/tracking/AccessToken';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { compose, Dispatch } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    language: string;
    t: Translator;
  };

const AccessTokens: React.FC<Props> = ({
  onClose,
  onOpen,
  onAdd,
  accessTokens,
  deviceName,
  t,
}) => {
  React.useEffect(() => {
    onOpen();
  }, [onOpen]);

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
        <Table striped bordered>
          <thead>
            <tr>
              <th>{t('tracking.accessToken.token')}</th>
              <th>{t('general.createdAt')}</th>
              <th>{t('tracking.accessToken.timeFrom')}</th>
              <th>{t('tracking.accessToken.timeTo')}</th>
              <th>{t('tracking.accessToken.listingLabel')}</th>
              <th>{t('tracking.accessToken.note')}</th>
              <th>{t('general.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {accessTokens.map(accessToken => (
              <AccessToken key={accessToken.id} accessToken={accessToken} />
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" onClick={onAdd}>
          {t('general.add')}
        </Button>
        <Button type="button" onClick={onClose}>
          {t('general.back')}
        </Button>
      </Modal.Footer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  accessTokens: state.tracking.accessTokens,
  deviceName: (
    state.tracking.devices.find(
      device => device.id === state.tracking.accessTokensDeviceId,
    ) || { name: '???' }
  ).name,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onOpen() {
    dispatch(trackingActions.loadAccessTokens());
  },
  onClose() {
    dispatch(trackingActions.showAccessTokens(undefined));
  },
  onAdd() {
    dispatch(trackingActions.modifyAccessToken(null));
  },
});

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AccessTokens);
