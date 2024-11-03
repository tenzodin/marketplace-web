// server/index.js

// ... [other imports and middleware]

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
