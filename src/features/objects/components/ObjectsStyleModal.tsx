import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { LabelVisibilityField } from '@features/drawing/components/LabelVisibilityField.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { MarkerTypeSelect } from '@shared/components/MarkerTypeSelect.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { RgbaColorPicker } from '@shared/components/RgbaColorPicker.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, type SubmitEvent, useState } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { FaCheck, FaPaintBrush } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  objectsSetLabelVisibility,
  objectsSetStyle,
} from '../model/actions.js';
import { objectsSettingsInitialState } from '../model/settingsReducer.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = { show: boolean };

export default function ObjectsStyleModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dm = useDrawingMessages();

  const om = useObjectsMessages();

  const markerType = useAppSelector(
    (state) => state.objectsSettings.selectedIcon,
  );

  const color = useAppSelector((state) => state.objectsSettings.color);

  const labelVisibility = useAppSelector(
    (state) => state.objectsSettings.labelVisibility,
  );

  const [editedMarkerType, setEditedMarkerType] = useState(markerType);

  const [editedColor, setEditedColor] = useState(color);

  const [editedLabelVisibility, setEditedLabelVisibility] =
    useState(labelVisibility);

  const dispatch = useDispatch();

  const close = () => {
    dispatch(setActiveModal(null));
  };

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    dispatch(
      objectsSetStyle({ selectedIcon: editedMarkerType, color: editedColor }),
    );

    dispatch(objectsSetLabelVisibility(editedLabelVisibility));

    close();
  };

  const handleReset = () => {
    setEditedMarkerType(objectsSettingsInitialState.selectedIcon);

    setEditedColor(objectsSettingsInitialState.color);

    setEditedLabelVisibility(objectsSettingsInitialState.labelVisibility);
  };

  const dirty =
    editedMarkerType !== markerType ||
    editedColor !== color ||
    editedLabelVisibility !== labelVisibility;

  useDocumentTitle(show ? om?.style.title : undefined);

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body>; disable enforceFocus
      // so its inputs stay editable (see PredefinedDrawingPropertiesModal).
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaintBrush /> {om?.style.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group controlId="markerType">
            <Form.Label>{om?.markerShape}</Form.Label>

            <MarkerTypeSelect
              asSelect
              value={editedMarkerType}
              onChange={setEditedMarkerType}
            />
          </Form.Group>

          <Form.Group controlId="color" className="mt-3">
            <Form.Label>{dm?.edit.color}</Form.Label>

            <RgbaColorPicker value={editedColor} onChange={setEditedColor} />
          </Form.Group>

          <LabelVisibilityField
            value={editedLabelVisibility}
            onChange={setEditedLabelVisibility}
          />
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={!dirty}
            icon={<FaCheck />}
            label={m?.general.save}
          />

          <ResetToDefaultsButton
            onClick={handleReset}
            disabled={
              editedMarkerType === objectsSettingsInitialState.selectedIcon &&
              editedColor === objectsSettingsInitialState.color &&
              editedLabelVisibility ===
                objectsSettingsInitialState.labelVisibility
            }
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
