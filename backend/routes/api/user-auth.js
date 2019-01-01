const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const UserSession = require("../../models/UserSession");

/* Sign Up */
router.post("/api/signup", (req, res, next) => {
	const { firstName, lastName, password } = req.body;
	let { email } = req.body;

	/* Error Checking */
	if (!firstName) {
		return res.send({
			success: false,
			message: "First name cannot be blank"
		});
	}
	if (!lastName) {
		return res.send({
			success: false,
			message: "Last name cannot be blank"
		});
	}
	if (!password || password.length < 4 || password.length > 25) {
		return res.send({
			success: false,
			message: "Password must between 4 and 25 characters."
		});
	}
	// Email validation
	if (!email) {
		return res.send({
			success: false,
			message: "Email cannot be blank"
		});
	}
	email = email.toLowerCase();

	// Verify email doesn't exist
	User.find({ email: email }, (err, prevUser) => {
		// Check if user exists or there is an error
		if (err) {
			return res.send({
				success: false,
				message: "Server error"
			});
		} else if (prevUser.length > 0) {
			return res.send({
				success: false,
				message: "Account already exists"
			});
		}

		// Create User
		const newUser = new User({
			firstName,
			lastName,
			email
		});

		// hash password
		newUser.password = newUser.generateHash(password);

		// Save User
		newUser.save((err, user) => {
			if (err) {
				return res.send({
					success: false,
					message: "Server error"
				});
			}
			res.send({
				success: true,
				message: "Success"
			});
		});
	});
});

/* Sign In */
router.post("/api/login", (req, res, next) => {
	const { password } = req.body;
	let { email } = req.body;

	if (!password && !email) {
		return res.send({
			success: false,
			message: "Please enter your email and password"
		});
	}

	if (!password || password.length < 4 || password.length > 20) {
		return res.send({
			success: false,
			message: "Please enter your password"
		});
	}

	// Email validation
	if (!email) {
		return res.send({
			success: false,
			message: "Please enter your email"
		});
	}
	email = email.toLowerCase();

	// Check user
	User.find({ email: email }, (err, users) => {
		// Check for error
		if (err) {
			return res.send({
				success: false,
				message: "Server error"
			});
		}

		if (users.length != 1) {
			return res.send({
				success: false,
				message: "Invalid email or password"
			});
		}

		// grab user
		const user = users[0];

		// Verify Password
		if (!user.validPassword(password)) {
			return res.send({
				success: false,
				message: "Invalid password"
			});
		}

		// Create new user session
		const userSession = new UserSession();
		userSession.userId = user._id;

		// Save user session
		userSession.save((err, doc) => {
			if (err) {
				return res.send({
					success: false,
					message: "Error creating session"
				});
			}

			return res.send({
				success: true,
				message: "Valid sign in",
				token: doc._id
			});
		});
	});
});

/* Verify */
router.get("/api/verify", (req, res, next) => {
	// get token
	const { token } = req.query;

	// Verify token
	UserSession.find({ _id: token, isDeleted: false }, (err, sessions) => {
		if (err) {
			return res.send({
				success: false,
				message: "Error validating session"
			});
		}

		// Check if token
		if (sessions.length != 1) {
			return res.send({
				success: false,
				message: "Couldn't find token"
			});
		} else {
			return res.send({
				success: true,
				message: "Valid Token"
			});
		}
	});
});

/* Logout */
router.get("/api/logout", (req, res, next) => {
	// get token
	const { token } = req.query;

	// verify token
	UserSession.findOneAndUpdate(
		{ _id: token, isDeleted: false },
		{ $set: { isDeleted: true } },
		null,
		(err, sessions) => {
			if (err) {
				return res.send({
					success: false,
					message: "Error validating token"
				});
			}
			return res.send({
				success: true,
				message: "Logged Out"
			});
		}
	);
});

module.exports = router;
