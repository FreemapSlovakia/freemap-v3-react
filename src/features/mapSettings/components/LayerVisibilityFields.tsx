import { useMessages } from '@features/l10n/l10nInjector.js';
import type { ReactElement } from 'react';
import { Form } from 'react-bootstrap';

type Props = {
  showInMenu: boolean;
  showInToolbar: boolean;
  onChange: (next: { showInMenu: boolean; showInToolbar: boolean }) => void;
};

export function LayerVisibilityFields({
  showInMenu,
  showInToolbar,
  onChange,
}: Props): ReactElement {
  const m = useMessages();

  return (
    <div className="d-flex flex-wrap gap-3">
      <Form.Check
        id="layer-show-in-menu"
        label={m?.settings.showInMenu}
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
        label={m?.settings.showInToolbar}
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
