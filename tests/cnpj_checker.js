function validaCNPJ (cnpj) {
    var b = [ 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 ] //Declara array contendo os números necessários para a validação
    var c = String(cnpj).replace(/[^\d]/g, '') //Converte cnpj para string, usa replace para remover os caractéres não desejados e armazena na variável c 
    
    if(c.length !== 14) //Verifica se o comprimento de c é diferente de 14, caso for, retorna false
        return false

    if(/0{14}/.test(c)) //Usa a expressão /0{14}/ para verificar se c consiste somente em 0, caso for, retorna false
        return false

    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]); //Inicia um for que percorre de 0 a 11, onde é calculado a soma do produto de cada digito em c com seu peso correspondente em b
    if(c[12] != (((n %= 11) < 2) ? 0 : 11 - n)) //Calcula o resto de n dividido por 11, se o resto for menor que 2, o digito verificador é 0, caso contrário é 11 menos o resto. O digito calculado é comparado com o digito 13 de c. Se não for igual, é retornado false
        return false

    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]); //Inicia um for que percorre de 0 a 12, calcula a soma do produto de cada digito em c com seu peso correspondente em b.
    if(c[13] != (((n %= 11) < 2) ? 0 : 11 - n)) //Calcula o segundo digito do cpf com a mesma lógica usada anteriormente e compara com o digito 14 de c, se não for igual, retorna falso
        return false

    return true //Passou por todas validações, retorna true
}