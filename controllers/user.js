const db = require("../connection")
const { setUser } = require("../auth")
const fs = require("fs")

async function handleUserSignup(req, res) {
    const { username, email, password } = req.body

    const roll = email.split('@iiitdmj.ac.in')[0].toUpperCase()

    const query = `
        SELECT name, roll_no
        FROM iiitstudent
        WHERE roll_no=?
    `

    const query2 = `
        INSERT INTO volunteer VALUES (?, ?, ?, ?)
    `

    try {
        const [results] = await db.execute(query, [roll]);
        if(!email.includes("@iiitdmj.ac.in")) return res.render("invalid_credentials");
        if (results.length === 0) return res.send("<h1>Student not found</h2>");

        if(results[0].roll_no === roll) {
            await db.execute(query2, [roll, username, 'Normal', password])
            return res.render("login");
        }

    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).send("An error occurred: " + err.message);
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body

    if(!email.includes("@iiitdmj.ac.in")) return res.render("invalid_credentials");

    const roll =  email.split("@iiitdmj.ac.in")[0].toUpperCase()

    if(roll.toString().length !== 8) return res.render("invalid_credentials");

    const query = `
        SELECT roll_no, name, password, role FROM volunteer WHERE roll_no=?
    `
    const query1 = `
        SELECT v.name, v.roll_no, v.password, v.role, s.day, s.subject
        FROM volunteer v
        JOIN schedule s
        ON v.roll_no=s.roll_no
        WHERE v.roll_no=? 
    `
    const query2 = `
        SELECT * FROM volunteer
    `

    const query3 = `
        SELECT * FROM student
    `

    try {
        const [results] = await db.execute(query, [roll])  
        const [results1] = await db.execute(query1, [roll])  
        const [results2] = await db.execute(query2)  
        const [results3] = await db.execute(query3)  

        if(results.length === 0) return res.send("<h1>Volunteer not found</h1>")
        if(results[0].password !== password) return res.render("invalid_credentials");

        const token = setUser(results[0], email)
        res.cookie("token", token)
    
        if(results[0].role == 'Normal') {
            if(results1.length === 0) {
                res.send("<h1>You cannot Login as you are not alloted a schedule</h1>")
            }
            return res.render("dashboard", {
                volunteer: results1
            });
        }
        else {
            return res.render("admin", {
                admin: results,
                volunteer: results2,
                students: results3
            });
        }

    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).send("An error occurred: " + err.message);
    }
}

async function handleDonation(req, res) {
    const { username, email, address, contact, payment, amount } = req.body

    const query = `
        INSERT INTO donation VALUES (?, ?, ?, ?, ?, ?)
    `
    try {
        await db.execute(query, [username, payment, amount, address, email, contact]);
        return res.send("<h1>Thank you for your kind help!</h1>")
        
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).send("An error occurred: " + err.message);
    }
}

async function handleAttendance(req, res) {
    const date = new Date()
    const todayDate = (date.getDate() + "-" + (Number(date.getMonth()) + 1) + "-" + date.getFullYear()).toString()

    const attendanceForToday = {};
    for (const [key, value] of Object.entries(req.body)) {
        attendanceForToday[key] = value;
    }

    fs.readFile('./attendance.json', 'utf8', (err, data) => {
        let attendanceData = {};

        if (!err && data) {
            try {
                attendanceData = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
            }
        }

        attendanceData[todayDate] = attendanceForToday;

        fs.writeFile('./attendance.json', JSON.stringify(attendanceData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing file:", writeErr);
                res.status(500).send("<h1>Error marking attendance</h1>");
            } else {
                console.log("Attendance recorded for:", todayDate);
                res.send("<h1>Attendance marked successfully!</h1>");
            }
        })
    })
}

async function handleAttendanceShowing(req, res) {
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
}

async function handleAddStudent(req, res) {
    const { std, fname, mname, lname, village } = req.body

    const query = `
        INSERT INTO student VALUES (?, ?, ?, ?, ?, ?)
    `

    let roll = ''

    while(roll.length !== 4) {
        let val = Math.floor(Math.random()*10)
        if(roll.length == 0 && val == '0') continue
        roll += val
    }

    try {
        await db.execute(query, [roll, std, fname, mname, lname, village]);
        return res.send("<h1>Student added successfully!</h1>")
        
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).send("An error occurred: " + err.message);
    }
}

async function handleVolunteerSchedule(req, res) {
    const { roll, day, subject } = req.body

    const query = `
        SELECT *
        FROM volunteer
        WHERE roll_no=?
    `

    const query1 = `
        INSERT INTO schedule VALUES (?, ?, ?)
    `

    try {
        const results = await db.execute(query, [roll])
        if(results.length === 0) return res.send("<h1>Student not registered as Volunteer!</h1>")
        await db.execute(query1, [roll, day, subject]);
        return res.send("<h1>Schedule updated successfully!</h1>")
        
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).send("An error occurred: " + err.message);
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleAttendance,
    handleAttendanceShowing,
    handleDonation,
    handleAddStudent,
    handleVolunteerSchedule
}