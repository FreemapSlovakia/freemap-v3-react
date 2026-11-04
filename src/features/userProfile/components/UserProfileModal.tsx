import { setActiveModal } from '@app/store/actions.js';
import {
  galleryRequestImage,
  gallerySetFilter,
} from '@features/gallery/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { Markdown } from '@shared/components/Markdown.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Alert, Image, Modal, Spinner, Table } from 'react-bootstrap';
import { FaCamera, FaGem, FaUser, FaUserEdit } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { useUserProfileMessages } from '../translations/useUserProfileMessages.js';

type Props = { show: boolean };

const ProfileSchema = z.object({
  id: z.uint32(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  hasPicture: z.boolean(),
  premium: z.boolean(),
  gallery: z.object({
    pictureCount: z.uint32(),
    commentCount: z.uint32(),
  }),
  eventCount: z.uint32(),
});

type Profile = z.infer<typeof ProfileSchema>;

export default function UserProfileModal({ show }: Props): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const upm = useUserProfileMessages();

  const prm = usePremiumMessages();

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const modal = activeModal?.type === 'user' ? activeModal : undefined;

  const userId = modal?.id ?? null;

  const myId = useAppSelector((state) => state.auth.user?.id);

  const [fetched, setFetched] = useState<
    | { userId: number; type: 'error'; error: unknown }
    | { userId: number; type: 'success'; profile: Profile }
  >();

  // Closed, the last one stays for the fade-out; another user's is still fetching.
  const state =
    fetched && (userId === null || fetched.userId === userId)
      ? fetched
      : { type: 'fetching' as const };

  useEffect(() => {
    if (userId === null) {
      return;
    }

    const ac = new AbortController();

    (async () => {
      const res = await fetch(
        `${process.env['API_URL']}/auth/users/${userId}/profile`,
        { signal: ac.signal, headers: { accept: 'application/json' } },
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setFetched({
        userId,
        type: 'success',
        profile: ProfileSchema.parse(await res.json()),
      });
    })().catch((error) => {
      if (!ac.signal.aborted) {
        setFetched({ userId, type: 'error', error });
      }
    });

    return () => {
      ac.abort();
    };
  }, [userId]);

  const nf = useNumberFormat();

  const df = useDateTimeFormat({ dateStyle: 'long' });

  const close = () => {
    const returnTo = modal?.returnTo;

    if (returnTo?.type === 'gallery-viewer') {
      // The viewer lives in the gallery slice, not in `main.activeModal`.
      dispatch(setActiveModal(null));

      dispatch(galleryRequestImage(returnTo.id));
    } else {
      dispatch(setActiveModal(returnTo ?? null));
    }
  };

  const profile = state.type === 'success' ? state.profile : undefined;

  return (
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaUser /> {profile?.name}
          {profile?.premium && (
            <>
              {' '}
              <GlyphMarker hint={prm?.premiumUser} color="info">
                <FaGem />
              </GlyphMarker>
            </>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        {state.type === 'fetching' ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : state.type === 'error' ? (
          <Alert variant="danger">
            {m?.general.loadError({ err: state.error })}
          </Alert>
        ) : (
          <>
            <div className="d-flex gap-3 align-items-start mb-3">
              {state.profile.hasPicture && (
                <Image
                  src={`${process.env['API_URL']}/auth/users/${state.profile.id}/picture`}
                  rounded
                  style={{ width: 128, height: 128, objectFit: 'cover' }}
                />
              )}

              <div className="flex-grow-1" style={{ overflowWrap: 'anywhere' }}>
                {state.profile.description && (
                  <Markdown text={state.profile.description} />
                )}

                <div className="text-body-secondary small mt-2">
                  {upm?.memberSince(df.format(state.profile.createdAt))}
                </div>
              </div>
            </div>

            <Table size="sm" className="mb-0">
              <tbody>
                <tr>
                  <th>{upm?.photos}</th>
                  <td className="text-end">
                    {nf.format(state.profile.gallery.pictureCount)}
                  </td>
                </tr>

                <tr>
                  <th>{upm?.comments}</th>
                  <td className="text-end">
                    {nf.format(state.profile.gallery.commentCount)}
                  </td>
                </tr>

                <tr>
                  {/* Bootstrap borders the cells, not the row. */}
                  <th className="border-bottom-0">{upm?.events}</th>
                  <td className="text-end border-bottom-0">
                    {nf.format(state.profile.eventCount)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>

      <FmModalFooter>
        {profile && profile.gallery.pictureCount > 0 && (
          <FmFooterButton
            variant="secondary"
            icon={<FaCamera />}
            label={upm?.showPhotos}
            onClick={() => {
              trackMatomo(['trackEvent', 'Gallery', 'showUserPhotos']);

              // Enables the photo layer too.
              dispatch(gallerySetFilter({ userId: profile.id }));

              // To the map, not back to what the profile was opened from.
              dispatch(setActiveModal(null));
            }}
          />
        )}

        {profile && profile.id === myId && (
          <FmFooterButton
            variant="secondary"
            icon={<FaUserEdit />}
            label={upm?.edit}
            onClick={() => dispatch(setActiveModal({ type: 'account' }))}
          />
        )}

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
