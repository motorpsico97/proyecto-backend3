const User = require('../models/User.js');

const createUserDao = async (userData) => User.create(userData);

const deleteUserDao = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        return null;
    }

    await user.deleteOne();
    return user;
};

const findUserByEmailDao = async (email) => User.findOne({ email });

const findUserByEmailWithPasswordDao = async (email) =>
    User.findOne({ email }).select('+password');

const getUsersDao = async () => User.find().select('-password');

const getUserByIdDao = async (id) => User.findById(id).select('-password');

const getUserByIdWithPasswordDao = async (id) => User.findById(id).select('+password');

const findUserByIdDao = async (id) => User.findById(id);

module.exports = {
    createUserDao,
    deleteUserDao,
    findUserByEmailDao,
    findUserByEmailWithPasswordDao,
    getUsersDao,
    getUserByIdDao,
    getUserByIdWithPasswordDao,
    findUserByIdDao,
};
