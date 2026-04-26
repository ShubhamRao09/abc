const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Calculator API
app.post("/add", (req, res) => {
    const { a, b } = req.body;
    res.json({ result: a + b });
});

app.post("/subtract", (req, res) => {
    const { a, b } = req.body;
    res.json({ result: a - b });
});

app.post("/multiply", (req, res) => {
    const { a, b } = req.body;
    res.json({ result: a * b });
});

app.post("/divide", (req, res) => {
    const { a, b } = req.body;
    if (b === 0) return res.status(400).json({ error: "Cannot divide by zero" });
    res.json({ result: a / b });
});

app.listen(5001, () => {
    console.log("Server running on http://localhost:5001");
});
