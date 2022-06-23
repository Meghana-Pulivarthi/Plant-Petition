DROP TABLE IF EXISTS signatures;
-- DROP TABLE IF EXISTS users;

  CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       users_id INT NOT NULL,
      --  users_id INT REFERENCES user(id),
      --  first VARCHAR NOT NULL CHECK (first != ''),
      --  last VARCHAR NOT NULL CHECK (last != ''),
       signature VARCHAR NOT NULL CHECK (signature != '')
   );

CREATE TABLE users (
id SERIAL PRIMARY KEY,
first VARCHAR NOT NULL CHECK (first != ''),
last VARCHAR NOT NULL CHECK (last != ''),
email VARCHAR NOT NULL CHECK (email !='') UNIQUE,
passwd VARCHAR NOT NULL CHECK (passwd !='')
);