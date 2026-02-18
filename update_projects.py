import json

# Read the projects file
with open('data/projects.json', 'r', encoding='utf-8') as f:
    projects = json.load(f)

# Update each project
for project in projects:
    # Use thumbnail as appIcon
    if 'thumbnail' in project:
        project['appIcon'] = project['thumbnail']
        del project['thumbnail']
    
    # Remove images field
    if 'images' in project:
        del project['images']

# Write back to file
with open('data/projects.json', 'w', encoding='utf-8') as f:
    json.dump(projects, f, ensure_ascii=False, indent=4)

print(f"✅ Updated {len(projects)} projects")
print("✅ Replaced 'thumbnail' with 'appIcon'")
print("✅ Removed 'images' field")
