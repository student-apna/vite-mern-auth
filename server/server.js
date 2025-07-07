import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRouter from "./routes/userRouter.js";

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://vite-mern-auth-w4a1.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

connectDB();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('API Working fine');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
