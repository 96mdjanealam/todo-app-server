const express = require("express");
const connectToDatabase = require("../models/task");
const authenticateUser = require("../middleware/authMiddleware");
const { ObjectId } = require("mongodb");
const router = express.Router();

// Middleware to attach database instance
router.use(async (req, res, next) => {
  req.db = await connectToDatabase();
  next();
});

// Get all tasks for the logged-in user
router.get("/tasks", authenticateUser, async (req, res) => {
  const db = req.db;
  const userId = req.user.uid;

  try {
    const tasks = await db.collection("tasks").find({ userId }).toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Adding a new task
router.post("/tasks", authenticateUser, async (req, res) => {
  const db = req.db;
  const { title, description, category } = req.body;
  const userId = req.user.uid;

  if (!title || title.length > 50) {
    return res.status(400).json({
      message:
        "Title is required and must be less than or equal to 50 characters",
    });
  }

  const newTask = {
    userId,
    title,
    description,
    category,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection("tasks").insertOne(newTask);
    res.json({ _id: result.insertedId, ...newTask });
  } catch (err) {
    res.status(500).json({ message: "Error adding task" });
  }
});

// Update a task
router.put("/tasks/:taskId", authenticateUser, async (req, res) => {
  const db = req.db;
  const { taskId } = req.params;
  const { title, description, category, order } = req.body;
  const userId = req.user.uid;

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (category) updateFields.category = category;
  if (order !== undefined) updateFields.order = order;

  try {
    const result = await db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(taskId), userId }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// Delete a task
router.delete("/tasks/:id", authenticateUser, async (req, res) => {
  const db = req.db;
  const { id } = req.params;
  const userId = req.user.uid;

  try {
    const result = await db
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(id), userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;
