require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = 3000;

// =========================
// MIDDLEWARE
// =========================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));


// =========================
// MONGODB
// =========================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.log("MONGODB_URI is missing.");
    process.exit(1);
}


// =========================
// USER MODEL
// =========================

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);


// =========================
// REGISTER
// =========================

app.post("/api/register", async (req, res) => {

    try {

        const { username, password } = req.body;

        console.log("Register request:", username);

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });

        }

        const existingUser = await User.findOne({
            username: username
        });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Username already exists."
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        console.log("User registered successfully:", username);

        res.json({
    success: true,
    message: "Login successful!",
    username: user.username
});

    } catch (error) {

        console.log("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });

    }

});


// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        console.log("Login request:", username);

        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });

        }

        const user = await User.findOne({
            username: username
        });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Username not found."
            });

        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });

        }

        console.log("Login successful:", username);

        res.json({
            success: true,
            message: "Login successful!",
            username: user.username
        });

    } catch (error) {

        console.log("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });

    }

});


// =========================
// CONNECT MONGODB + START SERVER
// =========================

mongoose.connect(MONGODB_URI)
    .then(() => {

        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        });

    })
    .catch((error) => {

        console.log("MongoDB connection error:", error);

    });