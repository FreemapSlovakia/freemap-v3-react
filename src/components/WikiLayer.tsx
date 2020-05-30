import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';

import { RootState } from 'fm3/storeCreator';
import { divIcon } from 'leaflet';
import { Popup, Marker } from 'react-leaflet';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';
import { wikiLoadPreview } from 'fm3/actions/wikiActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { withTranslator, Translator } from 'fm3/l10nInjector';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

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

const WikiLayerInt: React.FC<Props> = ({ points, preview, onOpen, t }) => {
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
              onOpen(wikipedia);
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
                <FontAwesomeIcon icon="external-link" />
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
              t('general.loading')
            )}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  points: state.wiki.points,
  preview: state.wiki.preview,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onOpen(wikipedia: string) {
    dispatch(wikiLoadPreview(wikipedia));
  },
});

export const WikiLayer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(WikiLayerInt));
