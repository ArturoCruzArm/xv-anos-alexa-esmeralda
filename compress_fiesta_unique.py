#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para comprimir fotos ÚNICAS de la FIESTA  (sin duplicados)
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuración
SOURCE_DIR = r"F:\2025\11\15\Esmeralda\fiesta\editadas"
OUTPUT_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images\fiesta"
QUALITY = 85
MAX_WIDTH = 1920

def compress_photo(input_path, output_path, quality=QUALITY):
    """Comprime una foto a WebP"""
    try:
        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)

            img.save(output_path, 'WebP', quality=quality, method=6)

            original_size = os.path.getsize(input_path) / 1024 / 1024
            compressed_size = os.path.getsize(output_path) / 1024 / 1024
            reduction = ((original_size - compressed_size) / original_size) * 100

            return original_size, compressed_size, reduction
    except Exception as e:
        print(f"[X] Error procesando {input_path}: {e}")
        return None, None, None

def main():
    sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

    print("="*60)
    print("  COMPRESOR DE FOTOS ÚNICAS - FIESTA")
    print("="*60)
    print()

    if not os.path.exists(SOURCE_DIR):
        print(f"[X] Error: No se encuentra el directorio {SOURCE_DIR}")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Buscar todas las fotos
    extensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    photos = []
    for ext in extensions:
        photos.extend(Path(SOURCE_DIR).glob(f'*{ext}'))

    photos = sorted(photos)

    # Eliminar duplicados basándose en el nombre base (sin extensión)
    seen_names = set()
    unique_photos = []

    for photo in photos:
        # Obtener nombre base sin extensión
        base_name = photo.stem
        if base_name not in seen_names:
            seen_names.add(base_name)
            unique_photos.append(photo)

    total_photos = len(unique_photos)

    print(f"[*] Total de archivos encontrados: {len(photos)}")
    print(f"[*] Fotos únicas (sin duplicados): {total_photos}")
    print(f"[*] Directorio origen: {SOURCE_DIR}")
    print(f"[*] Directorio destino: {OUTPUT_DIR}")
    print(f"[*] Calidad WebP: {QUALITY}")
    print()
    print("Iniciando compresion...")
    print()

    total_original = 0
    total_compressed = 0
    successful = 0

    for i, photo_path in enumerate(unique_photos, 1):
        output_name = f"fiesta{str(i).zfill(4)}.webp"
        output_path = os.path.join(OUTPUT_DIR, output_name)

        print(f"[{i}/{total_photos}] {photo_path.name} -> {output_name}... ", end='', flush=True)

        original_size, compressed_size, reduction = compress_photo(str(photo_path), output_path)

        if original_size is not None:
            total_original += original_size
            total_compressed += compressed_size
            successful += 1
            print(f"[OK] {original_size:.2f}MB -> {compressed_size:.2f}MB ({reduction:.1f}% reduccion)")
        else:
            print("[ERROR]")

    print()
    print("="*60)
    print("  RESUMEN")
    print("="*60)
    print(f"[OK] Fotos procesadas exitosamente: {successful}/{total_photos}")
    print(f"[*] Tamano original total: {total_original:.2f} MB")
    print(f"[*] Tamano comprimido total: {total_compressed:.2f} MB")
    print(f"[*] Reduccion total: {((total_original - total_compressed) / total_original * 100):.1f}%")
    print(f"[*] Espacio ahorrado: {(total_original - total_compressed):.2f} MB")
    print()
    print("[*] Compresion completada!")
    print()

if __name__ == "__main__":
    main()
