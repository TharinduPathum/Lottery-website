import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRouter from "./routers/authRouter";
import ticketRouter from "./routers/ticketRouter";
import paymentRouter from "./routers/paymentRouter";

dotenv.config();

const app = express();

connectDB();

app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/payments", paymentRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running on port ${PORT}`);
});