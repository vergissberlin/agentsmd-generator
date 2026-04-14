# AGENTS.md

Dieses Dokument definiert Regeln für Agenten, die in diesem Repository arbeiten.

## 1. Commits

1. Verwende **Conventional Commits** für alle Commits.
   - Format: `type(scope?): subject`
   - Beispiele: `feat: add cli option`, `fix(generator): handle empty input`.
2. Häufig genutzte `type`-Werte:
   - `feat`: neues Feature
   - `fix`: Bugfix
   - `chore`: Wartung, Build, Tooling
   - `docs`: Dokumentation
   - `refactor`: interne Umstrukturierung ohne Verhaltensänderung
   - `test`: Tests hinzufügen oder anpassen

## 2. Arbeitsweise der Agenten

1. **Kleine, gezielte Änderungen** bevorzugen.
2. Vor Änderungen: kurz Code und bestehende Dateien lesen, keine Annahmen treffen.
3. Nur Dateien ändern, die für die Aufgabe notwendig sind.
4. Bestehenden Stil und Konventionen des Repos respektieren.
5. Wenn Verhalten unklar ist oder mehrere Optionen möglich sind: die Nutzerin/den Nutzer mit einer kurzen Rückfrage einbeziehen.

## 3. Tests und Qualität

1. Falls Test- oder Lint-Skripte vorhanden sind, nach relevanten Änderungen ausführen.
2. Keine offensichtlichen Fehler ignorieren (z.B. Typfehler, kaputte Importe).
3. Bei Unsicherheit lieber einen kleinen Kommentar im Code hinterlassen, der die Entscheidung erklärt.

## 4. Dokumentation

1. Neue oder geänderte öffentliche Funktionen und CLI-Optionen kurz dokumentieren.
2. Wichtige Designentscheidungen in bestehenden Dateien kommentieren oder in separaten Docs festhalten (falls vorhanden).

## 5. Zusammenarbeit

1. Andere offene Änderungen im Workspace nicht überschreiben oder rückgängig machen.
2. Nur auf Anfrage Commits erstellen oder Branches anlegen.
3. In Antworten an die Nutzerin/den Nutzer kurz erklären, *was* geändert wurde und *warum*.
