# Elli Bir

**Elli Bir** ist ein Kartenspiel f?r 2 bis 4 Spieler. Ziel ist es, als Erster alle Karten loszuwerden, indem du Kombinationen (**Per**) bildest und auslegst.

Dieses Repository enth?lt eine digitale Version als **React-Webapp** (aktuell im **Hotseat-Modus**: mehrere Spieler teilen sich ein Ger?t und geben es abwechselnd weiter).

---

## Spiel starten

```bash
npm install
npm run dev
```

Dann im Browser ?ffnen: [http://localhost:5173](http://localhost:5173)

> **Hinweis:** Falls `node` oder `npm` nicht gefunden werden, muss Node.js installiert sein oder im PATH liegen.

---

## Spielziel

Wer als Erster **alle Handkarten ausgelegt** hat und **keine Karte mehr auf der Hand** h?lt, gewinnt die Runde. Die ?brigen Spieler z?hlen die Punkte ihrer verbleibenden Handkarten als **Strafpunkte**.

---

## Material

| Element | In dieser App |
|---|---|
| Spieler | 2 bis 4 |
| Kartens?tze | 2 vollst?ndige S?tze (104 Karten) |
| Joker | 4 |
| Startkarten pro Spieler | 14 |
| Nachziehstapel | alle ?brigen Karten |
| Ablagestapel | eine offene Startkarte |

---

## Was ist ein ?Per??

Ein **Per** ist eine g?ltige Kombination aus **mindestens 3 Karten**. Es gibt zwei Arten:

### 1. Satz (gleicher Wert, verschiedene Farben)

Drei oder vier Karten mit **demselben Wert**, aber in **unterschiedlichen Farben**.

Beispiele:

- ?7 ? ?7 ? ?7
- ?K ? ?K ? ?K ? ?K

Jede Farbe darf im Satz nur **einmal** vorkommen.

### 2. Lauf (aufeinanderfolgende Werte, gleiche Farbe)

Drei oder mehr Karten **derselben Farbe** mit **aufeinanderfolgenden Werten**.

Beispiele:

- ?5 ? ?6 ? ?7
- ?10 ? ?B ? ?D ? ?K
- ?Q ? ?K ? ?A (Ass kann auch hoch gez?hlt werden)

---

## Joker (mit Tron)

Joker z?hlen als **Tron-Karte** (z. B. bei Tron 8? ist der Joker die 8?). Sie passen nur in Pers, wenn der Slot **genau diese Karte** braucht. Details siehe [Tron-Regeln](#tron-regeln).

---

## Punktwerte

| Karte | Punkte |
|---|---|
| 2 bis 10 | Zahlenwert (z. B. 7 = 7 Punkte) |
| Bube, Dame, K?nig | je 10 Punkte |
| Ass | **1 oder 11 Punkte** (vor Spielbeginn festlegen) |
| Joker (in der Hand) | Tron-Punktwert |

---

## Vorbereitung

1. Jeder Spieler erh?lt **14 Karten**.
2. Die restlichen Karten bilden den **Nachziehstapel**.
3. Eine Karte wird **offen** daneben gelegt und startet den **Ablagestapel** (kein Joker als Startkarte).

---

## Spielablauf

Die Spieler sind **reihum** dran. In deinem Zug gehst du in dieser Reihenfolge vor:

### 1. Karte ziehen

Du musst **genau eine** Karte aufnehmen:

- die **oberste Karte vom Nachziehstapel**, oder
- die **oberste Karte vom Ablagestapel** (die offen liegende Karte).

### 2. Kombinationen auslegen (optional)

Falls m?glich, darfst du jetzt Karten aus deiner Hand auslegen:

- als neues **Per** auf den Tisch, oder
- an ein **bereits ausgelegtes Per** anlegen (siehe unten).

Du musst in diesem Schritt **nicht** auslegen ? du darfst auch direkt abwerfen.

### 3. Eine Karte abwerfen

Am **Ende deines Zuges** legst du **genau eine Karte** offen auf den Ablagestapel. Erst dann ist der n?chste Spieler dran.

> Du kannst nicht mit dem Abwerfen deiner letzten Karte gewinnen, wenn du in dem Zug noch keine Karte gezogen hast. Gewonnen wird, wenn nach dem Auslegen **keine Handkarte mehr ?brig** ist.

---

## Er?ffnung

Bevor du **zum ersten Mal** Karten auslegen darfst, musst du die **Er?ffnung** schaffen:

- Sammle ein oder mehrere g?ltige Pers in der Auslage-Vorbereitung.
- Lege sie dann **auf einmal** auf den Tisch (**Er?ffnen**).
- Erst danach giltst du als **er?ffnet**.

**Beispiel f?r eine g?ltige Er?ffnung:**

- Satz ?K ?K ?K = ein Per
- Du kannst auch mehrere Pers gleichzeitig aufdecken, z. B. zus?tzlich ?7 ?7 ?7

Bis zur Er?ffnung darfst du **keine einzelnen Pers** auslegen und **nichts an bestehende Pers anlegen**.

---

## Nach der Er?ffnung

Sobald du er?ffnet hast, darfst du in sp?teren Z?gen:

- **weitere neue Pers** auslegen,
- **Karten an bestehende Pers anlegen** (eigene oder fremde), sofern die Kombination danach noch g?ltig ist.

Beispiele f?rs Anlegen:

- ?8 an den Lauf ?5 ? ?6 ? ?7
- ?9 an den Satz ?9 ? ?9 ? ?9

---

## Spielende & Strafpunkte

- Die Runde endet, sobald ein Spieler **alle Karten ausgelegt** hat.
- Dieser Spieler **gewinnt** die Runde.
- Alle anderen z?hlen **Strafpunkte** f?r ihre Restkarten (siehe Tron-Regeln).

---

## Tron-Regeln

### Anzeigekarte & Tron

Zu Beginn jeder Runde wird eine **Anzeigekarte** offen neben den Stapeln gelegt (separat vom Ablagestapel). Daraus ergibt sich der **Tron**:

**Rangfolge:** 2 ? 3 ? 4 ? 5 ? 6 ? 7 ? 8 ? 9 ? 10 ? Bube ? Dame ? K?nig ? Ass

| Anzeigekarte | Tron (gleiche Farbe) |
|---|---|
| 2 ? Dame | n?chsth?herer Rang |
| K?nig | Ass |
| Ass | 2 |

Beispiel: Anzeige 7? ? Tron = 8?

### Joker & Tron-Karte in Pers

| Karte | Verhalten |
|---|---|
| **Echte Tron-Karte** | ?berall in Pers einsetzbar (voller Ersatz) |
| **Joker** | Z?hlt nur als Tron-Karte, **nur wenn der Slot genau passt** |

### Straf-Multiplikator (Farbe der Anzeigekarte)

| Farbe | Multiplikator |
|---|---|
| ? Kreuz | ?1 |
| ? Pik | ?2 |
| ? Herz | ?3 |
| ? Karo | ?4 |

**Strafberechnung f?r Verlierer:**

1. Aus der Resthand werden g?ltige **Dreier-Pers** gebildet (so viele Karten wie m?glich)
2. **Nur ?brige Karten** werden punktem??ig addiert
3. Summe ? Farb-Multiplikator (?2 zus?tzlich bei **Tron-Abwurf-Sieg**)

### Sonderstrafen

- **-100 Punkte:** Ein anderer er?ffnet, du h?ttest aus deiner Hand ebenfalls er?ffnen k?nnen (mindestens ein g?ltiges Per), hast es aber nicht getan
- **Tron-Sieg:** Gewinn durch Abwerfen der Tron-Karte (oder Joker) ? Gegner-Strafpunkte ?2 (stapelt mit Farb-Multiplikator)

---

## So spielst du die App (Hotseat)

1. **Spieleranzahl** (2?4) und **Namen** eintragen.
2. **Ass-Wert** w?hlen: 1 oder 11 Punkte.
3. Auf **?Spiel starten?** klicken.
4. Wenn der Zug wechselt, erscheint ein **?bergabe-Screen** ? gib das Ger?t an den n?chsten Spieler weiter und tippe auf **?Bereit?**.
5. **Karten antippen**, um sie auszuw?hlen.
6. **Ziehen:** Nachziehstapel oder Ablage antippen.
7. **Er?ffnung:** Karten w?hlen ? ?Per zur Auslage? ? wiederholen ? ?Er?ffnen?.
8. **Nach Er?ffnung:** Pers auslegen oder an bestehende Pers anlegen (Per antippen).
9. **Zug beenden:** genau eine Karte w?hlen ? ?Abwerfen & Zug beenden?.

Handkarten lassen sich per **Drag & Drop** umsortieren.

---

## Technischer ?berblick

| Bereich | Technologie |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Animationen | Framer Motion |
| Drag & Drop | dnd-kit |
| State | Zustand |
| Tests | Vitest |
| Geplant | Firebase / Firestore f?r Online-Multiplayer |

Die **Spielregeln** liegen in `src/engine/` als reine TypeScript-Logik ? unabh?ngig von UI und Backend, damit sie sp?ter serverseitig validiert werden kann.

```bash
npm test      # Regel-Tests ausf?hren
npm run build # Produktions-Build
```

---

## Regionale Varianten

Es gibt viele regionale Abweichungen bei Elli Bir (Startkarten, Joker-Regeln, Punktwerte). Diese App verwendet aktuell:

- 14 Startkarten
- 2 Decks + 4 Joker
- Eröffnung mit Auslage-Vorbereitung (mindestens ein Per)
- Tron-Regeln mit Anzeigekarte und Farb-Multiplikator
- Ass w?hlbar (1 oder 11)

Abweichungen von eurer Hausregel k?nnen sp?ter als Einstellungen erg?nzt werden.