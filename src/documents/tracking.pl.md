---
title: Konfiguracja śledzenia lokalizacji urządzenia
---

Freemap obsługuje dwie metody wysyłania lokalizacji urządzenia.

---

## Metoda 1: Śledzenie natywnym protokołem HTTP Freemap

Użyj tej metody z aplikacjami takimi jak [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) lub [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (włącz funkcję **Online tracking** w ustawieniach Trip Recording).

Skonfiguruj URL śledzenia w swojej aplikacji:

```
https://backend.freemap.sk/tracking/track/{token}
```

Zastąp `{token}` tokenem urządzenia z tabeli na [liście urządzeń](#show=tracking-my).

Endpoint akceptuje HTTP `GET` lub `POST` z następującymi parametrami:

| Parametr | Opis |
|---|---|
| `location` | Szerokość i długość geograficzna w stopniach oddzielone przecinkiem **(wymagane)** |
| `lat` | Szerokość geograficzna w stopniach **(wymagane)** |
| `lon` | Długość geograficzna w stopniach **(wymagane)** |
| `time`, `timestamp` | Data/czas interpretowalny przez JavaScript lub czas Unix w sekundach lub milisekundach |
| `alt`, `altitude` | Wysokość w metrach |
| `speed` | Prędkość w m/s |
| `speedKmh` | Prędkość w km/h |
| `acc`, `accuracy` | Dokładność w metrach |
| `hdop` | Pozioma DOP |
| `bearing`, `heading` | Kierunek w stopniach |
| `battery`, `batt` | Poziom baterii w procentach |
| `gsm_signal` | Siła sygnału GSM w procentach |
| `message` | Notatka / wiadomość |

---

## Metoda 2: Śledzenie przez Traccar

Użyj tej metody z aplikacją [Traccar Client](https://www.traccar.org/client/), dedykowanymi sprzętowymi trackerami GPS (np. trackery samochodowe, asset trackery, trackery dla zwierząt) lub innymi aplikacjami kompatybilnymi z Traccarem, jak Locus Map lub OsmAnd (dla tych zalecane jest jednak natywne śledzenie HTTP Freemap).

Skonfiguruj swoje urządzenie lub aplikację do wysyłania na:

- **Serwer:** `traccar.freemap.sk`
- **Port:** użyj standardowego portu dla protokołu urządzenia (zob. [lista urządzeń Traccar](https://www.traccar.org/devices/)); dla HTTP lub HTTPS możesz użyć portów **80** lub **443** zamiast 5055 (HTTP)

Jako identyfikator urządzenia użyj swojego **tokenu urządzenia** (z [listy urządzeń](#show=tracking-my)).

Traccar obsługuje ponad 200 protokołów — sprawdź [listę urządzeń Traccar](https://www.traccar.org/devices/), aby znaleźć właściwy port dla swojego sprzętu.
