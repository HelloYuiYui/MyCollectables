$(document).ready(function() {
    if(localStorage.username !== undefined) {
        //window.location = "#" + localStorage.username;
        //var userinfo = {un:localStorage.username, pp:localStorage.pp}
        $("#username").html(localStorage.getItem("username"));
        $("#additem").css("display", "block");
        $("#account").css("display", "block");
        $("#logout").css("display", "block");
        $("#login").css("display", "none");
        $("#signup").css("display", "none");
        $("#profile_photo").prop("src", localStorage.pp);
    } else if (localStorage.username === undefined) {
        $("#additem").css("display", "none");
        $("#account").css("display", "none");
        $("#logout").css("display", "none");
        $("#login").css("display", "block");
        $("#signup").css("display", "block");
    }
});

// auth stuff.
/* 
function auth() {

    $.post("/token", {token: localStorage.getItem("token")}, function(data) {
        //var tokenJSON = JSON.parse(data.responseText);
        console.log(data.username);
        localStorage.setItem("username", tokenJSON.username);
        localStorage.setItem("pp", tokenJSON.pp_link);
    })
    
    
    var tokenxhr = new XMLHttpRequest();
    tokenxhr.onreadystatechange=function(){
         if (tokenxhr.readyState==4 && tokenxhr.status==200){
            var tokenJSON = JSON.parse(tokenxhr.responseText);
            localStorage.setItem("username", tokenJSON.username);
            localStorage.setItem("pp", tokenJSON.pp_link);
         }
    };
    
    if (localStorage.length == 0) {
        tokenxhr.send(JSON.stringify({token: "null"}));
    } else if (localStorage.length > 0) {
        tokenxhr.send(JSON.stringify({token: localStorage.getItem("token")}));
    }
}
*/

function getItems() {
    $.get("/u/" + localStorage.token + "/items", function(data) {
         var resp = data;
         if (resp.length == 0) {
             var addSomeCoins = "<h1 style='margin-top: 50px;'>You don't have any coins, why not to add some?</h1>"; 
             $(addSomeCoins).appendTo("#cards");
         } else {
             for (i=0; i < resp.length;i++) {   // Shows each item.
                 var flag = (resp[i].country).split(" ").join("_");
                 if (resp[i].descr.length > 75) {    // Checks if the description is too long and cuts it short if it is.
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
                  /* var card2 = `
                    <div class='item' id='${resp[i].id}'><div class='inneritem'>
                    <p><img class='iflag' id='img${resp[i].id}' src='assets/flags/${flag}.png'></p>
                    <p>${resp[i].value}</p>
                    <p>${resp[i].currency}</p>
                    <p>${resp[i].year}</p>
                    <p class='des'>${resp[i].descr}</p></div>
                    </div>`;*/ // card 2.
                 $(card).appendTo("#cards");
             }
         }
    })
};