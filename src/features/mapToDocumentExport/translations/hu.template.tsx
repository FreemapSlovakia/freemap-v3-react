import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { MapToDocumentExportMessages } from './MapToDocumentExportMessages.js';

const outdoorMap = 'Túrázás, Kerékpár, Síelés, Lovaglás';

const hu: DeepPartialWithRequiredObjects<MapToDocumentExportMessages> = {
  exportError: ({ err }) =>
    addError(getMessages()!, 'Hiba történt a térkép exportálásakor', err),
  cancelExportTitle: 'Exportálás megszakítása',
  labelTitle: 'Címkék',
  cancelExportQuestion: 'Biztosan megszakítja a folyamatban lévő exportálást?',
  area: 'Exportálandó terület',
  format: 'Formátum',
  layersTitle: 'Választható rétegek',
  mapDataTitle: 'Térképadatok',
  layers: {
    contours: 'Szintvonalak',
    shading: 'Domborzatárnyékolás',
    hikingTrails: 'Turistautak',
    bicycleTrails: 'Kerékpáros útvonalak',
    skiTrails: 'Síútvonalak',
    horseTrails: 'Lovaglóútvonalak',
  },
  mapScale: 'Térkép felbontása',
  customLayerOrder: 'Térképadatok elhelyezése',
  orders: {
    natural: 'Természetes',
    topmost: 'Legfelül',
  },
  decorations: 'Térképdíszítések',
  scaleBar: 'Aránymérték',
  northArrow: 'Iránytű',
  attribution: 'Forrásmegjelölés',
  northArrowLetter: 'É',
  glow: 'Ragyogás',
  alert: (licence) => (
    <>
      Megjegyzések:
      <ul>
        <li>
          A <i>{outdoorMap}</i> fog exportáltatni.
        </li>
        <li>A térkép exportálása több tucat másodpercet is igénybe vehet.</li>
        <li>
          Megosztás előtt a térképet lássa el a következő szerzői jogi
          közleménnyel:
          <br />
          <em>{licence}</em>
        </li>
      </ul>{' '}
    </>
  ),
};

export default hu;
