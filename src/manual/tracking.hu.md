---
title: Élő követés
icon: FaBullseye
order: 600
---

Az élő követéssel a térképen láthatja, hol van éppen egy telefon vagy GPS-nyomkövető, és milyen úton haladt. Megoszthatja saját helyzetét másokkal, és figyelheti azokat az eszközöket, amelyeket mások osztanak meg Önnel.

A :FaBars: főmenüben a :FaBullseye: **Élő követés** pontban vagy a <kbd>g</kbd> <kbd>t</kbd> billentyűkkel nyitható meg.

## Saját helyzet megosztása

1. Jelentkezzen be, és nyissa meg a :FaMobileAlt: **Készülékeim** párbeszédablakot.
2. Nyomja meg az :FaPlus: **Új hozzáadása** gombot, és töltse ki a **Név** mezőt. A **Token** mezőt hagyja üresen, mentéskor generálódik.
3. Állítsa be telefonját vagy nyomkövetőjét az eszköz tokenjével – a listában az eszköz neve előtt látható. Lásd a következő részt.
4. Ha valakinek meg akarja engedni, hogy figyelje Önt, válassza az eszköz menüjében a :FaKey: **Kódok megtekintése** pontot, és nyomja meg az :FaPlus: **Új hozzáadása** gombot. Küldje el neki a kódot vagy az :FaClipboard: **URL másolása** gombbal másolt hivatkozást.

Az eszköz tokenjét tartsa meg magának – aki ismeri, az eszköze nevében küldhet helyzeteket. Ehelyett a figyelőkódokat ossza meg.

## Az eszköz beállítása

A Freemap kétféle módszert támogat az eszköz helyzetének küldéséhez.

### 1. módszer: Natív Freemap HTTP protokoll alapú követés

Ezt a módszert használja [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) vagy [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) alkalmazásokkal (engedélyezze az **Online tracking** funkciót a Trip Recording beállításaiban).

Konfigurálja a követési URL-t az alkalmazásában:

```
https://backend.freemap.sk/tracking/track/{token}
```

Cserélje le a `{token}` részt az eszköz tokenjére az [eszközlistából](#show=tracking-my).

A cím HTTP `GET` vagy `POST` kéréseket fogad a következő paraméterekkel:

| Paraméter | Leírás |
|---|---|
| `location` | Vesszővel elválasztott szélességi és hosszúsági fok **(kötelező, vagy `lat` és `lon`)** |
| `lat` | Szélességi fok |
| `lon` | Hosszúsági fok |
| `time`, `timestamp` | JavaScript által értelmezhető dátum vagy Unix idő másodpercben vagy milliszekundumban |
| `alt`, `altitude` | Magasság méterben |
| `speed` | Sebesség m/s-ban |
| `speedKmh` | Sebesség km/h-ban |
| `acc`, `accuracy` | Pontosság méterben |
| `hdop` | Vízszintes DOP |
| `bearing`, `heading` | Irányszög fokban |
| `battery`, `batt` | Akkumulátor szint százalékban |
| `gsm_signal` | GSM jelerősség százalékban |
| `message` | Megjegyzés / üzenet |

### 2. módszer: Traccar-alapú követés

Ezt a módszert használja a [Traccar Client](https://www.traccar.org/client/) alkalmazással, dedikált hardveres GPS nyomkövetőkkel (pl. jármű-nyomkövetők, eszközkövetők, háziállat-nyomkövetők) vagy más Traccar-kompatibilis alkalmazásokkal, mint a Locus Map vagy OsmAnd (bár ezeknél a natív Freemap HTTP követés ajánlott).

Konfigurálja eszközét vagy alkalmazását az alábbi szerverre való küldésre:

- **Szerver:** `traccar.freemap.sk`
- **Port:** Használja eszköze protokolljának alapértelmezett portját (lásd [Traccar eszközlista](https://www.traccar.org/devices/)); HTTP vagy HTTPS esetén használhatja a **80**-as vagy **443**-as portot az 5055 (HTTP) helyett

Az eszközazonosítóként használja az **eszköz tokenjét** (az [eszközlistából](#show=tracking-my)). A Traccar Client alkalmazáshoz az eszköz menüjében található :SiTraccar: **Traccar QR-kód** olyan kódot mutat, amelynek beolvasásával az alkalmazást az eszköz tokenjével állíthatja be.

A Traccar több mint 200 protokollt támogat — tekintse meg a [Traccar eszközlistát](https://www.traccar.org/devices/) a konkrét hardvereszközéhez szükséges port meghatározásához.

## Eszközök figyelése

1. Nyissa meg a :FaRegEye: **Figyelt** párbeszédablakot, és nyomja meg az :FaPlus: **Új hozzáadása** gombot.
2. Adja meg a kapott **Figyelőkód** értéket, és nyomja meg a :FaCheck: **Mentés** gombot. Az eszköz megjelenik a térképen.

A figyelt eszközök listája csak az oldal címében tárolódik; ha meg szeretné őrizni, mentse a térképet a :FaRegMap: [Saját térképeim](#show=my-maps) közé.
