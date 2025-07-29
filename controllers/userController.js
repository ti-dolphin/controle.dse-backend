const UserService  = require("../services/UserService");

class UserController {
     async login(req, res) {
        try {
            const payload = req.body;
            const {token, user} = await UserService.login(payload);
            res.status(200).json({ token, user });
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
    }

     async register(req, res) {
        try {
            const payload = req.body;
            const user = await UserService.create(payload);
            res.status(201).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

     async update(req, res) {
        try {
            const payload = req.body;
            const user = await UserService.update(req.params.CODPESSOA, payload);
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

     async delete(req, res) {
        try {
            await UserService.delete(req.params.CODPESSOA);
            res.status(204).send();
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const user = await UserService.getById(req.params.CODPESSOA);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getMany(req, res) {
        try {
            const users = await UserService.getMany(req.query); //passa parâmetros para a busca
            res.status(200).json(users);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getComercialUsers(req, res) {
        try {
            const users = await UserService.getComercialUsers(); //passa parâmetros para a busca
            res.status(200).json(users);
        } catch (err) {
          res.status(400).json({ error: err.message });
        }
    }


}

module.exports = new UserController();
