const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first,last, email, password) VALUES ($1,$2,$3,$4) RETURNING *`;
    const param = [first, last, email, password];
    return db.query(q, param);
};

module.exports.addSigners = (first, last, signature) => {
    const q = `INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3) RETURNING *`;
    const param = [first, last, signature];
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
