import { setActiveModal } from '@app/store/actions.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
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

export default function ToposcopeMenu(): ReactElement {
  const m = useToposcopeMessages();

  const dispatch = useDispatch();

  const hasCenter = useAppSelector(
    (state) => toposcopeCenterSelector(state) !== undefined,
  );

  return (
    <ToolMenu tool="toposcope">
      <LongPressTooltip label={hasCenter ? m?.moveCenter : m?.addCenter}>
        {({ props }) => (
          <Button
            variant={hasCenter ? 'secondary' : 'primary'}
            onClick={() => dispatch(toposcopeSetPickingCenter(true))}
            {...props}
          >
            {/* The very symbol the point it places will wear. */}
            <IconGlyph poi={CENTER_POI} />
          </Button>
        )}
      </LongPressTooltip>

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
    </ToolMenu>
  );
}
