const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Global variables
var userID = 0;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "defenseDB"
});

db.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

/*app.get("/deneme",function(req,res){

  const sql = `SELECT VNameID,NCompany FROM vehicle`;
  //const sql = "";
  db.query(sql,(err,results)=>{
    if(err){
      console.log(err);
      res.send("error");
    }else{
      console.log(results);
      res.render("deneme", { data: results });
    }

  });


});*/

//OK
app.get("/",function(req,res){

  const sql = "CREATE TABLE IF NOT EXISTS user (userID INT AUTO_INCREMENT PRIMARY KEY, userName VARCHAR(50), password VARCHAR(10), email VARCHAR(25), age INT)";
  //const sql = "";
  db.query(sql,(err,data)=>{
    if(err){
      console.log(err);
      res.send("error");
    }else{
      console.log("table created");
      res.sendFile(__dirname+"/home.html");
    }

  });


});

//OK
app.post("/", function(req, res) {
  const userName = req.body.userName;
  const password = req.body.password;
  const email = req.body.email;
  const age = req.body.age;

  const sql = `INSERT INTO user (userName, password, email, age)
               VALUES ('${userName}', '${password}', '${email}', ${age})`;

  db.query(sql,(err, data) => {
    if (err) {
      console.log(err);
      res.send("error");
    } else {
      userID++;
      console.log("user added");
      res.sendFile(__dirname+"/profile.html");
    }
  });
});

app.post("/myprofile",(req,res)=>{
    res.sendFile(__dirname+"/myprofile.html");
});

//OK not tested
app.post("/post",(req,res)=>{

  const sql = ` SELECT Title, Content
                FROM Entry WHERE UserID=${userID}`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("post.ejs", { data: results });
});

});

//OK not tested
app.post("/comment",(req,res)=>{

  const sql = `SELECT CommentAboutVehicle
              FROM Comment WHERE UserID=${userID}`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  //res.render("ok");
  res.render("comment.ejs", { data: results });
});

});

app.post("/vehiclecat",(req,res)=>{
  res.sendFile(__dirname+"/vehicle.html");
});

app.post("/vehicletype",(req,res)=>{
  const type = req.body.vehicleType;
  console.log(type);
  if(type == "land"){
    res.sendFile(__dirname+"/land.html");
  }else if(type == "aerospace"){
    res.sendFile(__dirname+"/aerospace.html");
  }else{
    res.sendFile(__dirname+"/naval.html");
  }

});


//OK
app.post("/product",(req,res)=>{
  const vehiclename = req.body.vehicleType;
  console.log(vehiclename);
  // bu isimle query yaz vehicleyi doldur title olmadan
  const sql = `SELECT vehicleEngine,vehicleWeight,vehicleArmour,vehicleCrewCapasity,typeOfVehicle,NCompany
              FROM vehicle
              WHERE VNameID = "${vehiclename}" `;

  db.query(sql, (error, results) => {
  if (error) {
    res.send("error");
  }
  res.render("product", { title: vehiclename, data: results });
});

});


//weapodan bir butonla git
//ikisinede aynı post
app.post("/range",(req,res)=>{

  var avg;
  //avg hesapla
  const sqlavg = "SELECT AVG(WRange) FROM weapon";

  db.query(sqlavg, (error, results) => {
  if (error) {
    console.log(err);
    res.send("error");
  }
  avg = results;
});

  const sql = `
    SELECT WNameID, WRange,
      CASE
        WHEN WRange > ${avg} THEN CONCAT('The range of weapon is greater than ', ${avg})
        WHEN WRange = ${avg} THEN CONCAT('The range of weapon quantity is ', ${avg})
        ELSE CONCAT('The range of weapon quantity is under ', ${avg})
      END AS RangeText
    FROM Weapon
    ORDER BY
      (CASE
        WHEN WNameID IS NULL THEN WRange
        ELSE WNameID
      END)`;


  db.query(sql, (error, results) => {
  if (error) {
    console.log(err);
    res.send("error");
  }
  res.render("range.ejs", { data: results });
});

});

//Vehicle genel den buttonla git
app.post("/vehicleweapon",(req,res)=>{

  const sql = `
  SELECT VNameID, WNameID
  FROM has H
  JOIN vehicle V
  ON H.VNnameID = V.VNameID
  JOIN weapon W
  ON H.WNnameID = W.WNameID`;

  db.query(sql, (error, results) => {
  if (error) {
    console.log(err);
    res.send("error");
  }
  res.render("vehicleweapon.ejs", { data: results });
});

});

app.get("/admin",(req,res)=>{

  res.sendFile(__dirname+"/admin.html");

});

app.post("/viewusers",(req,res)=>{
  const sql = `SELECT userName, password, email
              FROM user`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.render("user.ejs", { data: results });
});


});

app.post("/adminpost",(req,res)=>{

  const sql = `SELECT userName, Title
  FROM user U
  JOIN entry E
  ON U.UserID = E.UuserID`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.render("user.ejs", { data: results });
  });

});

app.post("/admincomment",(req,res)=>{

  const sql = `SELECT U.UserName, C.CommentAboutVehicle FROM user U LEFT OUTER JOIN comment C ON U.UserID = C.UuserID
  UNION
  SELECT U.UserName, C.CommentAboutVehicle FROM user U RIGHT OUTER JOIN comment C ON U.UserID = C.UuserID`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.render("user.ejs", { data: results });
  });

});

app.post("/viewvehicle",(req,res)=>{
  const sql = `SELECT CommentAboutNews, CommentAboutProducts
              FROM Comment WHERE UserID=${userID}"`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.render("comment.ejs", { data: results });
});

});

app.post("/viewweapon",(req,res)=>{
  const sql = `SELECT CommentAboutNews, CommentAboutProducts
              FROM Comment WHERE UserID=${userID}"`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.render("comment.ejs", { data: results });
});

});

app.post("/deleteusers",(req,res)=>{
  const sql = `DROP TABLE user`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});

app.post("/deletevehicle",(req,res)=>{
  const sql = `DROP TABLE vehicle`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});

app.post("/deleteweapon",(req,res)=>{
  const sql = `DROP TABLE weapon`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});


app.post("/deletesingleuser",(req,res)=>{
  const id = req.body.userId;
  const sql = `DELETE FROM user WHERE userID = ${id}`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});


app.post("/viewcompany",(req,res)=>{
  const id = req.body.userId;
  const sql = `SELECT NCompany, SUM(budgetSpent)
              FROM Vehicle
              GROUP BY NCompany
              ORDER BY NCompany ASC`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});

app.post("/addprop",(req,res)=>{
  const id = req.body.userId;
  const sql = `SELECT NCompany, SUM(budgetSpent)
              FROM Vehicle
              GROUP BY NCompany
              ORDER BY NCompany ASC`;

  db.query(sql, (error, results) => {
  if (error) {
    //console.log(err);
    res.send("error");
  }
  res.render("ok");
  //res.redirect("/admin");
});

});


app.listen(3000,function(){
  console.log("Server running on port 3000");
});
