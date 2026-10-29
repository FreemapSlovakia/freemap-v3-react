---
title: Sledování
icon: FaBullseye
order: 600
---

Se sledováním vidíte na mapě, kde se právě nachází telefon nebo GPS tracker, spolu s cestou, kterou urazil. Můžete tak sdílet svou polohu s ostatními a sledovat zařízení, která s vámi sdílejí jiní.

Otevřete ho v :FaBars: hlavním menu jako :FaBullseye: **Sledování** nebo klávesami <kbd>g</kbd> <kbd>t</kbd>.

## Sdílení vlastní polohy

1. Přihlaste se a otevřete :FaMobileAlt: **Moje zařízení**.
2. Stiskněte :FaPlus: **Přidat nové** a zadejte **Název**. Pole **Token** nechte prázdné, vygeneruje se po uložení.
3. Nastavte telefon nebo tracker s tokenem zařízení – v seznamu je uveden před názvem zařízení. Viz následující část.
4. Má-li vás někdo sledovat, vyberte v menu zařízení :FaKey: **Sledovací tokeny** a stiskněte :FaPlus: **Přidat nové**. Pošlete mu token nebo odkaz zkopírovaný tlačítkem :FaClipboard: **Kopírovat URL**.

Token zařízení si nechte pro sebe – kdokoli, kdo ho má, může jménem vašeho zařízení posílat polohy. Sdílejte raději sledovací tokeny.

## Nastavení zařízení

Freemap podporuje dva způsoby odesílání polohy vašeho zařízení.

### Metoda 1: Sledování nativním HTTP protokolem Freemap

Použijte tuto metodu s aplikacemi jako [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) nebo [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (zapněte funkci **Online tracking** v nastavení Trip Recording).

Nakonfigurujte URL sledování ve své aplikaci:

```
https://backend.freemap.sk/tracking/track/{token}
```

Nahraďte `{token}` tokenem vašeho zařízení ze [seznamu zařízení](#show=tracking-my).

Adresa přijímá HTTP `GET` nebo `POST` s následujícími parametry:

| Parametr | Popis |
|---|---|
| `location` | Zeměpisná šířka a délka ve stupních oddělené čárkou **(povinné, nebo `lat` a `lon`)** |
| `lat` | Zeměpisná šířka ve stupních |
| `lon` | Zeměpisná délka ve stupních |
| `time`, `timestamp` | JavaScriptem parsovatelné datum a čas nebo Unix čas v sekundách nebo milisekundách |
| `alt`, `altitude` | Nadmořská výška v metrech |
| `speed` | Rychlost v m/s |
| `speedKmh` | Rychlost v km/h |
| `acc`, `accuracy` | Přesnost v metrech |
| `hdop` | Horizontální DOP |
| `bearing`, `heading` | Azimut ve stupních |
| `battery`, `batt` | Úroveň baterie v procentech |
| `gsm_signal` | Síla GSM signálu v procentech |
| `message` | Poznámka / zpráva |

### Metoda 2: Sledování přes Traccar

Použijte tuto metodu s aplikací [Traccar Client](https://www.traccar.org/client/), dedikovanými hardwarovými GPS trackery (např. autotrackery, sledovače majetku, sledovače domácích zvířat) nebo jinými aplikacemi kompatibilními s Traccarem, jako jsou Locus Map nebo OsmAnd (pro tyto je však doporučeno nativní HTTP sledování Freemap).

Nakonfigurujte své zařízení nebo aplikaci k odesílání na:

- **Server:** `traccar.freemap.sk`
- **Port:** použijte standardní port pro protokol vašeho zařízení (viz [seznam zařízení Traccar](https://www.traccar.org/devices/)); pro HTTP nebo HTTPS můžete použít porty **80** nebo **443** místo 5055 (HTTP)

Jako identifikátor zařízení použijte svůj **token zařízení** (ze [seznamu zařízení](#show=tracking-my)). Pro Traccar Client zobrazí :SiTraccar: **Traccar QR kód** v menu zařízení kód; jeho naskenováním v aplikaci ji nastavíte s tokenem vašeho zařízení.

Traccar podporuje více než 200 protokolů — podívejte se na [seznam zařízení Traccar](https://www.traccar.org/devices/) a zjistěte správný port pro vaše konkrétní hardwarové zařízení.

## Sledování zařízení

1. Otevřete :FaRegEye: **Sledované** a stiskněte :FaPlus: **Přidat nové**.
2. Zadejte **Sledovací token**, který jste dostali, a stiskněte :FaCheck: **Uložit**. Zařízení se objeví na mapě.

Odkaz, který s vámi někdo sdílel, otevře mapu již se sledováním jeho zařízení. Seznam sledovaných zařízení je uložen jen v adrese stránky; chcete-li si ho ponechat, uložte mapu do :FaRegMap: [Mých map](#show=my-maps).
