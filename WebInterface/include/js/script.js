//events (mieux que window.event=function)
if(window.addEventListener) {
    window.addEventListener("load",onLoadPage,false);
    window.addEventListener("hashchange",loadPage,false);
} else if (window.attachEvent) {
    window.attachEvent("onload",onLoadPage);
    window.attachEvent("onhashchange",loadPage);
}

var consoleScrollEnd = true;


function onLoadPage() {
    if(navigator.appName != "Netscape")//Chrome, Edge, Firefox, Opéra, (IE11?)
        alert("Warning: this site is maybe not avaiable in this browser");
    //opéra : tout semble fonctionner
    //firefox : il arrive qu'il y ai des bugs (?)
    //edge : pas de scrollbar avec la version 18204//nouveau edge : fonctionne bien //https://caniuse.com/#feat=css-scrollbar
    addLog("command", "Initialisation de la console...");
    
    
    
    loadPage();
    $("#consoleLine").on('keyup', function (e) {
        if (e.keyCode === 13) {//enter
            var command = this.value;
            if (command == "")
                return;
            this.value = "";//clear

            addLog("command", command);
            newCommand(command);
        }
    });
    $("#consoleLine").on('keydown', function (e) {
        if (e.keyCode == 9) {//tab
            return false;//auto compltation ?
        }
    });
    $("#console").on("scroll", function (e) {
        var maxScroll = $("#console")[0].scrollHeight - $("#console").outerHeight();
        consoleScrollEnd = (($("#console").scrollTop()+128) > maxScroll);//on perd ou on gagne le scroll
    });
    $("#darkmodeClicker").on("click", function (e) {
        setDarkMode(!$("#darkmodeChecker")[0].checked);
    });
    setDarkMode(localStorage.getItem('darkmode'));

    initControlClient();
}
function setDarkMode(enabled) {
    document.getElementById("darkmodeSwitcher").setAttribute("darkmode", enabled);
    localStorage.setItem('darkmode', enabled);/*https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Client-side_storage#Basic_syntax*/
    if (typeof(enabled) == "string") {
        $("#darkmodeChecker")[0].checked = (enabled=="true");
    }
}
function loadPage() {
    var elementFocus = window.location.href;
    elementFocus = elementFocus.substring(elementFocus.lastIndexOf('/')+2);
    var menu_links = document.getElementsByClassName("menu_link");
    if (elementFocus == "" && menu_links.length >= 1) {
        elementFocus = menu_links[0].id.substring(menu_links[0].id.lastIndexOf("menu")+4);
        //si elementFocus n'est pas défini (url sans #Name) alors le premier onglet est selectionné
    }
    
    //change le "style" des élements actuels (sommaire et page)
    for (let i=0; i < menu_links.length; i++) {
        menu_links[i].setAttribute("open", menu_links[i].id == "menu"+elementFocus ? "true" : "false");
    }
    var pages_content = document.getElementsByClassName("pageContent");
    for (let i=0; i < pages_content.length; i++) {
        pages_content[i].setAttribute("open", pages_content[i].id == "page"+elementFocus ? "true" : "false");
    }
    
    if (elementFocus == "Controller") {
        document.getElementById("consoleLine").focus();
    }
}
function openPage(element) {
    window.open("./#"+element.id.substring((element.id.indexOf('u')+1)),"_self");
    //l'actualisation va se faire par loadPage lors de l'evenement onhashchange
}

function addLog(type, arg) {
    var time = new Date();//ms
    var timeStr = time.getHours()
                +":"+time.getMinutes()
                +":"+time.getSeconds()
                +"."+time.getMilliseconds();
    if (typeof arg == "string")
        arg = arg.split("\n").join("<br>");//replace \n by <br>
    
    $("#console").append("<div class='console_line' type='"+type+"'>"
                      +"<time datetime='"+time.toString()+"'>"
                      +timeStr+"</time>"
                      +"<p>"+arg+"</p>"
                      +"</div>");

    if (consoleScrollEnd)
        scrollToTheBottom();
}
function scrollToTheBottom() {
    var maxScroll = $("#console")[0].scrollHeight - $("#console").outerHeight();
    $("#console").animate({ scrollTop: maxScroll }, 0);//animated with 2nd valueat 100
    //document.getElementById("console").scrollTo(0, maxScroll);//scroll to the bottom (doesn't work with edge 18204)
}
function splitLine(line, separation) {
    var lineStrings = line.split("\"");//string
    var lineSplit = [];
    for (let i=0; i<lineStrings.length; i+=2) {
        var lineNoString = lineStrings[i].split(separation);
        while (lineNoString.length > 0)
            lineSplit.push(lineNoString.shift());//it's not a string => multiple strings
        if ((i+1) < lineStrings.length)
            lineSplit.push(lineStrings[i+1]);//it's a string here (between 2 ")
    }
    return lineSplit;
}
function newCommand(command) {
    var args = splitLine(command, " ");
    command = args.shift().toLowerCase();
    switch (command) {
        case "help":
        case "?":
            addLog("help", "Aide de la console :\n"
                   +"    help : affiche cet aide\n"
                   +"    sendMessage [type] [args] : envoie un message au raspberrypi");
            break;
        case "sendmessage":
            sendMessage(args.shift(), args);
            break;
        default:
            addLog("error", "Commande inconnue : \"" + command + "\"");
            break;
    }
}

