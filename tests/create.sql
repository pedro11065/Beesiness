INSERT INTO db_usuarios ( nomecompleto, email, senha, datadenascimento)
VALUES ('Pedro Henrique SIlva Quixabeira', 'pedro@gmail.com','12345678','13/03/2006');

CREATE TABLE table_users (id serial primary key, fullname varchar(255), email varchar(255) unique, password varchar(25), birthday varchar(10));
