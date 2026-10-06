import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  FmDismissButton,
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import type { LabelVisibility } from '@shared/labelVisibility.js';
import {
  type ReactElement,
  type ReactNode,
  type SubmitEvent,
  useCallback,
  useState,
} from 'react';
import { Modal } from 'react-bootstrap';
import { FaCheck, FaPaintBrush } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type DrawingStyle,
  drawingStyleEquals,
} from '../model/reducers/drawingSettingsReducer.js';
import { LabelVisibilityField } from './LabelVisibilityField.js';
import { useDrawingStyleEditor } from './useDrawingStyleEditor.js';

/** An extra footer action (between Save and Reset), e.g. drawing's "Apply to all". */
type ExtraAction = {
  key: string;
  label: ReactNode;
  icon: ReactNode;
  variant?: string;
  /** Receives the edited values; the modal closes afterwards. */
  onClick: (style: DrawingStyle, labelVisibility: LabelVisibility) => void;
};

type Props = {
  show: boolean;
  /** Header title; also the document title when it is a string. */
  title: ReactNode;
  /** Document title, when it must differ from the displayed `title`. */
  documentTitle?: string;
  /** Header icon; defaults to a paintbrush. */
  icon?: ReactNode;
  /** Style the editor seeds from (the current persisted value). */
  current: DrawingStyle;
  /** Style the "Reset to default" button refills the form with. */
  defaults: DrawingStyle;
  currentLabelVisibility: LabelVisibility;
  defaultLabelVisibility: LabelVisibility;
  widthStep?: number;
  /** Receives the edited values on Save; the modal closes afterwards. */
  onSave: (style: DrawingStyle, labelVisibility: LabelVisibility) => void;
  extraActions?: ExtraAction[];
};

/**
 * Shared modal shell for editing a persisted `DrawingStyle` setting (search
 * result style, track-viewer default style, drawing default properties). Owns
 * the editor, the Save/Reset/Cancel footer, and closing; callers supply the
 * title, the current/default styles, and what to dispatch on Save.
 */
export function DrawingStyleSettingsModal({
  show,
  title,
  documentTitle,
  icon = <FaPaintBrush />,
  current,
  defaults,
  currentLabelVisibility,
  defaultLabelVisibility,
  widthStep = 0.1,
  onSave,
  extraActions,
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const editor = useDrawingStyleEditor(current, { widthStep });

  const [labelVisibility, setLabelVisibility] = useState(
    currentLabelVisibility,
  );

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    onSave(editor.style, labelVisibility);

    close();
  };

  useDocumentTitle(
    show
      ? (documentTitle ?? (typeof title === 'string' ? title : undefined))
      : undefined,
  );

  return (
    <Modal
      show={show}
      onHide={close}
      contentClassName="bg-body-tertiary"
      scrollable
      // The color picker's popover is portalled to <body> (outside this modal's
      // DOM), so the modal's focus trap would steal focus from its inputs.
      // Disable enforceFocus so R/G/B/A/HEX (and the sliders) stay editable.
      enforceFocus={false}
    >
      <form onSubmit={handleSubmit} className="d-contents">
        <Modal.Header closeButton>
          <Modal.Title>
            {icon} {title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {editor.element}

          <LabelVisibilityField
            value={labelVisibility}
            onChange={setLabelVisibility}
          />
        </Modal.Body>

        <FmModalFooter>
          <FmFooterButton
            type="submit"
            disabled={
              editor.invalid ||
              (!editor.dirty && labelVisibility === currentLabelVisibility)
            }
            icon={<FaCheck />}
            label={m?.general.save}
          />

          {extraActions?.map((action) => (
            <FmFooterButton
              key={action.key}
              variant={action.variant ?? 'secondary'}
              disabled={editor.invalid}
              onClick={() => {
                action.onClick(editor.style, labelVisibility);

                close();
              }}
              icon={action.icon}
              label={action.label}
            />
          ))}

          <ResetToDefaultsButton
            onClick={() => {
              editor.reset(defaults);

              setLabelVisibility(defaultLabelVisibility);
            }}
            // Enabled while invalid so reset can recover a broken field.
            disabled={
              !editor.invalid &&
              drawingStyleEquals(editor.style, defaults) &&
              labelVisibility === defaultLabelVisibility
            }
          />

          <FmDismissButton label={m?.general.cancel} onClick={close} />
        </FmModalFooter>
      </form>
    </Modal>
  );
}
