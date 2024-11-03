// server/routes/products.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../routes/middleware/auth'); // Ensure this path is correct

const router = express.Router();

// ... rest of your product routes


/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private
 */
router.post(
  '/',
  auth,
  [
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('price', 'Price must be a number').isNumeric(),
    body('category', 'Category is required').not().isEmpty(),
    // images can be optional
  ],
  async (req, res) => {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure request body
    const { title, description, price, category, images } = req.body;

    try {
      const newProduct = new Product({
        title,
        description,
        price,
        category,
        images: images || [],
        sellerId: req.user.id,
      });

      await newProduct.save();

      res.status(201).json(newProduct);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

/**
 * @route   GET /api/products
 * @desc    Get all products with optional search and category filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  const { search, category } = req.query;
  let query = {};

  if (search) {
    query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  if (category) {
    query.category = category;
  }

  try {
    const products = await Product.find(query).populate('sellerId', 'username');
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'username');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private
 */
router.put(
  '/:id',
  auth,
  [
    body('title').optional().not().isEmpty().withMessage('Title cannot be empty'),
    body('description').optional().not().isEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('category').optional().not().isEmpty().withMessage('Category cannot be empty'),
    // images can be optional
  ],
  async (req, res) => {
    // Validate incoming request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure request body
    const { title, description, price, category, images } = req.body;

    // Build product object
    let productFields = {};
    if (title) productFields.title = title;
    if (description) productFields.description = description;
    if (price) productFields.price = price;
    if (category) productFields.category = category;
    if (images) productFields.images = images;

    try {
      let product = await Product.findById(req.params.id);

      if (!product) return res.status(404).json({ message: 'Product not found' });

      // Check user
      if (product.sellerId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'User not authorized' });
      }

      product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: productFields },
        { new: true }
      ).populate('sellerId', 'username');

      res.json(product);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check user
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await product.remove();

    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
