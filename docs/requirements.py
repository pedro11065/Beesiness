import subprocess

# Lista de pacotes a serem instalados
pacotes = [
    'flask',
    'json',          # Obs: 'json' já é um módulo padrão do Python e não precisa ser instalado separadamente
    'psycopg2',
    'requests'
]

# Função para instalar pacotes
def instalar_pacote(pacote):
    try:
        resultado = subprocess.run(['pip', 'install', pacote], capture_output=True, text=True, check=True)
        print(f"Saída da instalação do pacote '{pacote}':")
        print(resultado.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao instalar o pacote '{pacote}':")
        print(e.stderr)

# Instalando cada pacote da lista
for pacote in pacotes:
    instalar_pacote(pacote)
