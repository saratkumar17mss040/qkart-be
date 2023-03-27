const httpStatus = require('http-status');
const { Cart, Product } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
	const userCart = await Cart.findOne({ email: user.email });
	if (!userCart) {
		throw new ApiError(httpStatus.NOT_FOUND, 'User does not have a cart');
	}
	return userCart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
	const product = await Product.findById(productId);
	if (!product) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			"Product doesn't exist in database"
		);
	} else {
		const userCart = await Cart.findOne({ email: user.email });
		if (!userCart) {
			try {
				let newCart = await Cart.create({ email: user.email, cartItems: [] });
				newCart.cartItems.push({ product, quantity });
				await newCart.save();
				return newCart;
			} catch (err) {
				throw new ApiError(
					httpStatus.INTERNAL_SERVER_ERROR,
					'Internal Server Error'
				);
			}
		} else if (userCart) {
			for (let ele of userCart.cartItems) {
				if (ele.product._id == productId) {
					throw new ApiError(
						httpStatus.BAD_REQUEST,
						'Product already in cart. Use the cart sidebar to update or remove product from cart'
					);
				}
			}
			userCart.cartItems.push({ product, quantity });
			await userCart.save();
			return userCart;
		}
	}
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
	const product = await Product.findById(productId);
	if (!product) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			"Product doesn't exist in database"
		);
	} else {
		const userCart = await Cart.findOne({ email: user.email });
		if (!userCart) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'User does not have a cart. Use POST to create cart and add a product'
			);
		} else if (userCart) {
			for (const item of userCart.cartItems) {
				if (item.product._id == productId) {
					item.quantity = quantity;
					await userCart.save();
					return userCart;
				}
			}
			throw new ApiError(httpStatus.BAD_REQUEST, 'Product not in cart');
		}
	}
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
	const userCart = await Cart.findOne({ email: user.email });
	if (!userCart) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'User does not have a cart');
	} else if (userCart) {
		for (let i = 0; i < userCart.cartItems.length; i++) {
			if (userCart.cartItems[i].product._id == productId) {
				userCart.cartItems.splice(i, 1);
				await userCart.save();
				return userCart;
			}
		}
		throw new ApiError(httpStatus.BAD_REQUEST, 'Product not in cart');
	}
};

const checkout = async (user) => {
	const userCart = await getCartByUser(user);
	if (userCart.cartItems.length == 0)
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			`User does not have any products added in the cart`
		);
	if (!(await user.hasSetNonDefaultAddress())) {
		throw new ApiError(httpStatus.BAD_REQUEST, `Set User address first`);
	}
	let totalCartValue = 0;
	for (let item of userCart.cartItems) {
		totalCartValue += item.product.cost * item.quantity;
	}
	if (user.walletMoney < totalCartValue)
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			`Insufficient funds in user's wallet`
		);
	user.walletMoney -= totalCartValue;
	await user.save();
	userCart.cartItems = [];
	userCart.save();
};

module.exports = {
	getCartByUser,
	addProductToCart,
	updateProductInCart,
	deleteProductFromCart,
	checkout,
};
