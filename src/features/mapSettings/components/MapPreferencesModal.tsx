import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapSetLocalPrefs } from '@features/map/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  ChangeEvent,
  ReactElement,
  SubmitEvent,
  useCallback,
  useState,
} from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default MapPreferencesModal;

export function MapPreferencesModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const initialMaxZoom = useAppSelector((state) => String(state.map.maxZoom));

  const initialResolutionScale = useAppSelector((state) =>
    state.map.resolutionScale === null ? '' : String(state.map.resolutionScale),
  );

  const initialFeatureScale = useAppSelector((state) =>
    String(state.map.featureScale),
  );

  const [maxZoom, setMaxZoom] = useState(initialMaxZoom);

  const [resolutionScale, setResolutionScale] = useState(
    initialResolutionScale,
  );

  const [featureScale, setFeatureScale] = useState(initialFeatureScale);

  const invalidMaxZoom = isInvalidInt(maxZoom, false, 0, 99);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      if (maxZoom !== initialMaxZoom) {
        const maxZoomValue = parseInt(maxZoom, 10);

        dispatch(
          saveSettings({
            settings: {
              maxZoom: isNaN(maxZoomValue) ? 20 : maxZoomValue,
            },
          }),
        );
      }

      if (
        resolutionScale !== initialResolutionScale ||
        featureScale !== initialFeatureScale
      ) {
        dispatch(
          mapSetLocalPrefs({
            resolutionScale:
              resolutionScale === '' ? null : Number(resolutionScale),
            featureScale: Number(featureScale),
          }),
        );
      }

      close();
    },
    [
      close,
      dispatch,
      featureScale,
      initialFeatureScale,
      initialMaxZoom,
      initialResolutionScale,
      maxZoom,
      resolutionScale,
    ],
  );

  const handleMaxZoomChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxZoom(e.currentTarget.value);
    },
    [],
  );

  const handleResolutionScaleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setResolutionScale(e.currentTarget.value);
    },
    [],
  );

  const handleFeatureScaleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFeatureScale(e.currentTarget.value);
    },
    [],
  );

  const dirty =
    maxZoom !== initialMaxZoom ||
    resolutionScale !== initialResolutionScale ||
    featureScale !== initialFeatureScale;

  return (
    <Modal show={show} onHide={close}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCog /> {m?.mapLayers.preferences}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="maxZoom">
            <Form.Label>{m?.mapLayers.maxZoom}</Form.Label>

            <Form.Control
              type="number"
              min={0}
              max={99}
              value={maxZoom}
              isInvalid={invalidMaxZoom}
              onChange={handleMaxZoomChange}
            />
          </Form.Group>

          <Form.Group controlId="resolutionScale" className="mt-3">
            <Form.Label>{m?.mapLayers.resolutionScale}</Form.Label>

            <Form.Select
              value={resolutionScale}
              onChange={handleResolutionScaleChange}
            >
              <option value="">{m?.mapLayers.resolutionScaleAuto}</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
              <option value="3">3×</option>
              <option value="4">4×</option>
            </Form.Select>

            <Form.Text muted>{m?.mapLayers.resolutionScaleHelp}</Form.Text>
          </Form.Group>

          <Form.Group controlId="featureScale" className="mt-3">
            <Form.Label>{m?.mapLayers.featureScale}</Form.Label>

            <Form.Select
              value={featureScale}
              onChange={handleFeatureScaleChange}
            >
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
              <option value="4">4×</option>
            </Form.Select>

            <Form.Text muted>{m?.mapLayers.featureScaleHelp}</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            disabled={!dirty || invalidMaxZoom}
          >
            <FaCheck /> {m?.general.save}
          </Button>

          <Button variant="dark" type="button" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
