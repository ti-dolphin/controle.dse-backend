const UserService  = require("../services/UserService");

class UserController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await UserService.login(email, password);
            const {token, user} = data;
            res.status(200).json(result);
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const user = await UserService.create(req.body);
            res.status(201).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const user = await UserService.update(req.params.id, req.body);
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await UserService.delete(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const user = await UserService.getById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    static async getMany(req, res) {
        try {
            const users = await UserService.getMany(req.query); //passa parâmetros para a busca
            res.status(200).json(users);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = UserController;
