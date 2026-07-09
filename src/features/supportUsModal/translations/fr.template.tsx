import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { SupportUsMessages } from './SupportUsMessages.js';

const fr: DeepPartialWithRequiredObjects<SupportUsMessages> = {
  alert: {
    line1:
      '<b>Attention !</b> Utilisez ce bouton pour obtenir l’accès premium :',
    line2:
      'Le paiement par virement bancaire ou via PayPal est une façon de nous remercier pour les services de base, sans donner accès aux fonctions premium.',
  },
  explanation:
    'Le portail cartographique Freemap est créé bénévolement par des passionnés sur leur temps libre. Son fonctionnement nécessite toutefois du matériel et des services d’entreprises commerciales, ce qui a un coût.',
  account: 'Compte bancaire',
  paypal: 'Faire un don via PayPal',
  thanks: 'Nous vous serons très reconnaissants pour chaque don. Merci !',
  registration: 'Enregistrée sous MV/VVS/1-900/90-34343 le 2 octobre 2009',
  team: 'Équipe',
};

export default fr;
