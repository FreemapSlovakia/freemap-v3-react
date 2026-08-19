import type { DeepPartialWithRequiredObjects } from '@shared/types/deepPartial.js';
import type { CachedMapsMessages } from './CachedMapsMessages.js';

const cs: DeepPartialWithRequiredObjects<CachedMapsMessages> = {
  cacheOfflineMap: 'Uložit mapu pro offline použití',
  modifyOfflineMap: 'Upravit offline mapu',
  toDownload: 'Ke stažení',
  addOfflineMap: 'Přidat offline mapu',
  emptyMessage:
    'Zatím nejsou uloženy žádné offline mapy. Přidejte si jednu pro používání map bez připojení k internetu.',
  zoom: 'Přiblížení',
  tiles: 'Dlaždice',
  size: 'Velikost',
  ready: 'Připravena',
  incomplete: ({ pct }) => <>Nekompletní ({pct} %)</>,
  resume: 'Pokračovat',
  stop: 'Zastavit',
  total: 'Celkem',
  largeDownload: ({ tiles, size }) => (
    <>
      Velké stahování: {tiles} dlaždic (~{size}). Může to chvíli trvat.
    </>
  ),
  notEnoughSpace: ({ size, free }) => (
    <>
      Nedostatek místa: stahování potřebuje přibližně {size}, ale v tomto
      prohlížeči je dostupných jen {free}. Zastavilo by se v polovině.
    </>
  ),
  estSize: 'Odhadovaná velikost',
  startCaching: 'Spustit stahování',
  cachedSuccess: ({ name }) => `Mapa „${name}“ byla úspěšně stažena.`,
  activate: 'Aktivovat',
  focus: 'Přiblížit na oblast',
  namePrefix: 'Offline',
  offlineWiden:
    'Bez připojení lze tuto mapu jen zmenšit, nikoli zvětšit — zvětšením by bylo potřeba stáhnout dlaždice, které neobsahuje.',
  premiumZoomHint:
    'Nejpodrobnější přiblížení této vrstvy jsou prémiová. Offline mapa si dlaždice ponechává natrvalo a zobrazuje je i bez připojení, takže ke stažení těchto úrovní je potřeba prémiový přístup.',
  premiumWiden:
    'Tato mapa sahá do prémiových přiblížení. Bez prémiového přístupu ji lze zmenšit, nikoli však zvětšit — zvětšením by se znovu stáhly prémiové dlaždice.',
  premiumSkipped:
    'Nejpodrobnější přiblížení této mapy jsou prémiová a nestáhla se, takže mapa zůstává označená jako nekompletní.',
  networkFallback: 'Chybějící dlaždice stahovat z internetu',
  networkFallbackHint:
    'Zapnuto: při posunu mimo staženou oblast nebo při větším přiblížení se zobrazí živé dlaždice, pokud je připojení k internetu. Vypnuto: mapa ukáže jen to, co bylo staženo.',
  deleteTitle: 'Smazat offline mapu',
  deleteConfirm: ({ name }) => (
    <>
      Opravdu smazat offline mapu <b>{name}</b> i se všemi jejími dlaždicemi?
    </>
  ),
  browse: {
    intro:
      'Dlaždice, na které na mapě narazíte, lze uchovat na později, aby se již navštívené oblasti načetly i bez internetu. Týká se to všech dlaždicových vrstev a je to nezávislé na stažených offline mapách.',
    mode: 'Zdroj dlaždic',
    modes: {
      networkOnly: 'Pouze internet',
      networkFirst: 'Internet, poté mezipaměť',
      cacheFirst: 'Mezipaměť, poté internet',
      cacheOnly: 'Pouze mezipaměť',
    },
    store: 'Ukládat dlaždice stažené z internetu',
    maxAge: 'Uchovávat dlaždice',
    maxSize: 'Limit velikosti',
    days: ({ days }) => <>{days} dní</>,
    keepForever: 'Dokud je místo',
    noSizeLimit: 'Bez limitu',
    retentionHint:
      'Dlaždice po uplynutí doby se zahodí a po překročení limitu velikosti odejdou nejdéle nezobrazené.',
    cached: ({ tiles, size }) => (
      <>
        Uloženo: <strong>{tiles}</strong> dlaždic ({size})
      </>
    ),
    clear: 'Vymazat mezipaměť',
    clearConfirm:
      'Opravdu zahodit všechny dlaždice uložené při prohlížení? Nastavení zůstane.',
  },
};

export default cs;
