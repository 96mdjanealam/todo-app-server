require("dotenv").config();
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use(taskRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Todo app server is running");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
