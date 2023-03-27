const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { cartService } = require('../services');

/**
 * Fetch the cart details
 *
 * Example response:
 * HTTP 200 OK
 * {
 *  "_id": "5f82eebd2b11f6979231653f",
 *  "email": "crio-user@gmail.com",
 *  "cartItems": [
 *      {
 *          "_id": "5f8feede75b0cc037b1bce9d",
 *          "product": {
 *              "_id": "5f71c1ca04c69a5874e9fd45",
 *              "name": "ball",
 *              "category": "Sports",
 *              "rating": 5,
 *              "cost": 20,
 *              "image": "google.com",
 *              "__v": 0
 *          },
 *          "quantity": 2
 *      }
 *  ],
 *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
 *  "__v": 33
 * }
 *
 *
 */
const getCart = catchAsync(async (req, res) => {
	try {
		const cart = await cartService.getCartByUser(req.user);
		res.send(cart);
	} catch (err) {
		const { statusCode, message } = err;
		res.status(statusCode).send({ message });
	}
});

/**
 * Add a product to cart
 *
 *
 */
const addProductToCart = catchAsync(async (req, res) => {
	try {
		const cart = await cartService.addProductToCart(
			req.user,
			req.body.productId,
			req.body.quantity
		);
		res.status(httpStatus.CREATED).send(cart);
	} catch (err) {
		// console.log(err);
		const { statusCode, message } = err;
		if (!statusCode) {
			return res
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send({ message: 'Internal Server Error' });
		}
		res.status(statusCode).send({ message });
	}
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * - If updated quantity > 0,
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated cart object
 * - If updated quantity == 0,
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 *
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 *
 *
 */
const updateProductInCart = catchAsync(async (req, res) => {
	try {
		const { quantity, productId } = req.body;
		if (quantity > 0) {
			const cart = await cartService.updateProductInCart(
				req.user,
				productId,
				quantity
			);
			res.status(200).send(cart);
		} else if (req.body.quantity == 0) {
			const cart = await cartService.deleteProductFromCart(req.user, productId);
			res.status(204).send(cart);
		}
	} catch (err) {
		const { statusCode, message } = err;
		if (!statusCode) {
			return res
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send({ message: 'Internal Server Error' });
		}
		res.status(statusCode).send({ message });
	}
});

/**
 * Checkout user's cart
 */
const checkout = catchAsync(async (req, res) => {
	await cartService.checkout(req.user);
	return res.status(204).send();
});

module.exports = {
	getCart,
	addProductToCart,
	updateProductInCart,
	checkout,
};
