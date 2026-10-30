---
title: GPS zaznamenávač
icon: FaCircle
order: 610
---

GPS zaznamenávač slúži na nahrávanie vlastnej trasy na telefóne s Androidom. Záznam vytvára samostatná aplikácia Freemap GPS Recorder, takže nahrávanie pokračuje, aj keď prehliadač zatvoríte; vo Freemape vidíte trasu naživo na mape a ovládate nahrávanie.

Otvoríte ho v :FaBars: hlavnom menu ako :FaCircle: **GPS zaznamenávač**. Ponúka sa len na Androide – na iných zariadeniach v menu nie je, pretože aplikácia zaznamenávača beží len tam.

Ak chcete zdieľať svoju polohu s inými, pozrite [Sledovanie](#show=manual/tracking).

## Inštalácia zaznamenávača

Stlačte :FaCircle: **Nahrávať**. Ak aplikácia zaznamenávača nie je nainštalovaná, stiahne sa inštalačný súbor; otvorením súboru aplikáciu nainštalujete. Android sa môže najprv opýtať, či povolíte inštaláciu aplikácií z prehliadača.

Keď sa aplikácia zaznamenávača otvorí, povoľte, o čo žiada – presnú polohu, polohu na pozadí a upozornenia – a vyňte ju z optimalizácie batérie. Bez toho môže Android dlhé nahrávanie zastaviť.

## Nahrávanie

- :FaCircle: **Nahrávať** spustí nahrávanie. Ak aplikácia zaznamenávača nie je spustená, tlačidlo ju otvorí, nahrávanie sa spustí a vrátite sa do prehliadača.
- :FaPause: **Pozastaviť** nahrávanie pozastaví. Opätovným stlačením :FaCircle: **Nahrávať** pokračuje ten istý záznam novým úsekom, ktorý sa vykreslí s medzerou, nie s priamou čiarou cez prestávku.
- :FaStop: **Ukončiť** záznam ukončí – pozrite nižšie.
- :FaTrash: **Zmazať záznam** záznam zahodí. Zobrazí sa, len keď sa práve nenahráva.
- :FaChartArea: **Výškový profil** zobrazí profil doterajšej trasy s prerušením pri každej prestávke. Objaví sa, keď záznam obsahuje nadmorskú výšku.
- :FaCog: **Nastavenia záznamu** – pozrite nižšie.

Záznam sa na mape vykreslí ako čiara, červená, kým farbu nezmeníte, s vyznačenou poslednou polohou. Kliknutím na čiaru otvoríte nástroj. Počas nahrávania :FaRegDotCircle: **Kde som?** ukazuje polohu zo zaznamenávača, ak to v nastaveniach nevypnete.

## Údaje o zázname

Tlačidlo v strede lišty nástroja ukazuje vzdialenosť a trvanie záznamu. Po stlačení tlačidla sa zobrazia všetky údaje: vzdialenosť, trvanie, nadmorská výška, stúpanie, rýchlosť, priemerná rýchlosť, presnosť, satelity, počet bodov a úsekov a čas posledného bodu. Zaškrtnuté hodnoty sa zobrazia aj na lište; ak nie je zaškrtnuté nič, tlačidlo ukazuje len :FaInfoCircle:.

Bodka pri údajoch je zelená, kým mapa ukazuje záznam naživo, a sivá, keď nie. Točiace sa koliesko namiesto bodky znamená, že prebieha pripájanie k zaznamenávaču alebo načítanie trasy, a údaje sa dovtedy nemenia. Samotné nahrávanie pritom pokračuje.

## Lišta počas nahrávania

Počas nahrávania sa lišta nástroja nedá zatvoriť, len zbaliť tlačidlom :FaAngleLeft: **Zbaliť**. Z lišty zostane pásik s blikajúcou :FaCircle.text-danger: červenou bodkou, aby bolo vidno, že telefón nahráva. Stlačením bodky zobrazíte údaje o zázname, :FaAngleRight: **Rozbaliť** vráti celú lištu. Po pozastavení bodka prestane blikať; pásik zmizne, keď sa nenahráva a nástroj je zatvorený.

## Ukončenie záznamu

:FaStop: **Ukončiť** sa najprv opýta, potom nahrávanie zastaví a trasu presunie do nástroja :MdShapeLine: **Kreslenie a dáta**, kde si môžete pozrieť výškový profil trasy, vyfarbiť ju, upraviť a vyexportovať – pozrite [Trasy a súbory](#show=manual/tracks). Ak už Kreslenie a dáta niečo obsahujú, zvolíte **Pripojiť** (pridať trasu k existujúcim údajom) alebo **Nahradiť**.

V aplikácii zaznamenávača potom nezostane nič, takže v ukončenom zázname sa už pokračovať nedá a ďalšie nahrávanie začne novú trasu.

- Ak sa časť záznamu na stránku ešte nedostala, nič sa neprevezme ani nezmaže. Počkajte na spojenie a ukončite záznam znova.
- Ak prehliadač nedokáže trasu spoľahlivo uložiť, trasa je v Kreslení a dátach, ale zostane aj v aplikácii zaznamenávača. Trasu vyexportujte alebo uložte a potom záznam zmažte.

## Zmazanie záznamu

:FaTrash: **Zmazať záznam** sa najprv opýta a potom zmaže celú trasu v aplikácii zaznamenávača. Túto akciu nemožno vrátiť späť. Ak si trasu chcete ponechať, použite namiesto toho :FaStop: **Ukončiť**.

## Nastavenia záznamu

**Čo sa zaznamenáva** platí od ďalšieho spustenia nahrávania:

- **Čas medzi meraniami** – ako často sa zaznamená poloha, v sekundách.
- **Minimálna vzdialenosť medzi meraniami** – v metroch.
- **Zahodiť merania s presnosťou horšou ako** – v metroch; ak pole necháte prázdne, ponechajú sa všetky merania.
- **Zdroj polohy** – **GPS prijímač** meria nadmorskú výšku pri každom meraní; **Kombinovaný (GPS, wifi a senzory)** určí polohu lepšie medzi budovami a pod stromami, ale tú istú výšku opakuje aj niekoľko sekúnd.
- **Presnosť** – voľba medzi presnosťou a spotrebou batérie. Týka sa len kombinovaného zdroja.

**Zobrazenie**:

- **Začať nový úsek po prestávke** – v minútach; dlhšia prestávka sa vykreslí a exportuje ako medzera. Ak pole necháte prázdne, záznam sa nedelí.
- **Použiť záznam pre „Kde som?“** – keď je vypnuté, :FaRegDotCircle: **Kde som?** používa vlastné sledovanie GPS prehliadača.
- **Nechať obrazovku zapnutú počas nahrávania**.
- Farba a šírka čiary.

:FaCheck: **Uložiť** zmeny uloží, :FaUndo: **Obnoviť predvolené** vráti predvolené hodnoty.

## Keď niečo nefunguje

Problémy so zaznamenávačom sa zobrazia v hlásení nad mapou spolu s tlačidlom, ktoré pomôže:

- **Zaznamenávač neodpovedal — možno nie je spustený.** Aplikácia bola zatvorená alebo ju zastavil Android. Stlačte **Otvoriť zaznamenávač**; ak aplikácia nie je nainštalovaná, **Nainštalovať zaznamenávač**.
- **Zaznamenávač zatiaľ nemôže nahrávať — otvorte ho a udeľte, o čo žiada.** Stlačte **Otvoriť zaznamenávač** a povoľte, o čo aplikácia žiada.
- **Zaznamenávač nemusí prežiť dlhé nahrávanie** so zoznamom toho, čo chýba – povolenie, výnimka z optimalizácie batérie alebo krok, ktorý vyžaduje výrobca telefónu. **Otvoriť zaznamenávač** vás dovedie tam, kde to nastavíte.
- **Android nedovolil zaznamenávaču spustiť sa z pozadia.** Spustite nahrávanie v aplikácii zaznamenávača alebo aplikácii povoľte bežať bez obmedzení batérie.
- **Prehliadač odmietol prístup k lokálnej sieti.** Spojenie s aplikáciou zaznamenávača vedie len v rámci telefónu, prehliadač ho však považuje za lokálnu sieť a žiada o povolenie. Bez povolenia mapa nezobrazuje záznam naživo, ale nahrávanie pokračuje. Stlačte **Pripojiť** a prístup povoľte.
- **Zaznamenávač je pre túto verziu mapy príliš starý.** Stlačte **Aktualizovať zaznamenávač**.
