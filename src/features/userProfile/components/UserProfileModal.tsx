import { setActiveModal } from '@app/store/actions.js';
import { replacingEntry } from '@app/url/urlUpdating.js';
import {
  AUTH_PROVIDER_LABELS,
  AuthProviderSchema,
  knownValues,
  RoleSchema,
} from '@features/auth/model/types.js';
import { namedRoles } from '@features/auth/translations/namedRoles.js';
import { useAuthMessages } from '@features/auth/translations/useAuthMessages.js';
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
import { linkTarget, Markdown } from '@shared/components/Markdown.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { Alert, Badge, Image, Modal, Spinner, Table } from 'react-bootstrap';
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
  // A role newer than this build is dropped.
  roles: knownValues(RoleSchema),
  // Defaulted: an API older than this build sends neither.
  email: z.string().nullable().default(null),
  // A provider newer than this build is dropped.
  links: z
    .array(z.object({ provider: z.string(), url: z.url(), name: z.string() }))
    .default([])
    .transform((links) =>
      links.flatMap(({ provider, ...rest }) => {
        const r = AuthProviderSchema.safeParse(provider);

        return r.success ? [{ provider: r.data, ...rest }] : [];
      }),
    ),
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

  const am = useAuthMessages();

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const modal = activeModal?.type === 'user' ? activeModal : undefined;

  const userId = modal?.id ?? null;

  const myId = useAppSelector((state) => state.auth.user?.id);

  const language = useAppSelector((state) => state.l10n.language);

  const [fetched, setFetched] = useState<
    | { userId: number; type: 'error'; error: unknown }
    | { userId: number; type: 'success'; profile: Profile }
  >();

  // Closed, the last one stays for the fade-out; another user's is still fetching.
  const state =
    fetched &&
    (userId === null ||
      fetched.userId === userId ||
      (fetched.type === 'success' && fetched.profile.id === userId))
      ? fetched
      : { type: 'fetching' as const };

  // The API redirects an account merged into another one to that one.
  const mergedInto =
    fetched?.type === 'success' &&
    fetched.userId === userId &&
    fetched.profile.id !== userId
      ? fetched.profile.id
      : undefined;

  useEffect(() => {
    if (modal && mergedInto !== undefined) {
      replacingEntry(() =>
        dispatch(setActiveModal({ ...modal, id: mergedInto })),
      );
    }
  }, [modal, mergedInto, dispatch]);

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

  const rows = (p: Profile) => {
    const rows: [ReactNode, ReactNode][] = [
      [upm?.memberSince, df.format(p.createdAt)],
    ];

    if (p.email) {
      rows.push([
        upm?.email,
        <a key="email" href={`mailto:${p.email}`}>
          {p.email}
        </a>,
      ]);
    }

    for (const link of p.links) {
      rows.push([
        AUTH_PROVIDER_LABELS[link.provider],
        <a key={link.provider} href={link.url} {...linkTarget(link.url)}>
          {link.name}
        </a>,
      ]);
    }

    rows.push(
      [upm?.photos, nf.format(p.gallery.pictureCount)],
      [upm?.comments, nf.format(p.gallery.commentCount)],
      [upm?.events, nf.format(p.eventCount)],
    );

    return rows;
  };

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
            {(state.profile.hasPicture || state.profile.description) && (
              <div className="d-flex gap-3 align-items-start mb-3">
                {state.profile.hasPicture && (
                  <Image
                    src={`${process.env['API_URL']}/auth/users/${state.profile.id}/picture`}
                    rounded
                    style={{ width: 128, height: 128, objectFit: 'cover' }}
                  />
                )}

                {state.profile.description && (
                  <div
                    className="flex-grow-1"
                    style={{ overflowWrap: 'anywhere' }}
                  >
                    <Markdown text={state.profile.description} />
                  </div>
                )}
              </div>
            )}

            {/* Not a table row: a long list would squeeze every label. */}
            {state.profile.roles.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-3">
                {namedRoles(state.profile.roles, am, language).map(
                  ({ role, name }) => (
                    <Badge key={role} bg="secondary">
                      {name}
                    </Badge>
                  ),
                )}
              </div>
            )}

            <Table size="sm" className="mb-0">
              <tbody>
                {rows(state.profile).map(([label, value], i, all) => {
                  // Bootstrap borders the cells, not the row.
                  const last = i === all.length - 1 ? 'border-bottom-0' : '';

                  return (
                    <tr key={i}>
                      <th className={last}>{label}</th>
                      <td
                        className={`text-end ${last}`}
                        style={{ overflowWrap: 'anywhere' }}
                      >
                        {value}
                      </td>
                    </tr>
                  );
                })}
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
            onClick={() =>
              dispatch(setActiveModal({ type: 'account', section: 'personal' }))
            }
          />
        )}

        <FmDismissButton label={m?.general.close} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
