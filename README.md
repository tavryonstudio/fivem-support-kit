# FiveM Support Kit — τεχνικό demo 0.1.0

Πρωτότυπο για πωλητές FiveM scripts: έλεγχος συγκεκριμένων απαιτήσεων και οργανωμένη αναφορά για ticket. Δεν είναι έτοιμο εμπορικό προϊόν ούτε αυτόματο εργαλείο επισκευής.

## Γρήγορη δοκιμή χωρίς FiveM

Με Node.js 18 ή νεότερο, από αυτόν τον φάκελο:

```sh
node test.js
```

Εκτελεί tests με προσομοιωμένα FiveM APIs και δημιουργεί το `sample-report.txt`. Τα αποτελέσματα είναι συνθετικά, όχι μέτρηση πραγματικού server.

## Εγκατάσταση σε δοκιμαστικό FiveM server

1. Αντιγράψτε τον φάκελο `support_kit` στο `resources/[local]/`.
2. Αντιγράψτε τους τρεις φακέλους μέσα στο `fixtures` στο ίδιο `[local]`.
3. Μην δημιουργήσετε resource `demo_missing`.
4. Στην κονσόλα του server εκτελέστε διαδοχικά:

```text
refresh
ensure demo_target
ensure demo_old
ensure support_kit
stop demo_stopped
supportcheck
```

Το `demo_stopped` πρέπει να είναι εγκατεστημένο αλλά σταματημένο. Μην κάνετε `ensure [local]` μετά το `stop`, επειδή θα το ξεκινήσει. Το demo δεν απαιτεί QBCore, ESX ή database.

Αναμένονται MISSING για demo_missing, NOT_STARTED για demo_stopped και UNSUPPORTED_VERSION για demo_old (δηλώνει 1.0.0 αντί για την απαιτούμενη 2.0.0).

Η εντολή εκτελείται μόνο από server console/RCON ή άλλον έμπιστο server resource, όχι από παίκτες. Η αναφορά εμφανίζεται μόνο στην κονσόλα. Δεν αποστέλλεται αυτόματα στο Discord.

## Ρύθμιση για άλλο προϊόν

Επεξεργαστείτε το `support_kit/requirements.json`: product, resource και λίστα dependencies. Το προαιρετικό `supportedVersions` είναι αυστηρή λίστα ακριβών strings, όχι εύρος semver. Την ορίζει ο πωλητής βάσει των δικών του δοκιμών. Απουσία version metadata δίνει UNKNOWN_VERSION, όχι επιβεβαιωμένη ασυμβατότητα. Μετά τη ρύθμιση, εκτελέστε ξανά `supportcheck`.

## Όρια και δεδομένα

- Διαβάζει μόνο κατάσταση και version metadata των δηλωμένων resources, μαζί με το δικό του JSON.
- Δεν διαβάζει server.cfg, credentials, logs, player identifiers ή βάση δεδομένων.
- Δεν αλλάζει αρχεία, δεν ξεκινά/stops resources και δεν κάνει εξωτερικά requests.
- Ελέγξτε ονόματα/metadata πριν κοινοποιήσετε την αναφορά. Δεν υπάρχει γενικός scrubber για αυθαίρετα δεδομένα που προσθέτει ένας developer στα metadata.
- MISSING σημαίνει μη καταχωρισμένο resource στο runtime: μπορεί να χρειάζεται refresh ή σωστό όνομα, όχι απαραίτητα download.
- Δεν ελέγχει SQL, exports, escrow, gameplay, performance, κρυφές dependencies, providers/aliases ή πλήρη συμβατότητα framework.
- OK σημαίνει μόνο ότι πέρασαν οι συγκεκριμένοι δηλωμένοι έλεγχοι τη στιγμή εκτέλεσης.
- Η κατάσταση του target εμφανίζεται στην κεφαλίδα· δεν συμπεραίνει αν λειτουργεί σωστά στο παιχνίδι.

## Επαλήθευση και επόμενο κριτήριο

Ο έλεγχος λογικής και ο adapter έχουν δοκιμαστεί τοπικά με mocks. Δεν έχει πραγματοποιηθεί δοκιμή μέσα σε FXServer ή GTA/FiveM client. Πριν από πραγματική διάθεση χρειάζονται δοκιμές σε server, αξιολόγηση ευχρηστίας από πωλητές και απόδειξη προθυμίας πληρωμής. Δεν υπάρχει υπόσχεση μείωσης tickets ή επιβεβαιωμένη τιμή πώλησης.

Προτεινόμενο πείραμα: 3 πωλητές να ρυθμίσουν μόνοι τους ένα προϊόν, να αξιολογήσουν την αναφορά και να δηλώσουν αν θα πλήρωναν. Αν όλοι απαιτούν custom integration, η ιδέα δεν ταιριάζει στον στόχο ελάχιστης επικοινωνίας.

## Πηγές API

- https://docs.fivem.net/docs/scripting-reference/resource-manifest/
- https://docs.fivem.net/natives/?_0x4039B485
- https://docs.fivem.net/natives/?_0x964BAB1D
- https://docs.fivem.net/docs/scripting-manual/migrating-from-deprecated/creating-commands/
