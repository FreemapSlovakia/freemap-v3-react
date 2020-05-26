import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { RootState } from 'fm3/storeCreator';
import { divIcon } from 'leaflet';
import { Popup, Marker } from 'react-leaflet';

type Props = ReturnType<typeof mapStateToProps>;
// & ReturnType<typeof mapDispatchToProps>;

const icon = divIcon({
  iconSize: [19, 19],
  iconAnchor: [9, 9],
  popupAnchor: [0, -2],
  tooltipAnchor: [0, -2],
  html: `
    <div
      class="fa-icon-inside-leaflet-icon-holder"
      style="background-color: white; border-radius: 9px; padding-top: 2px; border: 1px solid black"
    >
      <i class="fa fa-wikipedia-w" />
    </div>`,
});

const WikiLAyerInt: React.FC<Props> = ({ points }) => {
  // const onSelects = useMemo(() => {
  //   return new Array(points.length).fill(0).map((_, i) => () => {
  //     if (i !== activeIndex) {
  //       onSelect(i);
  //     }
  //   });
  // }, [points.length, onSelect, activeIndex]);

  return (
    <>
      {points.map(({ id, lat, lon, name, wikipedia }) => (
        <Marker
          key={id}
          position={{ lat, lng: lon }}
          icon={icon}
          // onclick={onSelects[i]}
        >
          {name && (
            <Tooltip className="compact" direction="top" permanent>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 200,
                }}
              >
                {name}
              </div>
            </Tooltip>
          )}
          <Popup>
            <a
              href={wikipedia.replace(
                /(.*):(.*)/,
                'https://$1.wikipedia.org/wiki/$2',
              )}
              target="wikipedia"
            >
              {wikipedia.replace(/.*:/, '')}
            </a>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  points: state.map.wikiPoints,
});

// const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({});

export const WikiLayer = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(WikiLAyerInt);
