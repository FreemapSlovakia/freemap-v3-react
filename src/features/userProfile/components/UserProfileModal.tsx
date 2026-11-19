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
import { ManualHeaderButton } from '@features/documents/components/ManualHeaderButton.js';
import { MEDALS } from '@features/gallery/medals.js';
import {
  galleryRequestImage,
  gallerySetFilter,
} from '@features/gallery/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { linkTarget, Markdown } from '@shared/components/Markdown.js';
import { Modal } from '@shared/components/Modal.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  Fragment,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  Badge,
  Image,
  Spinner,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import {
  FaCamera,
  FaGem,
  FaUser,
  FaUserEdit,
  FaUserShield,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import { useUserProfileMessages } from '../translations/useUserProfileMessages.js';

type Props = { show: boolean };

const PeriodSchema = z.enum(['all', 'last90days', 'last30days']);

const deserializePeriod = (value: string | null) =>
  PeriodSchema.catch('all').parse(value);

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
    // Optional: an API older than this build sends none of these.
    ranking: z
      .partialRecord(
        PeriodSchema,
        z.object({
          pictureCount: z.uint32(),
          rank: z.uint32().nullable(),
          podiums: z.array(z.object({ country: z.string(), rank: z.uint32() })),
        }),
      )
      .optional(),
    countryCount: z.uint32().optional(),
    viewCount: z.uint32().optional(),
    receivedRating: z
      .object({ count: z.uint32(), average: z.number().nullable() })
      .optional(),
    ratingsGiven: z.uint32().optional(),
  }),
  eventCount: z.uint32(),
  osm: z
    .object({
      mapperSince: z.coerce.date(),
      changesetCount: z.uint32(),
      traceCount: z.uint32(),
      lastEditAt: z.coerce.date().nullable(),
    })
    .nullable()
    .default(null),
});

type Profile = z.infer<typeof ProfileSchema>;

type Row = [ReactNode, ReactNode];

/** `aside` sits right of the heading. */
type Section = { heading?: ReactNode; aside?: ReactNode; rows: Row[] };
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

  const [period, setPeriod] = usePersistentState(
    'fm.userProfile.period',
    String,
    deserializePeriod,
  );

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

  const rf = useNumberFormat({
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

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

  const sections = (p: Profile) => {
    const general: Row[] = [[upm?.memberSince, df.format(p.createdAt)]];

    if (p.email) {
      general.push([
        upm?.email,
        <a key="email" href={`mailto:${p.email}`}>
          {p.email}
        </a>,
      ]);
    }

    for (const link of p.links) {
      general.push([
        AUTH_PROVIDER_LABELS[link.provider],
        <a key={link.provider} href={link.url} {...linkTarget(link.url)}>
          {link.name}
        </a>,
      ]);
    }

    if (p.eventCount > 0) {
      general.push([upm?.events, nf.format(p.eventCount)]);
    }

    const g = p.gallery;

    const photos: Row[] = [];

    if (g.pictureCount > 0 && g.countryCount !== undefined) {
      photos.push([upm?.countries, nf.format(g.countryCount)]);
    }

    if (g.pictureCount > 0 && g.viewCount !== undefined) {
      photos.push([upm?.views, nf.format(g.viewCount)]);
    }

    if (g.receivedRating && g.receivedRating.average !== null) {
      photos.push([
        upm?.averageRating,
        `${rf.format(g.receivedRating.average)} ★ (${nf.format(g.receivedRating.count)})`,
      ]);
    }

    photos.push([upm?.comments, nf.format(g.commentCount)]);

    if (g.ratingsGiven !== undefined) {
      photos.push([upm?.ratingsGiven, nf.format(g.ratingsGiven)]);
    }

    const result: Section[] = [{ rows: general }];

    const ranking = g.pictureCount > 0 ? g.ranking?.[period] : undefined;

    photos.unshift([upm?.photos, nf.format(g.pictureCount)]);

    result.push({ heading: upm?.photosHeading, rows: photos });

    if (ranking) {
      const rankingRows: Row[] = [
        [upm?.periodPhotos, nf.format(ranking.pictureCount)],
      ];

      if (ranking.rank) {
        rankingRows.push([
          upm?.rank,
          [MEDALS[ranking.rank - 1], nf.format(ranking.rank)]
            .filter(Boolean)
            .join(' '),
        ]);
      }

      if (ranking.podiums.length > 0) {
        rankingRows.push([
          upm?.podiums,
          <span key="podiums" className="d-inline-flex flex-wrap gap-2">
            {ranking.podiums.map(({ country, rank }, i) => (
              <Fragment key={country}>
                {i > 0 && <span className="text-body-secondary">·</span>}
                <span className="text-nowrap">
                  <CountryFlag country={country} /> {MEDALS[rank - 1]}
                </span>
              </Fragment>
            ))}
          </span>,
        ]);
      }

      result.push({
        heading: upm?.rankingHeading,
        aside: (
          <ToggleButtonGroup
            type="radio"
            name="profilePeriod"
            size="sm"
            value={period}
            onChange={(value: typeof period) => {
              trackMatomo(['trackEvent', 'Gallery', 'profilePeriod', value]);

              setPeriod(value);
            }}
          >
            {(
              [
                ['all', upm?.periodAll],
                ['last90days', upm?.period90],
                ['last30days', upm?.period30],
              ] as const
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                id={`profilePeriod-${value}`}
                variant="outline-primary"
                value={value}
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ),
        rows: rankingRows,
      });
    }

    const osmLink = p.links.find((link) => link.provider === 'osm');

    if (p.osm && osmLink) {
      const hdyc = `https://hdyc.neis-one.org/?${encodeURIComponent(osmLink.name)}`;

      result.push({
        heading: AUTH_PROVIDER_LABELS.osm,
        rows: [
          [upm?.osmMapperSince, df.format(p.osm.mapperSince)],
          [upm?.osmChangesets, nf.format(p.osm.changesetCount)],
          ...(p.osm.lastEditAt
            ? [[upm?.osmLastEdit, df.format(p.osm.lastEditAt)] as Row]
            : []),
          [upm?.osmTraces, nf.format(p.osm.traceCount)],
          [
            upm?.osmMoreStats,
            <a key="hdyc" href={hdyc} {...linkTarget(hdyc)}>
              How did you contribute?
            </a>,
          ],
        ],
      });
    }

    return result;
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

        <ManualHeaderButton chapter="account" />
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
              <div className="d-flex flex-wrap align-items-center gap-1 mb-3">
                <GlyphMarker hint={upm?.roles} color={null} className="me-1">
                  <FaUserShield />
                </GlyphMarker>

                {namedRoles(state.profile.roles, am, language).map(
                  ({ role, name }) => (
                    <Badge key={role} bg="secondary">
                      {name}
                    </Badge>
                  ),
                )}
              </div>
            )}

            {sections(state.profile).map(
              ({ heading, aside, rows }, si, allSections) => (
                <Fragment key={si}>
                  {heading && (
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2 mb-2">
                      <h5 className="mb-0">{heading}</h5>
                      {aside}
                    </div>
                  )}

                  <Table
                    size="sm"
                    className={si === allSections.length - 1 ? 'mb-0' : ''}
                  >
                    <tbody>
                      {rows.map(([label, value], i) => {
                        // Bootstrap borders the cells, not the row.
                        const last =
                          i === rows.length - 1 ? 'border-bottom-0' : '';

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
                </Fragment>
              ),
            )}
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
