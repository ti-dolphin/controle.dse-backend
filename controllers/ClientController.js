const express = require('express');
const ClientService = require('../services/ClientService');

class ClientController {
   async getMany(req, res) {
    try {
      const clients = await ClientService.getMany();
      res.json(clients);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

   async getById(req, res) {
    try {
      const { CODCLIENTE } = req.params;
      const client = await ClientService.getById(CODCLIENTE);
      res.json(client);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

   async create(req, res) {
    try {
      const client = await ClientService.create(req.body);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

   async update(req, res) {
    try {
      const { CODCLIENTE } = req.params;
      const client = await ClientService.update(CODCLIENTE, req.body);
      res.json(client);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

   async delete(req, res) {
    try {
      const { CODCLIENTE } = req.params;
      await ClientService.delete(CODCLIENTE);
      res.status(204).json({ message: 'Cliente excluído com sucesso' });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ClientController();
