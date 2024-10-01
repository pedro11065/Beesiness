function validaCPF(cpf){
    var Soma; //Armazena a soma dos cálculos
    var Resto;//Armazena o resto dos cálculos
    Soma = 0;
    if(/(.)\1{10}/.test(strCPF)) return false; //Verifica se o cpf é repetido, se for retorna false

  for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i); // Inicia um for de 1 a 9, em que extrai o digito do cpf na posição i-1, converte para um inteiro que é multiplicado por (11-i)e o resultado é adicionado em Soma
  Resto = (Soma * 10) % 11; // Calcula o resto de Soma * 10 divido por 11 e armazena em Resto

    if ((Resto == 10) || (Resto == 11))  Resto = 0; // Se Resto for igual a 10 ou 11, Resto vira 0
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false; // Compara Resto com o décimo digito do cpf, se não é igual, retorna falso

  Soma = 0; // Soma vira 0 para a segunda validação
    for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i); //Inicia um for de 1 a 10, em que extrai um digito do cpf na posição i-1, converte em inteiro que é multiplicado por (12-i), resultado é adicionado a Soma
    Resto = (Soma * 10) % 11; // Calcula o resto de Soma * 10 dividido por 11 e armazena em resto

    if ((Resto == 10) || (Resto == 11))  Resto = 0; // Verifica se Resto é igual a 10 ou 11, se for é definido como 0
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false; // Compara resto com o digito 11 do cpf, se não for igual, retorna false
    return true; // O cpf passou pelas verificações, é retornado true

}