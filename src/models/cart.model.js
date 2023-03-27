const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require('../config/config');

// TODO: CRIO_TASK_MODULE_CART - Complete cartSchema, a Mongoose schema for "carts" collection
const subCartSchema = new mongoose.Schema({
	product: productSchema,
	quantity: { type: Number, required: true },
});

const cartSchema = mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		cartItems: [subCartSchema],
		paymentOption: { type: String, default: 'PAYMENT_OPTION_DEFAULT' },
	},
	{
		timestamps: false,
	}
);

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;
