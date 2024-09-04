-- O union ajuda a combinar dois ou mais resultados de um select em um único resultado.ABORT

SELECT Coluna1, coluna2
FROM tabela1
UNION
SELECT coluna1, coluna2
FROM tabela2

-- O UNION ALL permite que você junte as informações incluindo os dados duplicados.

SELECT Coluna1, coluna2
FROM tabela1
UNION ALL
SELECT coluna1, coluna2
FROM tabela2

-- O UNION normalmente é usado em tabelas que não estão normalizadas -> tem algum tipo de inconsistência.