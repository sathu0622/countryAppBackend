const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors({
  origin: '*', // Or specify your frontend origin explicitly like 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect("mongodb+srv://sathushan622:yj9G8A6daFxzY5F1@cluster0.2ydqcvl.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the User API");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//hrghrgh