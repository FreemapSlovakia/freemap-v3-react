import { setActiveModal } from '@app/store/actions.js';
import { type ActiveModal, encodeActiveModal } from '@app/store/activeModal.js';
import type { RootState } from '@app/store/store.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { inAppLink } from '@shared/inAppLink.js';
import type { ReactElement } from 'react';
import { Anchor, Image, OverlayTrigger, Popover } from 'react-bootstrap';
import { FaGem } from 'react-icons/fa';
import { useDispatch, useStore } from 'react-redux';

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

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  // What is open is read on click: a subscription would re-render every chip.
  const href = `#show=${encodeActiveModal({ type: 'user', id: user.id })}`;

  const link = inAppLink(href, () => {
    const { main, gallery } = store.getState();

    // The photo viewer is not `main.activeModal`, so it is named apart.
    const returnTo: ActiveModal | undefined =
      main.activeModal ??
      (gallery.activeImageId
        ? { type: 'gallery-viewer', id: gallery.activeImageId }
        : undefined);

    dispatch(setActiveModal({ type: 'user', id: user.id, returnTo }));
  });

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
      <Anchor className="fw-bold text-decoration-none" {...link}>
        {user.name}
      </Anchor>
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
