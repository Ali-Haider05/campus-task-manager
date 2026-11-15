import mongoose from "mongoose";

const getHealth = (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
};

export { getHealth };
