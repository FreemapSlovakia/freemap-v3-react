import { ReactElement } from 'react';
import { Image, OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  user: { id: number; name: string; hasPicture?: boolean };
};

export function UserChip({ user }: Props): ReactElement {
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
    </>
  );
}
