const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto'); // Asegúrate de tener el modelo

// Crear producto (POST /productos)
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        await nuevoProducto.save();
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Obtener todos los productos (GET /productos)
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Actualizar producto por ID (PUT /productos/:id)
router.put('/:id', async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!productoActualizado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(productoActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Eliminar producto por ID (DELETE /productos/:id)
router.delete('/:id', async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!productoEliminado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
