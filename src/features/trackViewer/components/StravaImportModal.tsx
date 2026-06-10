import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { authWithPopupOAuth } from '@features/auth/model/actions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Button, ListGroup, Modal, Spinner } from 'react-bootstrap';
import {
  FaBiking,
  FaCloudDownloadAlt,
  FaDumbbell,
  FaHiking,
  FaRoute,
  FaRunning,
  FaSkiing,
  FaSkiingNordic,
  FaStrava,
  FaSwimmer,
  FaTimes,
  FaWalking,
  FaWater,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import z from 'zod';
import connectWithStrava from '@/images/strava/btn_strava_connect_with_orange.svg';
import poweredByStrava from '@/images/strava/powered_by_strava_orange.svg';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../model/actions.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

const ActivitySchema = z.object({
  id: z.number(),
  name: z.string(),
  sport_type: z.string().nullish(),
  distance: z.number().nullish(),
  moving_time: z.number().nullish(),
  total_elevation_gain: z.number().nullish(),
  start_date: z.string().nullish(),
  map: z.object({ summary_polyline: z.string().nullish() }).nullish(),
  // Other available summary fields not shown: elapsed_time, average_speed,
  // max_speed, average_heartrate, max_heartrate, average_watts,
  // average_cadence, elev_high, elev_low, kudos_count, achievement_count,
  // start_latlng, trainer, commute, private. See Strava SummaryActivity.
});

const ListResponseSchema = z.array(ActivitySchema);

type Activity = z.infer<typeof ActivitySchema>;

const PER_PAGE = 30;

// Decodes a Google/Strava encoded polyline (precision 1e5) into [lat, lon]s.
function decodePolyline(str: string): [number, number][] {
  const coords: [number, number][] = [];

  let index = 0;
  let lat = 0;
  let lon = 0;

  while (index < str.length) {
    for (const isLon of [false, true]) {
      let result = 0;
      let shift = 0;
      let b: number;

      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const delta = result & 1 ? ~(result >> 1) : result >> 1;

      if (isLon) {
        lon += delta;
      } else {
        lat += delta;
      }
    }

    coords.push([lat / 1e5, lon / 1e5]);
  }

  return coords;
}

// A tiny route thumbnail rendered from the activity's summary polyline.
function RoutePreview({ polyline }: { polyline: string }): ReactElement | null {
  const points = useMemo(() => {
    const coords = decodePolyline(polyline);

    if (coords.length < 2) {
      return null;
    }

    const lats = coords.map((c) => c[0]);
    const lons = coords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Correct longitude for latitude so the preview keeps its proportions.
    const cos = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
    const w = (maxLon - minLon) * cos || 1;
    const h = maxLat - minLat || 1;
    const scale = 44 / Math.max(w, h);
    const offX = (48 - w * scale) / 2;
    const offY = (48 - h * scale) / 2;

    return coords
      .map(
        ([la, lo]) =>
          `${(offX + (lo - minLon) * cos * scale).toFixed(1)},${(offY + (maxLat - la) * scale).toFixed(1)}`,
      )
      .join(' ');
  }, [polyline]);

  if (!points) {
    return null;
  }

  return (
    <svg width={48} height={48} className="flex-shrink-0" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="#fc4c02"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Maps a Strava sport_type to one of our icons (Strava exposes only the
// string; there is no icon in the API).
function sportIcon(sport: string | null | undefined): ReactNode {
  switch (sport) {
    case 'Run':
    case 'TrailRun':
    case 'VirtualRun':
      return <FaRunning />;
    case 'Hike':
      return <FaHiking />;
    case 'Walk':
      return <FaWalking />;
    case 'Swim':
      return <FaSwimmer />;
    case 'AlpineSki':
    case 'BackcountrySki':
    case 'Snowboard':
      return <FaSkiing />;
    case 'NordicSki':
    case 'RollerSki':
      return <FaSkiingNordic />;
    case 'Kayaking':
    case 'Canoeing':
    case 'Rowing':
    case 'StandUpPaddling':
    case 'Surfing':
    case 'Sail':
    case 'Windsurf':
    case 'Kitesurf':
      return <FaWater />;
    case 'WeightTraining':
    case 'Crossfit':
    case 'Workout':
    case 'HighIntensityIntervalTraining':
      return <FaDumbbell />;
    default:
      return sport?.includes('Ride') ? <FaBiking /> : <FaRoute />;
  }
}

// Formats a duration in seconds as h:mm:ss or m:ss.
function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

type Props = { show: boolean };

export default function StravaImportModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  useDocumentTitle(show ? tvm?.strava.title : undefined);

  const dispatch = useDispatch();

  const authToken = useAppSelector((state) => state.auth.user?.authToken);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const connected = useAppSelector((state) =>
    Boolean(state.auth.user?.authProviders.includes('strava')),
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const [activities, setActivities] = useState<Activity[]>([]);

  const [page, setPage] = useState(0);

  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(false);

  const [importingId, setImportingId] = useState<number | null>(null);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const loadPage = useCallback(
    async (nextPage: number, signal?: AbortSignal) => {
      setLoading(true);

      setError(false);

      try {
        const res = await fetch(
          `${process.env['API_URL']}/strava/activities?page=${nextPage}&perPage=${PER_PAGE}`,
          {
            signal,
            headers: {
              accept: 'application/json',
              ...(authToken ? { authorization: 'Bearer ' + authToken } : {}),
            },
          },
        );

        if (!res.ok) {
          throw new Error();
        }

        const batch = ListResponseSchema.parse(await res.json());

        setActivities((prev) => [...prev, ...batch]);

        setHasMore(batch.length === PER_PAGE);

        setPage(nextPage);
      } catch {
        if (!signal?.aborted) {
          setError(true);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [authToken],
  );

  useEffect(() => {
    if (!show || !connected) {
      return;
    }

    const ac = new AbortController();

    setActivities([]);

    loadPage(1, ac.signal);

    return () => {
      ac.abort();
    };
  }, [show, connected, loadPage]);

  const handleImport = useCallback(
    async (activity: Activity) => {
      setImportingId(activity.id);

      try {
        const res = await fetch(
          `${process.env['API_URL']}/strava/activities/${activity.id}/export`,
          {
            headers: authToken ? { authorization: 'Bearer ' + authToken } : {},
          },
        );

        if (!res.ok) {
          throw new Error();
        }

        const trackGpx = await res.text();

        dispatch(trackViewerSetTrackUID(null));

        dispatch(trackViewerSetData({ trackGpx, focus: true }));

        dispatch(elevationChartClose());

        dispatch(setActiveModal(null));
      } catch {
        setError(true);
      } finally {
        setImportingId(null);
      }
    },
    [authToken, dispatch],
  );

  // Only activities with a recorded GPS track can be imported; this drops
  // manual/indoor activities, which have no polyline. Pagination still keys
  // off the raw batch size, so filtering here doesn't break "Load more".
  const visible = useMemo(
    () => activities.filter((a) => a.map?.summary_polyline),
    [activities],
  );

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  // Re-running on page/loading/hasMore keeps the closure fresh. This also
  // auto-continues past pages that are entirely manual/indoor (no visible
  // rows after filtering).
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;

    if (!el || !hasMore || loading) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadPage(page + 1);
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasMore, loading, page, loadPage]);

  return (
    <Modal
      show={show}
      onHide={close}
      scrollable
      contentClassName="bg-body-tertiary"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaStrava /> {tvm?.strava.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!connected ? (
          <>
            <Alert variant="warning">{tvm?.strava.notConnected}</Alert>

            {/* Official "Connect with Strava" button asset, used unmodified. */}
            <button
              type="button"
              className="btn p-0 border-0 bg-transparent"
              aria-label={tvm?.strava.connect}
              onClick={() =>
                dispatch(
                  authWithPopupOAuth({
                    provider: 'strava',
                    connect: loggedIn,
                    // Keep the picker open after connecting; otherwise the
                    // connect flow would switch to the account modal.
                    successAction: setActiveModal('strava-import'),
                  }),
                )
              }
            >
              <img
                src={connectWithStrava}
                alt={tvm?.strava.connect}
                height={48}
              />
            </button>
          </>
        ) : (
          <>
            <p>{tvm?.strava.intro}</p>

            {error && (
              <Alert variant="danger">
                {importingId === null
                  ? tvm?.strava.loadError
                  : tvm?.strava.importError}
              </Alert>
            )}

            {visible.length === 0 && !loading && !error && !hasMore ? (
              <p className="text-muted mb-0">{tvm?.strava.empty}</p>
            ) : (
              <ListGroup>
                {visible.map((activity) => (
                  <ListGroup.Item
                    key={activity.id}
                    className="d-flex align-items-center gap-2"
                  >
                    {activity.map?.summary_polyline && (
                      <RoutePreview polyline={activity.map.summary_polyline} />
                    )}

                    <div className="flex-grow-1">
                      <div>
                        {activity.sport_type ? (
                          <LongPressTooltip label={activity.sport_type}>
                            {({ props }) => (
                              <span {...props}>
                                {sportIcon(activity.sport_type)}
                              </span>
                            )}
                          </LongPressTooltip>
                        ) : (
                          sportIcon(activity.sport_type)
                        )}{' '}
                        {activity.name}
                      </div>

                      <small className="text-muted">
                        {[
                          activity.start_date &&
                            dateFormat.format(new Date(activity.start_date)),
                          activity.distance != null &&
                            `${(activity.distance / 1000).toFixed(1)} km`,
                          activity.moving_time != null &&
                            formatDuration(activity.moving_time),
                          activity.total_elevation_gain != null &&
                            `↑ ${Math.round(activity.total_elevation_gain)} m`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>

                      {/* Brand-mandated link back to the source; exact text. */}
                      <div>
                        <a
                          href={`https://www.strava.com/activities/${activity.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#FC5200', fontWeight: 'bold' }}
                        >
                          <small>View on Strava</small>
                        </a>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={importingId !== null}
                      onClick={() => handleImport(activity)}
                      aria-label={m?.general.load}
                    >
                      {importingId === activity.id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaCloudDownloadAlt />
                      )}
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            {loading && (
              <div className="d-flex justify-content-center mt-3">
                <Spinner animation="border" />
              </div>
            )}

            {hasMore && !loading && <div ref={sentinelRef} />}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {/* Attribution wherever Strava data is shown. */}
        <img
          src={poweredByStrava}
          alt="Powered by Strava"
          height={20}
          className="me-auto"
        />

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
