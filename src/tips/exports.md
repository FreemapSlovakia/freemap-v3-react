Freemap Slovakia vytvára pravidelné exporty mapy pre rôzne mobilné aplikácie/zariadenia. Tu si ich môžete stiahnuť. Ak tu nie je uvedený postup inštalácie mapy pre Vašu aplikáciu/zariadenie, je potrebné ho hľadať na webovej stránke Vami používanej aplikácie/zariadenia.

Mapové dáta © OpenStreetMap prispievatelia. Licencované pod ODbL 1.0.

### Mobilné aplikácie (Android / iOS)

[Freemap plugin](https://play.google.com/store/apps/details?id=sk.freemap.locus.addon.routePlanner) pre aplikáciu [Locus Map](https://www.locusmap.eu/) slúži na spravovanie offline vektorových máp a štýlov Freemap. Ostatné funkcie pluginu už nie sú udržiavané. Starší návod na inštaláciu a použitie nájdete na [Geoblogu](http://geoblog.freemap.sk/2013/04/02/freemap-vektorove-topograficke-mapy/).

Priame stiahnutie mapy Slovenska a Freemap štýlu pre program Locus Map a OruxMaps:

(Upozornenie: odkazy sú funkčné len cez prehliadač v mobilnom telefóne s nainštalovanou aplikáciou)

Locus Map:

- [mapa Slovenska V5](locus-actions://https/proxy.freemap.sk/locus/locus-map-sk-v5.xml)
- [mapa Českej republiky V5](locus-actions://https/proxy.freemap.sk/locus/locus-map-cz-v5.xml)
- [štýl pre mapu V5](locus-actions://https/proxy.freemap.sk/locus/locus-theme-v5.xml)
- [mapa Slovenska V3](locus-actions://https/download.freemap.sk/LocusMap/map_freemap_slovakia.xml) (staršia verzia)
- [štýl pre mapu V3](locus-actions://https/download.freemap.sk/LocusMap/theme_freemap_slovakia.xml) (staršia verzia)

OruxMaps:

- [mapa Slovenska V5](orux-map://proxy.freemap.sk/locus/freemapV5-slovakia.zip)
- [mapa Českej republiky V5](orux-map://proxy.freemap.sk/locus/freemapV5-czech.zip)
- [štýl pre mapu V5](orux-mf-theme://proxy.freemap.sk/locus/freemapV5.zip)
- [mapa Slovenska V3](orux-map://proxy.freemap.sk/locus/slovakia-topo-osm-srtm.zip) (staršia verzia)
- [štýl pre mapu V3](orux-mf-theme://proxy.freemap.sk/locus/orux_theme.zip) (staršia verzia)

Pokiaľ používate inú aplikáciu, ktorá vie zobraziť mapy vo formáte mapsforge, môžete si ručne stiahnuť nasledovné súbory. Tie potom musíte uložiť do priečinka, kde si to aplikácia vyžaduje. Kde konkrétne to je, zistíte buď priamo v aplikácií, alebo na web stránke aplikácie.

- [mapa Slovenska V5](https://proxy.freemap.sk/locus/freemapV5-slovakia.zip)
- [mapa Českej republiky V5](https://proxy.freemap.sk/locus/freemapV5-czech.zip)
- [štýl pre mapu V5](https://proxy.freemap.sk/locus/freemapV5.zip)

Uvedené mapy vo formáte mapsforge sa aktualizujú každý utorok a piatok.

### Garmin mapa ![Garmin logo](https://dev.freemap.sk/img/wiki/garmin_logo16.png)

Táto turisticko-cyklistická mapa je vytvorená z dát projektu OpenStreetMap. Mapu môžete používať buď v programe Garmin BaseCamp ako podkladovú mapu, alebo si ju nainštalovať do Garmin GPS prístroja. Vrstevnice sú vygenerované z [SRTM](http://www2.jpl.nasa.gov/srtm/).

_freemapSKtopo_ - obsahuje mapu Slovenska s turistickými a cyklo trasami (aktualizovaná každý pondelok a štvrtok)

- inštalátor pre MS Windows MapSource/BaseCamp:
  - [UTF8 mapa](https://download.freemap.sk/garmin/freemapSKtopo.exe)
  - [Latin1 mapa](https://download.freemap.sk/garmin/freemapSKtopo.latin1.exe)
- inštalátor mapy pre MacOS X BaseCamp:
  - [UTF8 mapa](https://download.freemap.sk/garmin/freemapSKtopo.gmapi.zip)
  - [Latin1 mapa](https://download.freemap.sk/garmin/freemapSKtopo.gmapi.latin1.zip)
- iba gmapsupp.img súbor:
  - [UTF8 mapa](https://download.freemap.sk/garmin/freemapSKtopo.gmapsupp.zip)
  - [Latin1 mapa](https://download.freemap.sk/garmin/freemapSKtopo.gmapsupp.latin1.zip)

_freemapCZtopo_ - obsahuje mapu Českej republiky s turistickými a cyklo trasami (aktualizovaná každý pondelok a štvrtok)

- inštalátor pre MS Windows MapSource/BaseCamp:
  - [Latin1 mapa](https://download.freemap.sk/garmin/freemapCZtopo.latin1.exe)
- inštalátor mapy pre MacOS X BaseCamp:
  - [Latin1 mapa](https://download.freemap.sk/garmin/freemapCZtopo.gmapi.latin1.zip)
- iba gmapsupp.img súbor:
  - [Latin1 mapa](https://download.freemap.sk/garmin//freemapCZtopo.gmapsupp.latin1.zip)

**Poznámka:** zariadenie Edge 1000 a GPSMap 64 (prípadne ďalšie) nezobrazujú mapu. Mapa používa unicode pre ukladanie znakov a tieto zariadenia s tím majú problém. Pokiaľ Vám zariadenie píše, že je "mapa zamknutá" [stiahnite si](https://download.freemap.sk/garmin) súbor, ktorý má v názve "latin1" a postupujte podľa návodu nižšie.
Viac o probléme zamknutej mapy na anglickom [Garmin fóre](https://forums.garmin.com/showthread.php?94680-Edge-1000-cannot-read-mkgmap-%28OSM%29-created-Unicode-maps).
Taktiež v prípade ak vlastníte staršie zariadenie, ktoré miesto písmen s diakritikou zobrazuje nezmyselné znaky, použite verziu, ktorá má v názve "latin1".

#### Inštalácia pre Windows

Prvá možnosť je za pomoci programov MapSource alebo BaseCamp, dodávaných spolu so zariadením.

1.  Stiahnite si zo stránky [https://download.freemap.sk/garmin](https://download.freemap.sk/garmin) mapu [freemapSKtopo.exe](https://download.freemap.sk/garmin/freemapSKtopo.exe) alebo alternatívne [freemapSKtopo.latin1.exe](https://download.freemap.sk/garmin/freemapSKtopo.latin1.exe) (obsahuje windows inštalátor pre MapSource/BaseCamp).
2.  Po spustení sa Vás inštalátor opýta, kam mapu uložiť
3.  Pripojte zariadenie k PC a spustite MapSource/BaseCamp.
4.  Vyberte si freemapSKtopo mapu, upravte mierku zobrazenia tak, aby ste videli celé Slovensko
5.  Vyberte _"nástroj mapy"_ a vyklikajte si ktoré oblasti chcete mať v zariadení (toto sa môže opakovať viac krát a pre rôzne mapy, stačí len zvoliť inú mapu a vyklikať na nej oblasti). Naľavo by ste mali vidieť (záložka Mapy) ako pribúdajú vybrané oblasti.
6.  Kliknite na _"Odoslať do zariadenia"_
7.  Hotov.

Ďalšou možnosťou ako dostať mapu do zariadenie je použiť súbor **gmapsupp.img**. Tento postup je možné použiť aj v prípade ak nie ste majiteľom počítača s OS Windows.

1.  Stiahnite si zo stránky [https://download.freemap.sk/garmin](https://download.freemap.sk/garmin) mapu [freemapSKtopo.gmapsupp.zip](https://download.freemap.sk/garmin/freemapSKtopo.gmapsupp.zip) alebo alternatívne [freemapSKtopo.gmapsupp.latin1.zip](https://download.freemap.sk/garmin/freemapSKtopo.gmapsupp.latin1.zip).
2.  Rozbaľte zip súbor. (Obsahuje gmapsupp.img a informacia.txt)
3.  Súbor gmapsupp.img stačí nakopírovať do zariadenia do priečinku Garmin alebo na pamäťovú kartu, tiež priečinok Garmin. Ak už máte taký súbor a obsahuje inú mapu **odporúčame si pôvodnú mapu zazálohovať v počítači**. Pokiaľ sa nejedná o staršie Garmin zariadenie, tak je možné používať aj viac img súborov súčasne. Stačí ak stiahnutý gmapsupp.img premenujete na napr. freemap.img a tento súbor uložíte do priečinka Garmin.

#### Inštalácia pre MacOS

Opísaný postup bol odladený na verzii MacOS X 10.9.2 (Mavericks) a prístroji Garmin [eTrex Venture cx](https://buy.garmin.com/en-US/US/on-the-trail/discontinued/etrex-venture-cx/prod410.html).

Inštalácia zhruba spočíva v stiahnutí mapových dát z úložiska Freemap, skonvertovaní do formátu ktorý je použiteľný programom BaseCamp a uložením mapy na miesto, kde ju tento program hľadá.

Na inštaláciu budete potrebovať:

- [Garmin BaseCamp pre MacOS X](http://www8.garmin.com/support/download_details.jsp?id=4449)
- [MapInstall a MapManager pre MacOS X](http://www8.garmin.com/support/download_details.jsp?id=3825)
- [Aktuálne freemap mapové súbory](https://download.freemap.sk/garmin/) (`freemapSKtopo.gmapsupp.zip` a `freemapSKtopo.gmapi.zip`)

_Inštalácia do programu BaseCamp_

1. rozbaľte komprimované freemap mapové súbory.
2. otvorte program Garmin MapManager
3. V ponuke kliknite na položku **File** (Súbor) a vyberte položku **Install Map...**
4. nájdite na disku súbor freemapSKtopo.gmapi a otvorte ho.
5. Po úspešnej inštalácii sa v zozname máp objaví nová položka. Bohužiaľ sa nám nepodarilo zistiť ako zobraziť meno mapy, takže toto v zozname neuvidíte.
6. Po otvorení programu **BaseCamp** budete môcť mapu (to znamená riadok bez mena) zvoliť z ponuky **Maps**.

_Inštalácia do prístroja Garmin_

Freemap mapy sa dajú nainštalovať do GPS prístrojov dvoma spôsobmi.

1. Mapa nainštalovaná do BaseCamp-u postupom opísaným vyššie sa dá pomocou programu [Garmin MapInstall](http://www8.garmin.com/support/download_details.jsp?id=3825) nainštalovať aj do GPS prístroja. Problém pri tejto metóde je ten, že Garmin používa na prepojenie počítača s GPS prístrojom chybný program (USB driver) a inštalácia môže trvať aj niekoľko hodín.
2. Oveľa rýchlejšia metóda je pripojiť GPS prístroj k počítaču (USB káblikom) v móde externého disku a súbor gmapsupp.img ktorý získate rozbalením archívu freemapSKtopo.gmapsupp.zip prekopírovať do foldera Garmin ktorý nájdete na médiu pripojeného GPS prístroja. Skopírovanie môžte urobiť aj bez použitia USB prepojenia tak, že pamäťovú kartu vyberiete z GPS, vložíte do adaptéra na čítanie pamäťového média (buď pripojeného ku, alebo zabudovaného vo vašom počítači) a jednoducho súbor go Garmin foldera skopírujete.

#### Upozornenie

Mapa, ako mnohé ďalšie voľne dostupné mapy, je pripravená neoficiálnymi nástrojmi, ktoré nie sú výrobcom zariadení Garmin podporované.
Tu uvedený postup je bez záruky a aj v prípade, že budete postupovať presne podľa neho nezaručujeme, že sa s Vaším zariadením nič nestane. Ak sa predsa len stane ponechajte si všetky kúsky čo Vám ostanú.
