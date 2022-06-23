const bcrypt = require("./bcrypt");

bcrypt
    .hash(passwd)
    .then(function (hash) {
        console.log(hash);
        return bcrypt.compare(passwd, hash);
    })
    .then(function (isCorrect) {
        if (isCorrect) {
            console.log("correct!");
        } else {
            console.log("WRONG!");
        }
    });
