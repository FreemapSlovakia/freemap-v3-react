import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { hasRole } from '@features/auth/model/types.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMapSettingsMessages } from '@features/mapSettings/translations/useMapSettingsMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useCanSaveSettings } from '@shared/hooks/useCanSaveSettings.js';
import { layerName } from '@shared/layerName.js';
import { flaggedCountries } from '@shared/mapDefinitions.js';
import { catalogIcon } from '@shared/mapLibrary/catalogMap.js';
import { isLayerInstalled } from '@shared/mapLibrary/installed.js';
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { FaEye, FaHistory, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { MdLibraryAdd } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import type { Messages } from '@/translations/messagesInterface.js';
import { type CatalogEntry, loadLibraryCatalog } from '../catalog.js';
import { prepareSearchTarget, searchLibrary } from '../librarySearch.js';
import {
  mapLibraryCatalogMapsLoaded,
  mapLibraryInstall,
  mapLibraryPreviewStart,
} from '../model/actions.js';

type Props = { show: boolean };

/** Enough to pick from; past it the query wants refining. */
const maxResults = 50;

const nameOf = (entry: CatalogEntry, m: Messages | undefined) =>
  layerName(entry, m) ?? entry.type;

type LibraryRowProps = {
  entry: CatalogEntry;
  name: string;
  installed: boolean;
  canSave: boolean;
};

function LibraryRow({
  entry,
  name,
  installed,
  canSave,
}: LibraryRowProps): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const { type, index, map } = entry;

  // The store learns a catalog map before it is shown or installed, so the
  // map reducer knows its kind and the menus its name.
  const makeKnown = () => {
    if (map) {
      dispatch(mapLibraryCatalogMapsLoaded([map]));
    }
  };

  return (
    <tr>
      <td>{index ? index.icon : catalogIcon(entry.category)}</td>

      <td className="w-100">
        {name}

        {index?.superseededBy && (
          <GlyphMarker hint={m?.mapLayers.legacy}>
            <FaHistory />
          </GlyphMarker>
        )}

        {flaggedCountries(entry)?.map((country) => (
          <CountryFlag key={country} country={country} />
        ))}
      </td>

      <td>
        <LongPressTooltip label={msm?.preview}>
          {({ props }) => (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                makeKnown();

                dispatch(mapLibraryPreviewStart({ type }));
              }}
              {...props}
            >
              <FaEye />
            </Button>
          )}
        </LongPressTooltip>
      </td>

      <td>
        <LongPressTooltip label={installed ? msm?.uninstall : msm?.install}>
          {({ props }) => (
            <Button
              size="sm"
              variant={installed ? 'danger' : 'secondary'}
              disabled={!canSave}
              onClick={() => {
                makeKnown();

                dispatch(mapLibraryInstall({ type, installed: !installed }));
              }}
              {...props}
            >
              {installed ? <FaTrash /> : <FaPlus />}
            </Button>
          )}
        </LongPressTooltip>
      </td>
    </tr>
  );
}

export default function MapLibraryModal({ show }: Props): ReactElement {
  const m = useMessages();

  const msm = useMapSettingsMessages();

  const dispatch = useDispatch();

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  // The library steps aside while a map is previewed, keeping its search.
  const previewing = useAppSelector(
    (state) => state.mapLibrary.preview !== null,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const canPreviewLayers = useAppSelector((state) =>
    hasRole(state.auth.user, 'layerPreview'),
  );

  const canSaveSettings = useCanSaveSettings();

  const [catalog, setCatalog] = useState<CatalogEntry[]>();

  const [query, setQuery] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useDocumentTitle(show ? m?.mapLayers.mapLibrary : undefined);

  useEffect(() => {
    let live = true;

    loadLibraryCatalog().then(
      (entries) => {
        if (live) {
          setCatalog(entries);
        }
      },
      (err: unknown) => {
        dispatch(
          toastsAdd({
            id: 'mapLibrary.catalogError',
            messageKey: 'general.loadError',
            messageParams: { err },
            style: 'danger',
          }),
        );
      },
    );

    return () => {
      live = false;
    };
  }, [dispatch]);

  const entries = useMemo(
    () =>
      catalog?.filter(
        (entry) => canPreviewLayers || !entry.index?.layerPreview,
      ) ?? [],
    [catalog, canPreviewLayers],
  );

  const targets = useMemo(() => {
    const countryNames = new Intl.DisplayNames([language], { type: 'region' });

    return entries.map((entry) =>
      prepareSearchTarget(nameOf(entry, m), [
        ...(m?.search.commands.keywords[`layer-${entry.type}`]?.split(',') ??
          []),
        ...(entry.countries ?? []).flatMap((country) => [
          country,
          countryNames.of(country.toUpperCase()) ?? '',
        ]),
        entry.category ?? '',
      ]),
    );
  }, [entries, m, language]);

  const searching = query.trim() !== '';

  const { matches, total } = useMemo(
    () => searchLibrary(entries, targets, query, maxResults),
    [entries, targets, query],
  );

  // Without a query the library shows what the user has, not the catalog.
  const shown = searching
    ? matches
    : entries.filter((entry) => isLayerInstalled(layersSettings, entry.type));

  const close = () => {
    dispatch(setActiveModal(null));
  };

  return (
    <Modal
      show={show}
      onHide={close}
      scrollable
      className={previewing ? 'd-none' : undefined}
      backdropClassName={previewing ? 'd-none' : undefined}
      // Hidden, it must neither close on Escape nor hold the focus.
      keyboard={!previewing}
      enforceFocus={!previewing}
      // The dialog takes the focus once shown, so `autoFocus` alone loses it.
      onEntered={() => searchRef.current?.focus()}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <MdLibraryAdd /> {m?.mapLayers.mapLibrary}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Control
          type="search"
          ref={searchRef}
          placeholder={msm?.searchLibrary({ count: entries.length })}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          className="mb-3"
        />

        {!catalog ? (
          <p className="text-muted text-center">{m?.general.loading}</p>
        ) : shown.length === 0 ? (
          <p className="text-muted text-center">
            {searching ? m?.mapLayers.noMapsFound : msm?.noInstalledMaps}
          </p>
        ) : (
          <>
            {!searching && (
              <div className="text-muted small mb-1">{msm?.installedMaps}</div>
            )}

            {(['base', 'overlay'] as const).map((layer) => {
              const rows = shown.filter((entry) => entry.layer === layer);

              return (
                rows.length > 0 && (
                  <section key={layer}>
                    <h6 className="mt-2">
                      {layer === 'base' ? msm?.baseMaps : msm?.overlays}
                    </h6>

                    <Table
                      striped
                      borderless
                      size="sm"
                      className="align-middle"
                    >
                      <tbody>
                        {rows.map((entry) => (
                          <LibraryRow
                            key={entry.type}
                            entry={entry}
                            name={nameOf(entry, m)}
                            installed={isLayerInstalled(
                              layersSettings,
                              entry.type,
                            )}
                            canSave={canSaveSettings}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </section>
                )
              );
            })}

            {searching && total > shown.length && (
              <div className="text-muted small text-center">
                {msm?.moreResults({ count: total - shown.length })}
              </div>
            )}
          </>
        )}

        {/* The catalog is derived from ELI, whose licence asks for this. */}
        <div className="text-muted small mt-3">
          {msm?.catalogCredit}{' '}
          <a
            href="https://github.com/osmlab/editor-layer-index"
            target="_blank"
            rel="noopener noreferrer"
          >
            OSM Editor Layer Index
          </a>{' '}
          (
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 3.0
          </a>
          )
        </div>
      </Modal.Body>

      <Modal.Footer>
        <OfflineBadge offline={!canSaveSettings} />

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
