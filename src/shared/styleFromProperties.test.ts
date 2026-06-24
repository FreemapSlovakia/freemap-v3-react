import { describe, expect, it } from 'vitest';
import {
  lineStyleFromProperties,
  pointStyleFromProperties,
} from './styleFromProperties.js';

describe('lineStyleFromProperties — simplestyle opacity', () => {
  it('folds fill-opacity / stroke-opacity into #RRGGBBAA', () => {
    const style = lineStyleFromProperties(
      {
        stroke: '#ff8000',
        'stroke-opacity': 0.5,
        fill: '#ffa000',
        'fill-opacity': 0.4980392156862745,
      },
      true,
    );

    expect(style.color).toBe('#ff800080');
    expect(style.fillColor).toBe('#ffa0007f');
  });

  it('leaves a fully opaque colour as plain #RRGGBB', () => {
    const style = lineStyleFromProperties(
      { stroke: '#0000ff', 'stroke-opacity': 1 },
      false,
    );

    expect(style.color).toBe('#0000ff');
  });

  it('prefers the lossless freemap:* colour over simplestyle', () => {
    const style = lineStyleFromProperties(
      { 'freemap:fillColor': '#11223344', fill: '#ffffff', 'fill-opacity': 0 },
      true,
    );

    expect(style.fillColor).toBe('#11223344');
  });
});

describe('pointStyleFromProperties — simplestyle opacity', () => {
  it('folds marker-color-opacity into the colour', () => {
    const style = pointStyleFromProperties({
      'marker-color': '#e53935',
      'marker-color-opacity': 0.5,
    });

    expect(style.color).toBe('#e5393580');
  });

  it('keeps a plain iconSpec but ignores a KML IconStyle URL', () => {
    expect(pointStyleFromProperties({ icon: 'poi:peak' }).icon).toBe(
      'poi:peak',
    );

    expect(
      pointStyleFromProperties({
        icon: 'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
      }).icon,
    ).toBeUndefined();
  });

  it('falls back to the KML icon-color tint for the marker colour', () => {
    const style = pointStyleFromProperties({
      'icon-color': '#ffff00',
      'icon-opacity': 1,
    });

    expect(style.color).toBe('#ffff00');
  });
});
