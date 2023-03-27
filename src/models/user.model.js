const mongoose = require('mongoose');
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require('validator');
const config = require('../config/config');
const bcrypt = require('bcryptjs');

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true, // Always convert `test` to lowercase
			validate: (val) => validator.isEmail(val),
			unique: true,
		},
		password: {
			type: String,
			minLength: 8,
			required: true,
			trim: true,
			validate(value) {
				if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
					throw new Error(
						'Password must contain at least one letter and one number'
					);
				}
			},
		},
		walletMoney: {
			type: Number,
			required: true,
			default: config.default_wallet_money,
		},
		address: {
			type: String,
			default: config.default_address,
		},
	},
	// Create createdAt and updatedAt fields automatically
	{
		timestamps: true,
	}
);

userSchema.pre('save', async function (next) {
	try {
		const salt = await bcrypt.genSalt();
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
	const isMatched = await bcrypt.compare(password, this.password);
	return isMatched;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
	const user = await this.findOne({ email });
	if (!user) {
		return false;
	}
	return true;
};

/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
userSchema.methods.hasSetNonDefaultAddress = async function () {
	const user = this;
	return user.address !== config.default_address;
};

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = {
	User,
};
