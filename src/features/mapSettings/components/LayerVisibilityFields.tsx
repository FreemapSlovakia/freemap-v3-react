import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { ShortcutRecorder } from '@shared/components/ShortcutRecorder.js';
import type { Shortcut } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { FaKeyboard, FaRegListAlt } from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { ToolbarIcon } from './ToolbarIcon.js';

/** How a map is reached: decided when it is made, changed in Installed maps. */
export type LayerVisibility = {
  showInMenu: boolean;
  showInToolbar: boolean;
  shortcut: Shortcut | null;
};

type Props = {
  value: LayerVisibility;
  /**
   * They are settings, so a form that can't write them switches them off — and
   * each says why, the connection being the only thing that stops them.
   */
  disabled?: boolean;
  onChange: (next: LayerVisibility) => void;
};

export function LayerVisibilityFields({
  value,
  disabled,
  onChange,
}: Props): ReactElement {
  const msm = useMapSettingsMessages();

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex flex-wrap align-items-center gap-3">
        <Form.Check
          id="layer-show-in-toolbar"
          label={
            <>
              <ToolbarIcon /> {msm?.showInToolbar}
              <OfflineBadge offline={disabled} />
            </>
          }
          disabled={disabled}
          checked={value.showInToolbar}
          onChange={(e) =>
            onChange({ ...value, showInToolbar: e.currentTarget.checked })
          }
        />

        <Form.Check
          id="layer-show-in-menu"
          label={
            <>
              <FaRegListAlt /> {msm?.showInMenu}
              <OfflineBadge offline={disabled} />
            </>
          }
          disabled={disabled}
          checked={value.showInMenu}
          onChange={(e) =>
            onChange({ ...value, showInMenu: e.currentTarget.checked })
          }
        />
      </div>

      {!disabled && (
        // Hidden without a keyboard; `d-flex`'s `!important` would override
        // that on the same element.
        <div className="fm-should-have-keyboard">
          <div className="d-flex align-items-center gap-2">
            <FaKeyboard /> {msm?.keyboardShortcut}
            <ShortcutRecorder
              value={value.shortcut}
              onChange={(shortcut) =>
                onChange({ ...value, shortcut: shortcut ?? null })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
