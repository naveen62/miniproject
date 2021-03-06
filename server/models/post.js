const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    post:{
        type:String,
        required:[true, 'please provide post title'],
        trim:true,
    },
    imagethr:{
        type:Boolean,
        default:false
    },
    image:{
        type: Buffer
    },
    community:{
        type:String,
        required:true,
        ref:'Community'
    },
    communityId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Community'
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
})

const Post = mongoose.model('Post', postSchema);

postSchema.virtual('comments',{
    ref:'Comment',
    localField:'_id',
    foreignField:'post'
})
postSchema.set('toObject', { virtuals: true });
postSchema.set('toJSON', { virtuals: true });

module.exports = Post;