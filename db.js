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

module.exports.getEmail = () => {
    return db.query(`SELECT email,password FROM users
    JOIN signatures
    ON signatures.users_id = users.id`);
};

//----------------------Signers Table-----------------\\
module.exports.addSigners = (signature, users_id) => {
    const q = `INSERT INTO signatures (signature,users_id) VALUES ($1,$2) RETURNING id`;
    const param = [signature, users_id];
    return db.query(q, param);
};

module.exports.countSigners = () => {
    return db.query(`SELECT * FROM signatures`);
};

exports.getSigners = () => {
    return db.query(
        `SELECT users.first, users.last, signatures.signature FROM users JOIN signatures ON users.id = signatures.users_id`
    );
};

module.exports.getDataURL = (usersID) => {
    const q = `SELECT signature,first,last FROM signatures JOIN users ON users.id = signatures.users_id WHERE users.id = $1`;
    const param = [usersID];
    return db.query(q, param);
};

//----------------------Signers Table-----------------\\
module.exports.addProfiles = (age, city, url, users_id) => {
    const q = `INSERT INTO profiles (age,city,url,users_id) VALUES ($1,$2,$3,$4)`;
    const param = [age, city, url, users_id];
    return q, param;
};

module.exports.getCity = () => {
    return db.query(`SELECT city FROM profiles WHERE LOWER(CITY) = LOWER($1)`);
};
