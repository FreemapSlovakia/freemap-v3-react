import { wikiLoadPreview } from 'fm3/actions/wikiActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { divIcon } from 'leaflet';
import { ReactElement } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

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

export function WikiLayer(): ReactElement {
  const m = useMessages();

  const points = useSelector((state: RootState) => state.wiki.points);

  const preview = useSelector((state: RootState) => state.wiki.preview);

  const dispatch = useDispatch();

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
          <Popup
            onOpen={() => {
              dispatch(wikiLoadPreview(wikipedia));
            }}
          >
            <h4>
              <a
                href={
                  preview
                    ? `https://${preview.lang}.wikipedia.org/wiki/${preview.langTitle}`
                    : wikipedia.replace(
                        /(.*):(.*)/,
                        'https://$1.wikipedia.org/wiki/$2',
                      )
                }
                target="wikipedia"
              >
                {preview ? preview.title : wikipedia.replace(/.*:/, '')}{' '}
                <FaExternalLinkAlt />
              </a>
            </h4>
            {preview ? (
              <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
                {preview.thumbnail && (
                  <img
                    src={preview.thumbnail.source}
                    width={preview.thumbnail.width}
                    height={preview.thumbnail.height}
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: preview.extract }} />
              </div>
            ) : (
              m?.general.loading
            )}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
