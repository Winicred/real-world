const User = require('../models/User');

class ProfileController {
    async getProfile(request, response) {
        const {username} = request.params;
        const loggedIn = request.loggedIn;

        const user = await User.findOne({username});
        if (!user) {
            return response.status(404).json({message: 'User not found.'});
        }

        if (!loggedIn) {
            return response.status(200).json({
                profile: user.toProfileResponse(false)
            });
        }

        const loggedInUser = await User.findOne({email: request.user.email});
        if (!loggedInUser) {
            return response.status(404).json({message: 'User not found.'});
        }

        return response.status(200).json({
            profile: user.toProfileResponse(loggedInUser._id)
        });
    }

    async followUser(request, response) {
        const {username} = request.params;

        const loggedInUser = await User.findOne({email: request.user.email});
        const user = await User.findOne({username});
        if (!loggedInUser || !user) {
            return response.status(404).json({message: 'User not found.'});
        }

        await loggedInUser.follow(user._id);

        return response.status(200).json({
            profile: user.toProfileResponse(loggedInUser._id)
        });
    }

    async unfollowUser(request, response) {
        const {username} = request.params;

        const loggedInUser = await User.findOne({email: request.user.email});
        const user = await User.findOne({username});
        if (!loggedInUser || !user) {
            return response.status(404).json({message: 'User not found.'});
        }

        await loggedInUser.unfollow(user._id);

        return response.status(200).json({
            profile: user.toProfileResponse(loggedInUser._id)
        });
    }
}

module.exports = new ProfileController();