import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapSetLocalPrefs } from '@features/map/model/actions.js';
import { mapInitialState } from '@features/map/model/reducer.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { isInvalidInt } from '@shared/numberValidator.js';
import {
  ChangeEvent,
  ReactElement,
  SubmitEvent,
  useCallback,
  useState,
} from 'react';
import {
  Button,
  Form,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { FaCheck, FaCog, FaTimes, FaUndo } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

export default function MapPreferencesModal({ show }: Props): ReactElement {
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

  useDocumentTitle(show ? m?.mapLayers.preferences : undefined);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  // Fills the form fields with defaults; the user then applies them with Save
  // (or closes without saving).
  const handleResetDefaults = useCallback(() => {
    setMaxZoom(String(mapInitialState.maxZoom));

    setResolutionScale(
      mapInitialState.resolutionScale === null
        ? ''
        : String(mapInitialState.resolutionScale),
    );

    setFeatureScale(String(mapInitialState.featureScale));
  }, []);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    const settings: Parameters<typeof saveSettings>[0]['settings'] = {};

    if (maxZoom !== initialMaxZoom) {
      const maxZoomValue = parseInt(maxZoom, 10);

      settings.maxZoom = isNaN(maxZoomValue) ? 20 : maxZoomValue;
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

    if (Object.keys(settings).length > 0) {
      // saveSettingsProcessor closes the modal on success;
      // dispatching setActiveModal(null) here would cancel its PATCH.
      dispatch(saveSettings({ settings }));
    } else {
      close();
    }
  };

  const handleMaxZoomChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxZoom(e.currentTarget.value);
    },
    [],
  );

  const dirty =
    maxZoom !== initialMaxZoom ||
    resolutionScale !== initialResolutionScale ||
    featureScale !== initialFeatureScale;

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
    >
      <form onSubmit={handleSubmit} className="d-contents">
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

          <Form.Group className="mt-3">
            <Form.Label className="d-block">
              {m?.mapLayers.resolutionScale}
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="resolutionScale"
              value={resolutionScale}
              onChange={setResolutionScale}
            >
              <ToggleButton id="rs-auto" value="" variant="outline-primary">
                {m?.mapLayers.resolutionScaleAuto}
              </ToggleButton>

              {['1', '2', '3', '4'].map((scale) => (
                <ToggleButton
                  key={scale}
                  id={'rs-' + scale}
                  value={scale}
                  variant="outline-primary"
                >
                  {scale}×
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Form.Text muted className="d-block">
              {m?.mapLayers.resolutionScaleHelp}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label className="d-block">
              {m?.mapLayers.featureScale}
            </Form.Label>

            <ToggleButtonGroup
              type="radio"
              name="featureScale"
              value={featureScale}
              onChange={setFeatureScale}
            >
              {['0.5', '1', '2', '4'].map((scale) => (
                <ToggleButton
                  key={scale}
                  id={'fs-' + scale}
                  value={scale}
                  variant="outline-primary"
                >
                  {scale}×
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Form.Text muted className="d-block">
              {m?.mapLayers.featureScaleHelp}
            </Form.Text>
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

          <Button variant="warning" type="button" onClick={handleResetDefaults}>
            <FaUndo /> {m?.general.resetToDefaults}
          </Button>

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
