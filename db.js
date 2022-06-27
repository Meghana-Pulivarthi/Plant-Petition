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
        `SELECT users.email, users.password, signatures.id FROM users
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
        `SELECT users.first, users.last, profiles.age, profiles.city, profiles.url 
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

// module.exports.editProfile = () => {
//     return db.query(`SELECT users.first,users.last,users.email,profiles.*
//      FROM users
//      JOIN profiles
//      ON users.id=profiles.users_id`);
// };
// INSERT INTO cators(name,age,oscars)
//  VALUES('INGRID', 67, 4)
// ON CONFLICT (id)
// DO UPDATE SET age=67, oscars=4;

// module.exports.editWithoutPass = () => {
//     const q = `INSERT INTO users (first,last,email,password) VALUES ($1,$2,$3,$4)`;
//     const a = `INSERT INTO profiles (first,last,email,password) VALUES($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE
//     SET first = {{first}}, last = {{last}},  email = {{email}}, password = {{password}} `;
//     return db.query(q, a);
// };

// module.exports.editWithPass = () => {
//     const q = `INSERT INTO users (first,last,email) VALUES ($1,$2,$3)`;
//     const a = `INSERT INTO profiles (first,last,email) VALUES($1,$2,$3) ON CONFLICT (id) DO UPDATE
//     SET SET first = {{first}}, last = {{last}},  email = {{email}} `;
//     return db.query(q, a);
// };
