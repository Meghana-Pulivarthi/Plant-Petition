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

module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first,last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;
    const param = [first, last, email, password];
    return db.query(q, param);
};

module.exports.getEmail = () => {
    return db.query(`SELECT email FROM users`);
};

module.exports.getEmail = () => {
    return db.query(`SELECT email FROM users`);
};
//----------------------Signers Table-----------------\\
module.exports.addSigners = (signature, users_id) => {
    const q = `INSERT INTO signers (signature,users_id) VALUES ($1,$2) RETURNING id`;
    const param = [signature, users_id];
    return db.query(q, param);
};

module.exports.getSigners = () => {
    return db.query(`SELECT first,last FROM signatures`);
};

module.exports.countSigners = () => {
    return db.query(
        `SELECT first, last,(select count(id) FROM signatures) FROM signatures`
    );
};

module.exports.getDataURL = (signaturesID) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const param = [signaturesID];
    return db.query(q, param);
};
