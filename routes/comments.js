var express=require("express");
var router=express.Router();

var Campground=require("../models/campground");
var Comment=require("../models/comment");

var middleware=require("../middleware");

var User=require("../models/user");


router.get("/",function(req,res){
    res.redirect("/campgrounds");
});



//////////////////////
///COMMENT ROUTES////
/////////////////////

router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn, function(req,res){
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log("error in finding the id");
       }else{
           
            res.render("comments/new",{campground:foundCampground});
       }
   })
   
})


router.post("/campgrounds/:id/comments",middleware.isLoggedIn, function(req,res){
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           console.log("error in finding the id");
           res.redirect("/campgrounds");
              }else{
                 // console.log(req.body.comment);
                Comment.create(req.body.comment,function(err,comment){
              if(err){
                  console.log(err)
              }else{
                  //add username and ID to the comment
                  comment.author.id=req.user._id;
                  comment.author.username=req.user.username;
                  console.log(comment.author.username)
                //save comment
                  comment.save();
                  foundCampground.comments.push(comment);
                  foundCampground.save();
                  req.flash("success","comment added successfully!!!")
                  res.redirect("/campgrounds/"+foundCampground._id);
                   
              }
          })
            
       }
   })
   
})


// EDIT COMMENT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req,res){
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err || !foundCampground){
        req.flash("error","no campground found");
        return res.render("back");
        }
        // Find Comment by ID 
        var campId=req.params.id;
        Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
            console.log("error in edit form");
        }else{
            
            res.render("comments/edit",{comment:foundComment, id:campId});
        }
    })
   

    
    })
   
})


//UPDATE COMMENT ROUTE
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req,res){
    console.log("inside the updatedComment route")
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
        if(err){
            console.log(err);
            res.redirect("/campgrounds")
        }
        else{
            req.flash("success","comment updated successfully!!!")
           
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
    
})

//DELETE COMMENT ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removedCooment){
        if(err){
            console.log("error in the delete route of comments");
            console.log(err);
        }
        else{
            req.flash("success","comment deleted successfully!!!")
             res.redirect("/campgrounds/"+req.params.id);
        }
    })
})





module.exports=router;