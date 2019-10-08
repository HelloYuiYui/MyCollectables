var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var mysql = require("mysql");
var bodyParser = require("body-parser");
var forge = require("node-forge");
var jwt = require("jsonwebtoken");
var dotenv = require("dotenv");
var colors = require("colors");

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
dotenv.config();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/'));
//app.use(express.static(__dirname + "/user/"));

var port = 3000; //process.env.port;
var key = 'whats_a_key_lmao';

// Establishing MySQL Connections.
var conn = mysql.createConnection({
    host: process.env.host,
    user: process.env.un,
    password: process.env.pwd,
    database: 'mc1'
});

var worldDB = mysql.createConnection({
    host: process.env.host,
    user: process.env.un,
    password: process.env.pwd,
    database: 'world'
});

function addLog(c){
    var path = 'log.txt';
    
    fs.appendFile("log.txt", c, function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
}

function dateify(d){
    var log = "[" + d.getDay() + " " + monthNames[d.getMonth()] + " " + d.getFullYear() + ", " + d.getHours() + ":" + d.getMinutes() + ", "+d.getSeconds()+"] ";
    return log;
}

// Checking MySQL connection.
conn.connect(function(err) {
    if (err) {
        console.error("error: ".red + err.message.red);
    } else {
    console.log("connected to database.");
    }
});

app.get('/', function(req, res){
    res.sendFile(__dirname + "/index.html");
}); // Leading user to main page.

app.get('/account', function(req, res){
    res.sendFile(__dirname + "/user/account.html");
})

app.get('/login', function(req, res){
    res.sendFile(__dirname + "/user/login.html");
});

app.get('/signup', function(req, res){
    res.sendFile(__dirname + "/user/signup.html");
});

app.post("/token", function(req, res){
    var a_t = jwt.verify(req.body.token, key);
    console.log(a_t.username);
    conn.query("select pp from users where username= ? ;", [a_t.username], function(err, data){
        res.send(JSON.stringify({username:a_t.username, pp_link:data[0].pp}));
    })
});

app.get("/u/:token", function(req, res){
    var t = jwt.verify(req.params.token, key);
    conn.query(`select email, username, country, pp from users where username= ? and pw_hash= ? ;`, [t.username, t.pw_h], function(err, data) {
        try {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));    
        } catch (err) {
            res.send(JSON.stringify({error:err}));
        }
    });
}); // Showing the items.

app.post("/u/:token/update", function(req, res){
    var t = jwt.verify(req.params.token, key);
    var sql = `update users set email= ?, country= ?, pp= ? where username= ? and pw_hash= ? ;`;
    conn.query(sql, [req.body[0].email, req.body[0].country, req.body[0].pp_link, t.username, t.pw_h], function(err, data){
        if (!err) {
            console.log(`successfully updated the database, altered the data of ${t.username}`);
            res.send(JSON.stringify({success:true}));
        } else if (err) {
            console.log(err);
            res.send(JSON.stringify({success:false}));
        }
    });

});

app.get("/u/:token/items", function(req, res){
    var t = jwt.verify(req.params.token, key);
    conn.query('select id, value, currency, descr, year, items.country, user, username, pw_hash from items, users where username= ? and pw_hash= ? and user=username;', [t.username, t.pw_h], function(err, data) {
        try {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(data));    
        } catch (err) {
            res.send(JSON.stringify({error:err}));
        }
    });
});

app.get("/:item_no", function(req, res) {
    var no = req.params.item_no
    conn.query('select id, value, currency, descr, year, country, added_at from items where id = ?', [no], function(err, data){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    })
})

app.post("/additem/newitem/:token", function(req, res){
    var t = jwt.verify(req.params.token, key);
    var r = req.body;
    var sql = `insert into items(value, currency, descr, year, country, user) values(?, ?, ?, ?, ?, ?);`;
    
    conn.query(sql, [r.value, r.currency, r.descr, r.year, r.country, t.username], function(err, data){
        if (!err) {
            console.log(`added item ${data.insertId} for ${t.username}`.green);
            var d = new Date();
            var msg = `added item ${data.insertId} for ${t.username}`;
            var log = dateify(d) + msg + "\r\n";
            addLog(log);
        } else if (err) {
            console.log(err.red);
        }
    });
    res.send(req.body);
}); // Adding new items to the database.

app.post("/user/signup", function(req, res){
    var md = forge.md.sha256.create(); 
    md.update(req.body.password); 
    var hashed_pw = md.digest().toHex();
    var sql = `insert into users(email, username, pw_hash, role, country, pp) values(?, ?, ?, ?, ?, ?);`;
    conn.query(sql, [req.body.email, req.body.username, hashed_pw, 'user', req.body.country, req.body.pp_img], function(err, data){
        if (!err) {
            var d = new Date();
            var msg = `${req.body.username} signed up.`;
            var log = dateify(d) + msg + "\r\n";
            addLog(log);
            res.send(data);
        } else if (err) {
            res.send({error: err.message});
        }
    });
});

app.post("/user/loginreq", function(req, res){
    // Hashing the password.
    var md = forge.md.sha256.create();
    md.update(req.body.password);
    var hashed_req_pw = md.digest().toHex();
    
    conn.query('select username, pw_hash from users where username= ?;', [req.body.username], function(err, data){
        var userfound = false;
        var username = "";
        
        if (data.length >= 1) {
            if (hashed_req_pw == data[0].pw_hash){
                var d = new Date(),
                    d2 = new Date(d);
                d2.setHours(d.getHours()+24);
                var msg = data[0].username + " logged in.";
                var log = dateify(d) + msg + "\r\n";
                addLog(log);
                var exp = d2;
                var payload = JSON.stringify({username:data[0].username, pw_h:data[0].pw_hash, expires:exp});
                var access_token = jwt.sign(payload, key);
                res.send(JSON.stringify({loggedin:"true", username: data[0].username, token:access_token}));
            } else if (hashed_req_pw != data[0].pw_hash) {
                userfound = true;
                res.send({loggedin:"false", u_found:userfound});
            }
        } else {
            console.log("no user found.");
            res.send({loggedin:"false", u_found:userfound});
        }
    });
});

app.get("/user/logout/:t", function(req, res){
    var username = req.params.t;
    var d = new Date();
    var msg = username + " logged out.";
    var log = dateify(d) + msg + "\r\n";
    addLog(log);
    res.send();
})

app.get("/additem/countries", function(req, res) {
    worldDB.query("select name from country order by name;", function(err, data) {
        if (!err) {
            res.send(JSON.stringify(data));
        }
    });
}); 
// For getting the country list in additem page. 

// Server and port settings.
http.listen(port, function(){
  console.log('listening on *:' + port);
});