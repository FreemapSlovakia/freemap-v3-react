---
title: Śledzenie na żywo
icon: FaBullseye
order: 600
---

Dzięki śledzeniu na żywo na mapie widać, gdzie w tej chwili znajduje się telefon lub tracker GPS, wraz z przebytą trasą. Można udostępniać innym własną pozycję i obserwować urządzenia udostępnione przez innych.

Otwiera się je w :FaBars: menu głównym jako :FaBullseye: **Śledzenie na żywo** lub klawiszami <kbd>g</kbd> <kbd>t</kbd>.

## Udostępnianie własnej pozycji

1. Po zalogowaniu otworzyć :FaMobileAlt: **Moje urządzenia**.
2. Nacisnąć :FaPlus: **Dodaj nowy** i wypełnić pole **Nazwa**. Pole **Token** można zostawić puste – zostanie wygenerowany po zapisaniu.
3. Skonfigurować telefon lub tracker z tokenem urządzenia – na liście jest podany przed nazwą urządzenia. Zob. następną sekcję.
4. Aby ktoś mógł obserwować pozycję, wybrać w menu urządzenia :FaKey: **Tokeny śledzenia** i nacisnąć :FaPlus: **Dodaj nowy**. Następnie przekazać token lub link skopiowany przyciskiem :FaClipboard: **Skopiuj URL**.

Token urządzenia należy zachować dla siebie – każdy, kto go zna, może wysyłać pozycje w imieniu urządzenia. Do udostępniania służą tokeny śledzenia.

## Konfiguracja urządzenia

Freemap obsługuje dwie metody wysyłania lokalizacji urządzenia.

### Metoda 1: Śledzenie natywnym protokołem HTTP Freemap

Tej metody używa się z aplikacjami takimi jak [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) lub [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (należy włączyć funkcję **Online tracking** w ustawieniach Trip Recording).

URL śledzenia w aplikacji:

```
https://backend.freemap.sk/tracking/track/{token}
```

`{token}` należy zastąpić tokenem urządzenia z [listy urządzeń](#show=tracking-my).

Adres akceptuje HTTP `GET` lub `POST` z następującymi parametrami:

| Parametr | Opis |
|---|---|
| `location` | Szerokość i długość geograficzna w stopniach oddzielone przecinkiem **(wymagane, albo `lat` i `lon`)** |
| `lat` | Szerokość geograficzna w stopniach |
| `lon` | Długość geograficzna w stopniach |
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

### Metoda 2: Śledzenie przez Traccar

Tej metody używa się z aplikacją [Traccar Client](https://www.traccar.org/client/), dedykowanymi sprzętowymi trackerami GPS (np. trackery samochodowe, asset trackery, trackery dla zwierząt) lub innymi aplikacjami kompatybilnymi z Traccarem, jak Locus Map lub OsmAnd (dla tych zalecane jest jednak natywne śledzenie HTTP Freemap).

Urządzenie lub aplikację należy skonfigurować do wysyłania na:

- **Serwer:** `traccar.freemap.sk`
- **Port:** standardowy port dla protokołu urządzenia (zob. [lista urządzeń Traccar](https://www.traccar.org/devices/)); dla HTTP lub HTTPS można użyć portów **80** lub **443** zamiast 5055 (HTTP)

Jako identyfikator urządzenia służy **token urządzenia** (z [listy urządzeń](#show=tracking-my)). Dla Traccar Client :SiTraccar: **Kod QR Traccar** w menu urządzenia pokazuje kod; po zeskanowaniu go w aplikacji zostanie ona skonfigurowana z tokenem urządzenia.

Traccar obsługuje ponad 200 protokołów — właściwy port dla danego sprzętu można znaleźć na [liście urządzeń Traccar](https://www.traccar.org/devices/).

## Obserwowanie urządzeń

1. Otworzyć :FaRegEye: **Obserwowane** i nacisnąć :FaPlus: **Dodaj nowy**.
2. Wpisać otrzymany **Token śledzenia** i nacisnąć :FaCheck: **Zapisz**. Urządzenie pojawi się na mapie.

Link udostępniony przez kogoś otwiera mapę z jego urządzeniem już obserwowanym. Lista obserwowanych urządzeń jest zapisana tylko w adresie strony; aby ją zachować, należy zapisać mapę w :FaRegMap: [Moje mapy](#show=my-maps).
