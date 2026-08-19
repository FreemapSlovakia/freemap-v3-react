import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import { type ReactElement, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { FaCheck, FaDatabase, FaTimes, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { TileServeMode } from '../browseCache.js';
import { browseCacheCleared, cachedMapsSetSettings } from '../model/actions.js';
import { useCachedMapsMessages } from '../translations/useCachedMapsMessages.js';

const MODE_KEYS = {
  'network-only': 'networkOnly',
  'network-first': 'networkFirst',
  'cache-first': 'cacheFirst',
  'cache-only': 'cacheOnly',
} as const;

const MODES = Object.keys(MODE_KEYS) as TileServeMode[];

// 0 keeps tiles until the size cap evicts them
const MAX_AGE_DAYS = [7, 30, 90, 365, 0];

// 0 lets the cache grow until the browser's own quota stops it
const MAX_SIZE_MB = [100, 250, 500, 1024, 2048, 0];

export function BrowseCacheSettings(): ReactElement {
  const m = useMessages();

  const cmm = useCachedMapsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const settings = useAppSelector((state) => state.cachedMapsSettings);

  const stats = useAppSelector((state) => state.cachedMaps.browseStats);

  const [draft, setDraft] = useState(settings);

  const nf = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <form
      className="d-contents"
      onSubmit={(e) => {
        e.preventDefault();

        dispatch(cachedMapsSetSettings(draft));

        dispatch(setActiveModal(null));
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaDatabase /> {m?.mapLayers.browseCache}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted">{cmm?.browse.intro}</p>

        <Form.Group controlId="browseMode" className="mb-3">
          <Form.Label>{cmm?.browse.mode}</Form.Label>

          <Form.Select
            value={draft.mode}
            onChange={(e) => {
              const mode = e.currentTarget.value as TileServeMode;

              // Saving follows the mode: a cache the user has just asked to
              // serve from that never fills is a trap, and one still filling
              // under "Internet only" is a surprise. The checkbox overrides it
              // either way.
              setDraft((draft) => ({
                ...draft,
                mode,
                store: mode !== 'network-only',
              }));
            }}
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {cmm?.browse.modes[MODE_KEYS[mode]]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            id="browseStore"
            type="checkbox"
            checked={draft.store}
            // nothing is fetched in this mode, so there is nothing to save
            disabled={draft.mode === 'cache-only'}
            label={cmm?.browse.store}
            onChange={(e) => {
              const store = e.currentTarget.checked;

              setDraft((draft) => ({ ...draft, store }));
            }}
          />
        </Form.Group>

        <Row>
          <Col xs={12} sm={6}>
            <Form.Group controlId="browseMaxAge" className="mb-3">
              <Form.Label>{cmm?.browse.maxAge}</Form.Label>

              <Form.Select
                value={draft.maxAgeDays}
                onChange={(e) => {
                  const maxAgeDays = Number(e.currentTarget.value);

                  setDraft((draft) => ({ ...draft, maxAgeDays }));
                }}
              >
                {MAX_AGE_DAYS.map((days) => (
                  <option key={days} value={days}>
                    {days === 0
                      ? cmm?.browse.keepForever
                      : cmm?.browse.days({ days: nf.format(days) })}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} sm={6}>
            <Form.Group controlId="browseMaxSize" className="mb-3">
              <Form.Label>{cmm?.browse.maxSize}</Form.Label>

              <Form.Select
                value={draft.maxSizeMb}
                onChange={(e) => {
                  const maxSizeMb = Number(e.currentTarget.value);

                  setDraft((draft) => ({ ...draft, maxSizeMb }));
                }}
              >
                {MAX_SIZE_MB.map((mb) => (
                  <option key={mb} value={mb}>
                    {mb === 0
                      ? cmm?.browse.noSizeLimit
                      : mb < 1024
                        ? `${mb} MB`
                        : `${mb / 1024} GB`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Text>{cmm?.browse.retentionHint}</Form.Text>
      </Modal.Body>

      <Modal.Footer className="flex-wrap">
        <div className="w-100 text-end">
          {cmm?.browse.cached({
            tiles: nf.format(stats?.tiles ?? 0),
            size: formatSize(stats?.bytes ?? 0),
          })}
        </div>

        <Button variant="primary" type="submit">
          <FaCheck /> {m?.general.save} <kbd>Enter</kbd>
        </Button>

        <Button
          variant="danger"
          disabled={!stats?.tiles}
          onClick={async () => {
            if (
              await confirm({
                title: cmm?.browse.clear,
                message: cmm?.browse.clearConfirm,
                confirmLabel: cmm?.browse.clear,
                confirmStyle: 'danger',
              })
            ) {
              dispatch(browseCacheCleared());
            }
          }}
        >
          <FaTrash /> {cmm?.browse.clear}
        </Button>

        <Button variant="dark" onClick={() => dispatch(setActiveModal(null))}>
          <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </form>
  );
}
