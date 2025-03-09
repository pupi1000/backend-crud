const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Asegúrate de tener el modelo

// Crear usuario (POST /usuarios)
router.post('/', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Obtener todos los usuarios (GET /usuarios)
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Actualizar usuario por ID (PUT /usuarios/:id)
router.put('/:id', async (req, res) => {
    try {
        const usuarioActualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json(usuarioActualizado);
    } catch (error) {
        res.status(400).json({ mensaje: error.message });
    }
});

// Eliminar usuario por ID (DELETE /usuarios/:id)
router.delete('/:id', async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuarioEliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;
