import os
import glob
import re

frontend_dir = r"c:\Users\gk044\OneDrive\Desktop\gk-neet\frontend"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    content = re.sub(r'import\s+\{\s*BASE_URL\s*\}\s+from\s+([\'"].*?config[\'"]);?', r'import { API_URL } from \1;', content)
    content = content.replace('${BASE_URL}/', '${API_URL}/api/')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.git' in dirs:
        dirs.remove('.git')
    if 'dist' in dirs:
        dirs.remove('dist')
        
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            process_file(os.path.join(root, file))
