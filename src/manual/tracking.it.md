---
title: Tracciamento in tempo reale
icon: FaBullseye
order: 600
---

Con il tracciamento in tempo reale vede sulla mappa dove si trova in questo momento un telefono o un tracker GPS, insieme al percorso che ha compiuto. Può condividere la sua posizione con altri e seguire i dispositivi che altri condividono con lei.

Lo apra dal :FaBars: menu principale con :FaBullseye: **Tracciamento in tempo reale** oppure con i tasti <kbd>g</kbd> <kbd>t</kbd>.

## La barra degli strumenti

![La barra degli strumenti del tracciamento in tempo reale](./images/tracking-toolbar.en.webp)

- :FaRegEye: **Seguiti** – i dispositivi che segue (<kbd>g</kbd> <kbd>w</kbd>).
- :FaMobileAlt: **I miei dispositivi** – i suoi dispositivi che inviano la propria posizione (<kbd>g</kbd> <kbd>d</kbd>). È necessario aver effettuato l'accesso.
- :FaRegEye: **Visualizza** – mostra le tracce come **Punti**, **Linea** oppure **Linea + Punti**.
- :FaPalette: **Colora per** – colora le tracce in base a un valore registrato, come altitudine, velocità o tempo. Vengono proposti solo i valori presenti nelle tracce; alcune modalità richiedono l'accesso premium.
- :FaChartArea: **Profilo altimetrico** – disponibile quando una traccia contiene l'altitudine.
- :FaEllipsisV: – :MdShapeLine: **Copia in Tracce e dati** crea una copia modificabile delle tracce, che poi è possibile esportare. Il tracciamento prosegue.

## Condividere la propria posizione

1. Acceda e apra :FaMobileAlt: **I miei dispositivi**.
2. Prema :FaPlus: **Aggiungi nuovo** e compili il campo **Nome**. Se lascia vuoto il campo **Token di traccia**, verrà generato al salvataggio. **Numero massimo** e **Età massima** limitano quante posizioni vengono conservate e per quanto tempo.
3. Configuri il telefono o il tracker con il token del dispositivo, riportato nell'elenco prima del nome del dispositivo. Veda la sezione seguente.
4. Per farsi seguire da qualcuno, scelga :FaKey: **Token di osservazione** nel menu del dispositivo e prema :FaPlus: **Aggiungi nuovo**. **Da** e **A** delimitano il periodo coperto dal token, mentre **Note** serve ad annotare a chi lo ha dato. Invii il token oppure il link copiato con :FaClipboard: **Copia URL**, che apre la mappa con il suo dispositivo.

Tenga per sé il token del dispositivo: chiunque lo conosca può inviare posizioni a nome del suo dispositivo. Condivida invece i token di osservazione: può crearne uno per ciascuna persona ed eliminarlo per smettere di condividere.

## Configurazione del dispositivo

### Protocollo HTTP di Freemap

Lo usi con app come [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) o [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (attivi **Online tracking** nelle impostazioni di Trip Recording). Nell'app imposti come URL di tracciamento:

```
https://backend.freemap.sk/tracking/track/{token}
```

Sostituisca `{token}` con il token del suo dispositivo, che trova in :FaMobileAlt: [I miei dispositivi](#show=tracking-my).

L'indirizzo accetta HTTP `GET` o `POST` con i seguenti parametri:

| Parametro | Descrizione |
|---|---|
| `location` | Latitudine e longitudine in gradi, separate da una virgola **(obbligatorio, oppure `lat` e `lon`)** |
| `lat` | Latitudine in gradi |
| `lon` | Longitudine in gradi |
| `time`, `timestamp` | Data e ora interpretabili da JavaScript oppure tempo Unix in secondi o millisecondi |
| `alt`, `altitude` | Altitudine in metri |
| `speed` | Velocità in m/s |
| `speedKmh` | Velocità in km/h |
| `acc`, `accuracy` | Precisione in metri |
| `hdop` | DOP orizzontale |
| `bearing`, `heading` | Direzione in gradi |
| `battery`, `batt` | Livello della batteria in percentuale |
| `gsm_signal` | Intensità del segnale GSM in percentuale |
| `message` | Nota / messaggio |

### Traccar

Lo usi con l'app [Traccar Client](https://www.traccar.org/client/), con i tracker GPS hardware (per auto, per beni o per animali domestici) o con altre app compatibili con Traccar. Per Locus Map e OsmAnd è consigliato il protocollo HTTP di Freemap descritto sopra.

- **Server:** `traccar.freemap.sk`
- **Porta:** la porta standard del protocollo del suo dispositivo (veda l'[elenco dei dispositivi Traccar](https://www.traccar.org/devices/) – Traccar supporta oltre 200 protocolli); per HTTP o HTTPS può usare la porta **80** o **443** invece della 5055
- **Identificatore del dispositivo:** il token del suo dispositivo

Per Traccar Client c'è una scorciatoia: :SiTraccar: **Codice QR Traccar** nel menu del dispositivo mostra un codice; lo scansioni nell'app per configurarla con il token del suo dispositivo.

## Seguire dispositivi

1. Apra :FaRegEye: **Seguiti** e prema :FaPlus: **Aggiungi nuovo**.
2. Inserisca il **Token di osservazione** ricevuto. Facoltativamente imposti un'**Etichetta**, il **Colore** e la **Larghezza** della linea e quali posizioni mostrare: **Da**, **Età massima**, **Numero massimo**. **Distanza di divisione** e **Pausa di divisione** interrompono la linea dove due posizioni sono più distanti o più lontane nel tempo di tali valori.
3. Prema :FaCheck: **Salva**. Il dispositivo compare sulla mappa.

Un link che qualcuno ha condiviso con lei apre la mappa con il dispositivo di quella persona già seguito. Si possono seguire anche i propri dispositivi: :FaRegEye: **Guarda** nell'elenco dei token di osservazione di un dispositivo.

L'elenco dei dispositivi seguiti è conservato solo nell'indirizzo della pagina. Per mantenerlo, salvi la mappa in :FaRegMap: [Le mie mappe](#show=my-maps).

## Dispositivi sulla mappa

Ogni dispositivo è disegnato nel proprio colore; la sua ultima posizione è segnata dalla figura di una persona e, se il dispositivo la comunica, da un cerchio che ne indica la precisione. Le posizioni compaiono man mano che il dispositivo le invia. Puntando su una posizione se ne vedono l'ora e, se il dispositivo li invia, l'altitudine, la velocità, il segnale, la batteria e il messaggio.

Un clic su una traccia la seleziona. La sua barra degli strumenti contiene :FaPencil: **Modifica**, :FaTrash: **Elimina** per smettere di seguirla e :FaEllipsisV: per copiare solo questa traccia in Tracce e dati.

## Registratore GPS

Su Android, :FaCircle: **Registratore GPS** nel menu principale serve a registrare il proprio percorso con l'app separata Freemap GPS Recorder, così la registrazione prosegue anche a browser chiuso. È descritto nel capitolo [Registratore GPS](#show=manual/gps-recorder).
