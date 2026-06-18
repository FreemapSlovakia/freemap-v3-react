import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { useMyMapsMessages } from '@features/myMaps/translations/useMyMapsMessages.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { CustomLayerDef } from '@shared/mapDefinitions.js';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Button, ListGroup, Modal } from 'react-bootstrap';
import {
  FaCheck,
  FaEye,
  FaPencilAlt,
  FaPlus,
  FaTimes,
  FaTrash,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { CustomMapForm } from './CustomMapForm.js';
import { LayerVisibilityFields } from './LayerVisibilityFields.js';

type Props = { show: boolean };

type View =
  | { mode: 'list' }
  | { mode: 'add'; draftType: string }
  | { mode: 'edit'; type: string };

function makeType() {
  return Math.random().toString(36).slice(-6);
}

export default function CustomMapsModal({ show }: Props): ReactElement {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const customLayers = useAppSelector((state) => state.map.customLayers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const activeLayers = useAppSelector((state) => state.map.layers);

  const [view, setView] = useState<View>({ mode: 'list' });

  const [draft, setDraft] = useState<CustomLayerDef | undefined>(undefined);

  const [showInMenu, setShowInMenu] = useState(true);

  const [showInToolbar, setShowInToolbar] = useState(false);

  useDocumentTitle(show ? m?.mapLayers.customMaps : undefined);

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
    async (def: CustomLayerDef) => {
      const name = def.name || `{${def.type}}`;

      if (
        !(await confirm({
          title: mm?.deleteTitle,
          message: mm?.deleteConfirm(name),
          confirmLabel: m?.general.delete,
          confirmStyle: 'danger',
        }))
      ) {
        return;
      }

      const next = customLayers.filter((d) => d.type !== def.type);

      window._paq.push(['trackEvent', 'MapSettings', 'delete', 'customMap']);

      dispatch(
        saveSettings({ settings: { customLayers: next }, keepOpen: true }),
      );
    },
    [customLayers, dispatch, m, mm, confirm],
  );

  const handleSave = useCallback(() => {
    if (!draft) {
      return;
    }

    const isEdit = customLayers.some((d) => d.type === draft.type);

    const next = [...customLayers.filter((d) => d.type !== draft.type), draft];

    window._paq.push([
      'trackEvent',
      'MapSettings',
      isEdit ? 'update' : 'create',
      'customMap',
    ]);

    dispatch(
      saveSettings({
        settings: {
          customLayers: next,
          layersSettings: {
            ...layersSettings,
            [draft.type]: {
              ...(layersSettings[draft.type] ?? {}),
              showInMenu,
              showInToolbar,
            },
          },
        },
        keepOpen: true,
        activateLayerType: draft.type,
      }),
    );

    goToList();
  }, [
    customLayers,
    draft,
    dispatch,
    goToList,
    layersSettings,
    showInMenu,
    showInToolbar,
  ]);

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

  useEffect(() => {
    if (view.mode === 'edit') {
      const s = layersSettings[view.type];

      setShowInMenu(s?.showInMenu ?? true);

      setShowInToolbar(s?.showInToolbar ?? false);
    } else if (view.mode === 'add') {
      setShowInMenu(true);

      setShowInToolbar(false);
    }
  }, [view, layersSettings]);

  return (
    <Modal
      scrollable
      show={show}
      onHide={close}
      size={view.mode === 'list' ? 'lg' : undefined}
      contentClassName="bg-body-tertiary"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <MdDashboardCustomize /> {m?.mapLayers.customMaps}
        </Modal.Title>
      </Modal.Header>

      {view.mode === 'list' ? (
        <>
          <Modal.Body>
            {customLayers.length === 0 ? (
              <p className="text-muted mb-0">
                {m?.mapLayers.customMapsEmptyMessage}
              </p>
            ) : (
              <ListGroup>
                {customLayers.map((def) => (
                  <ListGroup.Item
                    key={def.type}
                    className="d-flex flex-wrap align-items-center gap-2"
                  >
                    <div className="flex-grow-1 me-2">
                      <div>{def.name || `{${def.type}}`}</div>

                      <small className="text-muted">
                        <span className="text-nowrap">
                          {m?.mapLayers.technologies[def.technology] ??
                            def.technology}
                        </span>
                        {' · '}
                        <span className="text-nowrap">
                          {m?.mapLayers.layer[def.layer]}
                        </span>
                      </small>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <LongPressTooltip label={m?.mapLayers.activate}>
                        {({ props }) => (
                          <Button
                            size="sm"
                            variant={
                              activeLayers.includes(def.type)
                                ? 'primary'
                                : 'outline-primary'
                            }
                            active={activeLayers.includes(def.type)}
                            onClick={() =>
                              dispatch(mapToggleLayer({ type: def.type }))
                            }
                            {...props}
                          >
                            <FaEye />
                          </Button>
                        )}
                      </LongPressTooltip>

                      <Button
                        size="sm"
                        variant="outline-secondary"
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
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button type="button" variant="primary" onClick={handleAddClick}>
              <FaPlus /> {m?.mapLayers.addCustomMap}
            </Button>

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

            <div className="mt-3">
              <LayerVisibilityFields
                showInMenu={showInMenu}
                showInToolbar={showInToolbar}
                onChange={(v) => {
                  setShowInMenu(v.showInMenu);
                  setShowInToolbar(v.showInToolbar);
                }}
              />
            </div>
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
