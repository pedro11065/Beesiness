import subprocess

script_path = r"C:\Users\fsxre\Documents\GitHub\Beesiness\tests\stress.py"

# Criar cinco processos simultâneos
processes = [subprocess.Popen(["python", script_path]) for _ in range(5)]

# Opcional: Esperar todos os processos terminarem
for process in processes:
    process.wait()
