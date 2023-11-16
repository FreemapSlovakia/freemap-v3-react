import { Map } from 'maplibre-gl';

(Map.prototype as any).setLanguage = function (language: string) {
  const setLanguage = () => {
    const replacer = [
      'case',
      ['has', 'name:' + language],
      ['get', 'name:' + language],
      ['get', 'name'],
    ];

    for (const { id, layout } of this.getStyle().layers) {
      if (!layout || !('text-field' in layout)) {
        continue;
      }

      const textFieldLayoutProp = this.getLayoutProperty(id, 'text-field');

      // If the label is not about a name, then we don't translate it
      if (
        typeof textFieldLayoutProp === 'string' &&
        (textFieldLayoutProp.toLowerCase().includes('ref') ||
          textFieldLayoutProp.toLowerCase().includes('housenumber'))
      ) {
        continue;
      }

      this.setLayoutProperty(id, 'text-field', replacer);
    }
  };

  if (this.isStyleLoaded()) {
    setLanguage();
  } else {
    this.once('styledata', () => {
      setLanguage();
    });
  }
};
