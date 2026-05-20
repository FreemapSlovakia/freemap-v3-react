import { useMessages } from '@features/l10n/l10nInjector.js';
import { ReactElement } from 'react';
import { Image, OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
import { FaGem } from 'react-icons/fa';

type Props = {
  user: {
    id: number;
    name: string;
    hasPicture: boolean;
    premium: boolean;
  };
};

export function UserChip({ user }: Props): ReactElement {
  const m = useMessages();

  const src = `${process.env['API_URL']}/auth/users/${user.id}/picture`;

  return (
    <>
      {user.hasPicture && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Popover>
              <Popover.Body className="p-1">
                <Image
                  src={src}
                  rounded
                  style={{
                    width: 128,
                    height: 128,
                    objectFit: 'cover',
                  }}
                />
              </Popover.Body>
            </Popover>
          }
        >
          <Image className="me-1 w-6" src={src} roundedCircle />
        </OverlayTrigger>
      )}
      <b>{user.name}</b>
      {user.premium && (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{m?.premium.premiumUser}</Tooltip>}
        >
          <FaGem className="ms-1 text-info" />
        </OverlayTrigger>
      )}
    </>
  );
}
