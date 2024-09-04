/* Na pasta Join

+ A tabela "A" é a tabela citada após o "FROM" +
+ E a tabela "B" é a que antecede o "ON" (Pós INNER JOIN) +

TABELAS EXEMPLO:

    A            B

ID  NOME   | ID  NOME   |
           |            |
1  Robo    | 1  Espada  |
2  Macaco  | 2  ROBO    |
3  SAMURAI | 3  Mario   |
4  Monitor | 4  SAMURAI |
           
INNER JOIN: retorna apenas os resultados que correspondem(existem) tanto na tabela A como Tabela B.
*/
SELECT * 
FROM TabelaA
INNER JOIN TabelaB
ON tabelaA.nome = TabelaB.nome
/*
ID NOME    ID NOME
1  Robo    2  ROBO
3  Samurai 4  SAMURAI

-----------------------------------------------------------------------

FULL OUTER JOIN: retorna um conjunto de todos os registros correspondentes da TabelaA
e TabelaB quando são iguais. E além disso se não houver valores correspondentes,
 ele simplismente irá preencher esse lado com "null".
*/
SELECT * 
FROM TabelaA
FULL OUTER JOIN TabelaB
ON TabelaA.nome = TabelaB.nome
/*
ID NOME    ID   NOME
1  Robo    2    ROBO
2  Macaco  NULL NULL
3  Samurai 4    SAMURAI
4  Monitor NULL NULL
NULL NULL  1    Espada
NULL NULL  3    Mario

------------------------------------------------------------------------

LEFT OUTER JOIN(LEFT JOIN): retorna um conjunto de todos os registros da TabelaA, e além disso,
 os registros correspondentes(quando disponíveis) na TabelaB. Se não houver registros correspondentes
  ele simplismente vai preencher com "null".
*/
SELECT * FROM TabelaA
LEFT JOIN TabelaB
ON TabelaA.nome = TabelaB.nome
/*

ID NOME    ID   NOME
1  Robo    2    robo
2  Macaco  NULL NULL
3  Samurai 4    Samurai
4  Monitor NULL NULL
(ele só vai trazer os dados da tabela B quando existir dados correspondentes na tabelaA)
------------------------------------------------------------------------