import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import {
  FmDismissButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { elevationCoverage } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaMountain } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  dataViewerResolveElevationPrompt,
  dataViewerSetElevationPrompt,
  type ElevationFillMode,
} from '../model/actions.js';
import { targetsCoverage } from '../model/elevationTargets.js';
import { isTrackLine } from '../trackSelection.js';
import { useDataViewerMessages } from '../translations/useDataViewerMessages.js';

export default function DataViewerElevationPromptModal(): ReactElement | null {
  const m = useMessages();

  const tvm = useDataViewerMessages();

  const dispatch = useDispatch();

  const consumer = useAppSelector((state) => state.trackViewer.elevationPrompt);

  const coverage = useAppSelector((state) => {
    const { trackGeojson, elevationPrompt } = state.trackViewer;

    return elevationPrompt?.type === 'update'
      ? (targetsCoverage(trackGeojson, elevationPrompt.index) ?? 'none')
      : elevationCoverage((trackGeojson?.features ?? []).filter(isTrackLine));
  });

  if (!consumer || !tvm) {
    return null;
  }

  const ef = tvm.elevationFill;

  const close = () => dispatch(dataViewerSetElevationPrompt(null));

  const resolve = (mode: ElevationFillMode) =>
    dispatch(dataViewerResolveElevationPrompt({ mode, consumer }));

  // "Update elevation" is an explicit change request, so offering "leave
  // unchanged" there would just duplicate Cancel.
  const offerKeep = consumer.type !== 'update';

  const offerClear = consumer.type === 'update' && coverage !== 'none';

  const intro =
    coverage === 'none'
      ? ef.introNone
      : coverage === 'partial'
        ? ef.introPartial
        : ef.introFull;

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMountain /> {ef.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{intro}</p>

        {coverage !== 'none' && (
          <>
            <p className="mb-1">{ef.question}</p>

            <ul>
              <li>
                <strong>{ef.overrideAll}</strong> — {ef.overrideAllDesc}
              </li>

              {coverage === 'partial' && (
                <li>
                  <strong>{ef.fillMissing}</strong> — {ef.fillMissingDesc}
                </li>
              )}

              {offerKeep && (
                <li>
                  <strong>{ef.keep}</strong> — {ef.keepDesc}
                </li>
              )}

              {offerClear && (
                <li>
                  <strong>{ef.clear}</strong> — {ef.clearDesc}
                </li>
              )}
            </ul>
          </>
        )}

        <p className="text-body-secondary small mb-0">
          {ef.premiumHiRes((label) => (
            <PremiumGem label={label} onBeforeNavigate={close} />
          ))}
        </p>
      </Modal.Body>

      <FmModalFooter>
        <Button variant="primary" onClick={() => resolve('all')}>
          {coverage === 'none' ? ef.add : ef.overrideAll}
        </Button>

        {coverage === 'partial' && (
          <Button variant="secondary" onClick={() => resolve('missing')}>
            {ef.fillMissing}
          </Button>
        )}

        {coverage !== 'none' && offerKeep && (
          <Button variant="secondary" onClick={() => resolve('keep')}>
            {ef.keep}
          </Button>
        )}

        {offerClear && (
          <Button variant="danger" onClick={() => resolve('clear')}>
            {ef.clear}
          </Button>
        )}

        <FmDismissButton label={m?.general.cancel} onClick={close} />
      </FmModalFooter>
    </Modal>
  );
}
