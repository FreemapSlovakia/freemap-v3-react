import { mapSetShading } from '@features/map/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { colorReliefMaxElevation } from '../model/colorReliefMaxElevation.js';
import { createDefaultShadingComponent } from '../model/createShadingComponent.js';
import type {
  ShadingComponent,
  ShadingComponentType,
} from '../model/Shading.js';
import {
  type ParameterizedKind,
  ParameterizedShadingModal,
} from './ParameterizedShadingModal.js';
import { ShadingColorPicker } from './ShadingColorPicker.js';
import {
  MANAGEABLE_TYPES,
  ShadingComponentControl,
} from './ShadingComponentControl.js';
import { ShadingComponentList } from './ShadingComponentList.js';
import { ShadingComponentParams } from './ShadingComponentParams.js';
import classes from './ShadingControl.module.css';
import { ShadingToolbar } from './ShadingToolbar.js';

export default function ShadingControl() {
  const shading = useAppSelector((state) => state.map.shading);

  const colorReliefMax = useAppSelector((state) =>
    colorReliefMaxElevation(state.map.layers),
  );

  const dispatch = useDispatch();

  const [id, setId] = useState<number>();

  const selectedComponent = shading.components.find(
    (component) => component.id === id,
  );

  const [modalKind, setModalKind] = useState<ParameterizedKind | null>(null);

  const sc = useScrollClasses('vertical');

  const [card, setCard] = useState<HTMLDivElement | null>(null);

  const rf = useCallback(() => {
    if (!card) {
      return;
    }

    const { top } = card.getBoundingClientRect();

    window.requestAnimationFrame(() => {
      card.style.maxHeight =
        Math.max(window.innerHeight - top - 57, 100) + 'px';
    });
  }, [card]);

  useEffect(() => {
    window.addEventListener('resize', rf);

    return () => {
      window.removeEventListener('resize', rf);
    };
  }, [rf]);

  useEffect(() => {
    sc(card);

    if (!card) {
      return;
    }

    const ro = new ResizeObserver(() => {
      rf();
    });

    ro.observe(card);

    return () => {
      ro.disconnect();
    };
  }, [card, sc, rf]);

  function handleAdd(type0: string | null) {
    window._paq.push(['trackEvent', 'MapShading', 'add', type0 ?? undefined]);

    if (type0 === 'contour' || type0 === 'fog') {
      setModalKind(type0);

      return;
    }

    const newId = Math.random();

    dispatch(
      mapSetShading(
        produce(shading, (draft) => {
          draft.components.push(
            createDefaultShadingComponent(
              type0 as ShadingComponentType,
              newId,
              colorReliefMax,
            ),
          );
        }),
      ),
    );

    setId(newId);
  }

  function handleRemove() {
    dispatch(
      mapSetShading(
        produce(shading, (draft) => {
          draft.components = draft.components.filter(
            (component) => component.id !== id,
          );
        }),
      ),
    );

    setId(undefined);
  }

  function handleAddParameterized(component: ShadingComponent) {
    dispatch(
      mapSetShading(
        produce(shading, (draft) => {
          draft.components.push(component);
        }),
      ),
    );

    setId(component.id);

    setModalKind(null);
  }

  return (
    <>
      <Card body className={`${classes.shadingControl} mt-2 ms-2`}>
        <div className="fm-menu-scroller" ref={setCard}>
          <div />

          <Form
            noValidate
            className="p-2 overflow-hidden"
            onSubmit={(e) => e.preventDefault()}
            style={{ width: 'fit-content' }}
          >
            <ShadingToolbar
              canRemove={id !== undefined}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />

            <ShadingComponentList
              shading={shading}
              selectedId={id}
              onSelect={setId}
            />

            <hr />

            {shading.components.some(
              (component) => MANAGEABLE_TYPES[component.type],
            ) && (
              <ShadingComponentControl
                components={shading.components}
                onChange={(components) =>
                  dispatch(mapSetShading({ ...shading, components }))
                }
                selectedId={id}
                onSelect={setId}
              />
            )}

            {selectedComponent && (
              <ShadingComponentParams
                shading={shading}
                component={selectedComponent}
                onChange={(next) => dispatch(mapSetShading(next))}
              />
            )}

            <ShadingColorPicker
              shading={shading}
              selectedId={id}
              component={selectedComponent}
              colorReliefMax={colorReliefMax}
              onChange={(next) => dispatch(mapSetShading(next))}
            />
          </Form>
        </div>
      </Card>

      <ParameterizedShadingModal
        kind={modalKind}
        colorReliefMax={colorReliefMax}
        onClose={() => setModalKind(null)}
        onAdd={handleAddParameterized}
      />
    </>
  );
}
