import { Request, Response } from "express";
import Ticket from "../models/ticketModel";
import User from "../models/userModel";
import Draw from "../models/draw";


export const generateTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketsToCreate = [];
    const drawDate = "2026-06-25"; 

    for (let i = 0; i < 100; i++) {
      
      const randomId = Math.floor(10000 + Math.random() * 90000);
      const ticketNumber = `LOTT-${Date.now().toString().slice(-4)}-${randomId}`;
      
      const luckyNumbers: number[] = [];
      while (luckyNumbers.length < 5) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!luckyNumbers.includes(num)) {
          luckyNumbers.push(num);
        }
      }

      ticketsToCreate.push({
        ticketNumber,
        luckyNumbers,
        price: 100, 
        status: "available",
        drawDate,

      });
    }

  
    await Ticket.insertMany(ticketsToCreate, { ordered: false });

    res.status(201).json({ message: "වාසනාවන්ත ලොතරැයි ටිකට්පත් 100ක් සාර්ථකව පද්ධතියට එකතු කරන ලදී!" });
  } catch (error) {
    console.error("❌ TICKET GENERATION ERROR DETECTED:", error);

    res.status(500).json({ 
      message: "Server Error", 
      error: (error as Error).message 
    });
  }
};
export const getAvailableTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find({ status: "available" });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};

export const buyTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, ticketId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "පරිශීලකයා සොයාගත නොහැක." });
      return;
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "ලොතරැයි පත සොයාගත නොහැක." });
      return;
    }

    if (ticket.status === "sold") {
      res.status(400).json({ message: "කණගාටුයි! මෙම ලොතරැයි පත දැනටමත් වෙනත් අයෙකු මිලදී ගෙන ඇත." });
      return;
    }

    if (user.walletBalance < ticket.price) {
      res.status(400).json({ message: "ඔබගේ...</textarea>පසුම්බියේ (Wallet) ප්‍රමාණවත් මුදල් නොමැත. කරුණාකර Top-up කරන්න." });
      return;
    }

    user.walletBalance -= ticket.price;
    await user.save();

    ticket.status = "sold";
    ticket.userId = user._id as any;
    await ticket.save();

    res.status(200).json({
      message: "ලොතරැයි පත මිලදී ගැනීම සාර්ථකයි! වාසනාව උදාවේවා!",
      currentBalance: user.walletBalance,
      purchasedTicket: ticket
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: (error as Error).message });
  }
};

export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || req.headers["user-id"]; 

    if (!userId) {
       res.status(400).json({ message: "User ID is required" });
       return;
    }

    const myTickets = await Ticket.find({ userId: userId }); 
    res.status(200).json(myTickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const drawLottery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { winningNumbers } = req.body;

    if (!winningNumbers || !Array.isArray(winningNumbers) || winningNumbers.length !== 5) {
       res.status(400).json({ message: "කරුණාකර නිවැරදි දිනුම් අංක 5 ඇතුළත් කරන්න." });
       return;
    }

    const soldTickets = await Ticket.find({ status: "sold" });

    let totalWinners = 0;
    let totalPayout = 0;
    let count5000 = 0, count1000 = 0, count500 = 0, count200 = 0, count100 = 0;

    for (const ticket of soldTickets) {
      const matches = ticket.luckyNumbers.filter((num: number) => winningNumbers.includes(num)).length;

      let prizeMoney = 0;
      if (matches === 5) { prizeMoney = 5000; count5000++; } 
      else if (matches === 4) { prizeMoney = 1000; count1000++; } 
      else if (matches === 3) { prizeMoney = 500; count500++; } 
      else if (matches === 2) { prizeMoney = 200; count200++; } 
      else if (matches === 1) { prizeMoney = 100; count100++; }

      if (prizeMoney > 0) {
        totalWinners++;
        totalPayout += prizeMoney;

        await User.findByIdAndUpdate(ticket.userId, {
          $inc: { walletBalance: prizeMoney }
        });

        (ticket as any).status = "won";
        (ticket as any).prizeWon = prizeMoney; 
      } else {
        (ticket as any).status = "lost";
      }
      await ticket.save();
    }

    await Ticket.updateMany(
      { status: "available" }, 
      { $set: { status: "expired" } }
    );

    const newDrawResult = new Draw({
  winningNumbers,
  summary: {
    checkedTickets: soldTickets.length,
    totalWinners,
    totalPayout: `Rs. ${totalPayout}.00`,
    breakdown: { count5000, count1000, count500, count200, count100 }
  }
});
await newDrawResult.save();

    res.status(200).json({
      message: "ලොතරැයිය සාර්ථකව අදින ලදී!",
      summary: {
        checkedTickets: soldTickets.length,
        totalWinners,
        totalPayout: `Rs. ${totalPayout}.00`,
        breakdown: { count5000, count1000, count500, count200, count100 }
      }
    });

  } catch (error) {
    console.error("Error drawing lottery:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Ticket.find({ status: { $ne: "available" } }).populate("userId", "name email");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export const getPastDrawResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const draws = await Draw.find().sort({ drawDate: -1 });
    res.status(200).json(draws);
  } catch (error) {
    console.error("Error fetching draw results:", error);
    res.status(500).json({ message: "Server Error" });
  }
};