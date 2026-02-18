import json
import os
import re
import shutil

# Simple transliteration map
translit_map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-'
}

def create_slug(text):
    text = text.lower()
    res = ''
    for char in text:
        if char in translit_map:
            res += translit_map[char]
        elif re.match(r'[a-z0-9-]', char):
            res += char
        else:
            continue # Skip unknown chars
    
    # Remove duplicate hyphens
    res = re.sub(r'-+', '-', res)
    return res.strip('-')

# Read projects
with open('data/projects.json', 'r', encoding='utf-8') as f:
    projects = json.load(f)

base_dir = 'assets/images/projects'

# Clean up existing empty directories if desired? No, just create correct ones.
# Actually let's just create correct ones and maybe the user can clean up manually or I can invoke a cleanup.

for project in projects:
    slug = create_slug(project['title'])
    if not slug:
        slug = f"project_{project['id']}" # Fallback
        
    folder_name = f"{project['id']}_{slug}"
    folder_path = os.path.join(base_dir, folder_name)
    
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Created: {folder_path}")
        # Create readme
        with open(os.path.join(folder_path, 'README.txt'), 'w', encoding='utf-8') as readme:
            readme.write(f"Project: {project['title']}\n")
    else:
        print(f"Exists: {folder_path}")

print("\nDone! Updated folder structure.")
