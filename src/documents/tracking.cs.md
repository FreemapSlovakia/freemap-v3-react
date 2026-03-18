---
title: Nastavení sledování polohy zařízení
---

Freemap podporuje dva způsoby odesílání polohy vašeho zařízení.

---

## Metoda 1: Sledování nativním HTTP protokolem Freemap

Použijte tuto metodu s aplikacemi jako [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) nebo [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (zapněte funkci **Online tracking** v nastavení Trip Recording).

Nakonfigurujte URL sledování ve své aplikaci:

```
https://backend.freemap.sk/tracking/track/{token}
```

Nahraďte `{token}` tokenem vašeho zařízení z tabulky v [seznamu zařízení](#show=tracking-my).

Endpoint přijímá HTTP `GET` nebo `POST` s následujícími parametry:

| Parametr | Popis |
|---|---|
| `location` | Zeměpisná šířka a délka ve stupních oddělené čárkou **(povinné)** |
| `lat` | Zeměpisná šířka ve stupních **(povinné)** |
| `lon` | Zeměpisná délka ve stupních **(povinné)** |
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

---

## Metoda 2: Sledování přes Traccar

Použijte tuto metodu s aplikací [Traccar Client](https://www.traccar.org/client/), dedikovanými hardwarovými GPS trackery (např. autotrackery, sledovače majetku, sledovače domácích zvířat) nebo jinými aplikacemi kompatibilními s Traccarem, jako jsou Locus Map nebo OsmAnd (pro tyto je však doporučeno nativní HTTP sledování Freemap).

Nakonfigurujte své zařízení nebo aplikaci k odesílání na:

- **Server:** `traccar.freemap.sk`
- **Port:** použijte standardní port pro protokol vašeho zařízení (viz [seznam zařízení Traccar](https://www.traccar.org/devices/)); pro HTTP nebo HTTPS můžete použít porty **80** nebo **443** místo 5055 (HTTP)

Jako identifikátor zařízení použijte svůj **token zařízení** (ze [seznamu zařízení](#show=tracking-my)).

Traccar podporuje více než 200 protokolů — podívejte se na [seznam zařízení Traccar](https://www.traccar.org/devices/) a zjistěte správný port pro vaše konkrétní hardwarové zařízení.
