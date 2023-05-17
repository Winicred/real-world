const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const User = mongoose.model('users', new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            match: [/\S+@\S+\.\S+/, 'is invalid'],
            index: true
        },
        bio: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: "https://static.productionready.io/images/smiley-cyrus.jpg"
        },
        favouriteArticles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }],
        followingUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true,
        versionKey: false
    })
);

User.prototype.toUserResponse = function () {
    return {
        username: this.username,
        email: this.email,
        bio: this.bio,
        image: this.image,
        token: this.generateAccessToken()
    }
};

User.prototype.toProfileResponse = function (userId) {
    return {
        username: this.username,
        bio: this.bio,
        image: this.image,
        following: userId ? this.isFollowing(userId) : false
    }
};

User.prototype.isFollowing = function (id) {
    const idStr = id.toString();
    for (const followingUser of this.followingUsers) {
        if (followingUser.toString() === idStr) {
            return true;
        }
    }

    return false;
};

User.prototype.follow = function (id) {
    if (this.followingUsers.indexOf(id) === -1) {
        this.followingUsers.push(id);
    }

    return this.save();
};

User.prototype.unfollow = function (id) {
    if (this.followingUsers.indexOf(id) !== -1) {
        this.followingUsers.remove(id);
    }

    return this.save();
};

User.prototype.isFavourite = function (id) {
    const idStr = id.toString();
    for (const article of this.favouriteArticles) {
        if (article.toString() === idStr) {
            return true;
        }
    }
    return false;
}

User.prototype.generateAccessToken = function () {
    const accessToken = jwt.sign({
        "user": {
            "id": this._id,
            "email": this.email,
            "password": this.password
        }
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
    return accessToken;
}

User.prototype.favorite = function (id) {
    if (this.favouriteArticles.indexOf(id) === -1) {
        this.favouriteArticles.push(id);
    }

    return this.save();
}

User.prototype.unfavorite = function (id) {
    if (this.favouriteArticles.indexOf(id) !== -1) {
        this.favouriteArticles.remove(id);
    }

    return this.save();
}

module.exports = User