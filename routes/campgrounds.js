require('dotenv').load();
var express=require("express");
var router=express.Router();




var Campground=require("../models/campground");
var middleware=require("../middleware");

var geocoder = require('geocoder');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'nish1807', 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});


//  //INDEX - show all campgrounds
// router.get("/", function(req, res){
//     // Get all campgrounds from DB
//     Campground.find({}, function(err, allCampgrounds){
//         if(err){
//             console.log(err);
//         } else {
//             res.render("campgrounds/index",{campgrounds:allCampgrounds});
//         }
//     });
// });

//////////////////////////////////////////////
/////////////////CAMPGROUNDS ROUTES//////////////////
/////////////////////////////////////////////


router.get("/campgrounds",function(req,res){
    var noMatch=null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ "name": regex }, function(err, allCampgrounds) {
            if(err) {
               console.log(err);
            } 
            else {
                 if(allCampgrounds.length < 1){
                    noMatch = 'No campgrounds match that query. Please try again!';
                     
                 }
            res.render("campgrounds",{campgrounds:allCampgrounds, noMatch:noMatch}); 
            }
        })
    }
    else{
    Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log("Something went wrong");
            console.log(err);
        }
        else{
            console.log("Newly Created Campground")
            res.render("campgrounds",{campgrounds:allCampgrounds, noMatch:noMatch});     
            }
    }) 
}
})
    
    
          
  
  

router.get("/campgrounds/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});
  


router.post("/campgrounds",middleware.isLoggedIn,upload.single('image'), function(req,res){
    

    
    var newImageName=req.body.campground.name;
    // var newImageURL=req.body.image;
    var newImageDesc=req.body.campground.description;
    var newPrice=req.body.price;
    // console.log("the name you have entered is:"+newImageName);
    // console.log("the image you have entered is:"+newImageURL);
    // console.log("the image you have entered is:"+newImageDesc);
    // console.log("the price you have entered is:"+newPrice);
    // var author={
    //     id:req.user._id,
    //     username:req.user.username
    
    geocoder.geocode(req.body.location, function (err, data) {
    
    cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }

    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    
    var newCampGround={name:newImageName, image: req.body.campground.image, price:newPrice, description:newImageDesc, author: req.body.campground.author, location: location, lat: lat, lng: lng};
    //create a new campground and save to db
    Campground.create(newCampGround, function(err,newlyCreated){
        if(err){
            console.log("Something went wrong in posts method");
            console.log(err);
        }
        else{
           console.log("Inside the new.ejs"+ newlyCreated.author.username);
           console.log(newlyCreated)
           req.flash("success","Congratulations, Campground added!!!")
            res.redirect("/campgrounds");
        }
    })
        
    })

});
});


//Show more information about one object
router.get("/campgrounds/:id",function(req,res){
    var id=req.params.id;
    Campground.findById(id).populate("comments").exec(function(err,foundCampground){
        if(err || !foundCampground){
            req.flash("error","Campground not found");
            res.redirect("back");
        }else{
             res.render("campgrounds/show",{campground:foundCampground});
        }
    })
   
})

//EDIT the campground
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    console.log("in the edit route")
    // Find by ID 
    Campground.findById(req.params.id, function(err,foundCampground){
    if(err){
        console.log("error in edit form");
    }else{
    res.render("campgrounds/edit",{campground:foundCampground});
    }
    })
    // }
})

//UPDATE the campground
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req,res){
    console.log("in the update route");
    console.log(res);
    // Find by ID and UPDATE
    geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
   
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err,updatedCampground){
    if(err){
        req.flash("error", err.message);
        res.redirect("back");
        }
        else{
        req.flash("success","Campground updated successfully!!!")
        
        res.redirect("/campgrounds/"+req.params.id);
    }
    })
    })
    // }
})


//DELETE the Campground
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err,foundCampground){
        if (err){
            console.log("error in the delete route");
            console.log(err);
        }else{
            req.flash("success","Campground Deleted successfully!!!")
            res.redirect("/campgrounds");
        }
    });
    
});



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports=router;