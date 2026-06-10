import { getMessages } from '@features/l10n/messagesStore.js';
import { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import { addError } from '@/translations/messagesInterface.js';
import { ObjectsMessages } from './ObjectsMessages.js';

const cs: DeepPartialWithRequiredObjects<ObjectsMessages> = {
  type: 'Typ',
  lowZoomAlert: {
    message: ({ minZoom }) =>
      `Vyhledávání míst je možné až od přiblížení úrovně ${minZoom}.`,
    zoom: 'Přiblíž',
  },
  tooManyPoints: ({ limit }) => `Výsledek byl omezen na ${limit} objektů.`,
  fetchingError: ({ err }) =>
    addError(getMessages()!, 'Nastala chyba při získávání objektů', err),
  icon: {
    pin: 'Špendlík',
    ring: 'Kruhová',
    square: 'Čtvercová',
  },
  convertAsPoint: 'Jako bod',
  convertWithGeometry: 'S celou geometrií',
  showAsLookup: 'Zobrazit jako Nález',
  convertAll: 'Zkonvertovat všechny viditelné objekty na kreslení',
};

export default cs;
