const express = require("express")
const { handleUserSignup, handleUserLogin, handleAttendance, handleDonation, handleAddStudent, handleVolunteerSchedule } = require("../controllers/user")
const db = require("../connection.js")

const router = express.Router()

router.post("/signup", handleUserSignup)
router.post("/login", handleUserLogin)
router.post("/attendance", handleAttendance)
router.get('/logout', (req, res) => {
    res.clearCookie("token").redirect("/")
})
router.post("/donate", handleDonation)
router.post("/add-student", handleAddStudent)
router.post("/add-schedule", handleVolunteerSchedule)
router.get("/view-detail", async (req, res) => {
    const { roll } = req.query;

    const query = `
        SELECT v.name, v.roll_no, v.password, v.role, s.day
        FROM volunteer v
        JOIN schedule s
        ON v.roll_no=s.roll_no
        WHERE v.roll_no=? 
    `
    
    if (!roll) {
        return res.status(400).send('Invalid request');
    }

    try {
        const [results] = await db.execute(query, [roll]);
        if (results.length > 0) {
            res.render('view_detail', { volunteer: results });
        } else {
            res.status(404).send('No details found for this volunteer');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching volunteer details');
    }
})

module.exports = router