import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import '@shared/styles/react-tags.scss';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ReactTags, Tag } from 'react-tag-autocomplete';
import 'react-tag-autocomplete/example/src/styles.css';
import z from 'zod';
import { type MapMeta, mapsLoadList, mapsSave } from '../model/actions.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

type Props = {
  target?: MapMeta;
  onDone: () => void;
};

const UsersSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
  }),
);

export function MyMapsModalForm({ target, onDone }: Props): ReactElement {
  const dispatch = useDispatch();

  const activeMap = useAppSelector((state) => state.myMaps.activeMap);

  const myUserId = useAppSelector((state) => state.auth.user?.id);

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  const isOwnMap = !target || target.userId === myUserId;

  const canSave = !target || target.canWrite;

  const [name, setName] = useState(target?.name ?? '');

  useEffect(() => {
    setName(target?.name ?? '');
  }, [target]);

  const [writers, setWriters] = useState<number[]>(target?.writers ?? []);

  useEffect(() => {
    setWriters(target?.writers ?? []);
  }, [target]);

  const m = useMessages();

  const mm = useMyMapsMessages();

  const online = useOnline();

  const [users, setUsers] = useState<z.infer<typeof UsersSchema>>();

  useEffect(() => {
    fetch(`${process.env['API_URL']}/users`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw new Error();
      })
      .then((data) => {
        setUsers(UsersSchema.parse(data));
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      });
  }, [dispatch]);

  const userMap = useMemo(() => {
    const userMap = new Map<number, string>();

    for (const user of users ?? []) {
      userMap.set(user.id, user.name);
    }

    return userMap;
  }, [users]);

  const handleWriterAddition = (tag: Tag) => {
    setWriters((writers) => [...writers, Number(tag.value)]);
  };

  const handleWriterDelete = (index: number) => {
    setWriters((writers) => writers.filter((_, i) => i !== index));
  };

  const save = () => {
    const isEditingActive = target && target.id === activeMap?.id;

    if (!target) {
      dispatch(mapsSave({ name, writers, asCopy: true }));
      onDone();
      return;
    }

    if (isEditingActive) {
      dispatch(mapsSave({ name, writers }));
      onDone();
      return;
    }

    fetch(`${process.env['API_URL']}/maps/${target.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'If-Unmodified-Since': target.modifiedAt.toUTCString(),
      },
      body: JSON.stringify({
        name,
        public: target.public,
        writers,
      }),
    })
      .then((res) => {
        if (res.status === 412) {
          dispatch(
            toastsAdd({
              id: 'myMaps.conflictError',
              style: 'danger',
              message: mm?.conflictError ?? '',
            }),
          );

          return;
        }

        if (!res.ok) {
          throw new Error();
        }

        dispatch(
          toastsAdd({
            style: 'success',
            timeout: 5000,
            messageKey: 'general.saved',
          }),
        );

        dispatch(mapsLoadList());

        onDone();
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            message: mm?.saveError({ err }) ?? '',
          }),
        );
      });
  };

  return (
    <>
      <Modal.Body>
        <Form>
          {isOwnMap && (
            <Form.Group controlId="mapName" className="mb-3">
              <Form.Label className="required">{m?.general.name}</Form.Label>

              <Form.Control
                disabled={!online}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Form.Group>
          )}

          {isOwnMap && (
            <Form.Group controlId="writers" className="mb-3">
              <Form.Label>{mm?.writers}</Form.Label>

              <ReactTags
                placeholderText={mm?.addWriter}
                newOptionText={m?.general.newOptionText}
                deleteButtonText={m?.general.deleteButtonText}
                selected={writers.map((id) => ({
                  value: id,
                  label: userMap.get(id) ?? '???',
                }))}
                suggestions={
                  users
                    ?.filter(
                      (user) =>
                        user.id !== myUserId && !writers.includes(user.id),
                    )
                    .map((user) => ({
                      label: user.name,
                      value: user.id,
                    })) ?? []
                }
                onAdd={handleWriterAddition}
                onDelete={handleWriterDelete}
                collapseOnSelect
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {canSave && (
          <Button type="button" onClick={save} disabled={!name || !online}>
            <FaSave /> {mm?.save}
          </Button>
        )}

        <Button variant="dark" onClick={onDone}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </>
  );
}
