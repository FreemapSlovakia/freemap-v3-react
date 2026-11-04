import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '@features/homeLocation/model/actions.js';
import { Text } from '@features/l10n/Text.js';
import { PlaceName } from '@features/search/components/PlaceName.js';
import { latLonToString } from '@shared/geoutils.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaHome, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useAuthMessages } from '../../translations/useAuthMessages.js';

/** Saved as soon as it is set: it is picked on the map, not typed. */
export function HomeLocationField(): ReactElement {
  const dispatch = useDispatch();

  const am = useAuthMessages();

  const online = useOnline();

  const home = useAppSelector((state) => state.homeLocation.homeLocation);

  const language = useAppSelector((state) => state.l10n.language);

  return (
    <Form.Group className="mt-3 pt-3 border-top">
      <Form.Label>
        <FaHome /> <Text m={am} k="account.homeLocation" />
      </Form.Label>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className={home ? undefined : 'text-muted'}>
          {home ? (
            latLonToString(home, language)
          ) : (
            <Text m={am} k="account.homeLocationUnset" />
          )}

          <PlaceName position={home} />
        </span>

        <Button
          variant="secondary"
          size="sm"
          className="ms-auto"
          disabled={!online}
          onClick={() => dispatch(setSelectingHomeLocation(true))}
        >
          <FaMapMarkerAlt /> <Text m={am} k="account.setHomeLocation" />
        </Button>

        {home && (
          <Button
            variant="danger"
            size="sm"
            disabled={!online}
            onClick={() => dispatch(saveHomeLocation(null))}
          >
            <FaTimes /> <Text k="general.remove" />
          </Button>
        )}
      </div>
    </Form.Group>
  );
}
