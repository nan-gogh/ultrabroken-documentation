import os
import re
from pathlib import Path

def on_files(files, config, **kwargs):
    site_dir = config['site_dir']
    
    count = 0
    for file in files:
        if not file.is_documentation_page:
            continue
            
        src_norm = file.src_path.replace('\\', '/')
        if src_norm.startswith('wiki/glitchcraft/'):
            if '_glitchcraft-grimoire' in file.name:
                continue
                
            path = file.abs_src_path
            try:
                with open(path, 'r', encoding='utf-8-sig') as f:
                    content = f.read(1024)
            except Exception as e:
                print(f"Error reading {path}: {e}")
                continue
                
            match = re.search(r'^---\r?\n.*?\buid:\s*["\']([^"\']+)["\']', content, re.DOTALL | re.IGNORECASE)
            if match:
                uid = match.group(1).strip()
                
                # Update properties
                file.name = uid
                file.dest_uri = f"wiki/glitchcraft/{uid}/index.html" if config.get('use_directory_urls', True) else f"wiki/glitchcraft/{uid}.html"
                file.url = f"wiki/glitchcraft/{uid}/" if config.get('use_directory_urls', True) else f"wiki/glitchcraft/{uid}.html"
                file.abs_dest_path = os.path.normpath(os.path.join(site_dir, file.dest_uri))
                file.dest_path = file.dest_uri
                
                count += 1
    
    return files
