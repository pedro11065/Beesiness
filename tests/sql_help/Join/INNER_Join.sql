-- Serve para juntar informações de outras tabelas

-- Existem 3 tipos gerais de JOINS:
-- INNER JOIN, OUTER JOIN E SELF - JOIN

-- PrimaryKey = É um valor que uidentifica nicamente aquela tabela.(Somente dela)
-- ForeignKey = Um valor estrangeiro de outra tabela

/*

CLIENTE    \ ENDEREÇO
           \
clienteID  \ EnderecoID
Nome       \ Rua
EnderecoID \ Cidade

Vamos dizer que eu quero passar uma informação que tem na tabela endereço mas não tem na tabela cliente
no caso, "EnderecoID"

No caso da tabela "Cliente" a PrimaryKey dela seria o ClienteID, por unicamente e exclusivamente dela.
Já a ForeignKey seria o "EndrecoID", por ser somente uma referência para a minha tabela orginal(endereço)

Para realizar essa junção de informações teria que ser realizado o algaritimo:
*/
SELECT C.ClienteID, C.Nome, E. Rua, E.Cidade
From Cliente C
INNER JOIN Endereco E ON E.EnderecoID = C.EnderecoID -- Agrupados pela coluna em comum, no caso, EnderecoID

/*

2| Bruno | Rua Norte | São Paulo

Exemplo na pratica:

BusinessEntityID, FirstName, LastName, EmailAddress

*/

SELECT TOP 10 *
FROM Person.Person --BusinessEntityID, FirstName, LastName, ESTÁ AQUI

SELECT TOP 10 *
FROM Person.EmailAddress -- BusinessEntityID, EmailAddress, ESTÁ AQUI

--A coluna em comum entre eles é a "BusinessEntityID"

SELECT p.BusinessEntityID, p.FirstName, p.LastName, pe.EmailAddress
FROM Person.Person AS P
INNER JOIN PERSON.EmailAddress AS PE on p.BusinessEntityID = pe.BusinessEntityID

-- Tem também como juntar todas as informações de duas tableas de uam vez só.
-- Assim:

SELECT *
FROM Person.BusinessEntityAddress as BA
inner join Person.Address AS PA ON PA.AddressID = BA.AddressID
