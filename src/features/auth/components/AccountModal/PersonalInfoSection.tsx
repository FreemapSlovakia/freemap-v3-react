import { saveSettings } from '@app/store/actions.js';
import {
  AUTH_PROVIDER_LABELS,
  PublicFieldSchema,
} from '@features/auth/model/types.js';
import { usePictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { Text } from '@features/l10n/Text.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { MarkdownField } from '@shared/components/MarkdownField.js';
import { useModalLink } from '@shared/components/ShowModalLink.js';
import { isHeicFile, isHeicSupported } from '@shared/heicSupport.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  type ChangeEvent,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Form, Image } from 'react-bootstrap';
import { FaCheck, FaTimes, FaUpload, FaUserCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

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

  // Offered only with something to show: an email address, a connected login.
  const offeredFields = PublicFieldSchema.options.filter((field) =>
    field === 'email'
      ? Boolean(email.trim())
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
    email !== (user.email ?? '') ||
    description !== (user.description ?? '') ||
    picture !== undefined ||
    publicFieldsChanged;

  const invalidEmail =
    Boolean(email.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const invalidName = !name.trim();

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
        if (!online) {
          return;
        }

        dispatch(
          saveSettings({
            user: {
              name: name.trim(),
              email: email.trim() || null,
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
          }}
          maxLength={255}
        />
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
        <div className="d-flex align-items-baseline gap-2">
          <Form.Label className="me-auto">
            <Text m={am} k="account.publicFields" />
          </Form.Label>

          {/* Close there comes back here. */}
          <a
            {...modalLink({
              type: 'user',
              id: user.id,
              returnTo: activeModal ?? undefined,
            })}
          >
            <Text m={am} k="account.publicProfile" />
          </a>
        </div>

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
        disabled={!online || !userMadeChanges || invalidName || invalidEmail}
      >
        <FaCheck /> <Text k="general.save" />
      </Button>
    </Form>
  );
}
