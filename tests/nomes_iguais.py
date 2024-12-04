assets = [
    {'nome': 'Fornecedores', 'ID':1, 'valor':1000},
    {'nome': 'batata', 'ID':2, 'valor':1000},
    {'nome': 'arroz', 'ID':3, 'valor':1000},
    {'nome': 'Fornecedores', 'ID':4, 'valor':1000},
    {'nome': 'arroz', 'ID':5, 'valor':1000},

]

del_list = []

for i in range(len(assets)):
    now_name = assets[i]['nome']

    for j in range(i + 1, len(assets)):  # Começa do próximo índice
        next_name = assets[j]['nome']

        if now_name == next_name:
            #print(f'Nomes iguais! {now_name} - ID {assets[i]["ID"]} e ID {assets[j]["ID"]}')
            #print(f"\n i = {assets[i]}") ; print(f" j = {assets[j]}")
            assets[i]['valor'] = float(assets[j]['valor']) + float(assets[i]['valor'])

            del_list.append(assets[i]['ID'])
            #del assets[j]

for i in del_list:
    print(i)
    for item in assets:
        if item['ID'] == i:
            del assets[i]

for i in assets:
    print(f"\n{i}")