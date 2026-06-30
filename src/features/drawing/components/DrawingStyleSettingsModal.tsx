import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ResetToDefaultsButton } from '@shared/components/ResetToDefaultsButton.js';
import { ReactElement, ReactNode, SubmitEvent, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaCheck, FaPaintBrush, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { DrawingStyle } from '../model/reducers/drawingSettingsReducer.js';
import { useDrawingStyleEditor } from './useDrawingStyleEditor.js';

/** An extra footer action (between Save and Reset), e.g. drawing's "Apply to all". */
type ExtraAction = {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  variant?: string;
  /** Receives the edited style; the modal closes afterwards. */
  onClick: (style: DrawingStyle) => void;
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
  widthStep?: number;
  /** Receives the edited style on Save; the modal closes afterwards. */
  onSave: (style: DrawingStyle) => void;
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
  widthStep = 0.1,
  onSave,
  extraActions,
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const editor = useDrawingStyleEditor(current, { widthStep });

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    onSave(editor.style);

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

        <Modal.Body>{editor.element}</Modal.Body>

        <Modal.Footer>
          <Button type="submit" disabled={editor.invalid}>
            <FaCheck /> {m?.general.save}
          </Button>

          {extraActions?.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'secondary'}
              disabled={editor.invalid}
              onClick={() => {
                action.onClick(editor.style);

                close();
              }}
            >
              {action.icon} {action.label}
            </Button>
          ))}

          <ResetToDefaultsButton onClick={() => editor.reset(defaults)} />

          <Button variant="dark" onClick={close}>
            <FaTimes /> {m?.general.cancel}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
