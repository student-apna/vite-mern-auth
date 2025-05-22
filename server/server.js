import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRouter from "./routes/userRouter.js";

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))

// API endpoint

app.get('/',(req,res)=>{
    res.send('API Working ');
})

app.use('/api/auth',authRoutes);
app.use('/api/user',userRouter)

const port = process.env.PORT || 4000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})