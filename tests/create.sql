INSERT INTO table_users (user_fullname, user_email, user_password, user_birthday)
VALUES ('Pedro Henrique SIlva Quixabeira', 'pedro@gmail.com','12345678','13/03/2006');

CREATE TABLE table_users (id serial primary key, user_fullname varchar(255), user_email varchar(255) unique, user_password varchar(25), user_birthday varchar(10));
