import { useMessages } from '@features/l10n/l10nInjector.js';
import { COMMENT_EDIT_WINDOW_MS, type Comment } from '@shared/comments.js';
import { HintTooltip } from '@shared/components/HintTooltip.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { LinkedText } from '@shared/components/Markdown.js';
import { useConfirm } from '@shared/components/ModalProvider.js';
import { UserChip } from '@shared/components/UserChip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, type ReactNode, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

type ThreadProps = {
  comments: Comment[] | undefined;
  /** What the comments are on, naming who removed one. */
  ownerKind: 'event' | 'picture';
  /** Who may remove anyone's comment there: the organizer or the uploader. */
  ownerId: number | null;
  /** Whether the user moderates these comments. */
  moderator: boolean;
  disabled?: boolean;
  onEdit: (id: number, comment: string) => void;
  onDelete: (id: number) => void;
};

/** A thread, oldest first, with its author's edit and the delete. */
export function CommentThread({
  comments,
  ownerKind,
  ownerId,
  moderator,
  disabled,
  onEdit,
  onDelete,
}: ThreadProps): ReactElement | null {
  const m = useMessages();

  const userId = useAppSelector((state) => state.auth.user?.id);

  const confirm = useConfirm();

  const [editing, setEditing] = useState<{ id: number; text: string } | null>(
    null,
  );

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!comments) {
    return null;
  }

  if (!comments.length) {
    return (
      <p>
        <i>{m?.comments.none}</i>
      </p>
    );
  }

  return (
    <>
      {comments.map((c) => {
        const time = dateFormat.format(c.createdAt);

        if (c.deletedBy || !c.user) {
          return (
            <p key={c.id} className="small fst-italic text-body-secondary">
              {time} ·{' '}
              <HintTooltip hint={c.deletedAt && dateFormat.format(c.deletedAt)}>
                {c.deletedBy === 'owner'
                  ? m?.comments.removedByOwner[ownerKind]
                  : c.deletedBy === 'moderator'
                    ? m?.comments.removedByModerator
                    : m?.comments.deleted}
              </HintTooltip>
            </p>
          );
        }

        const own = userId !== undefined && c.user.id === userId;

        // TODO the icon outlives the hour while nothing re-renders; the API
        // then refuses the edit with a toast.
        const canEdit =
          own && Date.now() - c.createdAt.getTime() < COMMENT_EDIT_WINDOW_MS;

        const canDelete =
          userId !== undefined && (own || ownerId === userId || moderator);

        return (
          <div key={c.id} className="mb-3">
            <div className="d-flex flex-wrap align-items-center column-gap-2 small">
              {/* One flex item: the chip is an avatar and a name side by side. */}
              <span className="d-inline-flex align-items-center">
                <UserChip user={c.user} />
              </span>

              <span className="text-body-secondary">{time}</span>

              {c.editedAt && (
                <span className="text-body-secondary">
                  (
                  <HintTooltip hint={dateFormat.format(c.editedAt)}>
                    {m?.comments.edited}
                  </HintTooltip>
                  )
                </span>
              )}

              {canEdit && editing?.id !== c.id && (
                <LongPressTooltip label={m?.general.modify}>
                  {({ props }) => (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      disabled={disabled}
                      onClick={() =>
                        setEditing({ id: c.id, text: c.comment ?? '' })
                      }
                      {...props}
                    >
                      <FaEdit />
                    </Button>
                  )}
                </LongPressTooltip>
              )}

              {canDelete && (
                <LongPressTooltip label={m?.general.delete}>
                  {({ props }) => (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 link-danger"
                      disabled={disabled}
                      onClick={async () => {
                        if (
                          await confirm({
                            title: m?.comments.deleteTitle,
                            message: m?.comments.deleteMessage,
                            confirmLabel: m?.general.delete,
                            confirmStyle: 'danger',
                          })
                        ) {
                          onDelete(c.id);
                        }
                      }}
                      {...props}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </LongPressTooltip>
              )}
            </div>

            {editing?.id === c.id ? (
              <CommentComposer
                value={editing.text}
                onChange={(text) => setEditing({ id: c.id, text })}
                onSubmit={() => {
                  if (editing.text.trim() !== c.comment) {
                    onEdit(c.id, editing.text.trim());
                  }

                  // TODO closed before the save lands: a failed edit loses its text.
                  setEditing(null);
                }}
                submitLabel={m?.general.save}
                onCancel={() => setEditing(null)}
                disabled={disabled}
                autoFocus
              />
            ) : (
              <div className="text-break" style={{ whiteSpace: 'pre-wrap' }}>
                <LinkedText text={c.comment ?? ''} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  onCancel?: () => void;
  submitLabel?: ReactNode;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Notes under the field. */
  children?: ReactNode;
};

/** The field a comment is written or edited in; Ctrl+Enter submits it. */
export function CommentComposer({
  value,
  onChange,
  onSubmit,
  onFocus,
  onCancel,
  submitLabel,
  disabled,
  autoFocus,
  children,
}: ComposerProps): ReactElement {
  const m = useMessages();

  const empty = value.trim() === '';

  return (
    <Form
      className="mb-3"
      onSubmit={(e) => {
        e.preventDefault();

        if (!empty) {
          onSubmit();
        }
      }}
    >
      <Form.Control
        as="textarea"
        rows={2}
        placeholder={m?.comments.placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();

            e.currentTarget.form?.requestSubmit();
          } else if (e.key === 'Escape' && onCancel) {
            e.stopPropagation();

            onCancel();
          }
        }}
        maxLength={4096}
        disabled={disabled}
        autoFocus={autoFocus}
      />

      <div className="d-flex justify-content-end gap-2 mt-2">
        {onCancel && (
          <Button variant="dark" size="sm" onClick={onCancel}>
            {m?.general.cancel}
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          type="submit"
          disabled={empty || disabled}
        >
          {submitLabel ?? m?.comments.add}
        </Button>
      </div>

      {children}
    </Form>
  );
}
