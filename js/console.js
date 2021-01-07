// Ausführung wenn alles geladen wurde:
document.addEventListener('DOMContentLoaded', function() {   // als Eventhandler, mit }); am Ende
//window.onload = function(){                                            // als Funktion, mit } am Ende

    // toggling console:
    document.addEventListener('keydown', toggleConsoleKey);
    function toggleConsoleKey(e){
        if (e.keyCode === 0){
            toggleConsole();
        }
    }

    document.getElementById('terminalAccess').addEventListener('click', toggleConsole);
    function toggleConsole(){
        let holeconsole = document.getElementById('consoleposition');
        if (holeconsole.style.display == "flex") {
            holeconsole.style.display="none";
        } else {
            holeconsole.style.display="flex";
        }
    }


    // EVENTHANDLER:
    // =============

    //document.getElementById('consoleoverlay').addEventListener('click', setFocus);	// Focus bei Klick auf Konsolen-Fenster immer auf Befehlseingabefeld
    document.getElementById('consoleoverlay').addEventListener('click', function(e){
        document.getElementById('consoleoverlay').style.display = "none";
    });	// Focus bei Klick auf Konsolen-Fenster immer auf Befehlseingabefeld
    document.getElementById('consolegrafic').addEventListener('click', setFocus);	// Focus bei Klick auf Konsolen-Fenster immer auf Befehlseingabefeld
    var cmd = document.getElementById('cmd');                    // Eingabeformular-Objekt
    cmd.addEventListener('keydown', keyhandler);                     // Eventhandler für Tastendruck
    cmd.addEventListener('keyup', shifthandler);                     // Eventhandler für das loslassen einer Taste (für den Fall dass SHIFT involviert ist)
    cmd.addEventListener('input', setinput);                         // Eventhandler für Änderung im Eingabefeld (vollständig, da auswertung nach Keyup)

    // Konsolen-Link-Behandlung:  todo: non-URL-Links klicken ans laufen bringen

    var orderlinks = document.querySelectorAll('.order');
    console.log(orderlinks);
    orderlinks.forEach((item)=>{
        //console.log(item.id);   // check
        item.addEventListener('click', function(event){
            console.log(event.target.id);
            alert(event.target.id);
            //append(event.target.id.slice(1, event.target.id.length));
        });
    });

    /*    // Event-Bubbling-Ansatz:
        const allLinks = document.querySelector('.orders');
        body.addEventListener('click', event => {
            if (event.target !== allLinks) {
                return;
            }
                console.log(event);
                alert("I'm so clicked");
        })
    */


    // GLOBALE VARIABLEN:
    // ==================

    // Links
    var linkelemente = document.getElementsByClassName("links"); // Array aller Links (mit der css-Klasse links) auf der Seite
    var linknamen = [];                                                    // Array der Link-Texte, um diese als Befehl verwenden zu können
    for (let i=0; i<linkelemente.length; i++) linknamen[i] = linkelemente[i].text.slice(1, linkelemente[i].text.length-1);  // Beschneidung derer um eckige Klammern zu entfernen
    // Kommandos und Eingabe
    var cmdin = document.getElementById("cmdin");                 // Eingabefeld-Objekt
    var commands = ["help", "about", "profile", "projects", "websites", "exit", "quit", "clear", "cls"];   // Liste möglicher Kommandos (muss mit entsprechenden node-IDs korrespondieren)
    commands.sort();
    //var prompts = ["$ ", "> ", "% ", ": ", "- ", "# "];                  // $: standard, #: root    todo: verschiedene Prompts implementieren, die je nach Kontext wechseln
    var allcommands = commands.concat(linknamen);                          // Liste aller möglichen Eingabebefehle
    var lastcommands = [];      // Liste zuletzt eingegebener Kommandos
    var commandhistorypos = 0;  // Stelle in der Befehlseingabenhistorie (bei Benutzung von Pfeil-hoch/-runter)
    var shift = false;          // SHIFT gedrückt?
    var input = "";             // vollständige aktuelle Eingabe
    var typedinput = "";        // vollständiges Kommando
    // Autovervollständigung
    var autofills = [];         // Array für gefundene Autovervollständigungen
    var autofillPos = 0;        // Arrayposition der zuletzt gefundenen passenden Ergänzung zur Eingabe
    var autofilLen = 0;         // Anzahl der Zeichen die ergänzt wurden
    var tab = 0;                // Anzahl der Tabulator-drücke


    // FUNKTIONEN:
    // ===========

    function setinput(e){       // komplette Eingabe in input-Variable verfügbar machen
        input = e.target.value;
    }

    function setFocus() {       // Focus auf das Eingabefeld setzen
        document.getElementById("cmdin").focus();
    }

    function shifthandler(key){ // registrieren, ob Shift-Taste wieder losgelassen wurde
        if(key.keyCode === 16){
            shift = false;
            console.log("SHIFT losgelassen");
        }
    }

    // Funktionen für Keyhandler:

    // Automatische Befehlsvervollständigung                        todo: ans funktionieren bekommen
    function autocomplete(select){
        typedinput = input;                                              // speichere aktuellen Inhalt des Eingafeldes zwischen
        let inputlow = typedinput.toLowerCase();                         // Eingabefeld-Inhalt in Kleinbuchstaben
        let inputlen = typedinput.length;                                // Textlänge des Eingabefeld-Inhalts
        console.log("Autocomplete von " + inputlow);                     // prüfe ob Text in Eingabefeld mit Anfang eines Befehls übereinstimmt
        autofills =  allcommands.filter(com => com.startsWith(inputlow));// finde alle Befehle, die mit den eingegebenen Buchstaben beginnen
        console.log(autofills.length + " mögliche Befehle gefunden");
        autofilLen = autofills[autofillPos].length - inputlen;           // speichere die Anzahl der Buchstaben der Ergänzung
        document.getElementById("cmdin").value += autofills[autofillPos].slice(inputlen, autofills[autofillPos].length);
        console.log("Ergänzung von " + autofillPos+1 + ". Befehl");
        if (select) cmdin.setSelectionRange(inputlen, autofills[autofillPos].length, "backward"); // markiere die Ergänzung
    }

    function autocompleteReset(){
        typedinput = "";
        autofills = null;
        autofillPos = 0;
        autofilLen = 0;
        tab = 0;
    }

    // Tastendruck auswerten (keydown)

    function keyhandler(key) {                                  // Tastatureingabe auswerten
        console.log(key.keyCode);
        switch (key.keyCode) {

            case 0:
                toggleConsole();
                break;

            case 16:
                console.log("SHIFT...");
                shift = true;
                break;

            case 27:
                console.log("ESC");
                if (autofilLen > 0){                            // Autovervollständigung abbrechen und zurücksetzen, falls aktiv, ...
                    input=typedinput;
                    document.getElementById("cmdin").value = typedinput;
                    autocompleteReset();
                } else {
                    cmd.reset();                                // ...ansonsten Eingabefeld löschen
                }
                break;

            case 8:
                console.log("BACKDEL");
                if (autofilLen > 0) {
                    key.preventDefault();
                    document.getElementById("cmdin").value = typedinput;
                    autocompleteReset();
                }
                break;

            case 9:
                key.preventDefault();
                console.log("TAB");
                if (input.length > 0) {
                    if (shift) tab--;
                    else tab++;
                    autocomplete(false);                 // Autocomplete mit Tabulator (ohne Markierung)
                }
                if (shift) {                                   // zähle die automatischen Ergänzungen runter oder runter
                    if (autofillPos >= 0) autofillPos--;
                    else autofillPos = autofills.length-1;
                } else {
                    if (autofillPos < autofills.length) autofillPos++;
                    else autofillPos = 0;
                }
                break;

            case 38:
                key.preventDefault();
                console.log("ARROW UP");
                if (lastcommands.length > 0){
                    console.log(lastcommands.toString());
                    document.getElementById("cmdin").value = lastcommands[commandhistorypos];
                }
                commandhistorypos++;
                console.log(commandhistorypos);
                break;

            case 40:
                key.preventDefault();
                console.log("ARROW DOWN");
                if (commandhistorypos > 0){
                    document.getElementById("cmdin").value = lastcommands[commandhistorypos];
                    commandhistorypos--;
                }
                break;

            case 13:
                key.preventDefault();
                console.log("ENTER");
                readCmd();
                autocompleteReset();
                break;

            default:
                /*
                if (input.length > 2) {
                    autocomplete(true);         // Autocomplete bei Eingabe von mehr als 2 Buchstaben (mit Markierung)
                }
                */
        }
    }

    // Funktionen für readCMD:

    function append(ID) {                                  // Textbaustein auf die Konsole schreiben
        console.log(ID + " wird in Ausgabe geschrieben")
        let newOrder = document.getElementById(ID).cloneNode(true);
        newOrder.style.display="block";
        newOrder.className="prompted";
        let newElement = document.createElement("div");
        newElement.append(newOrder);
        document.getElementById("console").appendChild(newElement);
        cmd.scrollIntoView(false);
    }

    function appendCMD(cmd){                                // Befehlszeile in die Konsole schreiben
        let newOrder = document.getElementById("promptmessage").cloneNode(true);
        newOrder.style.display="block";
        newOrder.className="prompted";
        let newElement = document.createElement("div");
        newElement.append(newOrder);
        newElement.innerHTML += "$ ";
        newElement.innerHTML += cmd;
        document.getElementById("console").appendChild(newElement);
    }

    function clear(){                                       // die Konsole leeren
        let con = document.getElementById("console");
        let toDelete = con.childNodes;
        for(let i=toDelete.length-1; i>=0; i--){
            toDelete[i].remove();
            console.log(toDelete[i]);
        }
        console.log("Ausgabe gelöscht");
    }

    function openURL(url){                                 // Öffnen der Seite in neuem Fenster
        window.open(url);
    }


    // Eingabebefehl auswerten:
    function readCmd() {

        console.log(typedinput + " wurde eingegeben, " + input + " wurde verwendet.");
        command = input.toLowerCase();                      // String aus Eingabfeld in Kleinbuchstaben zur weiteren Verarbeitung speichern
        input = "";                                         // Eingabe-Variable und Eingabefeld leeren, sowie weitere Variablen zurück setzen...
        cmd.reset();
        tab = 0;
        commandhistorypos = 0;
        appendCMD(command);                                 // Das eingegebene Kommando in das Konsolenfenster schreiben
        if (linknamen.includes(command)) {                  // falls Eingabe ein Link, Link auswerten
            lastcommands.push(command);
            var linkindex = linknamen.indexOf(command);
            console.log(command + "-Seite wird geöffnet. (Link-Index: " + linkindex + ")");
            openURL(linkelemente[linkindex].href);
        } else {
            if (commands.includes(command)) {               // falls Eingabe ein Befehle, Befehl auswerten
                console.log(command + "-befehl erkannt");
                lastcommands.push(command);                 // Befehl in die Kommando-Historie aufnehmen
                switch (command) {                          // cases für Funktionsbefehle, default für Textbausteine
                    case "clear":
                    case "cls":
                        clear();
                        break;
                    case "exit":
                    case "quit":
                        clear();
                        appendCMD(command);
                        append(command);
                        cmd.remove();
                        setTimeout(toggleConsole, 4000);
                        break;
                    case "commands":

                    default:
                        append(command);
                        break;
                }
            } else {
                console.log("befehl nicht vorhanden");      // Falls Eingabe unbekannt, fehler ausgeben
                append("error");
            }
        }
    }

    // Begrüßungsbotschaft beim laden in die Konsole schreiben:
    append("welcome");
    setFocus();
});