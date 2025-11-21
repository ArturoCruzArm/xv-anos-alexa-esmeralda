#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para comprimir fotos de la FIESTA de XV años de Alexa Esmeralda a formato WebP
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Configuración
SOURCE_DIR = r"F:\2025\11\15\Esmeralda\fiesta\editadas"
OUTPUT_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images\fiesta"
QUALITY = 85  # Calidad de compresión WebP (85 es buena calidad con buen tamaño)
MAX_WIDTH = 1920  # Ancho máximo para las fotos

def compress_photo(input_path, output_path, quality=QUALITY):
    """Comprime una foto a WebP"""
    try:
        with Image.open(input_path) as img:
            # Convertir a RGB si es necesario
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Redimensionar si es muy grande
            if img.width > MAX_WIDTH:
                ratio = MAX_WIDTH / img.width
                new_height = int(img.height * ratio)
                img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)

            # Guardar como WebP
            img.save(output_path, 'WebP', quality=quality, method=6)

            # Calcular tamaños
            original_size = os.path.getsize(input_path) / 1024 / 1024
            compressed_size = os.path.getsize(output_path) / 1024 / 1024
            reduction = ((original_size - compressed_size) / original_size) * 100

            return original_size, compressed_size, reduction
    except Exception as e:
        print(f"[X] Error procesando {input_path}: {e}")
        return None, None, None

def main():
    # Configurar encoding UTF-8 para la salida
    sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

    print("="*60)
    print("  COMPRESOR DE FOTOS DE FIESTA - XV AÑOS ALEXA ESMERALDA")
    print("="*60)
    print()

    # Verificar directorio origen
    if not os.path.exists(SOURCE_DIR):
        print(f"[X] Error: No se encuentra el directorio {SOURCE_DIR}")
        sys.exit(1)

    # Crear directorio destino
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Buscar todas las fotos
    extensions = ['.jpg', '.jpeg', '.JPG', '.JPEG']
    photos = []
    for ext in extensions:
        photos.extend(Path(SOURCE_DIR).glob(f'*{ext}'))

    photos = sorted(photos)
    total_photos = len(photos)

    if total_photos == 0:
        print(f"[X] No se encontraron fotos en {SOURCE_DIR}")
        sys.exit(1)

    print(f"[*] Encontradas {total_photos} fotos para comprimir")
    print(f"[*] Directorio origen: {SOURCE_DIR}")
    print(f"[*] Directorio destino: {OUTPUT_DIR}")
    print(f"[*] Calidad WebP: {QUALITY}")
    print(f"[*] Ancho maximo: {MAX_WIDTH}px")
    print()
    print("Iniciando compresion...")
    print()

    # Comprimir fotos
    total_original = 0
    total_compressed = 0
    successful = 0

    for i, photo_path in enumerate(photos, 1):
        # Nombre de salida: fiesta0001.webp, fiesta0002.webp, etc.
        output_name = f"fiesta{str(i).zfill(4)}.webp"
        output_path = os.path.join(OUTPUT_DIR, output_name)

        print(f"[{i}/{total_photos}] {photo_path.name} → {output_name}... ", end='', flush=True)

        original_size, compressed_size, reduction = compress_photo(str(photo_path), output_path)

        if original_size is not None:
            total_original += original_size
            total_compressed += compressed_size
            successful += 1
            print(f"[OK] {original_size:.2f}MB -> {compressed_size:.2f}MB ({reduction:.1f}% reduccion)")
        else:
            print("[ERROR]")

    # Resumen
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
