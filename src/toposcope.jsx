import React, { PropTypes } from 'react';
import { readMessages, languages } from './i18n.js';
import { formatGpsCoord, distance, bearing, toRad } from './geoutils.js';

export default function Toposcope({
    pois = [], innerCircleRadius = 25, outerCircleRadius = 90,
    inscriptions = [], language = 'en', fontSize = 3.5,
    preventUpturnedText = false, onClick = () => {}, activePoiId = null
  }) {

  const messages = readMessages(language);

  const t = key => messages[key] || key;
  const observerPoi = pois.find(({ observer }) => observer);

  if (!observerPoi) {
    throw new Error('no observer found');
  }

  const poisAround = pois.filter(poi => poi !== observerPoi).map(poi => Object.assign({}, poi));
  const nf = typeof Intl !== 'undefined' ? new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;

  function formatDistance(d) {
    return nf ? nf.format(d / 1000) : (Math.round(d / 100) / 10);
  }

  const innerTexts = observerPoi.text
    .replace('{lat}', (observerPoi.lat > 0 ? 'N' : 'S') + ' ' + formatGpsCoord(Math.abs(observerPoi.lat)))
    .replace('{lon}', (observerPoi.lng < 0 ? 'W' : 'E') + ' ' + formatGpsCoord(Math.abs(observerPoi.lng)))
    .split('\n').map(line => line.trim()).filter(line => line);

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">
      <style>{`
        .line {
          stroke: #000000;
          stroke-width: 0.3;
          stroke-linecap: round;
          fill: none;
        }

        .lineText {
          font-family: Arial;
          font-size: ${fontSize}px;
        }
      `}</style>

      <path id="outerCircle" d="M 99,0 A 99,99 0 0 1 0,99 99,99 0 0 1 -99,0 99,99 0 0 1 0,-99 99,99 0 0 1 99,0 Z" className="line"/>

      {inscriptions.map((inscription, i) =>
        <text dy="6.0" className="lineText" key={i}>
          <textPath xlinkHref="#outerCircle" startOffset={i * 25 + 12.5 + '%'} textAnchor="middle">{inscription.replace('{a}', t('osmAttribution'))}</textPath>
        </text>
      )}

      {[ t('east'), t('south'), t('west'), t('north') ].map((x, i) =>
        <text key={i} dy="6" className="lineText">
          <textPath xlinkHref="#outerCircle" startOffset={`${i * 25}%`} textAnchor="middle">{x}</textPath>
        </text>
      )}

      {poisAround.map(poi => {
        const { id, lat, lng } = poi;
        const b = Math.PI + bearing(toRad(observerPoi.lat), toRad(observerPoi.lng), toRad(lat), toRad(lng));
        let p1 = `${Math.sin(b) * innerCircleRadius} ${Math.cos(b) * innerCircleRadius}`;
        let p2 = `${Math.sin(b) * outerCircleRadius} ${Math.cos(b) * outerCircleRadius}`;
        if (preventUpturnedText ? !(b > 2 * Math.PI) : poi.flipText) {
          [ p1, p2 ] = [ p2, p1 ];
          poi.reversed = true;
        }
        return <path id={`p${id}`} key={id} d={`M ${p1} L ${p2}`}
          className={`line clickable ${id === activePoiId ? 'poi-active-line' : ''}`}
          onClick={onClick.bind(null, id)}/>;
      })}

      {
        poisAround.map(({ id, lat, lng, text, reversed }) => {
          const lines = text.replace('{d}', formatDistance(distance(toRad(lat), toRad(lng), toRad(observerPoi.lat), toRad(observerPoi.lng)))).split('\n');
          const clickHandler = onClick.bind(null, id);
          const className = `lineText clickable ${id === activePoiId ? 'poi-active-text' : ''}`;
          return [
            <text key={'x' + id} className={className} onClick={clickHandler}>
              <textPath xlinkHref={`#p${id}`} startOffset={reversed ? '0%' : '100%'} textAnchor={reversed ? 'start' : 'end'}>
                <tspan x="0" dy="-2" xmlSpace="preserve">&#160;&#160;&#160;&#160;{lines[0]}&#160;&#160;&#160;&#160;</tspan>
              </textPath>
            </text>,
            lines[1] ? <text key={id} className={className} onClick={clickHandler}>
              <textPath xlinkHref={`#p${id}`} startOffset={reversed ? '0%' : '100%'} textAnchor={reversed ? 'start' : 'end'}>
                <tspan x="0" dy="5" xmlSpace="preserve">&#160;&#160;&#160;&#160;{lines[1]}&#160;&#160;&#160;&#160;</tspan>
              </textPath>
            </text> : undefined
          ];
        })
      }

      <circle cx="0" cy="0" r={outerCircleRadius} className="line"/>
      <circle cx="0" cy="0" r={innerCircleRadius} className="line"/>

      <text x="0" y={-1 - innerTexts.length * 3} className={`lineText clickable ${observerPoi.id === activePoiId ? 'poi-active-text' : ''}`}
          onClick={onClick.bind(null, observerPoi.id)}>
        {innerTexts.map((line, i) => <tspan key={i} textAnchor="middle" x="0" dy="6">{line}</tspan>)}
      </text>
    </svg>
  );
}

Toposcope.propTypes = {
  activePoiId: PropTypes.number,
  innerCircleRadius: PropTypes.number,
  outerCircleRadius: PropTypes.number,
  fontSize: PropTypes.number,
  inscriptions: PropTypes.arrayOf(PropTypes.string),
  messages: PropTypes.object,
  pois: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    observer: PropTypes.bool,
    flipText: PropTypes.bool
  })),
  title: PropTypes.string,
  language: PropTypes.oneOf(Object.keys(languages)),
  preventUpturnedText: PropTypes.bool,
  onClick: PropTypes.func
};
