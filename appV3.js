var express=require("express");
var app=express();

app.set("view engine", "ejs");

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

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
var seedDB=require("./seeds")


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
    res.render("landing");
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
            console.log("Newly Created Campground");
            res.render("campgrounds",{campgrounds:allCampgrounds});
        }
    })       
    })
  

app.get("/campgrounds/new",function(req,res){
    res.render("new");
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
             res.render("show",{campground:foundCampground});
        }
    })
   
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelp camp server has started");
});