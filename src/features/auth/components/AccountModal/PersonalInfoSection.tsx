import { saveSettings } from '@app/store/actions.js';
import { usePictureCacheBust } from '@features/auth/pictureCacheBust.js';
import { loadAuthMessages } from '@features/auth/translations/loadAuthMessages.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { isHeicFile, isHeicSupported } from '@shared/heicSupport.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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

  const m = useMessages();

  const am = useAuthMessages();

  const user = useAppSelector((state) => state.auth.user);

  const pictureCacheBust = usePictureCacheBust();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [description, setDescription] = useState(user?.description ?? '');

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

  const userMadeChanges =
    name !== user.name ||
    email !== (user.email ?? '') ||
    description !== (user.description ?? '') ||
    picture !== undefined;

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

        dispatch(
          saveSettings({
            user: {
              name: name.trim(),
              email: email.trim() || null,
              description: description.trim() || null,
              ...(picture !== undefined ? { picture } : {}),
            },
            keepOpen: true,
          }),
        );
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>{am?.account.picture}</Form.Label>

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

          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> {am?.account.choosePicture}
            </Button>

            {canRemovePicture && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemovePicture}
              >
                <FaTimes /> {m?.general.remove}
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
        <Form.Label className="required">{am?.account.name}</Form.Label>

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
        <Form.Label>{am?.account.email}</Form.Label>

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
        <Form.Label>{am?.account.description}</Form.Label>

        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
        />
      </Form.Group>

      <Button
        className="ms-auto d-block"
        variant="primary"
        type="submit"
        disabled={!userMadeChanges || invalidName || invalidEmail}
      >
        <FaCheck /> {m?.general.save}
      </Button>
    </Form>
  );
}
