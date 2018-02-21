var Campground=require("../models/campground");
var Comment=require("../models/comment");
var User=require("../models/user");

//all the middleware code here

var middleObj={};

middleObj.checkCampgroundOwnership=function(req,res,next){
     if (req.isAuthenticated()){
   
        //find the campground which he is trying to modify
        Campground.findById(req.params.id, function(err,foundCampground){
            if(err || !foundCampground){
                req.flash("error","Campground not found!!!")
                req.redirect("back");
                console.log(err);
            }
            else{
                //compare the user id with the campground author's id
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin ){
                    console.log("id matched")
                    next();
                }else{
                    req.flash("error","You don't have permission to do that!!!")
                    res.redirect("back")
                }
            }
        })
        
    }
    else{
        req.flash("error","Please Login First");
        res.redirect("back");
    }
    
}

middleObj.checkCommentOwnership=function(req,res,next){
     //is logged in?
    if (req.isAuthenticated()){
        //find the campground which he is trying to modify
        Comment.findById(req.params.comment_id, function(err,foundComment){
            if(err || !foundComment){
                req.flash("error","Comment not found");
                res.redirect("back");
                console.log(err);
            }
            else{
                //compare the user id with the comment author's id
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin ){
                    console.log("id matched")
                    next();
                }else{
                    req.flash("error","You don't have permission to do it");
                    next();
                }
            }
        })
        
    }
    else{
        res.redirect("back");
    }
    
}

middleObj.checkUserOwnership=function(req,res,next){
    console.log("into the user Ownership function")
    if(req.isAuthenticated())
    {
        User.findById(req.params.id, function(err,foundUser){
            
        console.log(foundUser)
        
            // eval(require("locus"));
            if(err || !foundUser){
                req.flash("error", "User not Found..")
                res.redirect("back");
            }
            
            else{
                // if(foundUser._id.equals(currentUser._id)){
                    next();
                    }
           
                    // res.redirect("back");
                    // }
                })
        }
   
    else
    {
       req.flash("error","You need to Login with Desired username");
        res.redirect("back");
    }
    
 }
   

middleObj.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First!!!")
    res.redirect("/login");
}


module.exports=middleObj;