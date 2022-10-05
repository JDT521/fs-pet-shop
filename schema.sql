DROP TABLE IF EXISTS pets CASCADE;

CREATE TABLE pets (
    id serial,
    pet_name varchar(20),
    age integer,
    kind varchar(20)
);

INSERT INTO pets (pet_name, age, kind) VALUES ('fido', 7, 'rainbow');
INSERT INTO pets (pet_name, age, kind) VALUES ('buttons', 5, 'snake');