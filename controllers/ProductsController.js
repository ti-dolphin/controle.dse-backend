const ProductService = require("../services/ProductService");

class ProductsController {
    async getMany(req, res) {
       try {
         const params = req.query;
         const {searchTerm } = params;

          const products = await ProductService.getMany({}, searchTerm);
          res.json(products);
       } catch (err) {
         console.log(err)
          res.status(500).json({ error: err.message });
       }
    }

    async getById(req, res) {
       try {
          const product = await ProductService.getById(Number(req.params.id));
          if (!product) {
             return res.status(404).json({ error: "Produto não encontrado" });
          }
          res.json(product);
       } catch (err) {
          res.status(500).json({ error: err.message });
       }
    }

    async create(req, res) {
       try {
          const newProduct = await ProductService.create(req.body);
          res.status(201).json(newProduct);
       } catch (err) {
          res.status(400).json({ error: err.message });
       }
    }

    async update(req, res) {
       try {
          const updatedProduct = await ProductService.update(
            Number(req.params.id),
            req.body
          );
          if (!updatedProduct) {
             return res.status(404).json({ error: "Produto não encontrado" });
          }
          res.json(updatedProduct);
       } catch (err) {
          res.status(400).json({ error: err.message });
       }
    }

    async delete(req, res) {
       try {
          const deleted = await ProductService.delete(Number(req.params.id));
          if (!deleted) {
             return res.status(404).json({ error: "Produto não encontrado" });
          }
          res.json({ message: "Produto excluído com sucesso" });
       } catch (err) {
          res.status(500).json({ error: err.message });
       }
    }
}

module.exports = new ProductsController();
