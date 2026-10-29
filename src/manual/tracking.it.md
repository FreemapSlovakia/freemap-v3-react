---
title: Tracciamento in tempo reale
icon: FaBullseye
order: 600
---

Con il tracciamento in tempo reale vede sulla mappa dove si trova in questo momento un telefono o un tracker GPS, insieme al percorso che ha fatto. Può condividere la sua posizione con altri e seguire i dispositivi che altri condividono con lei.

Lo apra dal :FaBars: menu principale con :FaBullseye: **Tracciamento in tempo reale** oppure con i tasti <kbd>g</kbd> <kbd>t</kbd>.

## Condividere la propria posizione

1. Acceda e apra :FaMobileAlt: **Miei dispositivi**.
2. Prema :FaPlus: **Aggiungi nuovo** e compili il campo **Nome**. Lasci vuoto il campo **Token**: verrà generato al salvataggio.
3. Configuri il telefono o il tracker con il token del dispositivo, che nell'elenco è riportato prima del nome del dispositivo. Veda la sezione seguente.
4. Per farsi seguire da qualcuno, scelga :FaKey: **Watch token** nel menu del dispositivo e prema :FaPlus: **Aggiungi nuovo**. Invii il token oppure il link copiato con :FaClipboard: **Copia URL**.

Tenga per sé il token del dispositivo: chiunque lo conosca può inviare posizioni a nome del suo dispositivo. Condivida invece i watch token.

## Configurazione del dispositivo

Freemap supporta due metodi per inviare la posizione del dispositivo.

### Metodo 1: Tracciamento con il protocollo HTTP nativo di Freemap

Usi questo metodo con app come [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) o [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (attivi la funzione **Online tracking** nelle impostazioni di Trip Recording).

Configuri l'URL di tracciamento nella sua app:

```
https://backend.freemap.sk/tracking/track/{token}
```

Sostituisca `{token}` con il token del suo dispositivo dall'[elenco dispositivi](#show=tracking-my).

L'indirizzo accetta HTTP `GET` o `POST` con i seguenti parametri:

| Parametro | Descrizione |
|---|---|
| `location` | Latitudine e longitudine in gradi separati da virgola **(obbligatorio, oppure `lat` e `lon`)** |
| `lat` | Latitudine in gradi |
| `lon` | Longitudine in gradi |
| `time`, `timestamp` | Data/ora interpretabile da JavaScript o Unix time in secondi o millisecondi |
| `alt`, `altitude` | Altitudine in metri |
| `speed` | Velocità in m/s |
| `speedKmh` | Velocità in km/h |
| `acc`, `accuracy` | Precisione in metri |
| `hdop` | DOP orizzontale |
| `bearing`, `heading` | Direzione in gradi |
| `battery`, `batt` | Livello batteria in percentuale |
| `gsm_signal` | Intensità segnale GSM in percentuale |
| `message` | Nota / messaggio |

### Metodo 2: Tracciamento tramite Traccar

Usi questo metodo con l'app [Traccar Client](https://www.traccar.org/client/), tracker GPS hardware dedicati (es. tracker per veicoli, asset tracker, tracker per animali) o altre app compatibili con Traccar come Locus Map o OsmAnd (per queste è però consigliato il tracciamento HTTP nativo di Freemap).

Configuri il suo dispositivo o la sua app per inviare a:

- **Server:** `traccar.freemap.sk`
- **Porta:** usi la porta standard per il protocollo del suo dispositivo (veda la [lista dispositivi Traccar](https://www.traccar.org/devices/)); per HTTP o HTTPS può usare le porte **80** o **443** invece di 5055 (HTTP)

Usi il suo **token dispositivo** (dall'[elenco dispositivi](#show=tracking-my)) come identificatore del dispositivo. Per Traccar Client, :SiTraccar: **Codice QR Traccar** nel menu del dispositivo mostra un codice: lo scansioni nell'app per configurarla con il token del suo dispositivo.

Traccar supporta oltre 200 protocolli: controlli la [lista dispositivi Traccar](https://www.traccar.org/devices/) per trovare la porta corretta per il suo hardware.

## Seguire dispositivi

1. Apra :FaRegEye: **Visto** e prema :FaPlus: **Aggiungi nuovo**.
2. Inserisca il **Watch Token** ricevuto e prema :FaCheck: **Salva**. Il dispositivo compare sulla mappa.

Un link che qualcuno ha condiviso con lei apre la mappa con il dispositivo di quella persona già seguito. L'elenco dei dispositivi seguiti è conservato solo nell'indirizzo della pagina; per mantenerlo, salvi la mappa in :FaRegMap: [Le mie mappe](#show=my-maps).
