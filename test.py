#!/usr/bin/env python3
"""
Downloads Folder Organizer
Organizes files in the Downloads folder by file type into subfolders.
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

def get_downloads_path():
    """Get the path to the Downloads folder."""
    home = Path.home()
    downloads_path = home / "Downloads"
    return downloads_path

def get_file_category(file_extension):
    """Categorize files based on their extensions."""
    categories = {
        'Images': {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff'},
        'Documents': {'.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages', '.tex'},
        'Spreadsheets': {'.xls', '.xlsx', '.csv', '.ods', '.numbers'},
        'Presentations': {'.ppt', '.pptx', '.odp', '.key'},
        'Videos': {'.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.3gp'},
        'Audio': {'.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'},
        'Archives': {'.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.deb', '.rpm', '.appimage'},
        'Code': {'.py', '.js', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs'},
        'Executables': {'.exe', '.msi', '.dmg', '.pkg', '.run', '.bin'},
        'Fonts': {'.ttf', '.otf', '.woff', '.woff2'},
        'Ebooks': {'.epub', '.mobi', '.azw', '.azw3'}
    }
    
    ext_lower = file_extension.lower()
    for category, extensions in categories.items():
        if ext_lower in extensions:
            return category
    
    return 'Others'

def create_category_folder(downloads_path, category):
    """Create a category folder if it doesn't exist."""
    folder_path = downloads_path / category
    folder_path.mkdir(exist_ok=True)
    return folder_path

def organize_downloads(dry_run=False):
    """Organize files in the Downloads folder."""
    downloads_path = get_downloads_path()
    
    if not downloads_path.exists():
        print(f"Downloads folder not found: {downloads_path}")
        return
    
    print(f"Organizing downloads folder: {downloads_path}")
    print("=" * 50)
    
    # Get all files (excluding directories and hidden files)
    files = [f for f in downloads_path.iterdir() 
             if f.is_file() and not f.name.startswith('.')]
    
    if not files:
        print("No files to organize!")
        return
    
    # Group files by category
    file_groups = defaultdict(list)
    
    for file_path in files:
        category = get_file_category(file_path.suffix)
        file_groups[category].append(file_path)
    
    # Show what will be moved
    total_files = 0
    for category, file_list in file_groups.items():
        print(f"\n{category} ({len(file_list)} files):")
        for file_path in file_list[:5]:  # Show first 5 files
            print(f"  - {file_path.name}")
        if len(file_list) > 5:
            print(f"  ... and {len(file_list) - 5} more files")
        total_files += len(file_list)
    
    print(f"\nTotal files to organize: {total_files}")
    
    if dry_run:
        print("\n[DRY RUN] No files were actually moved.")
        return
    
    # Ask for confirmation
    response = input("\nProceed with organizing? (y/N): ").strip().lower()
    if response != 'y':
        print("Operation cancelled.")
        return
    
    # Move files
    moved_count = 0
    error_count = 0
    
    for category, file_list in file_groups.items():
        category_folder = create_category_folder(downloads_path, category)
        
        for file_path in file_list:
            try:
                destination = category_folder / file_path.name
                
                # Handle filename conflicts
                counter = 1
                original_destination = destination
                while destination.exists():
                    stem = original_destination.stem
                    suffix = original_destination.suffix
                    destination = category_folder / f"{stem}_{counter}{suffix}"
                    counter += 1
                
                shutil.move(str(file_path), str(destination))
                moved_count += 1
                print(f"Moved: {file_path.name} → {category}/")
                
            except Exception as e:
                print(f"Error moving {file_path.name}: {e}")
                error_count += 1
    
    print(f"\nOrganization complete!")
    print(f"Files moved: {moved_count}")
    if error_count > 0:
        print(f"Errors: {error_count}")

def main():
    """Main function with command line argument handling."""
    import sys
    
    print("Downloads Folder Organizer")
    print("=" * 30)
    
    # Check for dry run flag
    dry_run = '--dry-run' in sys.argv or '-d' in sys.argv
    
    if dry_run:
        print("Running in DRY RUN mode (no files will be moved)")
        print()
    
    try:
        organize_downloads(dry_run=dry_run)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()