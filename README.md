# Elli Bir — Spielregeln

**Elli Bir** ist ein Kartenspiel für **2 bis 7 Spieler**. Ziel ist es, als Erster alle Handkarten loszuwerden, indem du Kombinationen (**Per**) bildest und auslegst.

Diese Datei beschreibt die **aktuell in der App umgesetzten Regeln** (`src/engine/`). Abweichungen von regionalen Hausregeln sind am Ende aufgeführt.

---

## Spielziel

Wer als Erster **keine Karte mehr auf der Hand** hat, gewinnt die Runde. Alle anderen Spieler erhalten **Strafpunkte** für die Karten, die noch auf der Hand liegen (nach Abzug optimaler Pers — siehe [Strafpunkte](#strafpunkte)).

---

## Material

| Element | Wert |
|---|---|
| Spieler | 2 bis 7 |
| Kartensätze | 2 vollständige Französische Blätter (104 Karten) |
| Joker | 4 |
| Startkarten | **14** pro Spieler |
| Startspieler | erhält **1 Karte extra** → **15 Karten** |
| Nachziehstapel | alle übrigen Karten |
| Ablagestapel | eine offene Startkarte |
| Anzeigekarte | eine separate offene Karte (bestimmt den Tron) |

---

## Kartenwerte (Punkte)

| Karte | Punkte |
|---|---|
| 2 bis 10 | Zahlenwert (z. B. 7 = 7 Punkte) |
| Bube, Dame, König | je **10** Punkte |
| Ass | **1 oder 11** Punkte (vor Spielbeginn wählbar) |
| Joker (in der Hand) | Punktwert der **Tron-Karte** |
| Echte Tron-Karte (in der Hand) | Punktwert der **Tron-Karte** |

---

## Was ist ein Per?

Ein **Per** ist eine gültige Kombination aus **mindestens 3 Karten**. Es gibt zwei Arten:

### Satz (Set)

Drei oder vier Karten mit **demselben Wert** in **unterschiedlichen Farben**.

- Beispiel: ♥7 ♠7 ♦7
- Beispiel: ♣K ♥K ♠K ♦K
- Jede Farbe darf im Satz nur **einmal** vorkommen.
- Maximal **4** Karten pro Satz.

### Lauf (Run)

Drei bis dreizehn Karten **derselben Farbe** mit **aufeinanderfolgenden Werten**.

- Beispiel: ♣5 ♣6 ♣7
- Beispiel: ♥10 ♥B ♥D ♥K
- Das Ass kann **tief** (… Q–K–A) oder **hoch** (… J–Q–K–A bzw. A als 14) gezählt werden — der Lauf muss danach lückenlos sein.

---

## Vorbereitung

1. Jeder Spieler erhält **14 Karten**.
2. Ein **zufällig gewählter Startspieler** bekommt **eine zusätzliche Karte** (insgesamt **15**).
3. Eine Karte wird als **Anzeigekarte** offen neben die Stapel gelegt (kein Joker).
4. Eine weitere Karte startet den **Ablagestapel** (kein Joker, falls möglich).
5. Alle übrigen Karten bilden den **Nachziehstapel**.

Der **Startspieler** beginnt direkt in der **Auslage-Phase** (ohne vorher zu ziehen) und muss am Ende des Zuges eine Karte abwerfen.

---

## Spielablauf

Die Spieler sind **reihum** dran. Jeder Zug (außer dem allerersten Zug des Startspielers) hat diese Phasen:

### 1. Ziehen

Du musst **genau eine** Karte aufnehmen:

- die **oberste Karte vom Nachziehstapel**, oder
- die **oberste Karte vom Ablagestapel**.

Ist der Nachziehstapel leer, wird der Ablagestapel (ohne die oberste Karte) gemischt und als neuer Nachziehstapel verwendet.

### 2. Auslegen (optional)

Du darfst — musst aber nicht — Karten auslegen:

- **neue Pers** auf den Tisch legen, und/oder
- Karten an **bereits ausgelegte Pers** anlegen (eigene oder fremde).

### 3. Abwerfen

Am **Ende deines Zuges** legst du **genau eine Karte** offen auf den Ablagestapel. Erst dann ist der nächste Spieler dran.

**Sieg:** Hast du nach dem Auslegen **keine Handkarte mehr**, gewinnst du sofort — auch ohne Abwurf in diesem Zug.

Pers darfst du in der **verdeckten Ablage** sammeln. Sie erscheinen erst auf dem Tisch, wenn **keine Karte mehr auf deiner Hand** liegt. An bereits sichtbare Pers auf dem Tisch darfst du jederzeit anlegen.

### Verdeckte Ablage

- Wähle ein gültiges Per → **Per zur Ablage**.
- **Nur du** siehst die Karten in der Ablage — für Gegner bleiben sie verborgen, bis sie auf dem Tisch liegen.
- Verdeckte Pers zählen **0 Punkte** (keine Punktwert-Anzeige, keine Wertung in der Ablage).
- **Zurücknehmen:** Tippe ein Per in der Ablage an — die Karten kommen wieder in deine Hand.
- Sobald deine **Hand leer** ist (alle Karten in der Ablage oder nach Abwurf der letzten Karte), werden alle verdeckten Pers **aufgedeckt** und liegen sichtbar auf dem Tisch.
- An **bereits sichtbare** Pers (deine oder fremde) kannst du weiterhin Karten anlegen.

---

## Tron-Regeln

### Anzeigekarte und Tron

Die **Anzeigekarte** liegt separat vom Ablagestapel. Aus ihr ergibt sich der **Tron** — die nächsthöhere Karte **derselben Farbe**:

**Rangfolge:** 2 → 3 → … → 10 → Bube → Dame → König → Ass → 2

| Anzeigekarte | Tron |
|---|---|
| 2 bis Dame | nächsthöherer Rang, gleiche Farbe |
| König | Ass (gleiche Farbe) |
| Ass | 2 (gleiche Farbe) |

Beispiel: Anzeige 7♦ → Tron = **8♦**

### Joker und Tron-Karte in Pers

| Karte | Verhalten in Pers |
|---|---|
| **Echte Tron-Karte** | Kann **überall** als Platzhalter eingesetzt werden (voller Wildcard) |
| **Joker** | Zählt **nur als Tron-Karte** — und nur, wenn der Slot **genau** Tron (Farbe + Rang) braucht |

Beispiel bei Tron 8♦: Der Joker ersetzt nur eine fehlende **8♦**, nicht eine beliebige 8 oder eine beliebige Karo-Karte.

### Straf-Multiplikator (Farbe der Anzeigekarte)

| Farbe | Multiplikator |
|---|---|
| ♣ Kreuz | ×1 |
| ♠ Pik | ×2 |
| ♥ Herz | ×3 |
| ♦ Karo | ×4 |

---

## Strafpunkte

Verliert ein Spieler die Runde, werden seine Restkarten bewertet:

1. Aus der Hand werden **so viele gültige Pers wie möglich** gebildet (Sätze und Läufe, beliebige Länge ab 3).
2. Nur die **übrigen Karten** (Deadwood) werden punktemäßig addiert.
3. Diese Summe wird mit dem **Farb-Multiplikator** der Anzeigekarte multipliziert.

### Tron-Sieg

Gewinnt ein Spieler, indem er die **Tron-Karte oder einen Joker** abwirft, gilt für die Gegner-Strafpunkte ein **zusätzlicher Faktor ×2** (stapelt mit dem Farb-Multiplikator).

**Beispiel:** Anzeige ♥ (×3), Gegner hat 20 Deadwood-Punkte, Sieg per Tron-Abwurf → 20 × 3 × 2 = **120 Strafpunkte**.

---

## Kurzüberblick: ein Zug

```
Ziehen (1 Karte)
    ↓
Optional: Pers auslegen / anlegen
    ↓
Genau 1 Karte abwerfen → nächster Spieler
```

**Startspieler (15 Karten):** kein Ziehen → optional auslegen → abwerfen.

---

## App-Bedienung (Hotseat)

Mehrere Spieler teilen sich ein Gerät und geben es abwechselnd weiter.

1. Spieleranzahl (2–7), Namen, **Anzahl Runden** (1–10) und **Ass-Wert** (1 oder 11) einstellen.
2. **Spiel starten** — bei Zugwechsel erscheint der Übergabe-Screen → **Bereit** tippen.
3. **Ziehen:** Nachziehstapel oder Ablage antippen.
4. **Per zur Ablage:** Karten wählen → **Per zur Ablage** (verdeckt, bis Hand leer).
5. **Anlegen:** Karten wählen → sichtbares Per auf dem Tisch antippen.
6. **Zug beenden:** genau eine Karte wählen → **Abwerfen & Zug beenden**.
7. Handkarten per **Drag & Drop** umsortieren.

**Kartenvorschau:** `http://localhost:5173/?preview=cards`

---

## Technik & Entwicklung

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Regel-Tests
npm run build    # Produktions-Build
```

| Bereich | Technologie |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Spiel-Logik | `src/engine/` (reines TypeScript, UI-unabhängig) |
| State | Zustand |
| Tests | Vitest |

---

## In dieser App vs. regionale Varianten

Diese Version verwendet bewusst:

- 14 Startkarten (+1 für Startspieler)
- 2 Decks + 4 Joker
- Pers in verdeckter Ablage; sichtbar erst bei leerer Hand
- Tron mit Anzeigekarte, Joker nur als exakter Tron-Slot
- Ass wählbar (1 oder 11)
- Hotseat-Modus (kein Online-Multiplayer)

Abweichungen von euren Hausregeln können später als Einstellungen ergänzt werden.
