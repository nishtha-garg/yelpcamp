var mongoose=require("mongoose");

//Schema Setup
var commentSchema=new mongoose.Schema({
    text:String,
    author: 
    {
        id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
        createdAt: { type: Date, default: Date.now },
        username: String
    }
    
},{ usePushEach: true });

//modelling
module.exports=mongoose.model("Comment",commentSchema);
