var express=require("express");
var app=express();

app.set("view engine", "ejs");

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

 var campgrounds=[
        {name: "Illinois Beach State Park : Zion, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/illinois-beach.jpg"},
        {name: "Matthiessen State Park: North Utica, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/matthiessen.jpg"},
        {name: "LaSalle/Peru KOA: North Utica, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/lasalle.jpg"},
        {name: "Starved Rock State Park: Oglesby, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/StarvedRock.5321.C.360600.jpg"},
        {name: "Chicago Northwest KOA: Union, IL", image: "http://50campfires.com/wp-content/uploads/2016/06/chicago-northwest.jpg"}
        ];
        

app.get("/",function(req,res){
    res.render("landing");
});

app.get("/campgrounds",function(req,res){
    res.render("campgrounds",{campgrounds:campgrounds});
});

app.post("/campgrounds",function(req,res){
    var newImageName=req.body.name;
    var newImageURL=req.body.image;
    var newCampGround={name:newImageName, image:newImageURL};
    campgrounds.push(newCampGround);
    res.redirect("/campgrounds");
});



app.get("/campgrounds/new",function(req,res){
    res.render("new");
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelp camp server has started");
});