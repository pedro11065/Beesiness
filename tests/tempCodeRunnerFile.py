

for i in range(len(assets)):
    now_name = assets[i]['nome']

    for j in range(i + 1, len(assets)):  # Começa do próximo índice
        next_name = assets[j]['nome']

        if now_name == next_name:
            #print(f'Nomes iguais