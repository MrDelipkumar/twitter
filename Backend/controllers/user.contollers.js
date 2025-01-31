import User from "../models/user.model.js";
import Notification from "../models/notifications.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary"
export const getProfile = async (req , res)=>{
    try{
        const {userName} = req.params;
        const user = await User.findOne({userName})
        if(!user){
            return res.status(404).json({error : "User Not found"})
        }
        res.status(200).json(user);
    }catch(error){
        console.log(`Error in get User Profile Controller : ${error}`)
        res.status(500).json({error : "Internal server error"})
    }
}

export const followUnFollowuser = async (req , res)=>{
    try{

        const {id} = req.params;
        const userToModify = await User.findById({_id : id})
        const currentUser = await User.findById({_id : req.user._id})
        if(id === req.user.id){
            return res.status(404).json({error : "You can't unfollow/follow yourself"})
        }
        if(!userToModify || !currentUser){
            return res.status(404).json({error : "user not found"})
        }

        const isfollowing = currentUser.following.includes(id);
        if(isfollowing){
            await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id: req.user._id} , {$pull:{following:id}})
            
            res.status(200).json({message : "unfollow Successfully"})
        }else{
            await User.findByIdAndUpdate({_id:id} , {$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id : req.user._id} , {$push:{following:id}})
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to :userToModify._id
            })
            await newNotification.save();
            res.status(200).json({message : " follow Successfully"})
        }  
    }catch(error){
        console.log(`Error in follow and unfollow controller : ${error}`)
        res.status(500).json({error : " Internal Server error"})
    }
}

export const getSuggestedUsers = async (req , res)=>{
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id :userId}).select("-password")
        const users = await User.aggregate([
            {
                $match :{
                    _id :{$ne : userId}
                }
            },{
                $sample:{
                    size :10
                }
            }
        ])
        const fillteredUser = users.filter((user)=> !userFollowedByMe.following.includes(user._id))
        const suggestedUsers = fillteredUser.slice(0,4);
        suggestedUsers.forEach((user)=>(user.password = null))
        res.status(200).json(suggestedUsers);
    }
     catch(error){
        console.log(`Error in getSuggestedUsers controller : ${error}`)
        res.status(500).json({error : " Internal Server error"})
    }
}

export const updateUser = async(req , res)=>{
    try{
        const userId = req.user._id;
        const {userName , fullName , email , currentPassword , newPassword , bio , link}=req.body;
        let {profileImg , coverImg}=req.body;
        let user = await User.findById({_id : userId})
        if(!user){
            return res.status(404).json({error : "User Not Found"})
        }
        if(!newPassword && currentPassword || (!currentPassword && newPassword)){
            return res.status(404).json({error : "Please Provide both the new password and current Password"})
        }
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword , user.password)
            if(!isMatch){
                return res.status(404).json({error :"Current Password is Incorrect"})
            }
            if(newPassword.length <6){
                return res.status(404).json({error : "Password Must have atleast 6 char"})
            }
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(newPassword , salt);
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destory(user.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse =await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destory(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse =await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.userName = userName || user.userName;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;
        return res.status(200).json({user});
    }
    catch(error){
        console.log(`Error in getSuggestedUsers controller : ${error}`)
        res.status(500).json({error : " Internal Server error"})
    }
}