import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Tooltip } from 'react-leaflet';

import RichMarker from 'fm3/components/RichMarker';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { Point } from 'leaflet';

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
};

const ElevationChartActivePoint: React.FC<Props> = ({
  elevationChartActivePoint,
  language,
  t,
}) => {
  const nf0 = Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const nf1 = Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    elevationChartActivePoint && (
      <RichMarker
        faIcon="info"
        faIconLeftPadding="2px"
        color="grey"
        interactive={false}
        position={{
          lat: elevationChartActivePoint.lat,
          lng: elevationChartActivePoint.lon,
        }}
      >
        <Tooltip
          className="compact"
          offset={new Point(9, -25)}
          direction="right"
          permanent
        >
          <span>
            → {nf1.format(elevationChartActivePoint.distance / 1000)} km
            {' ▴ '}
            {nf0.format(elevationChartActivePoint.ele)} {t('general.masl')}
            {typeof elevationChartActivePoint.climbUp === 'number' &&
              typeof elevationChartActivePoint.climbDown === 'number' && (
                <>
                  <br />
                  {' ↑ '}
                  {nf0.format(elevationChartActivePoint.climbUp)} m{' ↓ '}
                  {nf0.format(elevationChartActivePoint.climbDown)} m
                </>
              )}
          </span>
        </Tooltip>
      </RichMarker>
    )
  );
};

const mapStateToProps = (state: RootState) => ({
  elevationChartActivePoint: state.elevationChart.activePoint,
  language: state.l10n.language,
});

export default compose(
  withTranslator,
  connect(mapStateToProps),
)(ElevationChartActivePoint);
