#!/usr/bin/env python3
import os
import shutil

FIESTA_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images\fiesta"
TEMP_DIR = r"C:\Users\foro7\xv-anos-alexa-esmeralda\images\fiesta_temp"

# Crear directorio temporal
os.makedirs(TEMP_DIR, exist_ok=True)

# Obtener todas las fotos actuales y ordenarlas
photos = sorted([f for f in os.listdir(FIESTA_DIR) if f.endswith('.webp')])
print(f"Encontradas {len(photos)} fotos para renumerar")

# Copiar con nuevos nombres al directorio temporal
for i, old_name in enumerate(photos, 1):
    old_path = os.path.join(FIESTA_DIR, old_name)
    new_name = f"fiesta{str(i).zfill(4)}.webp"
    new_path = os.path.join(TEMP_DIR, new_name)
    shutil.copy2(old_path, new_path)
    print(f"[{i}] {old_name} -> {new_name}")

print(f"\nRenumeracion completa: {len(photos)} fotos")
print(f"Fotos renumeradas en: {TEMP_DIR}")
print("\nAhora debes:")
print("1. Eliminar las fotos antiguas de images/fiesta/")
print("2. Mover las fotos de images/fiesta_temp/ a images/fiesta/")
