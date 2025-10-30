import qrcode
from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Configurar encoding para Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# URL de la invitación
URL_INVITACION = "https://alexa-esmeralda.invitados.org/"

def generar_qr_simple(url, nombre_archivo="qr_invitacion.png"):
    """Genera un código QR simple"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#064420", back_color="white")
    img.save(nombre_archivo)
    print(f"✓ QR simple generado: {nombre_archivo}")
    return img

def generar_qr_con_texto(url, texto_superior, texto_inferior, nombre_archivo="qr_con_texto.png"):
    """Genera un código QR con texto decorativo"""
    # Generar QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="#064420", back_color="white").convert('RGB')

    # Crear imagen más grande para agregar texto
    ancho_qr, alto_qr = qr_img.size
    margen_superior = 120
    margen_inferior = 100

    nueva_img = Image.new('RGB', (ancho_qr, alto_qr + margen_superior + margen_inferior), 'white')
    nueva_img.paste(qr_img, (0, margen_superior))

    draw = ImageDraw.Draw(nueva_img)

    # Intentar usar fuente personalizada, si no usar default
    try:
        font_titulo = ImageFont.truetype("arial.ttf", 40)
        font_subtitulo = ImageFont.truetype("arial.ttf", 28)
    except:
        font_titulo = ImageFont.load_default()
        font_subtitulo = ImageFont.load_default()

    # Texto superior
    bbox = draw.textbbox((0, 0), texto_superior, font=font_titulo)
    ancho_texto = bbox[2] - bbox[0]
    draw.text(((ancho_qr - ancho_texto) / 2, 30), texto_superior,
              fill="#064420", font=font_titulo)

    # Texto inferior
    bbox = draw.textbbox((0, 0), texto_inferior, font=font_subtitulo)
    ancho_texto = bbox[2] - bbox[0]
    draw.text(((ancho_qr - ancho_texto) / 2, alto_qr + margen_superior + 30),
              texto_inferior, fill="#d4af37", font=font_subtitulo)

    nueva_img.save(nombre_archivo)
    print(f"✓ QR con texto generado: {nombre_archivo}")
    return nueva_img

def generar_qr_con_logo(url, ruta_logo, nombre_archivo="qr_con_logo.png"):
    """Genera un código QR con logo en el centro"""
    # Generar QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Alta corrección de errores
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color="#064420", back_color="white").convert('RGB')

    # Agregar logo si existe
    if os.path.exists(ruta_logo):
        logo = Image.open(ruta_logo)

        # Redimensionar logo (máximo 20% del QR)
        qr_width, qr_height = qr_img.size
        logo_size = qr_width // 5
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

        # Calcular posición central
        logo_pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)

        # Pegar logo
        qr_img.paste(logo, logo_pos, logo if logo.mode == 'RGBA' else None)
        print(f"✓ Logo agregado desde: {ruta_logo}")
    else:
        print(f"⚠ Logo no encontrado: {ruta_logo}")

    qr_img.save(nombre_archivo)
    print(f"✓ QR con logo generado: {nombre_archivo}")
    return qr_img

def generar_todos_los_qr():
    """Genera todas las versiones de códigos QR"""
    print("\n" + "="*50)
    print("  Generador de Códigos QR - XV Años Alexa")
    print("="*50 + "\n")

    # Crear carpeta para QR si no existe
    carpeta_qr = "codigos_qr"
    if not os.path.exists(carpeta_qr):
        os.makedirs(carpeta_qr)
        print(f"✓ Carpeta creada: {carpeta_qr}\n")

    # 1. QR Simple
    generar_qr_simple(URL_INVITACION, f"{carpeta_qr}/qr_simple.png")

    # 2. QR con texto
    generar_qr_con_texto(
        URL_INVITACION,
        "XV Años Alexa",
        "Escanea para ver la invitación",
        f"{carpeta_qr}/qr_con_texto.png"
    )

    # 3. QR con logo (si existe favicon)
    if os.path.exists("favicon.svg"):
        print("\n⚠ Nota: Para QR con logo, necesitas una imagen PNG o JPG")
        print("  El favicon.svg no es compatible. Convierte tu logo a PNG.\n")

    # Si hay un logo PNG disponible
    if os.path.exists("rosa-derecha.png"):
        generar_qr_con_logo(URL_INVITACION, "rosa-derecha.png", f"{carpeta_qr}/qr_con_logo.png")

    print("\n" + "="*50)
    print(f"  ✓ Códigos QR generados en la carpeta: {carpeta_qr}")
    print("="*50 + "\n")
    print("URL de la invitación:", URL_INVITACION)
    print("\nPuedes usar estos QR para:")
    print("  • Imprimir en tarjetas físicas")
    print("  • Compartir en redes sociales")
    print("  • Enviar por WhatsApp")
    print("  • Proyectar en pantallas")
    print("\n")

if __name__ == "__main__":
    generar_todos_los_qr()
