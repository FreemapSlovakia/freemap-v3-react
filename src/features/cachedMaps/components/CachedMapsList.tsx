import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapFitBbox, mapToggleLayer } from '@features/map/model/actions.js';
import { useOfflineMapExportMessages } from '@features/offlineMapExport/translations/useOfflineMapExportMessages.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { IconSpecGlyph } from '@shared/components/IconGlyph.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { modalMenuItemProps } from '@shared/hooks/useMenuHandler.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { makeLabelComparator } from '@shared/stringUtils.js';
import type { ReactElement } from 'react';
import { Button, ListGroup, Modal, ProgressBar } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaCrosshairs,
  FaDatabase,
  FaEye,
  FaPencilAlt,
  FaPlay,
  FaPlus,
  FaStop,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  cachedMapDeleted,
  cachedMapsSetView,
  cacheTilesRestart,
  cacheTilesStop,
} from '../model/actions.js';
import { useCachedMapsMessages } from '../translations/useCachedMapsMessages.js';

export function CachedMapsList(): ReactElement {
  const m = useMessages();

  const online = useOnline();

  const cmm = useCachedMapsMessages();

  const ome = useOfflineMapExportMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  const activeDownloads = useAppSelector(
    (state) => state.cachedMaps.activeDownloads,
  );

  const activeLayers = useAppSelector((state) => state.map.layers);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const language = useAppSelector((state) => state.l10n.language);

  const byName = makeLabelComparator(language);

  const sortedMaps = [...cachedMaps].sort((a, b) =>
    byName(a.name || undefined, b.name || undefined),
  );

  const totalSize = cachedMaps.reduce((sum, cm) => sum + cm.sizeBytes, 0);

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>
          <BiWifiOff /> {m?.mapLayers.offlineMaps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {cachedMaps.length === 0 ? (
          <p className="text-muted mb-0">{cmm?.emptyMessage}</p>
        ) : (
          <>
            <ListGroup>
              {sortedMaps.map((cm) => {
                const dl = activeDownloads[cm.type];

                const isComplete = cm.downloadedCount === cm.tileCount;

                const pct = dl
                  ? Math.round((dl.downloaded / dl.total) * 100)
                  : isComplete
                    ? 100
                    : Math.round((cm.downloadedCount / cm.tileCount) * 100);

                return (
                  <ListGroup.Item
                    key={cm.type}
                    variant={
                      activeLayers.includes(cm.type) ? 'primary' : undefined
                    }
                    className="d-flex align-items-center gap-2"
                  >
                    <IconSpecGlyph
                      spec={cm.iconSpec}
                      fallback={<BiWifiOff />}
                    />

                    <div className="flex-grow-1 me-2 min-w-0">
                      <div>{cm.name}</div>

                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <small className="text-muted">
                          <span className="text-nowrap">
                            {cmm?.zoom}:{' '}
                            <strong>
                              {cm.minZoom}&ndash;{cm.maxNativeZoom}
                            </strong>
                            {' · '}
                          </span>{' '}
                          <span className="text-nowrap">
                            {cmm?.tiles}:{' '}
                            <strong>{nf.format(cm.tileCount)}</strong>
                            {' · '}
                          </span>{' '}
                          {/* only maps that recorded their scale can state it;
                              for the rest it would be a guess from this screen */}
                          {cm.tileScale !== undefined && (
                            <span className="text-nowrap">
                              {ome?.scale}: <strong>{cm.tileScale}×</strong>
                              {' · '}
                            </span>
                          )}{' '}
                          <span className="text-nowrap">
                            {cmm?.size}:{' '}
                            <strong>
                              {formatSize(dl?.sizeBytes ?? cm.sizeBytes)}
                            </strong>
                          </span>
                        </small>

                        <small> · </small>

                        {dl ? (
                          <ProgressBar
                            now={pct}
                            label={`${pct}%`}
                            animated={dl.status === 'downloading'}
                            variant={
                              dl.status === 'error' ? 'danger' : undefined
                            }
                            className="flex-grow-1"
                            style={{ minWidth: 80 }}
                          />
                        ) : isComplete ? (
                          <small className="text-success">{cmm?.ready}</small>
                        ) : (
                          <small className="text-warning">
                            {cmm?.incomplete({ pct })}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ResponsiveActions
                        size="sm"
                        align="end"
                        toggleLabel={m?.general.actions}
                      >
                        {!dl && isComplete ? (
                          <Action
                            icon={<FaEye />}
                            label={cmm?.activate}
                            variant="primary"
                            onClick={() => {
                              dispatch(
                                mapToggleLayer({ type: cm.type, enable: true }),
                              );

                              dispatch(
                                mapFitBbox({
                                  bbox: cm.bounds,
                                  maxZoom: cm.maxNativeZoom,
                                  minZoom: cm.minZoom,
                                }),
                              );
                            }}
                            showFrom="sm"
                          />
                        ) : (
                          <Action
                            icon={<FaCrosshairs />}
                            label={cmm?.focus}
                            onClick={() =>
                              dispatch(
                                mapFitBbox({
                                  bbox: cm.bounds,
                                  maxZoom: cm.maxNativeZoom,
                                  minZoom: cm.minZoom,
                                }),
                              )
                            }
                            showFrom="sm"
                          />
                        )}

                        {/* halts the caching and keeps what it got; discarding
                            the map altogether is what Delete is for */}
                        {dl && (
                          <Action
                            icon={<FaStop />}
                            label={cmm?.stop}
                            onClick={() =>
                              dispatch(cacheTilesStop({ id: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        {!dl && !isComplete && (
                          <Action
                            icon={<FaPlay />}
                            label={cmm?.resume}
                            requiresOnline
                            onClick={() =>
                              dispatch(
                                cacheTilesRestart({
                                  id: cm.type,
                                  downloaded: cm.downloadedCount,
                                  total: cm.tileCount,
                                  sizeBytes: cm.sizeBytes,
                                }),
                              )
                            }
                            showFrom="sm"
                          />
                        )}

                        {!dl && (
                          <Action
                            icon={<FaPencilAlt />}
                            label={m?.general.modify}
                            onClick={() =>
                              dispatch(cachedMapsSetView({ edit: cm.type }))
                            }
                            showFrom="sm"
                          />
                        )}

                        <Action
                          icon={<FaTrash />}
                          label={m?.general.delete}
                          variant="danger"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: cmm?.deleteTitle,
                                message: cmm?.deleteConfirm({
                                  name: cm.name || `{${cm.type}}`,
                                }),
                                confirmLabel: m?.general.delete,
                                confirmStyle: 'danger',
                              })
                            ) {
                              dispatch(cachedMapDeleted({ id: cm.type }));
                            }
                          }}
                          showFrom="sm"
                        />
                      </ResponsiveActions>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            <div className="text-muted text-end mt-2">
              {cmm?.total}: {formatSize(totalSize)}
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {/* a real link, so it can be opened or copied like the menu entries
            that address a modal; the click itself is handled here */}
        <Button
          variant="link"
          href={modalMenuItemProps('browse-cache').href}
          onClick={(e) => {
            e.preventDefault();

            dispatch(setActiveModal({ type: 'browse-cache' }));
          }}
        >
          <FaDatabase /> {m?.mapLayers.browseCache}
        </Button>

        <Button
          variant="primary"
          disabled={!online}
          onClick={() => dispatch(cachedMapsSetView('add'))}
        >
          <FaPlus /> {cmm?.addOfflineMap}
        </Button>

        <OfflineBadge />

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </>
  );
}
