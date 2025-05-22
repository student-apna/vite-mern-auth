import jwt from 'jsonwebtoken';

export const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({success:false,message:'Not Authorized. Login Again'})
    }
    try {
     const tokenDecode =    jwt.verify(token,process.env.JWT_SECRET);
    //  console.log(tokenDecode.id);
     if(tokenDecode.id){

        if (!req.body) req.body = {};
        req.body.userId = tokenDecode.id;
        
     }else{
        return res.json({success:false,message:'Not Authorized. Login Again'})
     }

     next();
        
    } catch (error) {
        res.json({success:false,message:error.message})
        
    }

}

