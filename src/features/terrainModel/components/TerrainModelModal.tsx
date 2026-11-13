import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { MapAreaToggle } from '@features/mapArea/components/MapAreaToggle.js';
import { useMapAreaSelection } from '@features/mapArea/useMapAreaSelection.js';
import {
  type ExportCredits,
  resolveExportCredits,
} from '@features/mapToDocumentExport/model/exportCredits.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium, premiumTileAuth } from '@features/premium/premium.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { LabeledSlider } from '@shared/components/LabeledSlider.js';
import { Modal } from '@shared/components/Modal.js';
import { OfflineAlert } from '@shared/components/OfflineAlert.js';
import { formatSize } from '@shared/formatSize.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import parametricShading from '@shared/mapLibrary/defs/parametricShading.js';
import { nearestStep } from '@shared/mathUtils.js';
import { saveBlob } from '@shared/saveBlob.js';
import { loadTerrainLicenses } from '@shared/tileLicenses.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaCube, FaDownload } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';
import { terrainModelSetSettings } from '../model/actions.js';
import { NoElevationDataError } from '../model/errors.js';
import {
  type GenerateProgress,
  generateTerrainModel,
} from '../model/generate.js';
import {
  FREE_MAX_SAMPLES,
  fittingWidth,
  MAX_TILES,
  MAX_ZOOM,
  MIN_WIDTH_MM,
  normalizeBbox,
  PREMIUM_MAX_SAMPLES,
  planModel,
  SIMPLIFY_MAX_SAMPLES,
  tilePixelM,
} from '../model/plan.js';
import { LIMITS, MAX_DEVIATION_STOPS } from '../model/settingsReducer.js';
import { tileCount } from '../model/tileGrid.js';
import { useTerrainModelMessages } from '../translations/useTerrainModelMessages.js';

/** The finest elevation tile zoom served without premium. */
const FREE_ZOOM = (parametricShading.premiumFromZoom ?? 16) - 1;

type Props = { show: boolean };

type Result = {
  heightMm: number;
  triangles: number;
  bytes: number;
  /** Share of the grid without elevation data. */
  nodata: number;
  /** Arrives after the model; see `resolveExportCredits`. */
  credits?: ExportCredits;
  /** Data spacing read instead, where premium tiles were refused. */
  refusedAtM?: number;
};

type NumberFieldProps = {
  id: string;
  label?: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Shown empty and not editable. */
  disabled?: boolean;
  onChange: (value: number) => void;
};

/**
 * Millimetres, kept as typed until valid. Only a value changed from outside
 * replaces the text; never remount it, or typing loses focus.
 */
function MmField({
  id,
  label,
  value,
  min,
  max,
  step,
  disabled,
  onChange,
}: NumberFieldProps): ReactElement {
  const [text, setText] = useState(String(value));

  const [shown, setShown] = useState(value);

  if (value !== shown) {
    setShown(value);

    if (Number(text) !== value) {
      setText(String(value));
    }
  }

  const n = text.trim() ? Number(text) : Number.NaN;

  const invalid = !(n >= min && n <= max);

  return (
    <Form.Group className="mb-3">
      {label && <Form.Label htmlFor={id}>{label}</Form.Label>}

      <InputGroup>
        <Form.Control
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          isInvalid={!disabled && invalid}
          value={disabled ? '' : text}
          onChange={(e) => {
            const t = e.currentTarget.value;

            setText(t);

            const v = Number(t);

            if (t.trim() && v >= min && v <= max) {
              onChange(v);
            }
          }}
        />

        <InputGroup.Text>mm</InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );
}

type Bed = [number, number, number];

const { min: BED_MIN, max: BED_MAX } = LIMITS.bed;

function BedField({
  label,
  value,
  onChange,
}: {
  label?: ReactNode;
  value: Bed;
  onChange: (value: Bed) => void;
}): ReactElement {
  const [texts, setTexts] = useState(() => value.map(String));

  return (
    <Form.Group className="mb-3">
      <Form.Label htmlFor="fm-terrain-model-bed-0">{label}</Form.Label>

      <InputGroup>
        {([0, 1, 2] as const).map((i) => {
          const n = texts[i]?.trim() ? Number(texts[i]) : Number.NaN;

          return (
            <Form.Control
              key={i}
              id={`fm-terrain-model-bed-${i}`}
              type="number"
              min={BED_MIN}
              max={BED_MAX}
              step={1}
              isInvalid={!(n >= BED_MIN && n <= BED_MAX)}
              value={texts[i]}
              onChange={(e) => {
                const t = e.currentTarget.value;

                setTexts((ts) => ts.with(i, t));

                const v = Number(t);

                if (t.trim() && v >= BED_MIN && v <= BED_MAX) {
                  onChange(value.with(i, v) as Bed);
                }
              }}
            />
          );
        })}

        <InputGroup.Text>mm</InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );
}

export default function TerrainModelModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tm = useTerrainModelMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const settings = useAppSelector((state) => state.terrainModelSettings);

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  const {
    area,
    setArea,
    selecting,
    bbox: areaBbox,
    startSelecting,
  } = useMapAreaSelection();

  const bbox = areaBbox && normalizeBbox(areaBbox);

  const acrossAntimeridian = areaBbox !== undefined && bbox === null;

  // `null` follows the area: as wide as fits the bed.
  const [width, setWidth] = useState<number | null>(null);

  // A new area or bed takes the width back from what was typed.
  const fitKey = `${bbox?.join()}|${settings.bed[0]}|${settings.bed[1]}`;

  const [widthFitKey, setWidthFitKey] = useState(fitKey);

  if (fitKey !== widthFitKey) {
    setWidthFitKey(fitKey);

    setWidth(null);
  }

  const [progress, setProgress] = useState<GenerateProgress | null>(null);

  const busy = progress !== null;

  const cancelRef = useRef<(() => void) | null>(null);

  // Closing the modal any other way unmounts it; the worker must not outlive it.
  useEffect(() => () => cancelRef.current?.(), []);

  // Hidden by Back, a chord or another modal, it stays mounted a moment longer.
  useEffect(() => {
    if (!show) {
      cancelRef.current?.();
    }
  }, [show]);

  const [result, setResult] = useState<Result | null>(null);

  const [error, setError] = useState<string | null>(null);

  const nf0 = useNumberFormat({ maximumFractionDigits: 0 });

  const nf1 = useNumberFormat({ maximumFractionDigits: 1 });

  const nf2 = useNumberFormat({ maximumFractionDigits: 2 });

  const nf3 = useNumberFormat({ maximumFractionDigits: 3 });

  // 1 : 91 900 and 1 : 19.6 alike.
  const nfScale = useNumberFormat({ maximumSignificantDigits: 3 });

  const nfPercent = useNumberFormat({
    style: 'percent',
    maximumFractionDigits: 0,
  });

  const { bed, layerHeight, exaggeration, base, maxDeviation } = settings;

  const deviationStop = nearestStep(MAX_DEVIATION_STOPS, maxDeviation);

  const widthMm = width ?? (bbox ? fittingWidth(bbox, bed) : 0);

  const plan =
    bbox && widthMm > 0
      ? planModel(
          bbox,
          widthMm,
          premium ? MAX_ZOOM : FREE_ZOOM,
          premium ? PREMIUM_MAX_SAMPLES : FREE_MAX_SAMPLES,
        )
      : undefined;

  const tooLarge =
    plan !== undefined &&
    (plan.widthMm > bed[0] + 0.5 || plan.depthMm > bed[1] + 0.5);

  // terrain-tiles has nothing coarser than z8, so a continent would be read
  // from thousands of tiles.
  const areaTooLarge =
    plan !== undefined &&
    bbox !== null &&
    bbox !== undefined &&
    tileCount(bbox, plan.cols, plan.rows, plan.zoom) > MAX_TILES;

  // The same model under premium's limits, for a free account — offered only
  // where it would come out noticeably finer and could still be downloaded.
  const premiumCandidate =
    !premium && plan && bbox && plan.limitedBy !== 'floor' && !areaTooLarge
      ? planModel(bbox, widthMm, MAX_ZOOM, PREMIUM_MAX_SAMPLES)
      : undefined;

  const premiumPlan =
    premiumCandidate &&
    plan &&
    bbox &&
    premiumCandidate.stepMm < plan.stepMm * 0.9 &&
    tileCount(
      bbox,
      premiumCandidate.cols,
      premiumCandidate.rows,
      premiumCandidate.zoom,
    ) <= MAX_TILES
      ? premiumCandidate
      : undefined;

  const canSimplify =
    plan !== undefined && plan.cols * plan.rows <= SIMPLIFY_MAX_SAMPLES;

  const set = (values: Parameters<typeof terrainModelSetSettings>[0]) => {
    setResult(null);

    dispatch(terrainModelSetSettings(values));
  };

  const close = () => {
    cancelRef.current?.();

    dispatch(setActiveModal(null));
  };

  const handleDownload = async () => {
    if (!plan || !bbox) {
      return;
    }

    setError(null);

    setResult(null);

    trackMatomo(['trackEvent', 'TerrainModel', 'stl']);

    const auth = premiumTileAuth(
      parametricShading.url,
      parametricShading.premiumFromZoom,
      store.getState().auth.user,
    );

    // Cancel and Close must also stop what follows the worker: the save dialog.
    let cancelled = false;

    setProgress({ type: 'progress', phase: 'tiles', done: 0, total: 0 });

    try {
      const run = generateTerrainModel(
        {
          bbox,
          zoom: plan.zoom,
          url: parametricShading.url,
          token: auth && plan.zoom >= auth.fromZoom ? auth.token : undefined,
          freeZoom: FREE_ZOOM,
          cols: plan.cols,
          rows: plan.rows,
          widthMm: plan.widthMm,
          depthMm: plan.depthMm,
          mmPerM: plan.mmPerM,
          exaggeration,
          baseMm: base,
          toleranceMm: canSimplify ? maxDeviation : 0,
        },
        setProgress,
      );

      cancelRef.current = () => {
        cancelled = true;

        run.cancel();
      };

      const out = await run.promise;

      setProgress(null);

      setResult({
        heightMm: out.heightMm,
        triangles: out.triangles,
        bytes: out.stl.byteLength,
        nodata: out.nodata,
        refusedAtM:
          out.zoom < plan.zoom ? tilePixelM(out.zoom, bbox) : undefined,
      });

      // The model is in hand; its credits follow without holding up the save.
      // A dictionary that fails to load leaves the codes named as they stand.
      resolveExportCredits(out.attributions.join(','), () =>
        loadTerrainLicenses().catch(() => null),
      ).then((credits) => {
        if (!cancelled) {
          setResult((r) => r && { ...r, credits });
        }
      });

      if (!cancelled) {
        await saveBlob(
          new Blob([out.stl], { type: 'model/stl' }),
          'terrain.stl',
          { 'model/stl': ['.stl'] },
        );
      }
    } catch (err) {
      if (err instanceof NoElevationDataError) {
        setError(tm?.noData ?? err.message);
      } else if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError(tm?.error({ err: String(err) }) ?? String(err));
      }
    } finally {
      cancelRef.current = null;

      setProgress(null);
    }
  };

  useDocumentTitle(show ? m?.mainMenu.terrainModel : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      className={selecting ? 'd-none' : undefined}
      backdropClassName={selecting ? 'd-none' : undefined}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCube /> <Text k="mainMenu.terrainModel" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <OfflineAlert />

        <fieldset disabled={busy}>
          <Form.Group className="mb-3">
            <Form.Label className="d-block">
              <Text m={tm} k="area" />
            </Form.Label>

            <MapAreaToggle
              area={area}
              onSelectVisible={() => {
                setResult(null);

                setArea('visible');
              }}
              onSelectArea={() => {
                setResult(null);

                startSelecting();
              }}
            />
          </Form.Group>

          <MmField
            id="fm-terrain-model-width"
            label={tm?.width}
            value={widthMm}
            // No area yet: nothing to fit, so nothing to show.
            disabled={!bbox}
            min={MIN_WIDTH_MM}
            max={2000}
            step={1}
            onChange={(v) => {
              setResult(null);

              setWidth(v);
            }}
          />

          {plan && tm && (
            <p className="small">
              {tm.size({
                scale: nfScale.format(1000 / plan.mmPerM),
                width: nf0.format(plan.widthMm),
                depth: nf0.format(plan.depthMm),
              })}
              <br />
              {tm.grid({
                step: nf2.format(plan.stepMm),
                cols: nf0.format(plan.cols),
                rows: nf0.format(plan.rows),
              })}
              <br />
              {tm.elevation({
                m: nf1.format(tilePixelM(plan.zoom, bbox!)),
              })}
              {/* Not mid-run: following the offer would cancel it. */}
              {premiumPlan && !busy ? (
                <>
                  <br />
                  {tm.premiumFiner(
                    (label) => (
                      <PremiumGem label={label} onBeforeNavigate={close} />
                    ),
                    {
                      step: nf2.format(plan.stepMm),
                      data: nf1.format(tilePixelM(plan.zoom, bbox!)),
                      premiumStep: nf2.format(premiumPlan.stepMm),
                      premiumData: nf1.format(
                        tilePixelM(premiumPlan.zoom, bbox!),
                      ),
                    },
                  )}
                </>
              ) : (
                // "No finer" is true only at premium's zoom; a free account
                // capped below it has finer data it could buy.
                (plan.limitedBy === 'samples' ||
                  (plan.limitedBy === 'zoom' && premium)) && (
                  <>
                    <br />
                    {plan.limitedBy === 'samples'
                      ? tm.limitedBySamples
                      : tm.limitedByData}
                  </>
                )
              )}
            </p>
          )}

          {tooLarge && (
            <Alert variant="warning">
              <Text m={tm} k="tooLarge" />
            </Alert>
          )}

          {areaTooLarge && (
            <Alert variant="warning">
              <Text m={tm} k="areaTooLarge" />
            </Alert>
          )}

          {acrossAntimeridian && (
            <Alert variant="warning">
              <Text m={tm} k="acrossAntimeridian" />
            </Alert>
          )}

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-terrain-model-exaggeration"
              label={tm?.exaggeration}
              valueLabel={`${nf1.format(exaggeration)}×`}
              min={LIMITS.exaggeration.min}
              max={LIMITS.exaggeration.max}
              step={0.1}
              value={exaggeration}
              onChange={(v) => set({ exaggeration: v })}
            />
          </Form.Group>

          <MmField
            id="fm-terrain-model-base"
            label={tm?.base}
            value={base}
            min={LIMITS.base.min}
            max={LIMITS.base.max}
            step={0.5}
            onChange={(v) => set({ base: v })}
          />

          <Form.Group className="mb-3">
            <LabeledSlider
              id="fm-terrain-model-simplification"
              label={tm?.simplification}
              valueLabel={
                maxDeviation === 0
                  ? tm?.simplificationOff
                  : `${nf3.format(maxDeviation)} mm`
              }
              hint={tm?.simplificationHint}
              min={0}
              max={MAX_DEVIATION_STOPS.length - 1}
              step={1}
              value={deviationStop}
              onChange={(i) =>
                set({ maxDeviation: MAX_DEVIATION_STOPS[i] ?? 0 })
              }
            />

            {maxDeviation > 0 && plan && !canSimplify && (
              <Form.Text>
                <Text m={tm} k="simplificationTooLarge" />
              </Form.Text>
            )}
          </Form.Group>

          <fieldset>
            <legend className="fs-6 fw-bold">
              <Text m={tm} k="printer" />
            </legend>

            <BedField
              label={tm?.bed}
              value={bed}
              onChange={(v) => set({ bed: v })}
            />

            <MmField
              id="fm-terrain-model-layer"
              label={tm?.layerHeight}
              value={layerHeight}
              min={LIMITS.layerHeight.min}
              max={LIMITS.layerHeight.max}
              step={0.02}
              onChange={(v) => set({ layerHeight: v })}
            />
          </fieldset>
        </fieldset>

        {progress && tm && (
          <p className="small">
            {progress.phase === 'mesh'
              ? tm.progressMesh
              : tm.progressTiles({
                  done: nf0.format(progress.done),
                  total: nf0.format(progress.total),
                })}
          </p>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {result && tm && (
          <>
            <Alert variant="success">
              {tm.result({
                height: nf1.format(result.heightMm),
                layers: nf0.format(result.heightMm / layerHeight),
                triangles: nf0.format(result.triangles),
                size: formatSize(result.bytes),
              })}
            </Alert>

            {result.heightMm > bed[2] && (
              <Alert variant="warning">{tm.tooTall}</Alert>
            )}

            {result.refusedAtM !== undefined && (
              <Alert variant="warning">
                {tm.premiumRefused({ m: nf1.format(result.refusedAtM) })}
              </Alert>
            )}

            {result.nodata > 0 && (
              <Alert variant="warning">
                {tm.partialData({
                  percent: nfPercent.format(Math.max(0.01, result.nodata)),
                })}
              </Alert>
            )}

            {result.credits &&
              (result.credits.datasets.length > 0 ||
                result.credits.unresolved.length > 0) && (
                <p className="small mb-0">
                  {tm.credits}:{' '}
                  {[
                    ...result.credits.datasets.map((credit) =>
                      credit.url ? (
                        <a
                          key={credit.name}
                          href={credit.url}
                          target="_blank"
                          rel="noopener"
                        >
                          {credit.name}
                        </a>
                      ) : (
                        <span key={credit.name}>{credit.name}</span>
                      ),
                    ),
                    // Named as they stand rather than dropped.
                    ...result.credits.unresolved.map((code) => (
                      <span key={code}>{code}</span>
                    )),
                  ].flatMap((node, i) => (i > 0 ? [', ', node] : [node]))}
                </p>
              )}
          </>
        )}
      </Modal.Body>

      <FmModalFooter>
        <FmFooterButton
          variant="primary"
          disabled={!plan || areaTooLarge || busy}
          onClick={handleDownload}
          icon={busy ? <Spinner size="sm" /> : <FaDownload />}
          label={tm?.download}
        />

        {busy ? (
          <FmDismissButton
            label={m?.general.cancel}
            onClick={() => cancelRef.current?.()}
          />
        ) : (
          <FmDismissButton label={m?.general.close} onClick={close} />
        )}
      </FmModalFooter>
    </Modal>
  );
}
