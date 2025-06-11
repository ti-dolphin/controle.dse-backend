const { prisma } = require("../database");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
class UserService {
    async login(email, password) {
        const user = UserRepository.getUserByEmail(email);
        if (!user) {
            throw new Error("E-mail ou senha inválidos");
        }
        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        if (user.password !== hashedPassword) {
            throw new Error("E-mail ou senha inválidos");
        }
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "10h" }
        );
        return { user: { id: user.id, email: user.email }, token };
    }
}
module.exports = UserService;