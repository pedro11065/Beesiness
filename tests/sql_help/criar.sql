CREATE TABLE parkslot_historic(
    ID SERIAL PRIMARY KEY,
    Plate VARCHAR(7) UNIQUE,
    Custumer_name VARCHAR(255), 
    time_arrive VARCHAR(5),
    date_arrive VARCHAR(10)
    time_exit VARCHAR(5),
    date_exit VARCHAR(10)
	
);


CREATE TABLE Teste (
    IDconta INT PRIMARY KEY,
    soma INT,
    num1 INT,
    num2 INT -- Ultimo não tem virgula
);
