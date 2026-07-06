import { setActiveModal } from '@app/store/actions.js';
import { OverlayTrigger, Tooltip, type TooltipProps } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { modalMenuItemProps } from '@/shared/hooks/useMenuHandler.js';

type Props = { help: string; credits: string };

export function CreditsText({ credits, help }: Props) {
  const dispatch = useDispatch();

  const renderTooltip = (props: TooltipProps) => {
    const re = /(.*)\[(.*)\](.*)/.exec(help);

    return (
      <Tooltip id="credits-tooltip" {...props}>
        {re ? (
          <>
            {re[1]}
            <a
              href={modalMenuItemProps('offline-map-export').href}
              onClick={(e) => {
                e.preventDefault();

                dispatch(setActiveModal({ type: 'offline-map-export' }));
              }}
            >
              {re[2]}
            </a>
            {re[3]}
          </>
        ) : (
          help
        )}
      </Tooltip>
    );
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={renderTooltip}
      rootClose
      trigger="click"
    >
      <span
        className="text-decoration-underline text-muted cursor-pointer"
        style={{ cursor: 'help' }}
      >
        {credits}
      </span>
    </OverlayTrigger>
  );
}
