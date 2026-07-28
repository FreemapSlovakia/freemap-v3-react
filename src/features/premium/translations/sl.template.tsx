import { RovasLink } from '@shared/components/RovasLink.js';
import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { PremiumMessages } from './PremiumMessages.js';

const sl: DeepPartialWithRequiredObjects<PremiumMessages> = {
  title: 'Pridobi premium dostop',
  commonHeader: (price) => (
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
        <li
          className="text-decoration-underline fm-cursor-help"
          title="podrobno senčenje reliefa Slovaške in Češke v visoki ločljivosti, najvišje ravni približevanja Outdoor zemljevida, najvišje ravni približevanja ortofoto zemljevidov Slovaške in Češke, različni zemljevidi na osnovi WMS"
        >
          premium sloje zemljevida
        </li>
        <li>premium fotografije</li>
        <li>multimodalno načrtovanje poti</li>
        <li>
          podatke o nadmorski višini v visoki ločljivosti (številne evropske
          države)
        </li>
      </ul>
      <p className="mb-0">Freemap ostaja brezplačen in odprt.</p>
    </>
  ),
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
  alreadyPremium: 'Premium dostop že imate.',
  premiumUser: 'Uporabnik s premium dostopom',
  payOnce: 'Plačaj enkratno za eno leto',
  paySubscription: 'Letna naročnina (samodejno se obnavlja)',
  subscribe: 'Naroči se',
  payWithChrons: 'Plačaj s chroni',
  chronsHint: (
    <>
      Če želite pridobiti premium dostop za prostovoljsko delo, poročano v{' '}
      <RovasLink>Rovasu</RovasLink>, izberite plačilo s chroni.
    </>
  ),
  priceIncrease: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bo premium dostop stal ${newPrice}\xa0€ na leto. Če se naročite prej, vam letna cena ${oldPrice}\xa0€ ostane, dokler je naročnina aktivna. Enkratni nakup velja po ${oldPrice}\xa0€ le za to eno leto — naslednje kupite po ceni, ki bo takrat veljala.`,
  priceIncreaseShort: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bo premium dostop stal ${newPrice}\xa0€ na leto. Če se naročite prej, vam letna cena ${oldPrice}\xa0€ ostane, dokler je naročnina aktivna.`,
  priceIncreaseSwitch: ({ date, oldPrice, newPrice }) =>
    `Od ${date} bo premium dostop stal ${newPrice}\xa0€ na leto. Če do takrat preidete na letno naročnino, vam letna cena ${oldPrice}\xa0€ ostane, dokler je naročnina aktivna. Zaračunavati se začne šele, ko poteče že plačano leto, tako da ničesar ne plačate dvakrat.`,
  priceIncreaseMini: ({ date, newPrice }) =>
    `Premium od ${date} za ${newPrice}\xa0€ na leto.`,
  priceIncreaseMore: 'več…',
  winbackOffer: ({ price, expiredAt }) =>
    `Vaš premium dostop je potekel ${expiredAt}. Kot nekdanji kupec se lahko vrnete po prvotni ceni: letna naročnina s samodejnim podaljševanjem za ${price}\xa0€, ki vam ostane, dokler je aktivna. Ta ponudba je namenjena samo vam in jo je mogoče izkoristiti enkrat.`,
  winbackAccept: ({ price }) => `Naroči se za ${price}\xa0€ na leto`,
};

export default sl;
