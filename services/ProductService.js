const ProductRepository = require('../repositories/ProductRepository');

class ProductService {
  async getMany(params, searchTerm) {
    return await ProductRepository.getMany(params, searchTerm);
  }

  async getById(id) {
    return await ProductRepository.getById(id);
  }

  async create(productData) {
    return await ProductRepository.create(productData);
  }

  async update(id, productData) {
    return await ProductRepository.update(id, productData);
  }

  async delete(id) {
    return await ProductRepository.delete(id);
  }
}

module.exports = new ProductService();
