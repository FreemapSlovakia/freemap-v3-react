import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { HintMark } from '@shared/components/HintMark.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDirtyForm, useDirtySince } from '@shared/hooks/useDirtyForm.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import '@shared/styles/react-tags.scss';
import { Modal } from '@shared/components/Modal.js';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Form, Image } from 'react-bootstrap';
import { FaGem, FaSave } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { ReactTags, type Tag } from 'react-tag-autocomplete';
import z from 'zod';
import {
  type MapListItem,
  mapsLoadList,
  mapsSave,
  mapsSetMapOffline,
  mapsSetTags,
} from '../model/actions.js';
import { myMapsTagsSelector } from '../model/selectors.js';
import { loadMyMapsMessages } from '../translations/loadMyMapsMessages.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

type Props = {
  target?: MapListItem;
  onDone: () => void;
};

const UsersSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    hasPicture: z.boolean().default(false),
    premium: z.boolean().default(false),
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

  const [tags, setTags] = useState<string[]>(target?.tags ?? []);

  const allTags = useAppSelector(myMapsTagsSelector);

  const tagSuggestions = allTags
    .filter((tag) => !tags.includes(tag))
    .map((tag) => ({ label: tag, value: tag }));

  const wasOffline = useAppSelector((state) =>
    target ? state.myMaps.offlineIds.includes(target.id) : false,
  );

  // Seeded once: the modal mounts a fresh form per map, and an `offlineIds`
  // update mid-edit must not overwrite the user's pending toggle.
  const [offline, setOffline] = useState(wasOffline);

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

  // The map's own editors stand in until (or if never) `/users` answers.
  const userMap = useMemo(
    () =>
      new Map(
        [...(target?.editors ?? []), ...(users ?? [])].map((user) => [
          user.id,
          user,
        ]),
      ),
    [users, target],
  );

  // The picker's own "no match" and "new" options have Symbol values.
  const userOf = (value: unknown) =>
    typeof value === 'number' ? userMap.get(value) : undefined;

  const handleWriterAddition = (tag: Tag) => {
    setWriters((writers) => [...writers, Number(tag.value)]);
  };

  const handleWriterDelete = (index: number) => {
    setWriters((writers) => writers.toSpliced(index, 1));
  };

  // Done leaves the form, which takes its guard along.
  useDirtyForm(useDirtySince([name, writers, offline, tags]));

  const save = () => {
    const offlineChanged = target && offline !== wasOffline;

    // Turning offline OFF needs no server data, so apply it immediately.
    if (offlineChanged && !offline) {
      dispatch(mapsSetMapOffline({ id: target.id, offline: false }));
    }

    // Turning offline ON fetches and caches a copy; defer it until after the
    // rename/writers change is persisted so the cached copy reflects the saved
    // name rather than the pre-edit one.
    const flagOfflineOn = () => {
      if (target && offlineChanged && offline) {
        dispatch(mapsSetMapOffline({ id: target.id, offline: true }));
      }
    };

    const isEditingActive = target && target.id === activeMap?.id;

    if (!target) {
      // The save owns the flag here: the map has no id to flag until it exists.
      dispatch(mapsSave({ name, writers, asCopy: true, offline, tags }));
      onDone();
      return;
    }

    if (
      tags.length !== target.tags.length ||
      tags.some((tag) => !target.tags.includes(tag))
    ) {
      dispatch(mapsSetTags({ id: target.id, tags }));
    }

    // Saving unchanged name and writers would still bump the map's modification
    // time; another's map has neither to change.
    if (
      !isOwnMap ||
      (name === target.name &&
        JSON.stringify(writers) === JSON.stringify(target.writers ?? []))
    ) {
      flagOfflineOn();
      onDone();
      return;
    }

    if (isEditingActive) {
      dispatch(mapsSave({ name, writers }));
      flagOfflineOn();
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
        writers,
      }),
    })
      .then((res) => {
        if (res.status === 412) {
          dispatch(
            toastsAdd({
              id: 'myMaps.conflictError',
              style: 'danger',
              messageKey: 'conflictError',
              messageLoader: loadMyMapsMessages,
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
            messageKey: 'mapUpdated',
            messageParams: { name },
            messageLoader: loadMyMapsMessages,
          }),
        );

        dispatch(mapsLoadList());

        flagOfflineOn();

        onDone();
      })
      .catch((err) => {
        dispatch(
          toastsAdd({
            style: 'danger',
            messageKey: 'saveError',
            messageParams: { err },
            messageLoader: loadMyMapsMessages,
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
              <Form.Label className="required">
                <Text k="general.name" />
              </Form.Label>

              <Form.Control
                disabled={!online}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </Form.Group>
          )}

          {isOwnMap && (
            <Form.Group controlId="writers" className="mb-3">
              <Form.Label>
                <Text m={mm} k="writers" />
              </Form.Label>

              <ReactTags
                placeholderText={mm?.addWriter}
                newOptionText={m?.general.newOptionText}
                deleteButtonText={m?.general.deleteButtonText}
                selected={writers.map((id) => ({
                  value: id,
                  label: userMap.get(id)?.name ?? '???',
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
                renderTag={({ classNames, tag, ...props }) => {
                  const user = userOf(tag.value);

                  return (
                    <button
                      type="button"
                      className={`${classNames.tag} fm-user-tag`}
                      {...props}
                    >
                      <span className={classNames.tagName}>
                        <UserLabel user={user}>{tag.label}</UserLabel>
                      </span>
                    </button>
                  );
                }}
                renderOption={({ children, classNames, option, ...props }) => (
                  <div
                    className={`${classNames.option} ${option.active ? classNames.optionIsActive : ''}`}
                    {...props}
                  >
                    <UserLabel user={userOf(option.value)}>
                      {children}
                    </UserLabel>
                  </div>
                )}
              />
            </Form.Group>
          )}

          <Form.Group controlId="tags" className="mb-3">
            <Form.Label>
              <Text m={mm} k="tags" />
            </Form.Label>

            <ReactTags
              placeholderText={mm?.addTag}
              newOptionText={m?.general.newOptionText}
              deleteButtonText={m?.general.deleteButtonText}
              selected={tags.map((tag) => ({ label: tag, value: tag }))}
              suggestions={tagSuggestions}
              onAdd={({ value }) => {
                const typed = String(value).replace(/\s+/g, ' ').trim();

                const same = (t: string) =>
                  t.localeCompare(typed, undefined, {
                    sensitivity: 'accent',
                  }) === 0;

                // An existing tag differing only in case keeps its spelling.
                const tag = allTags.find(same) ?? typed;

                if (tag && !tags.some(same)) {
                  setTags([...tags, tag]);
                }
              }}
              onDelete={(i) => setTags(tags.toSpliced(i, 1))}
              allowNew
              collapseOnSelect
            />

            <Form.Text>{mm?.tagsHint}</Form.Text>
          </Form.Group>

          <Form.Group controlId="offline" className="mb-3 d-flex">
            <Form.Check
              type="checkbox"
              label={mm?.availableOffline}
              checked={offline}
              onChange={(e) => setOffline(e.currentTarget.checked)}
            />

            <HintMark hint={mm?.availableOfflineHint} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <FmModalFooter>
        {canSave && (
          <FmFooterButton
            onClick={save}
            disabled={!name || !online}
            icon={<FaSave />}
            label={mm?.save}
          />
        )}

        <FmDismissButton label={m?.general.cancel} onClick={onDone} />
      </FmModalFooter>
    </>
  );
}

/** A user as `UserChip` shows one, with nothing to click: the picker takes it. */
function UserLabel({
  user,
  children,
}: {
  user: z.infer<typeof UsersSchema>[number] | undefined;
  children: ReactNode;
}) {
  return (
    <>
      {user?.hasPicture && (
        <Image
          className="me-1 w-6"
          src={`${process.env['API_URL']}/auth/users/${user.id}/picture`}
          roundedCircle
        />
      )}
      {children}
      {user?.premium && <FaGem className="ms-1 text-info" />}
    </>
  );
}
