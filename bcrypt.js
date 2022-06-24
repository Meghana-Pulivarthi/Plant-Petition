const bcrypt = require("bcryptjs");

exports.hash = (hashpassword) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(hashpassword, salt);
    });
};

exports.compare = bcrypt.compare;
