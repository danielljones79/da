import subprocess
import pytoml as toml

def freeze_packages():
    result = subprocess.run(['pip', 'freeze'], capture_output=True, text=True)
    packages = result.stdout.strip().split('\n')
    return packages

def save_to_toml(packages, file_name='environment.toml'):
    data = {'dependencies': packages}
    with open(file_name, 'w') as file:
        toml.dump(data, file)

if __name__ == "__main__":
    packages = freeze_packages()
    save_to_toml(packages)