const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

module.exports.addSigners = () => {
    console.log(
        "[db]firstname",
        firstname,
        "[db]lastname",
        lastname,
        "[db]signature",
        signatures
    );
    const q = `INSERT INTO signatures (first,last,signature) VALUES ($1,$2,$3)`;
    const param = [firstname, lastname, signatures];
    return db.query(q, param);
};

module.exports.getSigners = () => {
    return db.query(`SELECT first,last FROM signatures`);
};

module.exports.countSigners = () => {
    return db.query(`SELECT COUNT(id) FROM signatures`);
};

module.exports.getDataURL = (signaturesID) => {
    const q = `SELECT signature FROM signatures WHERE id = $3`;
    const param = [signaturesID];
    return db.query(q, param);
};
