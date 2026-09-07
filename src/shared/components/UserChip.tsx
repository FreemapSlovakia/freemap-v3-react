import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import type { ReactElement } from 'react';
import { Image, OverlayTrigger, Popover } from 'react-bootstrap';
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
  const prm = usePremiumMessages();

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
        // The sentence already puts a space after the chip, so the gem reaches
        // over it rather than adding a second. `position-relative` is load
        // bearing: inline content that follows paints over an in-flow box, so
        // without it the reach does nothing.
        <GlyphMarker
          hint={prm?.premiumUser}
          color="info"
          className="me-n1 position-relative"
        >
          <FaGem />
        </GlyphMarker>
      )}
    </>
  );
}
