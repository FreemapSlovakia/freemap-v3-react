import { HintTooltip } from '@shared/components/HintTooltip.js';
import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const sl: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Pridobi premium dostop',
  commonHeader: (price, dtmCountries) => (
    <>
      <p>
        <strong>Freemap Premium</strong> je izbirna letna naročnina, ki nadgradi
        aplikacijo.
      </p>
      <p className="mb-1">
        Za <b>{price} €</b> na leto dobite:
      </p>
      <ul>
        <li>odstranjeno oglasno pasico</li>
        <li>
          <HintTooltip
            hint={
              <ul className="mb-0 ps-3 text-start">
                <li>najvišje ravni približevanja Outdoor zemljevida</li>
                <li>zemljevidi na osnovi WMS</li>
                <li>
                  najvišje ravni približevanja ortofoto zemljevidov Slovaške in
                  Češke
                </li>
                <li>
                  podrobno senčenje reliefa Slovaške in Češke v visoki
                  ločljivosti
                </li>
              </ul>
            }
          >
            premium sloje zemljevida
          </HintTooltip>
        </li>
        <li>premium fotografije</li>
        <li>multimodalno načrtovanje poti</li>
        <li>optimizacijo vrstnega reda točk poti</li>
        <li>
          <HintTooltip hint={dtmCountries}>
            podatke o nadmorski višini v visoki ločljivosti (številne evropske
            države)
          </HintTooltip>
        </li>
        <li>panorama v višji ločljivosti</li>
        <li>analiza vidnosti v višji ločljivosti</li>
        <li>daljša zgodovina vremenskega radarja in njegova napoved</li>
        <li>
          obarvanje poti in sledi (nekateri načini so na voljo le s premiumom)
        </li>
      </ul>
      <p className="mb-0">Freemap ostaja brezplačen in odprt.</p>
    </>
  ),
  dtmAreaNames: { gb: 'Anglija' },
  stepsForAnonymous: (
    <>
      <div className="fw-bold">Kako deluje</div>
      <div className="mb-3">
        <p className="mb-1 ms-3">
          <span className="fw-semibold">1. korak</span> - prijavite se ali si
          ustvarite brezplačen račun Freemap (spodaj).
        </p>
        <p className="mb-1 ms-3">
          <span className="fw-semibold">2. korak</span> - preusmerjeni boste na
          dokončanje plačila.
        </p>
      </div>
    </>
  ),
  success: 'Čestitamo, pridobili ste premium dostop!',
  becomePremium: 'Pridobi premium dostop',
  youArePremium: (date) => (
    <>
      Premium dostop imate do <b>{date}</b>.
    </>
  ),
  premiumOnly: 'Na voljo samo s premium dostopom.',
  noPremium: 'Nimate premium dostopa.',
  clickToActivate: 'Kliknite za aktivacijo.',
  higherPrecisionElevation:
    'Natančnejši podatki o nadmorski višini so na voljo s premium dostopom.',
  higherDetail: 'Podrobnejši prikaz je na voljo s premium dostopom.',
  alreadyPremium: 'Premium dostop že imate.',
  alreadySubscribed: 'Aktivno naročnino že imate.',
  premiumUser: 'Uporabnik s premium dostopom',
  payOnce: 'Plačaj enkratno za eno leto',
  paySubscription: 'Letna naročnina (samodejno se obnavlja)',
  payWithChrons: 'Plačaj s chroni',
  chronsHint: (
    <>
      Če želite pridobiti premium dostop za prostovoljsko delo, poročano v{' '}
      <RovasLink>Rovasu</RovasLink>, izberite plačilo s chroni.
    </>
  ),
  subscriptionReassurance: ({ price }) =>
    `Cena ${price}\xa0€ na leto vam ostane, dokler je naročnina aktivna. Kadar koli jo lahko prekličete — premium dostop nato velja do konca plačanega leta.`,
  youArePremiumRenews: (
    <>Imate premium dostop. Naročnina se samodejno podaljšuje.</>
  ),
};

export default sl;
