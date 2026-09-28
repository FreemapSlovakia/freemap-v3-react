import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { FaRegListAlt } from 'react-icons/fa';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';
import { ToolbarIcon } from './ToolbarIcon.js';

type Props = {
  showInMenu: boolean;
  showInToolbar: boolean;
  /**
   * Both are settings, so a form that can't write them switches them off — and
   * each says why, the connection being the only thing that stops them.
   */
  disabled?: boolean;
  onChange: (next: { showInMenu: boolean; showInToolbar: boolean }) => void;
};

export function LayerVisibilityFields({
  showInMenu,
  showInToolbar,
  disabled,
  onChange,
}: Props): ReactElement {
  const msm = useMapSettingsMessages();

  return (
    <div className="d-flex flex-wrap gap-3">
      <Form.Check
        id="layer-show-in-toolbar"
        label={
          <>
            <ToolbarIcon /> {msm?.showInToolbar}
            <OfflineBadge offline={disabled} />
          </>
        }
        disabled={disabled}
        checked={showInToolbar}
        onChange={(e) =>
          onChange({
            showInMenu,
            showInToolbar: e.currentTarget.checked,
          })
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
        checked={showInMenu}
        onChange={(e) =>
          onChange({
            showInMenu: e.currentTarget.checked,
            showInToolbar,
          })
        }
      />
    </div>
  );
}
