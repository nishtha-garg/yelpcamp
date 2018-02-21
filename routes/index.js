var express=require("express");
var router=express.Router();



var User=require("../models/user");
var Campground=require("../models/campground");
var middleware=require("../middleware");

var passport=require("passport");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");

router.get("/",function(req,res){
    res.redirect("/campgrounds");
});



//////////////////////////////////////////////
/////////////////AUTH ROUTES//////////////////
/////////////////////////////////////////////

router.get("/register",function(req,res){
    res.render("users/register");
})


router.post("/register",function(req,res){
    var newUser=new User({
        username:req.body.username,
        avatar:req.body.avatar,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email
    })
    // eval(require("locus"));
    if (req.body.adminCode==='secretcode1234'){
        newUser.isAdmin=true;
    }
    User.register(newUser,req.body.password,function(err,user){
        if(err){
           
            console.log(err);
            return res.render("users/register",{"error":err.message});
        }
        else{
            passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to YelpCamp, "+ user.username)
            res.redirect("/campgrounds")
            })
        }
    })
})



/////////////////////////////////////
//////LOGIN ROUTES////////////
////////////////////////////////////

//render logic form
router.get("/login",function(req,res){
    res.render("users/login");
})

//login logic
router.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
    }),function(req,res){
        });
        


/////////////////////////////////////
//////LOGOUT ROUTES////////////
////////////////////////////////////

router.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
})

//USER PROFILE

//show particular user profile
router.get("/users/:id",middleware.checkUserOwnership,function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err || !foundUser){
            req.flash("error", "Cannot find the user");
            res.redirect("/campgrounds");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
            if(err){
                req.flash("error","Something went wrong..")
                res.redirect("/")
            }
       
        res.render("users/show", {user:foundUser, campgrounds:campgrounds})
        })
    })
})


//Edit user's Profile:
router.get("/users/:id/edit",middleware.checkUserOwnership, function(req,res){
    console.log("middleware checked, into the edit route");
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "User not found");
            res.redirect("/users/"+req.params.id);
        }
        else{
            if(foundUser._id.equals(req.user._id)){
                console.log(foundUser);
                res.render("users/edit",{user:foundUser});
            }
            else{
                req.flash("error", "You don't have permission to do that");
                
                res.redirect("/users/"+req.params.id);
            }
            
        }
    })
})

//UPDATE USER PROFILE
router.put("/users/:id",middleware.checkUserOwnership, function(req,res){
    var newUser={
        username:req.body.username, 
        password:req.body.password,
        avatar:req.body.avatar,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
    }
    User.findByIdAndUpdate(req.params.id,newUser,function(err, foundUser){
        if(err){
            req.flash("error","This update is not possible");
            res.redirect("back");
        }
        else{
            req.flash("success", "USER PROFILE successfully updated");
            res.redirect("/users/"+req.params.id);
            
        }
    })
})

////////////////////////////////
//FORGOT ROUTES/////////////////
///////////////////////////////


router.get("/forgot", function(req,res){
    res.render("forgot")
})

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'nishthagarg212@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nishthagarg212@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'learntocodeinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'learntocodeinfo@mail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});





module.exports=router;