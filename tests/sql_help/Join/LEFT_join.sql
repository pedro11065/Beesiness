-- LEFT OUTER JOIN = LEFT JOIN

-- Quero descobrir quais pessoas tem um cartão de credito registrado:

SELECT *
FROM Person.Person PP
INNER JOIN Sales.PersonCreditCard PC
ON PP.BusinessEntityID = PC.BusinessEntityID
-- INNER JOIN: 19118 -> Só incluiu quem já tem cartão.
-- LEFT JOIN: 19972 -> ele incluiu também a pessoas que não tem cartão registrado.

-- Para saber quantos não tem o cartão:
SELECT *
FROM Person.Person PP
LEFT JOIN Sales.PersonCreditCard PC
ON PP.BusinessEntityID = PC.BusinessEntityID
WHERE PC.BusinessEntityID IS NULL
-- 854 Pessoas não tem cartão de crédito.