function validate() {
    var mail = document.getElementById("email").value;
    var uname = document.getElementById("username").value;
    var pw = document.getElementById("pw").value;
    var pwc = document.getElementById("pwcheck").value;
    //var ydob = document.getElementById("yeardob").value;
    //var mdob = document.getElementById("monthdob").value;
    //var ddob = document.getElementById("daydob").value;
    var ncou = document.getElementById("ncou").value;
    var ncou = document.getElementById("ncou").value;
    var profile_pic = document.getElementById("pp").value;
    
    if (profile_pic === undefined || profile_pic == ""){
        profile_pic = "/assets/defpp.png";
    }
    
    var all_done = true;
    
    if (mail == null) {
        all_done = false;
        alert("email field should not be empty!");
    }
    
    if (all_done){
        var jsonized = JSON.stringify({email:mail, username:uname, password:pw, country: ncou, pp_img:profile_pic});

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function(){
            if (xhr.readyState==4&&xhr.status==200){
                console.log("Successfully added new user to the database.");
                auth();
                window.location.replace("/");
            }
        }
        xhr.open("POST", "/user/signup", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(jsonized);
    }
}

function auth() {
    var un = document.getElementById("username").value;
    var pw = document.getElementById("pw").value;
    var expDate = "Mon 31 Dec 2019 23:59:59";
    var auth = JSON.stringify({username:un, password:pw});
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if (xhr.readyState==4 && xhr.status==200){
            var resp = JSON.parse(xhr.responseText);
            console.log(resp);
            if (resp.loggedin === "true"){
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                //var d1 = new Date (),
                //    d2 = new Date ( d1 );
                //d2.setHours(d1.getHours()+24); 
                //var exp = d2;
                localStorage.setItem("token", resp.token);                
                localStorage.setItem("username", resp.username); 
                document.getElementById("msg").innerHTML = "Logged in as " + localStorage.username;
                window.location.replace("/")
            } else if (resp.loggedin=="false") {
                document.getElementById("msg").innerHTML = "Wrong username or password.";
            }
        }
    };
    xhr.open("POST", "/user/loginreq", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(auth);
}

function enable(){   
    rmAttrib = function(elemId ,arg) {document.getElementById(elemId).removeAttribute(arg);}
    addAttrib = function(elemId, attribName, value) {document.getElementById(elemId).setAttribute(attribName, value);}

    rmAttrib("email", "disabled");
    rmAttrib("ncou", "disabled");
    rmAttrib("pp_link", "disabled");
    document.getElementById("submit").style += "display: block;";
}

/*
function itemInfo() {
    var itemId = document.URL.split('/')[3];
    var xhr = new XMLHttpRequest();
    if (xhr.onreadystatechange=function(res){
        var node = document.getElementById('iteminfo');
        var text = document.createTextNode(res)
        node.appendChild(res);
    });
}
*/

function accountInfo() {    
    var xhrreq = new XMLHttpRequest();
    xhrreq.onreadystatechange=function(){
        if (xhrreq.readyState==4&&xhrreq.status==200){
            var resp = JSON.parse(xhrreq.responseText)[0];
            document.getElementById("username").setAttribute("value", resp.username);
            document.getElementById("email").setAttribute("value", resp.email);
            document.getElementById("pp_link").setAttribute("value", resp.pp);
            document.getElementById("pp").setAttribute("src", resp.pp);
            document.getElementById(resp.country).setAttribute("selected", "selected");
        }
    }
    xhrreq.open("GET", "/u/" + localStorage.token);
    xhrreq.send(JSON.stringify({username:localStorage.username}));
}

function updateAccount(){
    var un = document.getElementById("username").value;
    var em = document.getElementById("email").value;
    var co = 'Over the Clouds'; //document.getElementById("ncou").value;
    var pp = document.getElementById("pp_link").value;
    if (pp === undefined || pp == "") {
        pp = '/assets/defpp.png';
    }
    var toBeSent = JSON.stringify([{username:un , email:em , country:co , pp_link:pp}]);
    console.log(toBeSent);
    
    var updatexhr = new XMLHttpRequest();
    updatexhr.onreadystatechange=function(){
        if (updatexhr.readyState==4&&updatexhr.status==200){
            var resp = JSON.parse(updatexhr.responseText);
            console.log(resp);
            if (resp.success == true){
                document.getElementById("result").innerHTML = "Successfully updated the database for user " + localStorage.username;
                //window.location.replace("/");
            } else {
                document.getElementById("result").innerHTML = "Failed to update the database for user " + localStorage.username;
            }
        }
    }
    updatexhr.open("POST", "/u/" + localStorage.token + "/update", true);
    updatexhr.setRequestHeader("Content-Type", "application/json");
    updatexhr.send(toBeSent);
}

function countries() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
         if (xmlhttp.readyState==4 && xmlhttp.status==200){
             data = xmlhttp.responseText;
             jsonized = JSON.parse(data);
             for (i=0; i<jsonized.length; i++) {
                 document.getElementById("ncou").innerHTML += "<option id='" + jsonized[i].name + "' value='" + jsonized[i].name + "'>" + jsonized[i].name + "</option>"
             }
         }
    };
    
    xmlhttp.open("GET", "/additem/countries", true);
    xmlhttp.send();
    return true;
}