window.onload = function personalise() {
    if (localStorage.username !== undefined) {
        var userinfo = {un:localStorage.username, pp:localStorage.pp}
        document.getElementById("username").innerHTML = localStorage.getItem("username");
        window.location = "#" + localStorage.username;
        document.getElementById("additem").style = "display:block;";
        document.getElementById("account").style = "display:block;";
        document.getElementById("logout").style = "display:block;";
        document.getElementById("login").style = "display:none;";
        document.getElementById("signup").style = "display:none;";
        document.getElementById("profile_photo").setAttribute("src", localStorage.pp)//"/profile_photos/" + localStorage.username + ".jpg");
    } else if (localStorage.username === undefined) {
        document.getElementById("additem").style = "display:none;";
        document.getElementById("account").style = "display:none;";
        document.getElementById("logout").style = "display:none;";
        document.getElementById("login").style = "display:block;";
        document.getElementById("signup").style = "display:block;";
    }
}

function auth() {
    var tokenxhr = new XMLHttpRequest();
    tokenxhr.onreadystatechange=function(){
         if (tokenxhr.readyState==4 && tokenxhr.status==200){
            var tokenJSON = JSON.parse(tokenxhr.responseText);
            localStorage.setItem("username", tokenJSON.username);
            localStorage.setItem("pp", tokenJSON.pp_link);
         }
    };

    tokenxhr.open("POST", "/token", true);
    tokenxhr.setRequestHeader("Content-Type", "application/json");

    if (localStorage.length == 0) {
        tokenxhr.send(JSON.stringify({token: "null"}));
    } else if (localStorage.length > 0) {
        tokenxhr.send(JSON.stringify({token: localStorage.getItem("token")}));
    }
}

function getIems() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
             var resp = JSON.parse(xmlhttp.responseText);
             if (resp.length == 0) {
                 var addSomeCoins = "<h1 style='margin-top: 50px;'>You don't have any coins, why not to add some?</h1>"; 
                 //document.getElementById("cards").innerHTML = addSomeCoins;
             } else {
             for (i=0; i < resp.length;i++) {   // Shows each item.
                 var flag = (resp[i].country).split(" ").join("_");
                 if (resp[i].descr.length > 75){    // Checks if the description is too long and cuts it short if it is.
                     var descrShort = resp[i].descr.split(" ");
                     var sum = "";
                     for (k=0; sum.length < 75; k++){
                         if(sum.lenght!=0){
                             sum = sum + " " + descrShort[k];
                         } else if (sum.lenght==0){
                             sum = descrShort[k] + " ";
                         }
                         resp[i].descr = sum + " ...";
                     }
                 }
                 var card = `
                    <span class='item' id='${resp[i].id}'>
                        <p>
                            <img class='iflag' id='img${resp[i].id}' src='assets/flags/${flag}.png'>
                            ${resp[i].value}<br><br>
                            ${resp[i].currency}<br><br>
                            ${resp[i].year}<br><br>
                            ${resp[i].descr}<br><br>
                        </p>
                    </span>`; // Sets the card layout.
                 
                  var card2 = `
                    <div class='item' id='${resp[i].id}'><div class='inneritem'>
                        <p><img class='iflag' id='img${resp[i].id}' src='assets/flags/${flag}.png'></p>
                        <p>${resp[i].value}</p>
                        <p>${resp[i].currency}</p>
                        <p>${resp[i].year}</p>
                        <p class='des'>${resp[i].descr}</p></div>
                    </div>`;
                 
                 if (resp[i]=resp.length){
                     document.getElementById("cards").innerHTML += `<span class='item' id='new' style="text-align: center">+</span>`;
                 } else {
                     document.getElementById("cards").innerHTML += card;
                 }
                 
                 xmlhttp.status = 205;
                }
             }
         }
    };
    
    xmlhttp.open("GET", "/u/" + localStorage.token + "/items");
    xmlhttp.send();
}

function addSomeCoins(){
    var addSomeCoins = "<h1 style='margin-top: 50px;'>You don't have any coins, why not to add some?</h1>"; 
    document.getElementById("cards").innerHTML = addSomeCoins;
}

function logOut() {
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function(){
         if (xhr.readyState==4 && xhr.status==200){
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("pp");
            window.location.reload();
         }
    };
    
    xhr.open("GET", "/user/logout/" + localStorage.username);
    xhr.send();
}