const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

//----------------------Users Table-----------------\\

module.exports.addUser = (fname, lname, email, password) => {
    const q = `INSERT INTO users (first,last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;
    const param = [fname, lname, email, password];
    return db.query(q, param);
};

module.exports.getEmail = (email) => {
    return db.query(
        `SELECT users.email, users.password, users.id FROM users
    LEFT JOIN signatures
    ON signatures.users_id = users.id
    WHERE email = $1`,
        [email]
    );
};

//----------------------Signers Table-----------------\\
module.exports.addSigners = (signature, users_id) => {
    const q = `INSERT INTO signatures (signature,users_id) VALUES ($1,$2) RETURNING id`;
    const param = [signature, users_id];
    return db.query(q, param);
};

module.exports.countSigners = (signatureID) => {
    const q = `SELECT COUNT(ID) FROM signatures WHERE id=$1`;
    const param = [signatureID];
    return db.query(q, param);
};

exports.getSigners = () => {
    return db.query(
        `SELECT users.first, users.last, users.email, profiles.age, profiles.city, profiles.url 
        FROM users
        LEFT OUTER JOIN signatures
        ON users.id = signatures.users_id
        JOIN profiles
        ON users.id = profiles.users_id`
    );
};

module.exports.getDataURL = (signatureID) => {
    const q = `SELECT signature FROM signatures WHERE id=$1`;
    const param = [signatureID];
    return db.query(q, param);
};

//----------------------Profiles Table-----------------\\
module.exports.addProfiles = (age, city, url, users_id) => {
    const q = `INSERT INTO profiles (age,city,url,users_id) VALUES ($1,$2,$3,$4)`;
    const param = [age, city, url, users_id];
    return db.query(q, param);
};

module.exports.getCity = (city) => {
    const q = ` SELECT users.first, users.last, profiles.age, profiles.city, profiles.url 
        FROM users
        LEFT OUTER JOIN profiles
        ON users.id = profiles.users_id WHERE LOWER(CITY) = LOWER($1)`;
    const param = [city];
    return db.query(q, param);
};

//Editing profiles
module.exports.profile = (userID) => {
    const q = `SELECT users.first,users.last,users.email,profiles.*
     FROM users
     LEFT OUTER JOIN profiles
     ON users.id=profiles.users_id
     WHERE users.id=$1`;
    const param = [userID];
    return db.query(q, param);
};

module.exports.editUserWithoutPass = (first, last, email, userID) => {
    const q = `UPDATE users SET first=$1, last=$2, email=$3 WHERE id=$4`;
    const param = [first, last, email, userID];
    return db.query(q, param);
};

module.exports.editUserWithPass = (first, last, email, password, userID) => {
    const q = `UPDATE users SET first=$1, last=$2, email=$3 email=$4 WHERE id=$5`;
    const param = [first, last, email, password, userID];
    return db.query(q, param);
};

module.exports.editProfiles = (age, city, url, userID) => {
    const q = `INSERT INTO profiles (age,city,url,users_id) 
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (users_id)
           DO UPDATE SET age=$1, city = $2,url=$3`;
    const param = [age, city, url, userID];
    return db.query(q, param);
};
//Deleting signature
module.exports.deleteSignature = (id) => {
    return db.query(`DELETE FROM signatures WHERE id = $1`, [id]);
};

//Deleting Profiles

// module.exports.deleteSigners = (users_id) => {
//     return db.query(`DELETE FROM users WHERE users_id = $1`, [users_id]);
// };

// module.exports.deleteProfiles = (users_id) => {
//     return db.query(`DELETE FROM profiles WHERE users_id = $1`, [users_id]);
// };

// module.exports.deleteUsers = (id) => {
//     return db.query(`DELETE FROM users WHERE id = $1`, [id]);
// };
