import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js";
export const signup = async (req , res)=>{
    try{
        const { userName , fullName , email , password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
        return res.status(404).json({error: " Invaild email Format"})}
        const existingEmail = await User.findOne({email})
        const existingUser = await User.findOne({userName})
        if (existingEmail || existingUser ){
            return res.status(404).json({error : "Your UserName or Email Already Existing"})
        }
        if (password.length < 6){
            return res.status(404).json({error : "Password Must have atleast 6 char length"})
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password , salt);
        const newUser = new User ({
            userName,
            fullName,
            email,
            password : hashedPassword
        })

        if (newUser){
            generateToken(newUser._id , res)
            await newUser.save();
            res.status(200).json({
                _id : newUser._id,
                userName : newUser.userName,
                fullName : newUser.fullName,
                email : newUser.email,
                followers : newUser.followers,
                following : newUser.following,
                profileImg : newUser.profileImg,
                coverImg : newUser.coverImg,
                bio : newUser.bio,
                link : newUser.link
            })
        }
        else{
            res.status(404).json({error : " Invalid User Data "})
        }
    } catch (error) {
            console.log(`Error in signup controller : ${error}`)
            res.status(500).json({error : "Internal Server Error"})
    }
    
}
export const login = async (req , res)=>{
    try{
        const {userName , password } = req.body;
        const user = await User.findOne({userName});
        const isPasswordCorrect = await bcrypt.compare(password , user?.password || "");
        if(!user || !isPasswordCorrect){
            return res.status(404).json({error : "Invalid UserName Or Password"})
        }
        generateToken(user._id , res);
        res.status(200).json({
            _id : user._id,
                userName : user.userName,
                fullName : user.fullName,
                email : user.email,
                followers : user.followers,
                following : user.following,
                profileImg : user.profileImg,
                coverImg : user.coverImg,
                bio : user.bio,
                link : user.link
        })
    } catch(error){
        console.log(`Error in login Controller : ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}
export const logout = async (req , res)=>{
    try{
        res.cookie("jwt","",{maxAge : 0});
        res.status(200).json({message : "Logout Successfully"})
    }catch(error){
        console.log(`Error in logout Controller : ${error}`)
        res.status(500).json({error : "Internal Server Error"})
    }
    
}
export const getMe = async (req , res)=>{
    try{
        const user = await User.findOne({_id : req.user._id}).select("-password")
        res.status(200).json(user);
    }catch(error){
        console.log(`Error in getMe Controller : ${error}`)
        res.status(500).json({error : "Internal Server Error"});
    }
}