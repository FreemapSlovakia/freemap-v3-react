import type { ToposcopeMessages } from './ToposcopeMessages.js';

const en: ToposcopeMessages = {
  pickCenterHint: 'Place the centre of the dial with the ◎ button below.',
  addCenter: 'Place the centre',
  moveCenter: 'Move the centre',
  centerAtMyPosition: 'Centre on my position',
  pickCenterPrompt: 'Click the map where the toposcope stands',
  addPointsHint:
    'Add drawing points; each one becomes a ray of the dial. The centre is a drawn point too — label and move it in the drawing tool.',
  downloadAsSvg: 'Download as SVG',
  osmAttribution: '© OpenStreetMap contributors',
  credit: ({ site }) => `Toposcope by ${site}`,
  settings: {
    title: 'Toposcope',
    inscriptions: 'Inscriptions',
    innerCircleRadius: 'Inner circle radius',
    outerCircleRadius: 'Outer circle radius',
    scale: 'Scale',
    scaleHint:
      'How large the writing is against the dial. Resizing the panel scales the whole drawing together.',
    preventUpturnedText: 'Prevent upside-down text',
    line1: 'First line',
    line2: 'Second line',
    lineHint:
      'Available: {label}, {elevation}, {elevation_ft}, {distance}, {distance_mi}, {azimuth}, {location}, and {p:name} for any property of the point. Put a part in [square brackets] to write it only when everything inside it has a value, as in [{elevation} · ]{distance}.',
    placeholders:
      "An inscription can carry {attribution} for the map credit and {credit} for this portal's.",
  },
};

export default en;
