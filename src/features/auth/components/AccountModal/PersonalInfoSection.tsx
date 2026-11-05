import { httpRequest } from '@app/httpRequest.js';
import { saveSettings } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { EmailCodeEntry } from '@features/auth/components/EmailCodeEntry.js';
import { isValidEmail } from '@features/auth/emailCode.js';
import { authSetUser } from '@features/auth/model/actions.js';
import { parseUser } from '@features/auth/model/parseUser.js';
import {
  AUTH_PROVIDER_LABELS,
  PublicFieldSchema,
} from '@features/auth/model/types.js';
import { usePictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { useEmailCode } from '@features/auth/useEmailCode.js';
import { Text } from '@features/l10n/Text.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { MarkdownField } from '@shared/components/MarkdownField.js';
import { useModalLink } from '@shared/components/ShowModalLink.js';
import { isHeicFile, isHeicSupported } from '@shared/heicSupport.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  type ChangeEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Button, Form, Image } from 'react-bootstrap';
import {
  FaCheck,
  FaEnvelope,
  FaExclamationTriangle,
  FaTimes,
  FaUpload,
  FaUserCircle,
} from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';

const MAX_PICTURE_BYTES = 5 * 1024 * 1024;

export function PersonalInfoSection(): ReactElement | null {
  const dispatch = useDispatch();

  const online = useOnline();

  const am = useAuthMessages();

  const user = useAppSelector((state) => state.auth.user);

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const modalLink = useModalLink();

  const pictureCacheBust = usePictureCacheBust();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [description, setDescription] = useState(user?.description ?? '');
  const [publicFields, setPublicFields] = useState(user?.publicFields ?? []);

  const store = useStore<RootState>();

  const emailCode = useEmailCode('change', async (address, code) => {
    const res = await httpRequest({
      getState: store.getState,
      method: 'PUT',
      url: '/auth/email',
      cancelActions: [],
      expectedStatus: 200,
      data: { email: address, code },
    });

    // The server's account: it may have merged another one into it, and it
    // unpublishes a changed address.
    dispatch(authSetUser(parseUser(await res.json())));

    trackMatomo(['trackEvent', 'Auth', 'confirmEmail']);

    dispatch(
      toastsAdd({
        messageKey: 'account.emailConfirmed',
        messageLoader: loadAuthMessages,
        style: 'info',
        timeout: 5000,
      }),
    );
  });

  // A disconnect or a reconnect changes what is stored; the draft follows, so
  // a tick it unpublished never comes back with the next save.
  const [draftOf, setDraftOf] = useState(user?.publicFields ?? []);

  // By content: a re-parsed user is a new array holding the same flags.
  if (
    user &&
    new Set(user.publicFields).symmetricDifference(new Set(draftOf)).size > 0
  ) {
    setDraftOf(user.publicFields);

    setPublicFields(user.publicFields);
  }

  // Likewise the address, changed by a confirmation or merge elsewhere.
  const [emailDraftOf, setEmailDraftOf] = useState(user?.email ?? '');

  if (user && (user.email ?? '') !== emailDraftOf) {
    setEmailDraftOf(user.email ?? '');

    // Not over an address being typed, or one a code just went to.
    if (email === emailDraftOf) {
      setEmail(user.email ?? '');
    }
  }

  // And what a merge sets, which a save of the old draft would undo.
  const [nameDraftOf, setNameDraftOf] = useState(user?.name ?? '');

  if (user && user.name !== nameDraftOf) {
    setNameDraftOf(user.name);

    if (name === nameDraftOf) {
      setName(user.name);
    }
  }

  const [descriptionDraftOf, setDescriptionDraftOf] = useState(
    user?.description ?? '',
  );

  if (user && (user.description ?? '') !== descriptionDraftOf) {
    setDescriptionDraftOf(user.description ?? '');

    if (description === descriptionDraftOf) {
      setDescription(user.description ?? '');
    }
  }

  // undefined = unchanged, null = will clear, string = new base64 to upload
  const [picture, setPicture] = useState<string | null | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Once a save completes the global cache-bust changes — drop the local
  // pending state so the freshly fetched server image takes over.
  // biome-ignore lint/correctness/useExhaustiveDependencies: fires only on cache-bust change
  useEffect(() => {
    setPreviewUrl(null);
    setPicture(undefined);
  }, [pictureCacheBust]);

  if (!user) {
    return null;
  }

  const newEmail = email.trim();

  const storedEmail = user.email ?? '';

  // Another address is set only by a code sent there, not by Save.
  const changingEmail = newEmail !== '' && newEmail !== storedEmail;

  const emailCleared = newEmail === '' && storedEmail !== '';

  const codeTarget = changingEmail
    ? newEmail
    : storedEmail && !emailCleared && user.emailVerified === false
      ? storedEmail
      : undefined;

  // Offered only with something to show: an email address (the profile shows
  // it once confirmed), a connected login.
  const offeredFields = PublicFieldSchema.options.filter((field) =>
    field === 'email'
      ? storedEmail !== '' && !emailCleared
      : user.authProviders.includes(field),
  );

  // A tick whose field went (a disconnect, a cleared email) is dropped, not
  // hidden: it must not come back checked when the field does.
  const effectiveFields = publicFields.filter((f) => offeredFields.includes(f));

  if (effectiveFields.length !== publicFields.length) {
    setPublicFields(effectiveFields);
  }

  const publicFieldsChanged =
    new Set(effectiveFields).symmetricDifference(new Set(user.publicFields))
      .size > 0;

  const userMadeChanges =
    name !== user.name ||
    emailCleared ||
    description !== (user.description ?? '') ||
    picture !== undefined ||
    publicFieldsChanged;

  const invalidEmail = Boolean(newEmail) && !isValidEmail(newEmail);

  // Removing it would leave no way in.
  const emailOnlyLogin =
    emailCleared &&
    user.authProviders.length === 0 &&
    // Unknown counts as verified: without a provider it likely is the way in.
    user.emailVerified !== false;

  const emailHint = emailOnlyLogin
    ? 'emailOnlyLogin'
    : newEmail === ''
      ? 'emailMissing'
      : codeTarget === undefined
        ? undefined
        : changingEmail
          ? 'emailChangeHint'
          : 'emailUnconfirmed';

  const warningHint =
    emailHint === 'emailUnconfirmed' || emailHint === 'emailMissing';

  const canSendCode = online && !emailCode.busy && !invalidEmail;

  const invalidName = !name.trim();

  const canSave = online && userMadeChanges && !invalidName && !emailOnlyLogin;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_PICTURE_BYTES) {
      dispatch(
        toastsAdd({
          messageKey: 'account.pictureTooLarge',
          messageLoader: loadAuthMessages,
          style: 'danger',
          timeout: 5000,
        }),
      );

      e.target.value = '';

      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const result = reader.result as string;
      const base64 = result.slice(result.indexOf(',') + 1);

      setPicture(base64);

      // Skip the local preview for HEIC the browser can't decode (the upload
      // still works — the server transcodes it to WebP).
      const previewable = !isHeicFile(file) || (await isHeicSupported());

      setPreviewUrl(previewable ? result : null);
    };

    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleRemovePicture = () => {
    setPicture(null);
    setPreviewUrl(null);
  };

  // A new picture is staged (base64) but can't be previewed (unsupported HEIC).
  const newPictureSelected = typeof picture === 'string';

  // Don't fall back to the stored server image when a new, unpreviewable
  // picture is staged — show the placeholder instead of a stale avatar.
  const avatarSrc =
    previewUrl ??
    (!newPictureSelected && picture !== null && user.hasPicture
      ? `${process.env['API_URL']}/auth/users/${user.id}/picture`
      : undefined);

  const showsPicture = avatarSrc !== undefined;

  const canRemovePicture =
    newPictureSelected || (picture === undefined && user.hasPicture);

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        // Enter in a field submits the form whatever the Save button says.
        if (!canSave) {
          return;
        }

        dispatch(
          saveSettings({
            user: {
              name: name.trim(),
              // Only a removal: a new one goes through its code, and this tab's
              // copy of the stored one may be stale.
              ...(emailCleared ? { email: null } : {}),
              description: description.trim() || null,
              // Only a change: another tab's must not be overwritten unseen.
              ...(publicFieldsChanged ? { publicFields: effectiveFields } : {}),
              ...(picture !== undefined ? { picture } : {}),
            },
            keepOpen: true,
          }),
        );
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>
          <Text m={am} k="account.picture" />
        </Form.Label>

        <div className="d-flex align-items-center gap-3">
          {showsPicture && avatarSrc ? (
            <Image
              key={pictureCacheBust}
              width={64}
              height={64}
              src={avatarSrc}
              roundedCircle
            />
          ) : (
            <FaUserCircle size={64} className="text-secondary" />
          )}

          <div className="d-flex gap-2 flex-wrap flex-row">
            <Button
              variant="secondary"
              size="sm"
              disabled={!online}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> <Text m={am} k="account.choosePicture" />
            </Button>

            {canRemovePicture && (
              <Button
                variant="danger"
                size="sm"
                disabled={!online}
                onClick={handleRemovePicture}
              >
                <FaTimes /> <Text k="general.remove" />
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />
        </div>
      </Form.Group>

      <Form.Group controlId="name" className="mb-3">
        <Form.Label className="required">
          <Text m={am} k="account.name" />
        </Form.Label>

        <Form.Control
          value={name}
          isInvalid={invalidName}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required
          maxLength={255}
        />
      </Form.Group>

      <Form.Group controlId="email" className="mb-3">
        <Form.Label>
          <Text m={am} k="account.email" />
        </Form.Label>

        <Form.Control
          type="email"
          value={email}
          isInvalid={invalidEmail}
          onChange={(e) => {
            setEmail(e.target.value);

            emailCode.setError(undefined);
          }}
          onKeyDown={(e) => {
            // Not the form's submit, which is Save and keeps the stored one.
            if (e.key === 'Enter' && changingEmail) {
              e.preventDefault();

              if (canSendCode && emailCode.sentTo !== newEmail) {
                emailCode.send(newEmail);
              }
            }
          }}
          maxLength={255}
        />

        {emailHint && (
          <Form.Text
            className={
              emailHint === 'emailOnlyLogin'
                ? 'text-danger'
                : warningHint
                  ? 'text-warning-emphasis'
                  : ''
            }
          >
            {warningHint && (
              <>
                <FaExclamationTriangle className="text-warning" />{' '}
              </>
            )}
            <Text m={am} k={`account.${emailHint}`} />
          </Form.Text>
        )}

        {emailCode.error && (
          <Alert variant="danger" className="mt-2 mb-0">
            {emailCode.error}
          </Alert>
        )}

        {codeTarget !== undefined && (
          <div className="mt-2">
            {emailCode.sentTo === codeTarget ? (
              <EmailCodeEntry
                state={emailCode}
                confirmIcon={<FaCheck />}
                confirmLabel={<Text m={am} k="emailCode.confirm" />}
              />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled={!canSendCode}
                onClick={() => emailCode.send(codeTarget)}
              >
                <FaEnvelope /> <Text m={am} k="emailCode.send" />
              </Button>
            )}
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="description">
        <MarkdownField
          id="account-description"
          label={<Text m={am} k="account.description" />}
          rows={3}
          value={description}
          onChange={setDescription}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
          {am?.account.publicFields({
            profile: (text) => (
              // Close there comes back here.
              <a
                {...modalLink({
                  type: 'user',
                  id: user.id,
                  returnTo: activeModal ?? undefined,
                })}
              >
                {text}
              </a>
            ),
          })}
        </Form.Label>

        <div>
          {offeredFields.map((field) => (
            <Form.Check
              key={field}
              inline
              type="checkbox"
              id={`account-public-${field}`}
              label={
                field === 'email'
                  ? am?.account.email
                  : AUTH_PROVIDER_LABELS[field]
              }
              checked={publicFields.includes(field)}
              onChange={(e) => {
                const { checked } = e.currentTarget;

                setPublicFields((fields) =>
                  checked
                    ? [...fields, field]
                    : fields.filter((f) => f !== field),
                );
              }}
            />
          ))}
        </div>
      </Form.Group>

      <Button
        className="ms-auto d-block"
        variant="primary"
        type="submit"
        disabled={!canSave}
      >
        <FaCheck /> <Text k="general.save" />
      </Button>
    </Form>
  );
}
