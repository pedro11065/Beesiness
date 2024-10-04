import os

def contar_linhas_diretorio(diretorio, extensoes):
    total_linhas = 0
    total_arquivos = 0
    maior_arquivo = ""
    maior_linhas = 0

    for dirpath, _, arquivos in os.walk(diretorio):
        for arquivo in arquivos:
            if arquivo.endswith(extensoes):
                total_arquivos += 1
                caminho_arquivo = os.path.join(dirpath, arquivo)
                with open(caminho_arquivo, 'r', encoding='utf-8') as f:
                    linhas = f.readlines()
                    num_linhas = len(linhas)
                    total_linhas += num_linhas

                    # Verifica se este é o maior arquivo
                    if num_linhas > maior_linhas:
                        maior_linhas = num_linhas
                        maior_arquivo = caminho_arquivo

                    print(f"{arquivo}: {num_linhas} linhas")

    print(f"\nTotal de arquivos: {total_arquivos}")
    print(f"Total de linhas em arquivos {extensoes}: {total_linhas}")
    print(f"O maior arquivo é {maior_arquivo} com {maior_linhas} linhas.")

# Exemplo de uso:
diretorio_projeto = r"C:\Users\fsxre\Documents\github\Beesiness"
extensoes_arquivos = ('.py', '.html', '.js', '.css')  # Incluindo CSS
contar_linhas_diretorio(diretorio_projeto, extensoes_arquivos)
