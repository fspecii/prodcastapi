import os

def find_ts_tx_files(root_dir):
    ts_tx_files = []
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')  # Don't traverse into node_modules
        for file in files:
            if file.endswith(('.ts', '.tx')):
                ts_tx_files.append(os.path.join(root, file))
    return ts_tx_files

if __name__ == "__main__":
    current_dir = os.getcwd()
    ts_tx_files = find_ts_tx_files(current_dir)
    
    if ts_tx_files:
        print("Found the following .ts and .tx files:")
        for file in ts_tx_files:
            print(file)
    else:
        print("No .ts or .tx files found in the subfolders.")