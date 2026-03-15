const jwt = require("jsonwebtoken")
const secret = process.env.JWT_SECRET_TOKEN

function setUser(user, email) {
    const payload = {
        email: email,
        roll: user.roll_no,
        password: user.password
    }

    const token = jwt.sign(payload, secret)
    return token
}

function getUser(token) {
    try {
        const user = jwt.verify(token, secret)
        return user
    } catch (error) {
        console.log("Error", error)
        return null        
    }
}

module.exports = {
    setUser,
    getUser
}