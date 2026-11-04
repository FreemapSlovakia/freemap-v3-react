import { requestCompassPermission } from '@features/location/compass.js';
import { mapPickSetPosition } from '@features/mapPick/model/actions.js';
import { useClearMapPickOnLeave } from '@features/mapPick/useClearMapPickOnLeave.js';
import { PickingMenu } from '@shared/components/PickingMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import {
  panoramaLookAt,
  panoramaPick,
  panoramaSetPicking,
} from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

export default function PanoramaPickingMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = usePanoramaMessages();

  const picking = useAppSelector((state) => state.panorama.picking);

  const position = useAppSelector((state) => state.mapPick.position);

  useClearMapPickOnLeave();

  return (
    <PickingMenu
      // A switch between viewpoint and target starts the address search over,
      // as the marker's own key drops the pick.
      key={picking}
      prompt={
        picking === 'target' ? m?.pickTargetPrompt : m?.pickViewpointPrompt
      }
      // Both actions end the picking mode themselves.
      onConfirm={() => {
        if (!position) {
          return;
        }

        if (picking === 'target') {
          dispatch(panoramaLookAt(position));

          return;
        }

        // iOS grants the magnetometer only from a gesture. Not
        // `ensureCompassPermission`: a refusal here mustn't turn off the beam.
        void requestCompassPermission();

        dispatch(panoramaPick(position));
      }}
      confirmDisabled={!position}
      onCancel={() => dispatch(panoramaSetPicking(null))}
      cancelKbd="Esc"
      onPlace={(at) => dispatch(mapPickSetPosition(at))}
    />
  );
}
