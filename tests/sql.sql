/*To so anotando uns codigos SQL, ignore*/


/*

Table_users: user_id(UUID), user_fullname, user_email, user_password, user_birthday

Table_companies: company_id(UUID), user_id(table_users), company_name, company_email, company_cnpj, company_password)

table_user_companies: company_id(table_companies), user_id(table_users), user_access_level


table_log_all: log_time, log_description

*/

INSERT INTO table_users (user_fullname, user_email, user_password, user_birthday)
VALUES ('Pedro Henrique SIlva Quixabeira', 'pedro@gmail.com','12345678','13/03/2006');

CREATE TABLE table_users 
(user_id UUID primary key default uuid_generate_v4(), /*UUID*/
user_fullname varchar(255), 
user_email varchar(255) unique, 
user_password varchar(25), 
user_birthday varchar(10);
user_cpf varchar(11) unique);;


CREATE TABLE table_companies 
(company_id primary key default uuid_generate_v4(), /*UUID*/
user_id UUID REFERENCES table_users(user_id), /*Faz a relação com o user_id na outra tabela. Está ai para indicar quem registrou a empresa*/
company_name varchar(255),
company_email varchar(255) unique, 
company_cnpj varchar(14) unique,
company_password varchar(25));

CREATE TYPE access_level AS ENUM ('viewer', 'checker', 'editor'); /*Cria um tipo de registro chamado acess_level que só permite essas 3 opções, servindo como verificação no banco de dados*/

CREATE TABLE table_user_companies /*Só mandar o nivel de acesso do usuário ('viewer', 'checker', 'editor')*/
(company_id UUID REFERENCES table_companies(company_id), 
user_id UUID REFERENCES table_users(user_id),
user_access_level access_level); /*Faz a relação com o user_id na outra tabela. Está ai para indicar quem registrou a empresa*/

CREATE TABLE table_log_all /*Não é necessario enviar que horas são, já commita sozinho a data, só mandar a descrição*/
(log_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
log_description varchar(255));
