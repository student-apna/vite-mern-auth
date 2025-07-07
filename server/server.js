import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRouter from "./routes/userRouter.js";

const app = express();

// ✅ TRUST proxy for cookies (VERY IMPORTANT for deployed server like Render)
app.set('trust proxy', 1);

// ✅ CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://vite-mern-auth-w4a1.vercel.app',
  'https://vite-mern-auth-w4a1-aftab-alams-projects-3a2a889d.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// ✅ Middleware
connectDB();
app.use(express.json());
app.use(cookieParser());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('API Working fine');
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// ✅ Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
