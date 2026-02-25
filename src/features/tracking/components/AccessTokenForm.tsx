import { useMessages } from '@features/l10n/l10nInjector.js';
import { DateTime } from '@shared/components/DateTime.js';
import { toDatetimeLocal } from '@shared/dateUtils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useTextInputState } from '@shared/hooks/useTextInputState.js';
import { ReactElement, SubmitEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { trackingActions } from '../model/actions.js';

import { Button, Modal } from 'react-bootstrap';
import { FaBullseye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export function AccessTokenForm(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const accessToken = useAppSelector((state) =>
    state.tracking.modifiedAccessTokenId
      ? state.tracking.accessTokens.find(
          (accessToken) =>
            accessToken.id === state.tracking.modifiedAccessTokenId,
        )
      : undefined,
  );

  const deviceName = useAppSelector(
    (state) =>
      (
        state.tracking.devices.find(
          (device) => device.id === state.tracking.accessTokensDeviceId,
        ) || { name: '???' }
      ).name,
  );

  const [note, setNote] = useTextInputState(accessToken?.note ?? '');

  const [timeFrom, setTimeFrom] = useState(
    accessToken?.timeFrom ? toDatetimeLocal(accessToken.timeFrom) : '',
  );

  const [timeTo, setTimeTo] = useState(
    accessToken?.timeTo ? toDatetimeLocal(accessToken.timeTo) : '',
  );

  // const [listingLabel, setListingLabel] = useTextInputState(
  //   accessToken?.listingLabel ?? '',
  // );

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(
      trackingActions.saveAccessToken({
        note: note.trim() || null,
        timeFrom: timeFrom === '' ? null : new Date(timeFrom),
        timeTo: timeTo === '' ? null : new Date(timeTo),
        listingLabel: null, // listingLabel.trim() || null,
      }),
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaBullseye />{' '}
          {accessToken
            ? m?.tracking.accessTokens.modifyTitle({
                token: accessToken.token,
                deviceName,
              })
            : m?.tracking.accessTokens.createTitle(deviceName)}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group controlId="timeFrom" className="mb-3">
          <Form.Label>{m?.tracking.accessToken.timeFrom}</Form.Label>

          <DateTime value={timeFrom} onChange={setTimeFrom} />
        </Form.Group>

        <Form.Group controlId="timeTo" className="mb-3">
          <Form.Label>{m?.tracking.accessToken.timeTo}</Form.Label>

          <DateTime value={timeTo} onChange={setTimeTo} />
        </Form.Group>

        {/* <Form.Group  controlId="listingLabel" className="mb-3">
          <Form.Label>{m?.tracking.accessToken.listingLabel}</Form.Label>
          <Form.Control
            value={listingLabel}
            onChange={setListingLabel}
            maxLength={255}
          />
        </Form.Group> */}

        <Form.Group controlId="note" className="mb-3">
          <Form.Label>{m?.tracking.accessToken.note}</Form.Label>

          <Form.Control value={note} onChange={setNote} maxLength={255} />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button type="submit">{m?.general.save}</Button>

        <Button
          variant="dark"
          type="button"
          onClick={() => {
            dispatch(trackingActions.modifyAccessToken(undefined));
          }}
        >
          {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Form>
  );
}
