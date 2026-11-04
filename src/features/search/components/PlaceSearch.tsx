import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { fitMapToBbox } from '@features/map/fitMapToBbox.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import {
  type PhotonFeature,
  PhotonResponseSchema,
  photonAddress,
  photonExtentToBBox,
  photonForwardUrl,
  uniquePhotonFeatures,
} from '@shared/types/photonResult.js';
import type { Map as LeafletMap } from 'leaflet';
import { type FormEvent, type ReactElement, useEffect, useState } from 'react';
import { Button, Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { HideArrow, minQueryLength, suggestDelayMs } from './searchInput.js';

type Props = {
  /** Where the chosen place is; the map is already moved there. */
  onPlace: (position: LatLon) => void;
};

/**
 * Finds an address for a picking mode: the chosen hit only places the mode's
 * marker, which the user still moves and confirms.
 */
export function PlaceSearch({ onPlace }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const online = useOnline();

  const language = useAppSelector((state) => state.l10n.language);

  const [query, setQuery] = useState('');

  /** The query last sent to the geocoder; a new one cancels the one in flight. */
  const [asked, setAsked] = useState('');

  const [results, setResults] = useState<{
    key: string;
    features?: PhotonFeature[];
    error?: unknown;
  }>();

  const [open, setOpen] = useState(false);

  /** What the results must answer: the query last asked, in this language. */
  const key = `${language}\n${asked}`;

  const loading = asked !== '' && results?.key !== key;

  // Never a stale list: what is shown answers the query last asked.
  const shown = open && asked !== '' && results?.key === key;

  // A map click is the pick itself, and leaves the focus in the box.
  useEffect(() => {
    const close = () => setOpen(false);

    let map: LeafletMap | undefined;

    let gone = false;

    void mapPromise.then((m) => {
      if (!gone) {
        map = m;

        m.on('click', close);
      }
    });

    return () => {
      gone = true;

      map?.off('click', close);
    };
  }, []);

  // Suggest while typing.
  useEffect(() => {
    const q = query.trim();

    if (q.length < minQueryLength) {
      return;
    }

    const timeout = setTimeout(() => setAsked(q), suggestDelayMs);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!asked || !online) {
      return;
    }

    const ac = new AbortController();

    (async () => {
      const res = await fetch(
        photonForwardUrl(asked, language, 8, await mapPromise),
        { signal: ac.signal },
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Doesn't open the list: an answer landing after a map click or a pick
      // must not cover the map. Only typing, focus and Enter open it.
      setResults({
        key: `${language}\n${asked}`,
        features: uniquePhotonFeatures(
          PhotonResponseSchema.parse(await res.json()).features,
        ),
      });
    })().catch((error) => {
      if (!ac.signal.aborted) {
        setResults({ key: `${language}\n${asked}`, error });
      }
    });

    return () => ac.abort();
  }, [asked, language, online]);

  if (!online) {
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const q = query.trim();

    if (q.length >= minQueryLength) {
      setAsked(q);

      setOpen(true);
    }
  }

  function handleChoose(feature: PhotonFeature) {
    setOpen(false);

    const [lon, lat] = feature.geometry.coordinates;

    const { extent } = feature.properties;

    if (extent) {
      void fitMapToBbox(dispatch, photonExtentToBBox(extent), { maxZoom: 17 });
    } else {
      dispatch(
        mapRefocus({ lat, lon, zoom: Math.max(store.getState().map.zoom, 16) }),
      );
    }

    onPlace({ lat, lon });

    trackMatomo(['trackEvent', 'Search', 'pickingPlace']);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Dropdown
        show={shown}
        onToggle={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
          }
        }}
      >
        <Dropdown.Toggle as={HideArrow}>
          <InputGroup className="flex-nowrap">
            <Form.Control
              type="search"
              style={{ minWidth: '8rem' }}
              value={query}
              onChange={(e) => {
                const { value } = e.currentTarget;

                setQuery(value);

                const suggests = value.trim().length >= minQueryLength;

                // Too short to suggest: the old list no longer answers it.
                setOpen(suggests);

                if (!suggests) {
                  setAsked('');
                }
              }}
              onFocus={() => setOpen(query.trim().length >= minQueryLength)}
              onKeyDown={(e) => {
                // Clears the box first; only an empty one lets Escape reach
                // `keyboardHandler` and cancel the picking mode. A shown list
                // closes itself.
                if (e.key === 'Escape' && !shown && query) {
                  e.stopPropagation();

                  setOpen(false);

                  setQuery('');

                  setAsked('');
                }
              }}
              placeholder={m?.search.findPlace}
              autoComplete="off"
            />

            <Button
              variant="secondary"
              type="submit"
              disabled={query.trim().length < minQueryLength}
            >
              {loading ? <Spinner size="sm" /> : <FaSearch />}
            </Button>
          </InputGroup>
        </Dropdown.Toggle>

        <FmDropdownMenu>
          {results?.error !== undefined ? (
            <Dropdown.ItemText className="text-danger">
              {m?.search.fetchingError({ err: results.error })}
            </Dropdown.ItemText>
          ) : (
            results?.features?.length === 0 && (
              <Dropdown.ItemText>{m?.search.noResults}</Dropdown.ItemText>
            )
          )}

          {results?.features?.map((feature, i) => {
            const { name } = feature.properties;

            const address = photonAddress(feature.properties);

            return (
              <Dropdown.Item key={i} onClick={() => handleChoose(feature)}>
                <div className="text-truncate">{name || address}</div>

                {name && address && (
                  <small className="d-block text-truncate text-muted">
                    {address}
                  </small>
                )}
              </Dropdown.Item>
            );
          })}
        </FmDropdownMenu>
      </Dropdown>
    </Form>
  );
}
