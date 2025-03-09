const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;


console.log('Rutas disponibles:');
if (app._router && app._router.stack) {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods)
        .map((method) => method.toUpperCase())
        .join(', ');
      console.log(`${methods} ${middleware.route.path}`);
    }
  });
} else {
  console.log('⚠️ No hay rutas registradas.');
}


// Middleware
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/Sample', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => console.log('Conectado a MongoDB'));

// Modelos de Mongoose
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true, required: true },
});
const productoSchema = new mongoose.Schema({
  nombre: String,
  precio: { type: Number, required: true },
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Producto = mongoose.model('Producto', productoSchema);

// Contadores
const operaciones = { GET: 0, POST: 0, PUT: 0, DELETE: 0 };

const contarOperacion = (req, res, next) => {
  if (operaciones[req.method] !== undefined) {
    operaciones[req.method]++;
  }
  next();
};

app.get('/operaciones', (req, res) => {
  res.json(operaciones);
});

// Rutas Usuarios
const usuarioRouter = express.Router();
usuarioRouter.post('/', contarOperacion, async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});


usuarioRouter.get('/', contarOperacion, async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error });
  }
});

usuarioRouter.put('/:id', contarOperacion, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
});

usuarioRouter.delete('/:id', contarOperacion, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
});

// Rutas Productos
const productoRouter = express.Router();
productoRouter.post('/', contarOperacion, async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error });
  }
});

productoRouter.get('/', contarOperacion, async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos', error });
  }
});

productoRouter.put('/:id', contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
});

productoRouter.delete('/:id', contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
});

// Contadores
app.get('/contadores', async (req, res) => {
  try {
    const usuariosCount = await Usuario.countDocuments();
    const productosCount = await Producto.countDocuments();
    res.json({ usuarios: usuariosCount, productos: productosCount });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los contadores', error });
  }
});

app.get('/operaciones', (req, res) => {
  res.json({ totalOperaciones });
});

// Usar rutas
app.use('/usuarios', usuarioRouter);
app.use('/productos', productoRouter);



// Función para validar ID
// Middleware para validar ID de MongoDB (solo debe declararse una vez)
const validarID = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID no válido' });
  }
  next();
};

// Usar validación en rutas
usuarioRouter.put('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
});

usuarioRouter.delete('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
});

productoRouter.put('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
});

productoRouter.delete('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
});

// Usar validación en rutas
usuarioRouter.delete('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
});

productoRouter.put('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error });
  }
});

productoRouter.delete('/:id', validarID, contarOperacion, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error });
  }
});
// Iniciar el servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
