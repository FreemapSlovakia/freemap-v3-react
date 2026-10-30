---
title: Élő követés
icon: FaBullseye
order: 600
---

Az élő követéssel a térképen láthatja, hol van éppen egy telefon vagy GPS-nyomkövető, és milyen utat tett meg. Megoszthatja saját helyzetét másokkal, és figyelheti azokat az eszközöket, amelyeket mások osztanak meg Önnel.

A :FaBars: főmenüben a :FaBullseye: **Élő követés** pontban vagy a <kbd>g</kbd> <kbd>t</kbd> billentyűkkel nyitható meg.

## Az eszköztár

![Az élő követés eszköztára](./images/tracking-toolbar.en.webp)

- :FaRegEye: **Figyelt** – az Ön által figyelt eszközök (<kbd>g</kbd> <kbd>w</kbd>).
- :FaMobileAlt: **Készülékeim** – a saját eszközei, amelyek a helyzetüket küldik (<kbd>g</kbd> <kbd>d</kbd>). Ehhez be kell jelentkeznie.
- :FaRegEye: **Megjelenítés** – a nyomvonalak megjelenítése **Pontok**, **Vonal** vagy **Vonal + pontok** formájában.
- :FaPalette: **Színezés szerint** – a nyomvonalak színezése egy rögzített érték, például a magasság, a sebesség vagy az idő szerint. Csak azok az értékek választhatók, amelyeket a nyomvonalak tartalmaznak; egyes módokhoz prémium hozzáférés szükséges.
- :FaChartArea: **Magassági profil** – akkor jelenik meg, ha a nyomvonal magassági adatokat is tartalmaz.
- :FaEllipsisV: – a :MdShapeLine: **Másolás ide: Nyomvonalak és adatok** szerkeszthető másolatot készít a nyomvonalakról, amelyet aztán exportálhat. A követés eközben folytatódik.

## Saját helyzet megosztása

1. Jelentkezzen be, és nyissa meg a :FaMobileAlt: **Készülékeim** ablakot.
2. Nyomja meg az :FaPlus: **Új hozzáadása** gombot, és adja meg a **Név** mezőt. A **Követési kód** mezőt hagyja üresen, mentéskor automatikusan létrejön. A **Legmagasabb szám** és a **Legmagasabb kor** azt korlátozza, hány helyzetet és meddig őriz meg a rendszer.
3. Állítsa be telefonját vagy nyomkövetőjét az eszköz kódjával – a listában az eszköz neve előtt látható. Lásd a következő részt.
4. Ha meg szeretné engedni valakinek, hogy figyelje Önt, válassza az eszköz menüjében a :FaKey: **Kódok megtekintése** pontot, és nyomja meg az :FaPlus: **Új hozzáadása** gombot. Az **Ettől** és az **Eddig** a kód érvényességi idejét korlátozza, a **Megjegyzés** mezőbe pedig feljegyezheti, kinek adta a kódot. Küldje el neki a kódot vagy az :FaClipboard: **URL másolása** gombbal másolt hivatkozást, amely a térképet az Ön eszközével együtt nyitja meg.

Az eszköz kódját tartsa meg magának – aki ismeri, az Ön eszközének nevében küldhet helyzeteket. Ehelyett a figyelőkódokat ossza meg: mindenkinek külön kódot készíthet, és a kód törlésével megszüntetheti a megosztást.

## Az eszköz beállítása

### Freemap HTTP protokoll

Ezt használja olyan alkalmazásokkal, mint a [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) vagy az [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (az utóbbiban a Trip Recording beállításai között kapcsolja be az **Online tracking** lehetőséget). Az alkalmazásban a követési URL legyen:

```
https://backend.freemap.sk/tracking/track/{token}
```

A `{token}` helyére írja be az eszköz kódját a :FaMobileAlt: [Készülékeim](#show=tracking-my) listából.

A cím HTTP `GET` és `POST` kéréseket fogad a következő paraméterekkel:

| Paraméter | Leírás |
|---|---|
| `location` | Szélesség és hosszúság fokban, vesszővel elválasztva **(kötelező, vagy `lat` és `lon`)** |
| `lat` | Szélesség fokban |
| `lon` | Hosszúság fokban |
| `time`, `timestamp` | JavaScript által értelmezhető dátum és idő, vagy Unix-idő másodpercben vagy ezredmásodpercben |
| `alt`, `altitude` | Magasság méterben |
| `speed` | Sebesség m/s-ban |
| `speedKmh` | Sebesség km/h-ban |
| `acc`, `accuracy` | Pontosság méterben |
| `hdop` | Vízszintes DOP |
| `bearing`, `heading` | Irányszög fokban |
| `battery`, `batt` | Akkumulátorszint százalékban |
| `gsm_signal` | GSM-jelerősség százalékban |
| `message` | Megjegyzés / üzenet |

### Traccar

Ezt használja a [Traccar Client](https://www.traccar.org/client/) alkalmazással, hardveres GPS-nyomkövetőkkel (autóba, értéktárgyakra, háziállatokra szánt készülékekkel) vagy más, Traccarral kompatibilis alkalmazásokkal. A Locus Maphez és az OsmAndhoz a fenti Freemap HTTP protokoll ajánlott.

- **Szerver:** `traccar.freemap.sk`
- **Port:** az eszköz protokolljának szokásos portja (lásd a [Traccar eszközlistáját](https://www.traccar.org/devices/) – a Traccar több mint 200 protokollt támogat); HTTP vagy HTTPS esetén az 5055 helyett a **80**-as vagy a **443**-as port is használható
- **Eszközazonosító:** az eszköz kódja

A Traccar Clienthez van egy gyorsabb út: az eszköz menüjében a :SiTraccar: **Traccar QR-kód** egy kódot jelenít meg; ezt beolvasva az alkalmazás az eszköz kódjával beállítható.

## Eszközök figyelése

1. Nyissa meg a :FaRegEye: **Figyelt** ablakot, és nyomja meg az :FaPlus: **Új hozzáadása** gombot.
2. Adja meg a kapott **Figyelőkód** értéket. Megadhat egy **Felirat** szöveget, a vonal színét (**Szín**) és vastagságát (**Szélesség**), valamint azt, hogy mely helyzetek jelenjenek meg: **Kezdő időpont**, **Legmagasabb életkor**, **Legmagasabb szám**. A **Távolság felosztása** és az **Időtartam felosztása** ott szakítja meg a vonalat, ahol két helyzet távolabb vagy hosszabb idő elteltével követi egymást, mint a megadott érték.
3. Nyomja meg a :FaCheck: **Mentés** gombot. Az eszköz megjelenik a térképen.

Az Önnel megosztott hivatkozás úgy nyitja meg a térképet, hogy a megosztó eszköze már a figyeltek között van. A saját eszközeit is figyelheti: az eszköz figyelőkódjainak listájában a :FaRegEye: **Figyelés** gombbal.

A figyelt eszközök listája csak az oldal címében tárolódik. Ha meg szeretné őrizni, mentse a térképet a :FaRegMap: [Saját térképeim](#show=my-maps) közé.

## Eszközök a térképen

Minden eszköz a saját színével jelenik meg; utolsó helyzetét egy emberalak jelöli, és ha az eszköz küld ilyen adatot, egy kör a pontosságát mutatja. A helyzetek akkor érkeznek, amikor az eszköz elküldi őket. Ha egy helyzetre mutat, megjelenik az időpontja, és ha az eszköz küldi őket, a magasság, a sebesség, a jelerősség, az akkumulátorszint és az üzenet is.

Egy nyomvonalra kattintva kijelöli azt. Eszköztárán a :FaPencil: **Módosítás**, a figyelés megszüntetésére szolgáló :FaTrash: **Törlés** és a :FaEllipsisV: gomb található, amellyel csak ezt a nyomvonalat másolhatja a Nyomvonalak és adatok eszközbe.

## GPS-rögzítő

Androidon a főmenü :FaCircle: **GPS-rögzítő** pontja a saját útja rögzítésére szolgál a különálló Freemap GPS Recorder alkalmazással, így a rögzítés akkor is folytatódik, ha a böngésző be van zárva. Részletesen a [GPS-rögzítő](#show=manual/gps-recorder) fejezet írja le.
