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

// Weather API (sample data)
app.get("/weather", (req, res) => {
    res.json({
        city: "Pune",
        temperature: "30°C",
        condition: "Sunny",
        humidity: "45%",
        wind: "12 km/h",
        feelsLike: "32°C",
        forecast: [
            { day: "Mon", temp: "31°C", condition: "Sunny" },
            { day: "Tue", temp: "29°C", condition: "Cloudy" },
            { day: "Wed", temp: "27°C", condition: "Rainy" },
            { day: "Thu", temp: "30°C", condition: "Sunny" },
            { day: "Fri", temp: "28°C", condition: "Partly Cloudy" }
        ]
    });
});

app.listen(5001, () => {
    console.log("Server running on http://localhost:5001");
});
