import { connect } from 'react-redux';
import * as React from 'react';

import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import DateTime from 'fm3/components/DateTime';
import { toDatetimeLocal } from 'fm3/dateUtils';
import { IAccessTokenBase } from 'fm3/types/trackingTypes';
import { useTextInputState } from 'fm3/hooks/inputHooks';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose, Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const AccessTokenForm: React.FC<Props> = ({
  onSave,
  onCancel,
  accessToken,
  deviceName,
  t,
}) => {
  const [note, setNote] = useTextInputState(
    (accessToken && accessToken.note) || '',
  );
  const [timeFrom, setTimeFrom] = React.useState(
    accessToken && accessToken.timeFrom
      ? toDatetimeLocal(accessToken.timeFrom)
      : '',
  );
  const [timeTo, setTimeTo] = React.useState(
    accessToken && accessToken.timeTo
      ? toDatetimeLocal(accessToken.timeTo)
      : '',
  );
  const [listingLabel, setListingLabel] = useTextInputState(
    (accessToken && accessToken.listingLabel) || '',
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      note: note.trim() || null,
      timeFrom: timeFrom === '' ? null : new Date(timeFrom),
      timeTo: timeTo === '' ? null : new Date(timeTo),
      listingLabel: listingLabel.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="bullseye" />{' '}
          {accessToken
            ? t('tracking.accessTokens.modifyTitle', {
                token: accessToken.token,
                deviceName,
              })
            : t('tracking.accessTokens.createTitle', { deviceName })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          <ControlLabel>{t('tracking.accessToken.timeFrom')}</ControlLabel>
          <DateTime value={timeFrom} onChange={setTimeFrom} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.accessToken.timeTo')}</ControlLabel>
          <DateTime value={timeTo} onChange={setTimeTo} />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.accessToken.listingLabel')}</ControlLabel>
          <FormControl
            value={listingLabel}
            onChange={setListingLabel}
            maxLength={255}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{t('tracking.accessToken.note')}</ControlLabel>
          <FormControl value={note} onChange={setNote} maxLength={255} />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button type="submit">{t('general.save')}</Button>
        <Button type="button" onClick={onCancel}>
          {t('general.cancel')}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const mapStateToProps = (state: RootState) => ({
  accessToken:
    state.tracking.modifiedAccessTokenId &&
    state.tracking.accessTokens.find(
      accessToken => accessToken.id === state.tracking.modifiedAccessTokenId,
    ),
  deviceName: (
    state.tracking.devices.find(
      device => device.id === state.tracking.accessTokensDeviceId,
    ) || { name: '???' }
  ).name,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onCancel() {
    dispatch(trackingActions.modifyAccessToken(undefined));
  },
  onSave(accessToken: IAccessTokenBase) {
    dispatch(trackingActions.saveAccessToken(accessToken));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AccessTokenForm);
