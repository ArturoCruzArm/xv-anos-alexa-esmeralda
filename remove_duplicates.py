#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para eliminar fotos duplicadas
"""

import os
import hashlib
from pathlib import Path

IMAGES_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images"

def get_file_hash(filepath):
    """Obtiene el hash MD5 de un archivo"""
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def main():
    print("="*60)
    print("  ELIMINADOR DE FOTOS DUPLICADAS")
    print("="*60)
    print()

    # Obtener todas las fotos
    photos = sorted(Path(IMAGES_DIR).glob("*.webp"))
    print(f"[*] Encontradas {len(photos)} fotos")
    print()

    # Calcular hashes
    print("Calculando hashes...")
    hashes = {}
    duplicates = []

    for photo in photos:
        file_hash = get_file_hash(photo)
        if file_hash in hashes:
            # Duplicado encontrado
            duplicates.append(photo)
            print(f"[DUPLICADO] {photo.name} es igual a {hashes[file_hash].name}")
        else:
            hashes[file_hash] = photo

    print()
    print("="*60)
    print("  RESUMEN")
    print("="*60)
    print(f"[*] Total de fotos: {len(photos)}")
    print(f"[*] Fotos unicas: {len(hashes)}")
    print(f"[*] Duplicados encontrados: {len(duplicates)}")
    print()

    if duplicates:
        print("Eliminando duplicados...")
        for dup in duplicates:
            os.remove(dup)
            print(f"[ELIMINADO] {dup.name}")
        print()
        print(f"[OK] {len(duplicates)} duplicados eliminados")

        # Renombrar fotos restantes
        print()
        print("Renombrando fotos restantes...")
        remaining = sorted(Path(IMAGES_DIR).glob("*.webp"))
        for i, photo in enumerate(remaining, 1):
            new_name = f"foto{str(i).zfill(4)}.webp"
            new_path = photo.parent / new_name
            if photo.name != new_name:
                photo.rename(new_path)
                print(f"[RENOMBRADO] {photo.name} -> {new_name}")

        print()
        print(f"[OK] Quedan {len(remaining)} fotos unicas numeradas correctamente")
    else:
        print("[OK] No se encontraron duplicados")

    print()

if __name__ == "__main__":
    main()
