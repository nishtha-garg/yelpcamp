var mongoose=require("mongoose");

var Campground=require("./models/campground");
var Comment=require("./models/comment");
 var data=[
        {
        name: "Illinois Beach State Park : Zion, IL", 
        image: "http://50campfires.com/wp-content/uploads/2016/06/illinois-beach.jpg",
        description: "Illinois Beach State Park is part of the Illinois state park system and is located along Lake Michigan in Winthrop Harbor, Zion, and unincorporated Benton Township in northeast Illinois. Together with lands to the north, including Chiwaukee Prairie, it forms the Chiwaukee Illinois Beach Lake Plain, an internationally recognized wet-land under the Ramsar Convention.[1] The park is broken into two units that encompass an area of 4,160 acres (1,683 ha) and contains over six miles of Lake Michigan shoreline."
 },
        
        
        {
        name: "Matthiessen State Park: North Utica, IL", 
        image: "http://50campfires.com/wp-content/uploads/2016/06/matthiessen.jpg",
        description: "The park is centered on a stream that flows from Matthiessen Lake to the Vermilion River. The stream has eroded partway through the sandstone layers, leaving interesting rock formations and drops. The Upper Dells begin at Matthiessen Lake with the Lake Falls, which drop into the canyon below, and continue downstream to the 45-foot-tall (14 m) Cascade Falls where the Lower Dells begin. The interesting coloration of many of the canyons is the result of minerals in the groundwater. Many mineral springs exist throughout the park, providing salt lick spots for the large deer population."
        },
        
        
        {
        name: "LaSalle/Peru KOA: North Utica, IL", 
        image: "http://50campfires.com/wp-content/uploads/2016/06/lasalle.jpg",
        description: "With easy access from I-39 and I-80, yet away from interstate noise, this KOA is a great country retreat for weary travelers looking for a good night's sleep. Simple pleasures like relaxing around a campfire and enjoying the sounds of nature will help you prepare for the next leg of your journey. Or extend your stay and explore the state parks in the area. Just 5 miles south, the deep canyons and towering bluffs at Starved Rock State Park will make you feel as though you've left the Prairie State altogether. Hike up to 13 miles of trails along canyons with waterfalls. At nearby Matthiessen State Park, you'll find vigorous trails and beautiful rock formations. Check out restaurants, shopping and golf in the area."
        }
    ]    
        





function seedDB(){
    
    //Remove all campgrounds
    Campground.remove({},function(err){
        if(err){
            console.log(err);
            console.log("error in removing all campgrounds")
        }
        console.log("Campgroungs are successfully removed")
        
        
    //     //Add new campgrounds
    //     data.forEach(function(seed){
    //     Campground.create(seed,function(err,campground){
    //         if(err){
    //             console.log(err)
    //         }else{
    //           console.log("Campground added") 
    //         }
        
    //     //create a comments for each campground
    //     Comment.create(
    //         {
    //         text:"I really liked this place but i wish, if there could be an internet",
    //         author:"Jatin"
    //         },function(err,comment){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             campground.comments.push(comment);
    //             campground.save();
    //             console.log("new comment created");
    //         }
    //     }
    //     )
        
    // })
    // }) 
    })
}

module.exports=seedDB;