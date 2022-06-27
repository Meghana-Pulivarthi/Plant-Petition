DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profiles;



CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first VARCHAR NOT NULL CHECK (first != ''),
  last VARCHAR NOT NULL CHECK (last != ''),
  email VARCHAR NOT NULL CHECK (email !='') UNIQUE,
  password VARCHAR NOT NULL CHECK (password !='')
);

CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
users_id INT REFERENCES users(id) UNIQUE,
signature VARCHAR NOT NULL CHECK (signature != '')
);

CREATE TABLE profiles (
id SERIAL PRIMARY KEY,
users_id INT REFERENCES users(id) UNIQUE,
age INT,
city VARCHAR,
url VARCHAR
);

