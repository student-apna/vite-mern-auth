import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRouter from "./routes/userRouter.js";



const app = express();



app.use(cors({
  origin: 'https://vite-mern-auth-w4a1.vercel.app', // your Vercel frontend URL
  credentials: true
}));

connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

// API endpoint

app.get('/',(req,res)=>{
    res.send('API Working fine');
})

app.use('/api/auth',authRoutes);
app.use('/api/user',userRouter)

const port = process.env.PORT || 4000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})