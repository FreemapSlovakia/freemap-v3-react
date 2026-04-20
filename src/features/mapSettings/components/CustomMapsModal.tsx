import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { CustomLayerDef } from '@shared/mapDefinitions.js';
import { ReactElement, useCallback, useState } from 'react';
import { Button, ButtonToolbar, Modal, Table } from 'react-bootstrap';
import { FaCheck, FaPencilAlt, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { CustomMapForm } from './CustomMapForm.js';

type Props = { show: boolean };

type View =
  | { mode: 'list' }
  | { mode: 'add'; draftType: string }
  | { mode: 'edit'; type: string };

function makeType() {
  return Math.random().toString(36).slice(-6);
}

export default CustomMapsModal;

export function CustomMapsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const [view, setView] = useState<View>({ mode: 'list' });

  const [draft, setDraft] = useState<CustomLayerDef | undefined>(undefined);

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const goToList = useCallback(() => {
    setDraft(undefined);

    setView({ mode: 'list' });
  }, []);

  const handleAddClick = useCallback(() => {
    setDraft(undefined);

    setView({ mode: 'add', draftType: makeType() });
  }, []);

  const handleEditClick = useCallback((type: string) => {
    setDraft(undefined);

    setView({ mode: 'edit', type });
  }, []);

  const handleDeleteClick = useCallback(
    (def: CustomLayerDef) => {
      const name = def.name || `{${def.type}}`;

      if (!window.confirm(m?.maps.deleteConfirm(name))) {
        return;
      }

      const next = customLayers.filter((d) => d.type !== def.type);

      dispatch(
        saveSettings({ settings: { customLayers: next }, keepOpen: true }),
      );
    },
    [customLayers, dispatch, m],
  );

  const handleSave = useCallback(() => {
    if (!draft) {
      return;
    }

    const next = [...customLayers.filter((d) => d.type !== draft.type), draft];

    dispatch(
      saveSettings({ settings: { customLayers: next }, keepOpen: true }),
    );

    goToList();
  }, [customLayers, draft, dispatch, goToList]);

  const editingValue =
    view.mode === 'edit'
      ? customLayers.find((d) => d.type === view.type)
      : undefined;

  const draftType =
    view.mode === 'add'
      ? view.draftType
      : view.mode === 'edit'
        ? view.type
        : '';

  return (
    <Modal show={show} onHide={close} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <MdDashboardCustomize /> {m?.mapLayers.customMaps}
        </Modal.Title>
      </Modal.Header>

      {view.mode === 'list' ? (
        <>
          <Modal.Body>
            <ButtonToolbar className="justify-content-end mb-2">
              <Button type="button" variant="primary" onClick={handleAddClick}>
                <FaPlus /> {m?.general.add}
              </Button>
            </ButtonToolbar>

            {customLayers.length > 0 && (
              <Table striped bordered responsive>
                <thead>
                  <tr>
                    <th>{m?.general.name}</th>
                    <th>{m?.mapLayers.technology}</th>
                    <th>{m?.mapLayers.layer.layer}</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {customLayers.map((def) => (
                    <tr key={def.type}>
                      <td>{def.name || `{${def.type}}`}</td>
                      <td>
                        {m?.mapLayers.technologies[def.technology] ??
                          def.technology}
                      </td>
                      <td>{m?.mapLayers.layer[def.layer]}</td>
                      <td className="text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="me-1"
                          onClick={() => handleEditClick(def.type)}
                          title={m?.general.modify}
                        >
                          <FaPencilAlt />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDeleteClick(def)}
                          title={m?.general.delete}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="dark" type="button" onClick={close}>
              <FaTimes /> {m?.general.close} <kbd>Esc</kbd>
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Body>
            <CustomMapForm
              key={draftType}
              type={draftType}
              value={editingValue}
              onChange={setDraft}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              type="button"
              onClick={handleSave}
              disabled={!draft}
            >
              <FaCheck /> {m?.general.save}
            </Button>

            <Button variant="dark" type="button" onClick={goToList}>
              <FaTimes /> {m?.general.cancel}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
