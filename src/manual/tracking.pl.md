---
title: Śledzenie na żywo
icon: FaBullseye
order: 600
---

Dzięki śledzeniu na żywo na mapie widać, gdzie w tej chwili znajduje się telefon lub tracker GPS, wraz z przebytą trasą. Można udostępniać innym własną pozycję i obserwować urządzenia udostępnione przez innych.

Otwiera się je w :FaBars: menu głównym jako :FaBullseye: **Śledzenie na żywo** lub klawiszami <kbd>g</kbd> <kbd>t</kbd>.

## Pasek narzędzi

![Pasek narzędzi śledzenia na żywo](./images/tracking-toolbar.en.webp)

- :FaRegEye: **Obserwowane** – obserwowane urządzenia (<kbd>g</kbd> <kbd>w</kbd>).
- :FaMobileAlt: **Moje urządzenia** – własne urządzenia wysyłające swoją pozycję (<kbd>g</kbd> <kbd>d</kbd>). Wymaga zalogowania.
- :FaRegEye: **Widok** – rysowanie tras jako **Punkty**, **Linia** lub **Linia + Punkty**.
- :FaPalette: **Koloruj według** – kolorowanie tras według zarejestrowanej wartości, np. wysokości, prędkości lub czasu. Dostępne są tylko wartości zawarte w trasach; niektóre tryby wymagają dostępu premium.
- :FaChartArea: **Profil wysokościowy** – wyświetlany, gdy trasa zawiera wysokość.
- :FaEllipsisV: – :MdShapeLine: **Kopiuj do narzędzia Trasy i dane** tworzy edytowalną kopię tras, którą można następnie wyeksportować. Śledzenie trwa dalej.

## Udostępnianie własnej pozycji

1. Po zalogowaniu otworzyć :FaMobileAlt: **Moje urządzenia**.
2. Nacisnąć :FaPlus: **Dodaj nowy** i wypełnić pole **Nazwa**. Jeśli pole **Token** pozostanie puste, token zostanie wygenerowany po zapisaniu. **Maksymalna liczba** i **Maksymalny wiek** ograniczają, ile pozycji jest przechowywanych i jak długo.
3. Skonfigurować telefon lub tracker z tokenem urządzenia – na liście jest podany przed nazwą urządzenia. Zob. następną sekcję.
4. Aby ktoś mógł obserwować pozycję, wybrać w menu urządzenia :FaKey: **Tokeny śledzenia** i nacisnąć :FaPlus: **Dodaj nowy**. Pola **Od** i **Do** ograniczają okres, którego dotyczy token, a w polu **Notatka** można zapisać, komu został przekazany. Następnie przekazać token lub link skopiowany przyciskiem :FaClipboard: **Skopiuj URL**, który otwiera mapę z urządzeniem.

Token urządzenia należy zachować dla siebie – każdy, kto go zna, może wysyłać pozycje w imieniu urządzenia. Do udostępniania służą tokeny śledzenia: dla każdej osoby można utworzyć osobny i usunąć go, aby zakończyć udostępnianie.

## Konfiguracja urządzenia

### Protokół HTTP Freemap

Ten sposób jest przeznaczony dla aplikacji takich jak [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) lub [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (w ustawieniach Trip Recording należy włączyć **Online tracking**). Jako URL śledzenia należy ustawić w aplikacji:

```
https://backend.freemap.sk/tracking/track/{token}
```

`{token}` należy zastąpić tokenem urządzenia z :FaMobileAlt: [Moje urządzenia](#show=tracking-my).

Adres akceptuje HTTP `GET` lub `POST` z następującymi parametrami:

| Parametr | Opis |
|---|---|
| `location` | Szerokość i długość geograficzna w stopniach oddzielone przecinkiem **(wymagane, albo `lat` i `lon`)** |
| `lat` | Szerokość geograficzna w stopniach |
| `lon` | Długość geograficzna w stopniach |
| `time`, `timestamp` | Data i czas w formacie zrozumiałym dla JavaScriptu lub czas uniksowy w sekundach albo milisekundach |
| `alt`, `altitude` | Wysokość w metrach |
| `speed` | Prędkość w m/s |
| `speedKmh` | Prędkość w km/h |
| `acc`, `accuracy` | Dokładność w metrach |
| `hdop` | Pozioma DOP |
| `bearing`, `heading` | Kierunek w stopniach |
| `battery`, `batt` | Poziom naładowania baterii w procentach |
| `gsm_signal` | Siła sygnału GSM w procentach |
| `message` | Notatka / wiadomość |

### Traccar

Ten sposób jest przeznaczony dla aplikacji [Traccar Client](https://www.traccar.org/client/), sprzętowych trackerów GPS (samochodowych, do ochrony mienia czy dla zwierząt) oraz innych aplikacji zgodnych z Traccarem. Dla Locus Map i OsmAnd zalecany jest opisany wyżej protokół HTTP Freemap.

- **Serwer:** `traccar.freemap.sk`
- **Port:** standardowy port protokołu danego urządzenia (zob. [listę urządzeń Traccar](https://www.traccar.org/devices/) – Traccar obsługuje ponad 200 protokołów); dla HTTP lub HTTPS można zamiast 5055 użyć portu **80** lub **443**
- **Identyfikator urządzenia:** token urządzenia

Dla Traccar Client jest skrót: :SiTraccar: **Kod QR Traccar** w menu urządzenia wyświetla kod; po zeskanowaniu go w aplikacji zostanie ona skonfigurowana z tokenem urządzenia.

## Obserwowanie urządzeń

1. Otworzyć :FaRegEye: **Obserwowane** i nacisnąć :FaPlus: **Dodaj nowy**.
2. Wpisać otrzymany **Token śledzenia**. Opcjonalnie można ustawić **Etykieta**, **Kolor** i **Szerokość** linii oraz to, które pozycje mają być wyświetlane: **Od**, **Maks. wiek**, **Maks. liczba**. **Podział odległości** i **Podział czasu** przerywają linię tam, gdzie dwie pozycje dzieli większa odległość lub dłuższy czas niż podana wartość.
3. Nacisnąć :FaCheck: **Zapisz**. Urządzenie pojawi się na mapie.

Link udostępniony przez kogoś otwiera mapę z jego urządzeniem już obserwowanym. Obserwować można także własne urządzenia: :FaRegEye: **Śledź** na liście tokenów śledzenia urządzenia.

Lista obserwowanych urządzeń jest zapisana tylko w adresie strony. Aby ją zachować, należy zapisać mapę w :FaRegMap: [Moje mapy](#show=my-maps).

## Urządzenia na mapie

Każde urządzenie jest rysowane w swoim kolorze, a jego ostatnią pozycję oznacza sylwetka człowieka oraz – jeśli urządzenie ją podaje – okrąg pokazujący dokładność. Pozycje pojawiają się w miarę, jak urządzenie je wysyła. Po wskazaniu pozycji wyświetla się jej czas oraz – jeśli urządzenie je wysyła – wysokość, prędkość, sygnał, poziom baterii i wiadomość.

Kliknięcie trasy ją zaznacza. Jej pasek narzędzi zawiera :FaPencil: **Edytuj**, :FaTrash: **Usuń**, które kończy obserwowanie, oraz :FaEllipsisV: do skopiowania tylko tej trasy do narzędzia Trasy i dane.

## Rejestrator GPS

Na Androidzie pozycja :FaCircle: **Rejestrator GPS** w menu głównym służy do nagrywania własnej trasy za pomocą osobnej aplikacji Freemap GPS Recorder, dzięki czemu nagrywanie trwa także po zamknięciu przeglądarki. Opisuje ją rozdział [Rejestrator GPS](#show=manual/gps-recorder).
