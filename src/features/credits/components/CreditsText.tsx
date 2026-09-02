import { useModalLink } from '@shared/components/ShowModalLink.js';
import { OverlayTrigger, Tooltip, type TooltipProps } from 'react-bootstrap';

type Props = { help: string; credits: string };

export function CreditsText({ credits, help }: Props) {
  const modalLink = useModalLink();

  const renderTooltip = (props: TooltipProps) => {
    const re = /(.*)\[(.*)\](.*)/.exec(help);

    return (
      <Tooltip id="credits-tooltip" {...props}>
        {re ? (
          <>
            {re[1]}
            <a {...modalLink({ type: 'offline-map-export' })}>{re[2]}</a>
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
