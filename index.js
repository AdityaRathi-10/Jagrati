require("dotenv").config()
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const fs = require("fs")

const userRouter = require("./routes/user")

const app = express()
const PORT = process.env.PORT || 9001

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

app.use(express.static(path.resolve("./views/images")))
app.use(express.static(path.resolve("./views/styles")))
app.use(express.static(path.resolve("./public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.json())

app.use("/user", userRouter)

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/show", (req, res) => {
    fs.readFile('./attendance.json', 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading attendance file:", err);
            return res.status(500).json({ error: "Failed to load attendance data" });
        }

        try {
            const attendanceData = JSON.parse(data);
            res.render("show", {
                attendanceData
            });
        } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr);
            res.status(500).json({ error: "Invalid attendance data format" });
        }
    })
})

app.get("/add-student", (req, res) => {
    res.render("addStudent")
})

app.get("/add-schedule", (req, res) => {
    res.render("addSchedule")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/get-involved", (req, res) => {
    res.render("get_involved")
})

app.get("/present", (req, res) => {
    res.render("attendance")
})

app.get("/donate", (req, res) => {
    res.render("donation")
})

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`))