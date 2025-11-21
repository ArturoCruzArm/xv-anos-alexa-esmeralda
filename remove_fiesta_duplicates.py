#!/usr/bin/env python3
#-*- coding: utf-8 -*-
"""
Script para eliminar fotos duplicadas de fiesta (mantener solo fotos impares)
"""

import os
import sys

FIESTA_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images\fiesta"

def main():
    print("=" * 60)
    print("  ELIMINADOR DE DUPLICADOS - FOTOS DE FIESTA")
    print("=" * 60)
    print()

    # Obtener todas las fotos
    all_photos = sorted([f for f in os.listdir(FIESTA_DIR) if f.endswith('.webp')])
    total = len(all_photos)

    print(f"[*] Total de fotos en fiesta: {total}")
    print()

    # Eliminar fotos pares (duplicadas)
    deleted = 0
    for i, photo in enumerate(all_photos, 1):
        if i % 2 == 0:  # Foto par (duplicada)
            photo_path = os.path.join(FIESTA_DIR, photo)
            try:
                os.remove(photo_path)
                deleted += 1
                print(f"[{deleted}] Eliminada: {photo}")
            except Exception as e:
                print(f"[X] Error eliminando {photo}: {e}")

    # Renumerar las fotos restantes
    remaining_photos = sorted([f for f in os.listdir(FIESTA_DIR) if f.endswith('.webp')])

    print()
    print("Renumerando fotos...")
    print()

    for i, old_name in enumerate(remaining_photos, 1):
        new_name = f"fiesta{str(i).zfill(4)}.webp"
        old_path = os.path.join(FIESTA_DIR, old_name)
        new_path = os.path.join(FIESTA_DIR, new_name)

        if old_name != new_name:
            os.rename(old_path, new_path)
            print(f"[{i}] {old_name} → {new_name}")

    print()
    print("=" * 60)
    print("  RESUMEN")
    print("=" * 60)
    print(f"[*] Fotos originales: {total}")
    print(f"[*] Duplicados eliminados: {deleted}")
    print(f"[*] Fotos finales: {len(remaining_photos)}")
    print()
    print("[OK] Proceso completado!")
    print()

if __name__ == "__main__":
    main()
