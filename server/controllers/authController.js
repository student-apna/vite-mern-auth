import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

import {EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'

export const register = async (req,res)=>{
    const {name,email,password} = req.body;
    // console.log(req.body);
    if(!name || !email || !password){
       return res.json({success:false,message:'Missing Details'}) ;
    }

    try {

        const existingUser = await userModel.findOne({email});
        if(existingUser ){
            return res.json({success:false,message:
                "User Already exists "})
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user = new userModel({name,email,password:hashedPassword})
        await user.save();

        // generate token
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure :process.env.NODE_ENV==='production' ,
            sameSite:process.env.NODE_ENV==='production'?
            'none':'strict',
            maxAge:7 * 24 * 60 * 60 * 1000
        });


      // send a welcome email
      const mailOptions = {
        from :process.env.SENDER_EMAIL,
        to:email, // user ko send krenge jisne account create kiya hai
        subject:'Welcome to Shameen Auto Spare Parts',
        text:`Welcome to GLA website .
         Your account has been created with email id :${email}`

      }

      await transporter.sendMail(mailOptions);


        return res.json({success:true,message:"User Succussfully register"});

        
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }
}

// controller function for user login


export const login = async (req,res)=>{
    const {email,password} = req.body;

    if(!email || !password){
        return res.json({success:false,message:'Email and password are required'})
    }
    try {
        const user  = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'Invalid email'});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:'Invalid Password'});
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure :process.env.NODE_ENV==='production' ,
            sameSite:process.env.NODE_ENV==='production'?
            'none':'strict',
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success:true,
        });
        
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}


export const logout = async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure :process.env.NODE_ENV==='production' ,
            sameSite:process.env.NODE_ENV==='production'?
            'none':'strict',
        })

        return res.json({success:true,message:"Logged Out"});
        
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
}




// Send Verification OTP to the User's Email
export const sendVerifyOtp = async (req,res)=>{
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:
                'Account already verified'})
        }

        const otp =String( Math.floor( 100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now()+2 * 60 *1000;  // 2 min 
        await user.save();

     const mailOption = {
        from :process.env.SENDER_EMAIL,
        to:user.email,
         subject:'Account Verification OTP',
        // text:`Your OTP is ${otp}. Verify your account using this OTP.`,
        html :EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)

        }

    await transporter.sendMail(mailOption);
     res.json({success:true,message:'Verification OTP Sent on Email'})
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}


// verify the email using the OTP

export const verifyEmail = async (req,res)=>{
    const {userId,otp} = req.body;
    // user sirf otp send krega useId ko cookies se nikalenge middleware ki help se
    if(!userId || !otp){
        return res.json({success :false,message:'Missing Details'});
    }

    try {
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success:false,message:'User Not Found'})
        }

        if(user.verifyOtp==='' || user.verifyOtp!==otp){
            return res.json({success:false,message:'Invalid OTP'})
        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:'OTP Expired'})
        }
        
        user.isAccountVerified = true;
        // reset
        user.verifyOtp = '';
        user.verifyOtpExpireAt=0;
        await user.save();

        return res.json({success:true,message:'Email verified'})

        
    } catch (error) {
        return res.json({success:false,message:error.message});
    }

} 


// check if user is authenticated

export const isAuthenticated = async(req,res)=>{
    try {
        return res.json({success:true});
        
    } catch (error) {
        res.json({success:false,message:error.message});
        
    }

}

// Send Password Reset OTP
export const sendResetOtp = async (req,res)=>{
    const {email} = req.body;
    if(!email){
     return res.json({success:false,message:'Email is Jaruri'})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'user not found'});
        }
        // send the otp
        const otp = Math.floor( 100000 + Math.random() * 900000);
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now()+5 * 60 *1000;  // 5 min
        await user.save();

     const mailOption = {
        from :process.env.SENDER_EMAIL,
        to:user.email,
        subject:'Password Reset OTP',
        text:`Your OTP for resetting your password is ${otp}.
         Use this OTP to proceed with resetting your password.`,
         html :PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)

        }

    await transporter.sendMail(mailOption);
    return res.json({success:true,message:'OTP sent to your email'})
        
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}


// Reset User Password

export const resetPassword = async (req,res)=>{
    const {email,otp,newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false
            ,message:'Email , OTP and new Password are required'})
    }

    try {
        const user  = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:'user not found'})
        }
        if(user.resetOtp==="" || user.resetOtp!==otp){
            return res.json({success:false,message:'Invalid OTP'});
        }

        if(user.resetOtpExpireAt< Date.now()){
            return res.json({success:false,message:'OTP Expired'});
        }
        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOtp='';
        user.resetOtpExpireAt = 0;
        await  user.save();

        return res.json({success:true,message:'Password has been reset successfully'});
        
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}