---
title: AI asistenti
icon: FaRobot
order: 870
---

Pre AI asistentov je k dispozícii popis Freemapu a v prehliadači, ktorý to podporuje, aj sada nástrojov na priame ovládanie mapy.

## Otázky asistentovi o Freemape

Na adrese [www.freemap.sk/llms.txt](https://www.freemap.sk/llms.txt) je popis Freemapu určený pre AI asistentov, ako sú ChatGPT, Claude či Gemini. Odkazuje na ďalšie časti, ktoré opisujú všetky funkcie, všetky mapové vrstvy a parametre odkazu na Freemap. Asistent vďaka tomu dokáže:

- vysvetliť, ako niečo vo Freemape urobiť,
- zostaviť odkaz, ktorý otvorí Freemap so značkami, čiarami či plochami, s naplánovanou trasou, so zvolenými mapovými vrstvami alebo na konkrétnom mieste a priblížení.

Dajte asistentovi adresu a položte otázku, napríklad:

> Prečítaj si https://www.freemap.sk/llms.txt a povedz mi, ako vo Freemape exportovať naplánovanú trasu do GPX.

> Prečítaj si https://www.freemap.sk/llms.txt a sprav odkaz na Freemap so značkami na vrcholoch Kriváň, Rysy a Gerlachovský štít nad turistickou mapou.

Asistent musí vedieť otvárať webové stránky. Ak to nevie, skopírujte text stránky do konverzácie. Odkaz, ktorý dostanete, otvorte a skontrolujte – aj asistent sa môže mýliť.

## Ovládanie mapy asistentom (WebMCP)

[WebMCP](https://github.com/webmachinelearning/webmcp) je navrhovaný webový štandard, cez ktorý webová stránka sprístupňuje nástroje AI agentovi bežiacemu vo vašom prehliadači. Freemap má nástroje na:

- presun mapy na miesto, priblíženie na zadanú oblasť a prepínanie mapových vrstiev,
- vyhľadávanie miest a zobrazenie výsledku na mape,
- naplánovanie trasy cez zadané body vrátane dĺžky, času, popisu odbočení a stúpania,
- zobrazenie objektov (bodov záujmu) zvolených kategórií a zistenie, čo sa nachádza v danom bode,
- pridávanie značiek, kreslenie čiar a plôch, výpis a odstránenie nakreslených prvkov,
- zistenie nadmorskej výšky z modelu terénu,
- uloženie toho, čo je na mape, do GPX, GeoJSON alebo KML,
- otvorenie nástroja či okna, v ktorom budete pokračovať ručne, a vyčistenie mapy.

Čo nimi agent zmení, to uvidíte na mape, rovnako ako keby ste klikali sami.

### Zapnutie WebMCP v Chrome

WebMCP je experimentálna funkcia a postup sa môže zmeniť. K októbru 2026 podľa [dokumentácie WebMCP pre Chrome](https://developer.chrome.com/docs/ai/webmcp):

1. V Chrome na počítači otvorte `chrome://flags/#enable-webmcp-testing`, nastavte položku na **Enabled** a Chrome reštartujte.
2. Nainštalujte agenta, ktorý vie volať nástroje WebMCP. Dokumentácia uvádza dve rozšírenia, obe nezávislé od Gemini v Chrome: [Model Context Tool Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd), do ktorého zadáte vlastný API kľúč ku Gemini, a ukážkové [rozšírenie WebMCP](https://github.com/GoogleChromeLabs/webmcp-extension).

Pred začatím si v dokumentácii overte aktuálny stav.

### Používanie

Otvorte [www.freemap.sk](https://www.freemap.sk/), otvorte agenta a napíšte, čo chcete, napríklad:

> Ukáž mi Nízke Tatry na turistickej mape s turistickými trasami.

> Naplánuj cyklotrasu z Banskej Bystrice na Donovaly a povedz mi, aké je celkové stúpanie.

> Nájdi chaty v aktuálnom výreze mapy a označ tú, ktorá je najbližšie k stredu mapy.

Tam, kde agent skončil, môžete pokračovať ručne.
