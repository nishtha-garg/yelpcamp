var mongoose=require("mongoose");

//Schema Setup
var campgroundSchema=new mongoose.Schema({
    name:String,
    image:String,
    price:String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    description:String,
     author: 
    {
        id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
        username: String
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
        ]
    
},{ usePushEach: true });

//modelling
module.exports=mongoose.model("Campground",campgroundSchema);
