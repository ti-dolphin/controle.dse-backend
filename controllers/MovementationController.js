const MovementationService = require("../services/MovementationService");


class MovementationController {
    async create(req, res) {
        try {
            const payload = req.body;
            const result = await MovementationService.create(payload);
            res.status(201).json(result);
        } catch (error) {
            console.log("error: ", error);
            res.status(500).json({ erro: error.message });
        }
    }

    async getMany(req, res) {
        try {
            const result = await MovementationService.getMany(req.query);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: error.message });
        }
    }

    async getById(req, res) {
        try {
            const result = await MovementationService.getById(
              Number(req.params.id_movimentacao)
            );
            if (!result) {
                return res.status(404).json({ erro: "Não encontrado" });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async update(req, res) {
        try {
            const payload = req.body;

            const result = await MovementationService.update(req.body.id_movimentacao, payload);
            if (!result) {
                return res.status(404).json({ erro: "Não encontrado" });
            }
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await MovementationService.delete(
              Number(req.params.id_movimentacao)
            );
            if (!result) {
                return res.status(404).json({ erro: "Não encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
}
module.exports = new MovementationController();
