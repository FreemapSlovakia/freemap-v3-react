# Translation style

How the UI addresses the user, per language. The mechanics of the locale files
(templates, generated `*.messages.tsx`, `sync-language-files`) are in
[`AGENTS.md`](../AGENTS.md#translations).

## Address the user formally

Every language that distinguishes formal from informal address uses the formal
form. Mixing the two within a language reads as careless, so a new string follows
this table, not the tone of the English source.

Prefer a neutral wording that doesn't address the user at all where it reads as
naturally: "Žiadne aplikačné tokeny." over "Nemáte žiadne…". It is shorter and
avoids grammatical gender ("Boli ste prihlásený" assumes a man).

| Language | Form                        | Examples                                                   |
| -------- | --------------------------- | ---------------------------------------------------------- |
| `sk`     | vykanie, lowercase `vy/váš` | Zadajte číslo. · Uložte ich do svojich máp. · môžete       |
| `cs`     | vykání, lowercase `vy/váš`  | Zadejte číslo. · Chybu můžete nahlásit…                    |
| `de`     | `Sie`, capitalized          | Klicken Sie… · Ihr Konto · Melden Sie sich zuerst an       |
| `fr`     | `vous`                      | votre compte · Connectez-vous                              |
| `it`     | `Lei`, lowercase pronouns   | il suo account · può · clicchi · acceda                    |
| `pl`     | neutral, impersonal         | Brak dostępu premium. · można… · Czy na pewno usunąć mapę? |
| `hu`     | önözés                      | jelentkezzen be · Kérjük, ellenőrizze… · a fiókját         |
| `sl`     | vikanje                     | Vaš položaj · Zdaj se lahko prijavite… · izberite          |

- **Polish** avoids `Pan/Pani`, which reads stiffly in a UI. Rephrase without the
  pronoun; the plural `Państwo` only where nothing neutral works.
- **Short button and menu labels** may stay bare imperatives or infinitives where
  that is the language's UI norm — `it` (Salva, Aggiungi), `pl` (Zapisz,
  Kliknij), `sl` (Izberi, Shrani). Match the sibling labels in the same template.
- **Search keywords** (`search.commands.keywords`) are what users type, not text
  addressed to them; they keep whatever verb form people search with.
- **English** has no formal form; address the user as "you", plainly.
