var express=require("express");
require('dotenv').load();
var app=express();

app.set("view engine", "ejs");
const ejsLint = require('ejs-lint');

 ejsLint.lint();
 require('dotenv').config()
var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));


//to be used before passport config
var flash=require("connect-flash");
app.use(flash());

app.use(express.static(__dirname+"/public"));

var passport=require("passport");
var LocalStrategy=require("passport-local");





//add mongoose
var mongoose=require("mongoose");
// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://<nishtha>:<Nishtha1234#>@ds025399.mlab.com:25399/yelpcamp");





// //Schema Setup
// var campgroundSchema=new mongoose.Schema({
//     name:String,
//     image:String,
//     description:String
// });

//modelling
var Campground=require("./models/campground");
var Comment=require("./models/comment")
var seedDB=require("./seeds")
var User=require("./models/user");

var methodOverride=require("method-override");
app.use(methodOverride("_method"));



var commentRoutes=require("./routes/comments");
var campgroundRoutes=require("./routes/campgrounds");
var indexRoutes=require("./routes/index");

app.locals.moment = require('moment');


// seedDB();

/////////////////////////////
//PASSPORT CONFIGURATION//
//////////////////////////

app.use(require("express-session")({
    secret:"Rusty is the cutest dog ever",
    resave:false,
    saveUnintialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
});


app.get("/", function(req,res){
    res.render("landing.ejs")
})


app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);
 


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelp camp server has started");
});
