import {
  deletePlace,
  startPickingPlace,
} from '@features/homeLocation/model/actions.js';
import { FREE_PLACES, placeLimit } from '@features/homeLocation/places.js';
import { Text } from '@features/l10n/Text.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { PlaceName } from '@features/search/components/PlaceName.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapPin, FaPencilAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useAuthMessages } from '../../translations/useAuthMessages.js';

/** Saved as soon as changed; a lapsed premium keeps and edits its places. */
export function PlacesField(): ReactElement {
  const dispatch = useDispatch();

  const am = useAuthMessages();

  const online = useOnline();

  const places = useAppSelector((state) => state.homeLocation.places);

  const user = useAppSelector((state) => state.auth.user);

  const language = useAppSelector((state) => state.l10n.language);

  const full = places.length >= placeLimit(user);

  return (
    <>
      {places.length === 0 && (
        <p className="text-muted">
          <Text m={am} k="account.noPlaces" />
        </p>
      )}

      {places.map((place) => (
        <div
          key={place.id}
          className="d-flex flex-wrap align-items-center gap-2 mb-2"
        >
          <span>
            <FaMapPin /> <b>{place.name}</b>{' '}
            <small className="text-muted">
              {latLonToString(place, language)}
            </small>
            {/* At most MAX_PLACES lookups, within the geocoder's burst. */}
            <PlaceName position={place} />
          </span>

          <Button
            variant="secondary"
            size="sm"
            className="ms-auto"
            disabled={!online}
            onClick={() => dispatch(startPickingPlace({ id: place.id }))}
          >
            <FaPencilAlt /> <Text k="general.modify" />
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={!online}
            onClick={() => dispatch(deletePlace(place.id))}
          >
            <FaTimes /> <Text k="general.remove" />
          </Button>
        </div>
      ))}

      <div className="d-flex align-items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!online || full}
          onClick={() => dispatch(startPickingPlace({}))}
        >
          <FaPlus /> <Text k="main.addPlace" />
        </Button>

        {!isPremium(user) && places.length >= FREE_PLACES && (
          <PremiumGem hint={am?.account.placesPremium} />
        )}
      </div>
    </>
  );
}
