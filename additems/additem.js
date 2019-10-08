function newItem() {

    var newval = document.getElementById("nvalue").value;
    var newcur = document.getElementById("ncurrency").value;
    var newdes = document.getElementById("ndescr").value;
    var newyear = document.getElementById("nyear").value;
    var newcou = document.getElementById("ncou").value;

    var vals = [newval, newcur, newdes, newyear, newcou, localStorage.getItem('username')];
    var forbidden_symbol = "'";

    for (i=0;i<vals.length;i++){
        var check = vals[i].split("");
        if (check.includes(forbidden_symbol)){
            var loc = check.indexOf(forbidden_symbol);
            check.splice(loc, 0, "\\");
            console.log(check.join(""));
            vals[i] = check.join("");
        }
    }

    console.log(vals);

    console.log(newcou);

    var jsonized = JSON.stringify({value: vals[0], currency: vals[1], descr: vals[2], year: vals[3], country: vals[4], user: vals[5]});

    document.getElementById("demo").innerHTML =
        `New record has been added:
        ${newcur},
        ${newdes}`;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
             console.log(jsonized);
             console.log("New item has been successfully added.")
         }
    };

    xmlhttp.open("POST", "/additem/newitem/" + localStorage.token, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(jsonized);
}

function countries() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
             data = xmlhttp.responseText;
             jsonized = JSON.parse(data);
             for (i=0; i<jsonized.length; i++) {
                 document.getElementById("ncou").innerHTML += "<option value='" + jsonized[i].name + "'>" + jsonized[i].name + "</option>"
             }
         }
    };

    xmlhttp.open("GET", "/additem/countries", true);
    xmlhttp.send();
}

countries()