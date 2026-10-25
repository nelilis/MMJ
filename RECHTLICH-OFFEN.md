# Offene Angaben vor Veröffentlichung

Die Rechtstexte sind vorbereitet, aber noch nicht vollständig geprüft. Nicht als rechtliche Freigabe behandeln.

- Öffentlicher weiterer unmittelbarer Kontakt (z. B. Telefonnummer) fehlt im Impressum. ZVR-Zahl 1853085271 wurde vom Verein angegeben und übernommen.
- Hoster bestätigen; Datenschutzerklärung Abschnitt 2 um Anbieter, tatsächliche Protokollierung, Speicherdauer und gegebenenfalls Drittlandtransfer ergänzen.
- Vereinsname wurde exakt als „Panorama Compund Slopestyle Verein“ übernommen. Schreibweise mit Registerauszug abgleichen.
- Empfangsadresse auf Wunsch auf panoramacompound@gmail.com vereinheitlicht. Contest-Anmeldung bleibt ein E-Mail-Entwurf; Online-Haftungserklärungen gehen über FormSubmit an diese Adresse.
- 60 Tage Aufbewahrung wurden ab E-Mail-Eingang ausgelegt. Verein muss Löschung tatsächlich durchführen; Backups, Weiterleitungen und Zugriff der Organisatoren berücksichtigen. Bei frühen Anmeldungen kann diese Frist vor dem Event enden.
- Gmail-Vertragsgrundlage, Vereinszugriff und tatsächliche Verarbeitung/Übermittlungen prüfen. Ein Informationstext ersetzt keine erforderlichen Vereinbarungen oder Schutzmaßnahmen.
- Teilnahmebedingungen fehlen: Altersgrenze/Erziehungsberechtigte, Stichtag für 20 Teilnehmende, Wetterentscheidung, Absagekommunikation, Zahlung und Erstattung. Keine unbelegten Regelungen oder Haftungsausschlüsse eingefügt.
- Fotolizenzen und Rechte erkennbarer Personen bestätigen; erforderliche Bildnachweise ergänzen.
- Etwaige weitere Register-/Gewerbe-/Steuerangaben je nach Tätigkeit des Vereins prüfen.

Quellen:
- https://www.wko.at/ooe/wirtschaftsrecht-gewerberecht/das-korrekte-website-impressum-verein.pdf
- https://www.wko.at/datenschutz/eu-dsgvo-informationspflichten
- https://policies.google.com/privacy?hl=de
## Online-Haftungsausschluss – Einrichtung

- Originalvorlage liegt in `dist/formulare/haftungsausschluss-original.pdf`. Erklärungstext wurde aus der Vorlage übernommen. Eigene Seite unter `/haftungsausschluss/`, ohne Verlinkung von der Hauptseite, mit `noindex, nofollow` (kein Zugriffsschutz). Gezeichnete Unterschrift oder alternativ PNG-/JPG-Upload, Pflicht-Checkbox und bei Minderjährigen vollständiger Name der erziehungsberechtigten Person; keine qualifizierte elektronische Signatur. PDF wird lokal mit jsPDF 4.2.1 (unter `dist/assets/vendor/`, MIT-Lizenz im Bibliothekskopf) und eingebetteter lokaler Barlow-Schrift erzeugt. Es enthält Erklärungstext, Angaben, Unterschriftsbild und Dokument-ID. Vorschau/Download vor separater Versandbestätigung; jede Eingabeänderung verwirft die Freigabe. Das bestätigte PDF wird über multipart/form-data als Anhang versendet. Bei Minderjährigen Name und Bestätigung der erziehungsberechtigten Person. Die Identität wird technisch nicht überprüft.
- Versand über `https://formsubmit.co/panoramacompound@gmail.com` mit nativer POST-Übermittlung und der standardmäßigen Sicherheitsabfrage. Kein API-Schlüssel nötig.
- Nach Bereitstellung über HTTP(S) eine gekennzeichnete Testübermittlung durchführen, Aktivierungs-E-Mail im Empfängerpostfach bestätigen und danach eine weitere Übermittlung bis zum tatsächlichen E-Mail-Eingang prüfen. Hier wurde keine E-Mail ausgelöst. Ohne Aktivierung ist der Empfang nicht betriebsbereit.
- FormSubmit als zusätzlichen Verarbeiter vor Livebetrieb prüfen: Vereinbarungen, Anbieter/Verarbeitungsorte, Löschfristen und gegebenenfalls Übermittlungsgrundlagen konkretisieren. Die öffentlichen Anbieterhinweise reichen für diese Angaben nicht aus. Datenschutzhinweis beschreibt den technischen Ablauf; er ersetzt diese Prüfung nicht.
- Verein soll bestätigen, dass die elektronische Unterschrift anstelle der PDF-Unterschrift akzeptiert wird und wie lange Haftungserklärungen tatsächlich benötigt werden. Die bestehende Aufbewahrungsvorgabe von 60 Tagen wurde vorläufig beibehalten.

- Mobile PDF-Vorschau: Alle Seiten werden mit lokalem PDF.js 6.4.299 (Legacy-Build, Apache-2.0, Lizenz unter `dist/assets/vendor/pdfjs/LICENSE`) auf Canvas dargestellt. Kein eingebetteter Browser-PDF-Viewer nötig. Bei einem Darstellungsfehler bleiben Öffnen und Download zur vollständigen Prüfung verfügbar.

- Sprachwahl: DE/EN auf Hauptseite, Impressum, Datenschutz und Haftungsausschluss. Nur die Sprache wird im sessionStorage gespeichert; `?lang=de` / `?lang=en` erhält sie in internen Links. Der Sprachwechsel erhält Eingaben und Unterschrift, verwirft jedoch eine bestehende PDF-Freigabe. Das PDF wird einschließlich Erklärung und Beschriftungen in der gewählten Sprache erstellt. Das verlinkte Original-PDF bleibt deutsch.
