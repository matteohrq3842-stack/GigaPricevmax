import os
import zipfile
import sys

def create_zip(source_dir, output_filename, extra_files=[]):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # 1. Add the static site content (from 'out' folder)
        print(f"Ajout du contenu du site depuis '{source_dir}'...")
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                # Force forward slashes for Linux compatibility
                arcname = arcname.replace(os.sep, '/')
                
                zipf.write(file_path, arcname)
                
                # Set permissions to 644 (rw-r--r--) for Linux
                info = zipf.getinfo(arcname)
                info.external_attr = 0o100644 << 16

        # 2. Add extra files (READMEs, tuto, etc.) to the root of the ZIP
        print("Ajout des fichiers de documentation...")
        for file_path, arcname in extra_files:
            if os.path.exists(file_path):
                print(f"  - {arcname}")
                # Force forward slashes for Linux compatibility in zip
                arcname = arcname.replace(os.sep, '/')
                zipf.write(file_path, arcname)
                
                # Set permissions
                info = zipf.getinfo(arcname)
                info.external_attr = 0o100644 << 16
            else:
                print(f"  Attention: Fichier introuvable '{file_path}' (ignoré)")

if __name__ == "__main__":
    source = "out"
    output = "gigaprice_static.zip"
    
    # Current directory (web-nextjs)
    current_dir = os.getcwd()
    # Parent directory (GigaPricevmax-main)
    parent_dir = os.path.dirname(current_dir)
    
    # List of files to include: (Absolute Path on Disk, Name inside ZIP)
    extra_files_to_include = [
        # Files from Current Directory (web-nextjs)
        (os.path.join(current_dir, "README.md"), "README.md"),
        (os.path.join(current_dir, "README_WEB.md"), "README_WEB.md"),
        (os.path.join(current_dir, "INSTRUCTIONS_GIT_IA.md"), "INSTRUCTIONS_GIT_IA.md"),
        (os.path.join(current_dir, "README_BOT_DATA_NEEDS.md"), "README_BOT_DATA_NEEDS.md"),
        (os.path.join(current_dir, "README_FUTURE_APP.md"), "README_FUTURE_APP.md"),
        (os.path.join(current_dir, "tuto.png"), "tuto.png"),
        (os.path.join(current_dir, "DEPLOY_INSTRUCTIONS.md"), "DEPLOY_INSTRUCTIONS.md")
    ]

    if not os.path.exists(source):
        print(f"Erreur : Le dossier '{source}' n'existe pas. Lancez le build d'abord.")
        sys.exit(1)
        
    print(f"Création de l'archive '{output}'...")
    create_zip(source, output, extra_files_to_include)
    print("Terminé avec succès !")
