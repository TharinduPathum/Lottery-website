router.get("/api/admin/dashboard-stats", async (req, res) => {
  try {
    const activeUsers = await User.countDocuments(); 

    const pendingDraws = await LotteryDraw.countDocuments({ status: "pending" });

    
    const salesData = await Transaction.aggregate([
      { $match: { type: "purchase", status: "success" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
    ]);
    
    const totalSales = salesData.length > 0 ? salesData[0].totalAmount : 0;

    
    res.status(200).json({
      totalSales,
      activeUsers,
      pendingDraws
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});