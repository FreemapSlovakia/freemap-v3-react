---
title: Moje mapy
icon: FaRegMap
order: 580
---

Uložená mapa uchováva pod zvoleným názvom vo vašom účte to, čo ste umiestnili na mapu: [kresbu](#show=manual/drawing) a [trasy](#show=manual/tracks), naplánovanú trasu, sledované zariadenia, pripnuté výsledky vyhľadávania a body záujmu, spolu s mapovými vrstvami a pozíciou. Mapu si môžete znova otvoriť na ľubovoľnom zariadení, zdieľať odkazom a povoliť úpravy iným používateľom. Na ukladanie máp sa treba [prihlásiť](#show=login).

## Uloženie aktuálnej mapy

Otvorte :FaBars: **Hlavné menu** → :FaRegMap: **Moje mapy** (<kbd>g</kbd> <kbd>m</kbd>), stlačte :FaPlus: **Pridať novú mapu**, zadajte **Názov** a stlačte :FaSave: **Uložiť**. Do novej mapy sa uloží všetko, čo je práve na mape.

Keď sú trasy alebo kresba príliš veľké pre adresu stránky, na lište kreslenia sa zobrazí výstražný symbol :FaExclamationTriangle.text-warning: – takéto údaje sú len v tomto prehliadači. Cez :FaEllipsisV: → :FaSave: **Uložiť do mojich máp** na tejto lište ich rovnako uložíte ako novú mapu.

## Otvorená mapa

Kým je otvorená uložená mapa, hore na obrazovke je lišta s nápisom **Moja mapa** a názvom mapy:

- :FaRegMap: otvorí dialóg **Moje mapy**.
- :FaCalendarAlt: sa zobrazí, keď mapu používajú akcie. Otvorí akciu, alebo ich pri viacerých vypíše: najprv nadchádzajúce, potom minulé.
- :FaExclamationTriangle.text-warning: sa zobrazí, keď na mape niečo zmeníte – zmeny ešte nie sú uložené.
- :FaSave: **Uložiť** uloží zmeny do mapy. Na cudzej mape, ktorú upravovať nemôžete, otvorí formulár novej mapy a obsah uložíte ako novú vlastnú mapu.
- :FaSync: **Znovu načítať mapu** zahodí neuložené zmeny a otvorí mapu tak, ako bola naposledy uložená.
- :FaUnlink: **Odpojiť** zatvorí mapu a obsah nechá na obrazovke; :FaEraser: **Odpojiť a vyčistiť** zo šípky vedľa tlačidla obsah aj odstráni.

Neuložené zmeny v tomto prehliadači prežijú aj opätovné načítanie stránky, do mapy sa však dostanú iba uložením.

## Dialóg Moje mapy

Dialóg zobrazuje zoznam vašich máp a máp, pri ktorých vás iní pridali medzi editorov, s dátumom vytvorenia a poslednej zmeny; pole navrchu filtruje mapy podľa názvu. Pri cudzej mape je uvedený **Vlastník** a voľby **Všetky**, **Moje** a **Zdieľané so mnou** nad zoznamom ho obmedzia podľa vlastníka. :FaCog: → **Zoradenie** zoradí zoznam **Podľa názvu**, **Najnovšie vytvorené** alebo **Naposledy zmenené**.

Dlhý zoznam pomôžu roztriediť tagy. Pridáte ich v položke **Tagy** v okne :FaEdit: **Upraviť**; vidíte ich len vy, aj pri cudzej mape. Každý tag je nad zoznamom ako tlačidlo, posledné je **Bez tagu**. Stlačením tlačidla zostanú v zozname len mapy s týmto tagom, ďalším stlačením sa vrátia všetky. Dvojklik stlačí iba tento tag a ostatné uvoľní, :FaTimes: za tlačidlami uvoľní všetky. Ak je stlačených viac tagov, **Aspoň jeden** zobrazí mapy s niektorým z nich a **Všetky** mapy so všetkými. **Bez tagu** pridá mapy bez tagov; pri voľbe **Všetky** sa neponúka.

Mapy, ktoré už nepotrebujete, môžete odložiť: :FaCog: → **Skryté tagy** skryje všetky mapy s označeným tagom bez ohľadu na stlačené tlačidlá a tag stratí svoje tlačidlo. Riadok pod zoznamom uvádza, koľko máp je takto skrytých. Skryté tagy si dialóg pamätá v tomto prehliadači.

Pri každej mape sú:

- :FaCloudDownloadAlt: **Načítať** otvorí mapu s mapovými vrstvami a pozíciou. :FaShapes: **Načítať bez podkladovej mapy a pozície** v šípke vedľa tlačidla pridá iba obsah mapy a aktuálny pohľad nechá tak. Ak už na mape niečo je, zvolíte, či načítanú mapu **Pripojiť**, alebo existujúci obsah **Nahradiť**.
- :FaEdit: **Upraviť** – pri vlastnej mape zmena položiek **Názov** a **Editori**, pri každej mape **Tagy** a **Dostupné offline v tomto prehliadači**.
- :FaTrash: **Zmazať** (len pri vlastných mapách) mapu po potvrdení odstráni.

Na úzkej obrazovke sú niektoré z týchto volieb v ponuke :FaEllipsisV: v riadku mapy.

## Zdieľanie a editori

Kým je uložená mapa otvorená, odkaz na mapu je v adrese stránky. Každý, kto odkaz otvorí, mapu uvidí, aj bez prihlásenia. Používatelia, ktorých pridáte medzi **Editori** v okne :FaEdit: **Upraviť**, môžu do mapy ukladať aj svoje zmeny; ostatní si ju môžu uložiť len ako vlastnú mapu.

## Offline

Mapa označená ako **Dostupné offline v tomto prehliadači** sa otvorí aj bez pripojenia a v zozname má značku **Offline**. :FaCog: → :BiWifiOff: **Sprístupniť všetky offline** označí naraz všetky vaše mapy, :FaTimes: **Odstrániť všetky z offline** označenie zruší. Takto sa uchová len obsah mapy – podkladovú mapu treba stiahnuť samostatne, pozrite [Používanie offline](#show=manual/offline).

**Uložiť** funguje aj offline: zmeny zostanú v tomto prehliadači so značkou **Neodoslané** a odošlú sa, keď sa pripojenie obnoví, alebo cez :FaCog: → :FaCloudUploadAlt: **Odoslať neodoslané zmeny**. Ak sa mapa medzitým zmenila inde, značka ukazuje **Konflikt** a ponuka mapy v zozname obsahuje **Uložiť ako kópiu**, **Prepísať verziu na serveri** alebo **Zahodiť moje zmeny**.
