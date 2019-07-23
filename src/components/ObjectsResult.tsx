import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Popup } from 'react-leaflet';

import RichMarker from 'fm3/components/RichMarker';
import { getPoiType } from 'fm3/poiTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
};

const ObjectsResult: React.FC<Props> = ({ objects, t, language }) => {
  return (
    <>
      {objects.map(({ id, lat, lon, tags, typeId }) => {
        const pt = getPoiType(typeId);
        const img = pt ? require(`../images/mapIcons/${pt.icon}.png`) : null;

        const { name, ele } = tags;
        const nf = Intl.NumberFormat(language, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        });

        return (
          <RichMarker
            key={`poi-${id}`}
            position={{ lat, lng: lon }}
            image={img}
          >
            <Popup autoPan={false}>
              <span>
                {pt ? (
                  <>
                    {t(`objects.subcategories.${pt.id}`)}
                    {name && <br />}
                    {name}
                    {ele && <br />}
                    {ele && `${nf.format(parseFloat(ele))} m n. m.`}
                  </>
                ) : (
                  name
                )}
              </span>
            </Popup>
          </RichMarker>
        );
      })}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  objects: state.objects.objects,
  language: state.l10n.language,
});

export default compose(
  withTranslator,
  connect(mapStateToProps),
)(ObjectsResult);
