---
title: Configurazione del tracciamento della posizione del dispositivo
---

Freemap supporta due metodi per inviare la posizione del dispositivo.

---

## Metodo 1: Tracciamento con il protocollo HTTP nativo di Freemap

Usa questo metodo con app come [Locus Map](https://docs.locusmap.eu/doku.php?id=manual:user_guide:functions:live_tracking#custom_live_tracking) o [OsmAnd](https://osmand.net/docs/user/plugins/trip-recording/#recording-settings) (attiva la funzione **Online tracking** nelle impostazioni di Trip Recording).

Configura l'URL di tracciamento nella tua app:

```
https://backend.freemap.sk/tracking/track/{token}
```

Sostituisci `{token}` con il token del tuo dispositivo dalla tabella nell'[elenco dispositivi](#show=tracking-my).

L'endpoint accetta HTTP `GET` o `POST` con i seguenti parametri:

| Parametro | Descrizione |
|---|---|
| `location` | Latitudine e longitudine in gradi separati da virgola **(obbligatorio)** |
| `lat` | Latitudine in gradi **(obbligatorio)** |
| `lon` | Longitudine in gradi **(obbligatorio)** |
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

---

## Metodo 2: Tracciamento tramite Traccar

Usa questo metodo con l'app [Traccar Client](https://www.traccar.org/client/), tracker GPS hardware dedicati (es. tracker per veicoli, asset tracker, tracker per animali) o altre app compatibili con Traccar come Locus Map o OsmAnd (per queste è però consigliato il tracciamento HTTP nativo di Freemap).

Configura il tuo dispositivo o app per inviare a:

- **Server:** `traccar.freemap.sk`
- **Porta:** usa la porta standard per il protocollo del tuo dispositivo (vedi [lista dispositivi Traccar](https://www.traccar.org/devices/)); per HTTP o HTTPS puoi usare le porte **80** o **443** invece di 5055 (HTTP)

Usa il tuo **token dispositivo** (dall'[elenco dispositivi](#show=tracking-my)) come identificatore del dispositivo.

Traccar supporta oltre 200 protocolli — controlla la [lista dispositivi Traccar](https://www.traccar.org/devices/) per trovare la porta corretta per il tuo hardware specifico.
