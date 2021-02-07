import { ExternalTargets, openInExternalApp } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { LatLon } from 'fm3/types/common';
import { ReactElement, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaClipboard,
  FaFacebook,
  FaLink,
  FaShareAlt,
  FaTwitter,
  FaWindowMaximize,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  onSelect?: (where: string) => void;
  showKbdShortcut?: boolean;
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom,
  mapType,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  onSelect,
  showKbdShortcut,
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const handleDropdownItemSelect = useCallback(
    (where: string | null) => {
      if (is<ExternalTargets>(where)) {
        if (onSelect) {
          onSelect(where);
        }

        dispatch(
          openInExternalApp({
            where,
            lat,
            lon,
            zoom,
            mapType,
            includePoint,
            pointTitle,
            pointDescription,
            url,
          }),
        );
      }
    },
    [
      onSelect,
      dispatch,
      lat,
      lon,
      zoom,
      mapType,
      includePoint,
      pointTitle,
      pointDescription,
      url,
    ],
  );

  const hasShare = 'share' in navigator;
  const hasClipboard = navigator.clipboard?.writeText;

  return (
    <>
      {url && (
        <>
          <Dropdown.Item eventKey="window" onSelect={handleDropdownItemSelect}>
            <FaWindowMaximize /> {m?.external.window}
          </Dropdown.Item>
          {hasShare && (
            <Dropdown.Item eventKey="url" onSelect={handleDropdownItemSelect}>
              <FaLink /> {m?.external.url}
            </Dropdown.Item>
          )}
          {(navigator as any).canShare && (
            <Dropdown.Item eventKey="image" onSelect={handleDropdownItemSelect}>
              <FaShareAlt /> {m?.external.image}
            </Dropdown.Item>
          )}
          <Dropdown.Divider />
        </>
      )}
      {!url && hasClipboard && (
        <Dropdown.Item eventKey="copy" onSelect={handleDropdownItemSelect}>
          <FaClipboard /> {m?.general.copyUrl}
          {showKbdShortcut && (
            <>
              {' '}
              <kbd>j</kbd> <kbd>c</kbd>
            </>
          )}
        </Dropdown.Item>
      )}
      {!url && hasShare && (
        <Dropdown.Item eventKey="url" onSelect={handleDropdownItemSelect}>
          <FaLink /> {m?.external.url}
        </Dropdown.Item>
      )}
      {!url && (hasClipboard || hasShare) && <Dropdown.Divider />}
      <Dropdown.Item eventKey="facebook" onSelect={handleDropdownItemSelect}>
        <FaFacebook /> Facebook
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>f</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Item eventKey="twitter" onSelect={handleDropdownItemSelect}>
        <FaTwitter /> Twitter
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>t</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item eventKey="osm.org" onSelect={handleDropdownItemSelect}>
        {m?.external.osm}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>o</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Item eventKey="mapy.cz" onSelect={handleDropdownItemSelect}>
        {m?.external.mapy_cz}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>m</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Item eventKey="google" onSelect={handleDropdownItemSelect}>
        {m?.external.googleMaps}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>g</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Item eventKey="mapillary" onSelect={handleDropdownItemSelect}>
        Mapillary
      </Dropdown.Item>
      <Dropdown.Item
        eventKey="openstreetcam"
        onSelect={handleDropdownItemSelect}
      >
        OpenStreetCam
      </Dropdown.Item>
      <Dropdown.Item eventKey="oma.sk" onSelect={handleDropdownItemSelect}>
        {m?.external.oma} (SK)
      </Dropdown.Item>
      <Dropdown.Item eventKey="hiking.sk" onSelect={handleDropdownItemSelect}>
        {m?.external.hiking_sk} (SK)
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>h</kbd>
          </>
        )}
      </Dropdown.Item>{' '}
      <Dropdown.Item eventKey="zbgis" onSelect={handleDropdownItemSelect}>
        {m?.external.zbgis} (SK)
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>z</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Divider />
      {expertMode && (
        <Dropdown.Item eventKey="josm" onSelect={handleDropdownItemSelect}>
          {m?.external.josm}
          {showKbdShortcut && (
            <>
              {' '}
              <kbd>j</kbd> <kbd>j</kbd>
            </>
          )}
        </Dropdown.Item>
      )}
      <Dropdown.Item eventKey="osm.org/id" onSelect={handleDropdownItemSelect}>
        {m?.external.id}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>i</kbd>
          </>
        )}
      </Dropdown.Item>
    </>
  );
}
