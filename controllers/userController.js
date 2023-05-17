const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserController {
    async login(request, response) {
        const { user } = request.body;

        if (!user || !user.email || !user.password) {
            return response.status(400).json({ message: "All fields are required." });
        }

        const loginUser = await User.findOne({ email: user.email });
        if (!loginUser) {
            return response.status(404).json({ message: "User not found." });
        }

        const match = await bcrypt.compare(user.password, loginUser.password);
        if (!match) {
            return response.status(401).json({ message: 'Invalid credentials.' });
        }

        return response.status(200).json({
            user: loginUser.toUserResponse()
        });
    }

    async register(request, response) {
        const { user } = request.body;

        if (!user || !user.email || !user.username || !user.password) {
            return response.status(400).json({ message: "All fields are required." });
        }

        const candidate = await User.findOne({ $or: [{ email: user.email }, { username: user.username }] });
        if (candidate) {
            return response.status(422).json({
                errors: {
                    body: "User already exists."
                }
            });
        }

        const hashedPwd = await bcrypt.hash(user.password, 10);
        const userObject = {
            "username": user.username,
            "password": hashedPwd,
            "email": user.email
        };

        const createdUser = await User.create(userObject);
        if (!createdUser) {
            return response.status(422).json({
                errors: {
                    body: "Unable to register a user."
                }
            });
        }

        return response.status(201).json({
            user: createdUser.toUserResponse()
        });
    }

    async getMe(request, response) {
        const { email } = request.user;

        const user = await User.findOne({ email }).exec();
        if (!user) {
            return response.status(404).json({ message: "User not found." });
        }

        return response.status(200).json({
            user: user.toUserResponse()
        })
    }

    async update(request, response) {
        const { user } = request.body;

        if (!user) {
            return res.status(400).json({ message: "Required a user object." });
        }

        const { email } = request.user;

        const target = await User.findOne({ email }).exec();
        if (!target) {
            return response.status(404).json({ message: "User not found." });
        }

        if (user.email) {
            target.email = user.email;
        }
        if (user.username) {
            target.username = user.username;
        }
        if (user.password) {
            const hashedPwd = await bcrypt.hash(user.password, 10);
            target.password = hashedPwd;
        }
        if (typeof user.image !== 'undefined') {
            target.image = user.image;
        }
        if (typeof user.bio !== 'undefined') {
            target.bio = user.bio;
        }
        await target.save();

        return response.status(200).json({
            user: target.toUserResponse()
        });
    }
}

module.exports = new UserController();