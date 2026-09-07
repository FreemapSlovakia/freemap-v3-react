import { setActiveModal } from '@app/store/actions.js';
import {
  FloatingWindowControls,
  FullscreenButton,
} from '@shared/components/FloatingWindowControls.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { PlacePickerButton } from '@shared/components/PlacePickerButton.js';
import { downloadSvg } from '@shared/downloadSvg.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCog, FaDownload } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { CENTER_POI, toposcopeCenterSelector } from '../centerPoint.js';
import { toposcopeSetPickingCenter } from '../model/actions.js';
import { getToposcopeSvg } from '../toposcopeSvgHolder.js';
import { useToposcopeMessages } from '../translations/useToposcopeMessages.js';

type Props = {
  fullscreen: boolean;
  onToggleFullscreen: () => void;
};

/** Everything the dial is driven by; see `FloatingWindowControls`. */
export function ToposcopeControls({
  fullscreen,
  onToggleFullscreen,
}: Props): ReactElement {
  const m = useToposcopeMessages();

  const dispatch = useDispatch();

  const hasCenter = useAppSelector(
    (state) => toposcopeCenterSelector(state) !== undefined,
  );

  return (
    <FloatingWindowControls fullscreen={fullscreen}>
      <PlacePickerButton
        consumer="toposcope-center"
        variant={hasCenter ? 'secondary' : 'primary'}
        label={hasCenter ? m?.moveCenter : m?.addCenter}
        // The very symbol the point it places will wear.
        icon={<IconGlyph poi={CENTER_POI} />}
        locateLabel={m?.centerAtMyPosition}
        onPick={() => dispatch(toposcopeSetPickingCenter(true))}
      />

      <LongPressTooltip label={m?.settings.title}>
        {({ props }) => (
          <Button
            variant="secondary"
            onClick={() =>
              dispatch(setActiveModal({ type: 'toposcope-settings' }))
            }
            {...props}
          >
            <FaCog />
          </Button>
        )}
      </LongPressTooltip>

      {/* The embed is a cross-origin iframe, where the browser refuses both the
          save picker and a synthesized download. */}
      {!window.fmEmbedded && (
        <LongPressTooltip label={m?.downloadAsSvg}>
          {({ props }) => (
            <Button
              variant="secondary"
              disabled={!hasCenter}
              onClick={() => downloadSvg(getToposcopeSvg(), 'toposcope.svg')}
              {...props}
            >
              <FaDownload />
            </Button>
          )}
        </LongPressTooltip>
      )}

      <span className="ms-auto">
        <FullscreenButton
          fullscreen={fullscreen}
          onToggle={onToggleFullscreen}
        />
      </span>
    </FloatingWindowControls>
  );
}
