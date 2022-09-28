/* eslint-disable no-param-reassign */
import '@maplibre/maplibre-gl-leaflet';
import { createTileLayerComponent, LayerProps } from '@react-leaflet/core';
import * as L from 'leaflet';

class MaplibreWithLang extends L.MaplibreGL {
  isTokenField = /^\{name/;

  _isLanguageField = /^name:/;

  _language?: string | null;

  _loaded = false;

  constructor(options: MaplibreLayerProps) {
    super(options);

    this._language = options.language;
  }

  adaptPropertyLanguageWithLegacySupport(
    isLangField: RegExp,
    property: string | maplibregl.Expression,
    languageFieldName: string,
  ) {
    if (
      property.length === 4 &&
      property[0] === 'coalesce' &&
      typeof property[3] === 'string' &&
      this.isTokenField.test(property[3])
    ) {
      // Back to original format string for legacy
      property = property[3];
    }

    if (typeof property === 'string') {
      // Only support legacy format string at top level
      if (languageFieldName !== 'name' && this.isTokenField.test(property)) {
        const splitLegacity = this.splitLegacityFormat(property);
        // The last is not used, it is the original value to be restore

        return [
          'coalesce',
          this.adaptLegacyExpression(splitLegacity, languageFieldName),
          splitLegacity,
          property,
        ];
      }

      return property;
    }

    return this.adaptPropertyLanguage(isLangField, property, languageFieldName);
  }

  splitLegacityFormat(s: string) {
    const ret: (string | string[])[] = ['concat'];

    let sub = '';

    for (let i = 0; i < s.length; i++) {
      if (s[i] === '{') {
        if (sub) {
          ret.push(sub);
        }

        sub = '';
      } else if (s[i] === '}') {
        if (sub) {
          ret.push(['get', sub]);
        }

        sub = '';
      } else {
        sub += s[i];
      }
    }

    if (sub) {
      ret.push(sub);
    }

    return ret;
  }

  adaptLegacyExpression(
    expressions: (string | string[])[],
    languageFieldName: string,
  ) {
    // Kepp only first get name express
    let isName = false;

    const ret: (string | unknown[])[] = [];

    for (const expression of expressions) {
      // ['get', 'name:.*']
      if (
        Array.isArray(expression) &&
        expression.length >= 2 &&
        typeof expression[1] === 'string' &&
        this._isLanguageField.test(expression[1])
      ) {
        if (!isName) {
          isName = true;

          ret.push(['coalesce', ['get', languageFieldName], expression]);
        }
      } else {
        ret.push(expression);
      }
    }

    return ret;
  }

  adaptNestedExpressionField(
    isLangField: RegExp,
    properties: maplibregl.Expression,
    languageFieldName: string,
  ) {
    for (const property of properties) {
      if (Array.isArray(property)) {
        if (
          this.isFlatExpressionField(
            isLangField,
            property as maplibregl.Expression,
          )
        ) {
          property[1] = languageFieldName;
        }

        this.adaptNestedExpressionField(
          isLangField,
          property as maplibregl.Expression,
          languageFieldName,
        );
      }
    }
  }

  adaptPropertyLanguage(
    isLangField: RegExp,
    property: maplibregl.Expression,
    languageFieldName: string,
  ) {
    if (this.isFlatExpressionField(isLangField, property)) {
      property[1] = languageFieldName;
    }

    this.adaptNestedExpressionField(isLangField, property, languageFieldName);

    // handle special case of bare ['get', 'name'] expression by wrapping it in a coalesce statement
    if (property[0] === 'get' && property[1] === 'name') {
      const defaultProp = property.slice();

      const adaptedProp = ['get', languageFieldName];

      property = ['coalesce', adaptedProp, defaultProp];
    }

    return property;
  }

  isFlatExpressionField(isLangField: RegExp, property: maplibregl.Expression) {
    const isGetExpression = property.length >= 2 && property[0] === 'get';

    if (
      isGetExpression &&
      typeof property[1] === 'string' &&
      this.isTokenField.test(property[1])
    ) {
      console.warn(
        'This plugin no longer supports the use of token syntax (e.g. {name}). Please use a get expression. See https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/ for more details.',
      );
    }

    return (
      isGetExpression &&
      typeof property[1] === 'string' &&
      isLangField.test(property[1])
    );
  }

  _getLanguageField(language: string) {
    return language === 'mul' ? 'name' : `name:${language}`;
  }

  _applyLanguage() {
    const m = this.getMaplibreMap() as unknown as maplibregl.Map;

    const symbolLayers = m
      .getStyle()
      .layers?.filter(
        (layer) => layer.type === 'symbol',
      ) as maplibregl.SymbolLayer[];

    for (const layer of symbolLayers) {
      if (layer.layout && typeof layer.layout['text-field'] === 'string') {
        m.setLayoutProperty(
          layer.id,
          'text-field',
          this.adaptPropertyLanguageWithLegacySupport(
            /^name:/,
            layer.layout['text-field'],
            this._getLanguageField(this._language ?? 'mul'),
          ),
        );
      }
    }
  }

  // FIXME dynamic language changing doesn't work
  setLanguage(lang: string) {
    this._language = lang;

    if (this._loaded) {
      this._applyLanguage();
    } else {
      this.getMaplibreMap().once('load', () => {
        this._loaded = true;

        this._applyLanguage();
      });
    }
  }

  onAdd(map: L.Map) {
    L.MaplibreGL.prototype.onAdd.call(this, map);

    if (this._language) {
      this.setLanguage(this._language);
    }

    return this;
  }
}

type MaplibreLayerProps = LayerProps &
  L.LeafletMaplibreGLOptions & {
    language?: string | null;
  };

export const MaplibreLayer = createTileLayerComponent<
  MaplibreWithLang,
  MaplibreLayerProps
>(
  (props, context) => ({
    instance: new MaplibreWithLang(props),
    context,
  }),

  (instance, props, prevProps) => {
    if (props.language !== prevProps.language) {
      instance.setLanguage(props.language ?? 'mul');
    }
  },
);

export default MaplibreLayer;
