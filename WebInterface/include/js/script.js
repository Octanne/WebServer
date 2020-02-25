//events (mieux que window.event=function)
if(window.addEventListener) {
    window.addEventListener("load",onLoadPage,false);
    window.addEventListener("hashchange",loadPage,false);
} else if (window.attachEvent) {
    window.attachEvent("onload",onLoadPage);
    window.attachEvent("onhashchange",loadPage);
}


function onLoadPage() {
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
    
    initControlClient();
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
    
    var maxScroll = $("#console")[0].scrollHeight - $("#console").outerHeight();
    var isOnBottomScroll = (($("#console").scrollTop()+100) > maxScroll);//100px = 4 lignes
    console.log(maxScroll, $("#console").scrollTop()+50, isOnBottomScroll);
    $("#console").append("<div class='console_line' type='"+type+"'>"
                      +"<time datetime='"+time.toString()+"'>"
                      +timeStr+"</time>"
                      +"<p>"+arg+"</p>"
                      +"</div>");
    
    
    maxScroll = $("#console")[0].scrollHeight - $("#console").outerHeight();
    if (isOnBottomScroll)
        $("#console").animate({ scrollTop: maxScroll }, 100);//scroll to the bottom
}
function scrollToTheBottom() {
    
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
                   +"    sendMessage(type, args) : envoie un message au raspberrypi");
            break;
        case "sendmessage":
            sendMessage(args.shift(), args);
            break;
        default:
            addLog("error", "Commande inconnue : \"" + command + "\"");
            break;
    }
}