const express = require("express");
const multer = require("multer");
const mongoose = require ("mongoose");
mongoose.connect("mongodb+srv://veenit:veenit@cluster0.dkyepiz.mongodb.net/?retryWrites=true&w=majority")
.then(function(){
    console.log("Connection established Succesfully");
})
.catch(function(){
    console.log("Error in establishing connection");

})

const signup = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    }

})

const collection = new mongoose.model("data" , signup)

// module.exports=collection







const app=express();
const path = require("path");
app.use(express.json()); 
app.use(express.urlencoded({extended:false})); //body parser
//Ye ekdam last m use kiye sir ne(for dashboard.ejs)
const cookie = require("cookie-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(session({
    secret:"@123ABC",
    saveUninitialized : true,
    resave:false,
    cookie : {
        maxAge:1000000
    }
}));
app.set('view engine', 'ejs');
//--------------------------------
app.use(express.static("public")); //public folder m html aur css file ko link krne ka middleware
  //ejs set hogya as a view engine
const port = process.env.PORT || 4040; //port number

//EJS is used to send dynamic content

app.get("/login",function(req,res){
    res.render("login",{msg : ""});
    // res.sendFile(path.join(__dirname,"/public/login.html"));

})

// app.get("/home" , function(req,res){
//     res.render("dashboard",{user:req.session.username});
// })

app.post("/actionlogin" , async(req,res)=>{
    try{
        const check = await collection.findOne({Name:req.body.username})
        if(check.Password==req.body.password){
            req.session.username = req.body.username;
            res.render("dashboard", {user : req.session.username});
        }
        else{ 
            // res.render("dashboard", {user : req.session.username});
            // res.redirect("/login.html")
            res.render("login" , {msg : "Invalid password"});
        }
    }
    catch{
        res.render("login" , {msg : "Invalid user/password"});

    }


    // if(req.body.username == req.body.password && req.body.username!=""){
    //     req.session.username = req.body.username; //so that we can get usename in dashboard.ejs after login succesfully
    //     // res.sendFile(path.join(__dirname,"/dashboard.html"));
        
    
    
} )
app.get("/logout" , function(req,res){
    // req.session.destroy();
    res.render("login" , {msg : ""})
})


app.get("/test" , function(req,res){
    res.render("home", {name : "Veenit", Skills :["HTML" , "CSS" ,"JavaScript" ,"NodeJs"]}); //ek ejs page jo views folder m hona chaiye
}) 

app.get("/signup" , function(req,res){
    res.render("signup");
})

app.post("/signupsuccess" , async function (req,res){
    const data = {
        Name:req.body.Username,
        Password:req.body.Password
    }

    await collection.insertMany([data])
    res.render("login" , {msg : ""})



})




const mstorage = multer.diskStorage({
    destination: function (req, file, cb) {
      //file - that is uploading , cb - callback function
      cb(null, "public/files");
      // cb(null , __dirname , "./public/files");
    },
    filename: function (req, file, cb) {
    //   console.log(file);
      const ext = file.mimetype.split("/")[1];
      cb(null, req.session.username+ "."+ ext);
      // console.log("veenit");
      cb(null, "test.jpg");
    },
  });

  
  const filter = function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    if (ext == "png") cb(null, true);
    else cb(new Error("File not supported"), false);
  };
  
  
  const upload = multer({ storage: mstorage , fileFilter : filter });


  app.get("/dashboard" , function(req,res){
    res.render("dashboard", {user : req.session.username});
})


app.post("/uploadfile", upload.single("pic"), function (req,res) {
    res.render("dashboard", {user : req.session.username});
//   res.redirect("/dashboard")
});






app.listen(port,()=> console.log(`Listening to port ${port}`));

