import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PanoramaMessages } from './PanoramaMessages.js';

const de: DeepPartialWithRequiredObjects<PanoramaMessages> = {
  pickHint: ({ icon }) => (
    <>Wählen Sie den Blickpunkt mit der Schaltfläche {icon} unten.</>
  ),
  rendering: 'Panorama wird berechnet…',
  queued: ({ ahead }) =>
    ahead === 0
      ? 'Warten auf den Renderer…'
      : ahead === 1
        ? 'Warten — ein Panorama ist vorher dran.'
        : `Warten — ${ahead} Panoramen sind vorher dran.`,
  cancel: 'Abbrechen',
  update: 'Aktualisieren',
  outdated: 'Das Bild zeigt den vorherigen Blickpunkt.',
  locate: 'Ansicht von meinem Standort',
  pickViewpoint: 'Auf der Karte wählen',
  pickViewpointPrompt: 'Klicken Sie auf die Karte, von wo aus Sie schauen',
  lookAt: 'Einen Ort auf der Karte anschauen',
  pickTargetPrompt: 'Klicken Sie auf die Karte, wohin Sie schauen möchten',
  createToposcope: 'Panoramatafel aus dieser Ansicht erstellen',
  toposcopeMergeModal: {
    title: 'Die Karte ist nicht leer',
    message:
      'Auf der Karte sind bereits Punkte gezeichnet. Sollen die Gipfel aus dieser Ansicht dazukommen oder sie ersetzen? Der Mittelpunkt der Tafel rückt so oder so auf diesen Blickpunkt.',
    append: 'Hinzufügen',
    replace: 'Ersetzen',
  },
  settings: {
    title: 'Panorama-Einstellungen',
    tiltHint:
      'Wie viel Himmel und Boden das Bild fasst — die Winkel über und unter dem Horizont.',
    custom: 'Genaue Winkel',
    depthLift: 'Ferne entfalten',
    depthLiftOff: 'Naturgetreu',
    depthLiftHint:
      'Hebt entferntes Gelände an, sodass sich ferne Ketten von den Graten davor abheben — so wie es ein von Hand gezeichnetes Panorama tut. Dadurch kommen auch Gipfel ins Bild, die von hier aus gar nicht zu sehen wären; ihre Namen sind gekennzeichnet.',
    rangeHint:
      'Gelände jenseits von 300 km gehört zu Premium. Jeder weitere Kilometer wird entlang jedes Strahls des Bildes abgeschritten, eine weitere Sicht kostet den Renderer also entsprechend mehr.',
    look: 'Stil',
    looks: {
      natural: 'Natürlich',
      relief: 'Schattiertes Relief',
      drawn: 'Gezeichnet',
      engraved: 'Stich',
      custom: 'Eigener',
    },
    ridgeStrength: 'Stärke der Gratlinien',
    ridgeWidth: 'Dicke der Gratlinien',
    ridgeColor: 'Farbe der Grate',
    ground: 'Gelände',
    groundHint:
      'Eine Farbe, die der eingebaute Dunst mit zunehmender Entfernung zur Himmelsfarbe hin auswäscht — oder ein Verlauf, der das Gelände nach seiner Entfernung einfärbt und den Dunst ganz ersetzt.',
    groundSolid: 'Farbe',
    groundGradient: 'Verlauf',
    gradientFar: 'Verlauf reicht bis',
    gradientFarAuto: 'Automatisch',
    gradientFarHint:
      'Die Entfernung, in der die letzte Farbe erreicht ist; die Mitte des Balkens liegt bei einem Drittel davon. Automatisch misst das tatsächlich im Bild stehende Gelände, sodass die ganze Palette auf das entfällt, was das Bild zeigt.',
    gradientSky: 'In den Himmel übergehen',
    gradientSkyHint:
      'Die letzte Farbe ist der Himmel selbst, sodass ferne Ketten im Horizont verschwimmen, statt sich dagegen abzusetzen. Aus ergibt die harte Kammlinie, die ein Plakat will.',
    gradientClip: 'Gelände dahinter ausblenden',
    gradientClipHint:
      'Gelände jenseits dieser Entfernung wird weggelassen statt flach in der letzten Farbe gemalt, sodass der ganze Verlauf auf das entfällt, was das Bild zeigt. Gipfel, die darauf stehen, werden nicht benannt.',
  },
  preview: 'Vorschau',
  quality: {
    label: 'Qualität / Geschwindigkeit',
    superfast: 'Niedrigste / schnellste',
    fast: 'Niedrige / schnelle',
    standard: 'Standard',
    detailed: 'Detailliert / langsam',
    finest: 'Feinste / langsamste',
    premiumHint:
      'Ein feineres Panorama wird mit bis zu sechsfacher Auflösung und neunfacher Abtastung berechnet, sodass die Grate so erscheinen, wie sie wirklich sind, und nicht als Treppen. Auf einem Server, der ein Panorama nach dem anderen berechnet, kostet jede Stufe entsprechend mehr — die feineren gehören deshalb zu Premium.',
  },
  tilt: {
    label: 'Senkrechter Ausschnitt',
    standard: 'Standard',
    wide: 'Hoch',
    flat: 'Flach',
  },
  labels: {
    title: 'Gipfelnamen',
    density: 'Anzahl der Namen',
    none: 'Keine',
    few: 'Weniger',
    normal: 'Normal',
    many: 'Mehr',
    weight: 'Gipfel bewerten nach',
    weightHint:
      'Nach Größe werden die großen Berge benannt, wie weit sie auch entfernt sind, in der Mitte das, was die Ansicht füllt, und nach Nähe das, was nahe ist, wie es auch aussieht.',
    weights: ['Größe', 'Eher Größe', 'Größe und Nähe', 'Eher Nähe', 'Nähe'],
    prominence: 'Echte Berge bevorzugen',
    prominenceOff: 'Aus',
    prominenceHint:
      'Ein Gipfel bekommt seinen Namen dafür, dass er ein Berg für sich ist, und nicht nur dafür, wie er von Ihrem Standort aus heraussticht — so verdient auch ein berühmter Gipfel zwischen höheren Nachbarn seinen Namen. Bei vielen Gipfeln ist sie unbekannt; die werden wie bisher beurteilt.',
    haze: 'Wie weit Namen tragen',
    hazeOff: 'Klare Luft',
    hazeHint:
      'Wie weit ein Gipfel entfernt sein muss, damit der Dunst mehr zählt als der Gipfel selbst. Jenseits des Dreifachen davon wird gar nichts mehr benannt.',
    showEle: 'Höhen anzeigen',
    showEleHint:
      'Schreibt unter jeden Gipfelnamen seine Höhe. Jede Beschriftung ist dann zwei Zeilen hoch, sodass weniger davon ins Bild passen.',
    showRevealed: 'Aufgedeckte Gipfel benennen',
    showRevealedHint:
      'Gipfel, die das Entfalten der Ferne hinter einem näheren Grat hervorgeholt hat: gezeichnet, aber von hier aus nicht wirklich sichtbar. Ihre Namen sind blasser und treten dort zurück, wo neben einem sichtbaren Gipfel kein Platz für beide ist.',
  },
  dominance: {
    label: 'Mindestdominanz',
    all: 'Beliebig',
  },
  autoPan: 'Mit dem Gerät oder von selbst drehen',
  peak: {
    title: ({ name, ele }) => (
      <>
        <b>{name}</b>
        {ele === null ? null : ` (${ele})`}
      </>
    ),
    figures: ({ distance, azimuth }) => `${distance}\xa0· ${azimuth}`,
  },
  errors: {
    offline:
      'Ein Panorama wird auf dem Server berechnet, und Sie sind offline.',
    unreachable:
      'Der Rendering-Dienst war nicht erreichbar. Er ist möglicherweise außer Betrieb, oder etwas zwischen Ihnen und ihm blockiert die Anfrage.',
    busy: 'Der Rendering-Dienst ist derzeit nicht verfügbar. Versuchen Sie es gleich noch einmal.',
    tooMany:
      'In letzter Zeit wurden zu viele Panoramen berechnet. Versuchen Sie es später noch einmal, oder holen Sie sich Premium.',
    noData:
      'Für diesen Blickpunkt gibt es keine Geländedaten. Klicken Sie an eine andere Stelle.',
    failed: 'Das Panorama konnte nicht berechnet werden.',
  },
  caveats: {
    title: 'Was das Bild zeigt und was nicht',
    bareEarth:
      'Das Geländemodell ist blanke Erde: Wälder und Gebäude fehlen darin, eine Sicht, die ein Wald verstellen würde, ist also frei gezeichnet. Das ist mit Abstand die größte Fehlerquelle.',
    coverage:
      'Die Genauigkeit hängt vom Land ab. Wo ein nationales Laserscan-Modell vorliegt, ist der Nahbereich scharf; sonst antwortet ein globales 30-m-Modell.',
    viewpoint:
      'Das Auge wird auf den höchsten Punkt im Umkreis weniger Meter um Ihren Klick gesetzt, damit der Fels daneben die Gipfelsicht nicht verdirbt.',
    depthLift:
      'Die Ferne ist entfaltet, dieses Bild ist also eine Zeichnung und keine Fotografie: Gipfel mit blasserem Namen verdeckt in Wirklichkeit ein Grat davor, und eine aus dem Bild abgelesene Entfernung bedeutet keine freie Sichtlinie mehr.',
  },
  terrainSource: 'Gelände',
  peakSource: 'Gipfelnamen',
};

export default de;
