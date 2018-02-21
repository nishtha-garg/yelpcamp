var express=require("express");
var app=express();

app.set("view engine", "ejs");

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static(__dirname+"/public"));

var passport=require("passport");
var LocalStrategy=require("passport-local");


//add mongoose
var mongoose=require("mongoose");
mongoose.connect("mongodb://localhost/yelp_camp");


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
    next();
});


seedDB();

// var campgrounds=[
//         {name: "Illinois Beach State Park : Zion, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/illinois-beach.jpg"},
//         {name: "Matthiessen State Park: North Utica, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/matthiessen.jpg"},
//         {name: "LaSalle/Peru KOA: North Utica, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/lasalle.jpg"},
//         {name: "Starved Rock State Park: Oglesby, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/StarvedRock.5321.C.360600.jpg"},
//         {name: "Chicago Northwest KOA: Union, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/chicago-northwest.jpg"}
//         ];
 
//  Campground.create(
//       {
//         name: "Matthiessen State Park: North Utica, IL", 
//         image: "http://50campfires.com/wp-content/uploads/2016/06/matthiessen.jpg",
//         description: "This is an amazing place to be in. It is one of the best campgrounds near the Chicago city "
        
          
//       }, function(err,newCampGround){
//         if(err){
//             console.log("Something went wrong");
//             console.log(err);
//         }
//         else{
//             console.log("Newly Created Campground");
//             console.log(newCampGround);
//         }
//     })       

app.get("/",function(req,res){
    res.redirect("/campgrounds");
});

app.get("/campgrounds",function(req,res){
    //get all campgrounds from database
    //res.render("campgrounds",{campgrounds:campgrounds});
    Campground.find({},function(err,allCampgrounds){
       if(err){
            console.log("Something went wrong");
            console.log(err);
        }
        else{
            console.log("Newly Created Campground")
            console.log(req.user)
            res.render("campgrounds",{campgrounds:allCampgrounds, currentUser:req.user});
        }
    })       
    })
  

app.get("/campgrounds/new",function(req,res){
    res.render("campgrounds/new");
});
  


app.post("/campgrounds",function(req,res){
    var newImageName=req.body.name;
    var newImageURL=req.body.image;
    var newImageDesc=req.body.description;
    console.log("the name you have entered is:"+newImageName);
    console.log("the image you have entered is:"+newImageURL);
    console.log("the image you have entered is:"+newImageDesc);
    
    
    var newCampGround={name:newImageName, image:newImageURL,description:newImageDesc};
    //create a new campground and save to db
    Campground.create(newCampGround, function(err,newlyCreated){
        if(err){
            console.log("Something went wrong in posts method");
            console.log(err);
        }
        else{
            res.redirect("/campgrounds");
        }
    
        
    })

});


//Show more information about one object
app.get("/campgrounds/:id",function(req,res){
    var id=req.params.id;
    Campground.findById(id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log("Error found at show request")
        }else{
             res.render("campgrounds/show",{campground:foundCampground});
        }
    })
   
})


//////////////////////
///COMMENT ROUTES////
/////////////////////


app.get("/campgrounds/:id/comments/new",isLoggedIn, function(req,res){
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log("error in finding the id");
       }else{
            res.render("comments/new",{campground:foundCampground});
       }
   })
   
})


app.post("/campgrounds/:id/comments",isLoggedIn, function(req,res){
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log("error in findind the id");
           res.redirect("/campgrounds");
              }else{
                 // console.log(req.body.comment);
                Comment.create(req.body.comment,function(err,comment){
              if(err){
                  console.log(err)
              }else{
                  foundCampground.comments.push(comment);
                  foundCampground.save();
                  res.redirect("/campgrounds/"+foundCampground._id);
                   
              }
          })
            
       }
   })
   
})




//////////////////////////////////////////////
/////////////////AUTH ROUTES//////////////////
/////////////////////////////////////////////


app.get("/register",function(req,res){
    res.render("users/register");
})

app.post("/register",function(req,res){
    var newUser=new User({username:req.body.username})
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("users/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds")
            })
        }
    })
})



/////////////////////////////////////
//////LOGIN ROUTES////////////
////////////////////////////////////

//render logic form
app.get("/login",function(req,res){
    res.render("users/login");
})

//login logic
app.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
    }),function(req,res){
        });
        


/////////////////////////////////////
//////LOGOUT ROUTES////////////
////////////////////////////////////

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
})


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelp camp server has started");
});