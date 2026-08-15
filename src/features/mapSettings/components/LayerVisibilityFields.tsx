import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';
import { useMapSettingsMessages } from '../translations/useMapSettingsMessages.js';

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
        id="layer-show-in-menu"
        label={
          <>
            {msm?.showInMenu}
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

      <Form.Check
        id="layer-show-in-toolbar"
        label={
          <>
            {msm?.showInToolbar}
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
    </div>
  );
}
