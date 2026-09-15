from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF


ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name("PymIA_Desarrollos_Comercial.pdf")
LOGO = ROOT / "landing" / "logopymia2.jpg"
SURVEY_URL = "https://meli2026-encuesta.vercel.app"

W, H = 960, 540  # 16:9 PDF slides

CREAM = HexColor("#F5F0E8")
INK = HexColor("#1C211E")
GREEN = HexColor("#1D5B50")
MINT = HexColor("#76A68E")
LIGHT_GREEN = HexColor("#DDE9E1")
WARM = HexColor("#DED8CD")
MUTED = HexColor("#6C6E68")
LINE = HexColor("#BBB9B0")
RED = HexColor("#9D4A40")
PAPER = HexColor("#FCFAF6")


def register_fonts():
    pdfmetrics.registerFont(TTFont("PymIA-Display", r"C:\Windows\Fonts\georgia.ttf"))
    pdfmetrics.registerFont(TTFont("PymIA-DisplayBold", r"C:\Windows\Fonts\georgiab.ttf"))
    pdfmetrics.registerFont(TTFont("PymIA-Body", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("PymIA-BodyBold", r"C:\Windows\Fonts\arialbd.ttf"))


def line(c, x1, y1, x2, y2, color=LINE, width=0.8):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1, y1, x2, y2)


def text_width(text, font, size):
    return pdfmetrics.stringWidth(text, font, size)


def wrap(text, font, size, width):
    words = text.split()
    lines, current = [], ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_width(candidate, font, size) <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paragraph(c, text, x, y, width, font="PymIA-Body", size=14, leading=None, color=INK):
    leading = leading or size * 1.35
    c.setFillColor(color)
    c.setFont(font, size)
    for item in text.split("\n"):
        for row in wrap(item, font, size, width) or [""]:
            c.drawString(x, y, row)
            y -= leading
    return y


def bullet_list(c, items, x, y, width, size=13, color=INK, bullet_color=GREEN, gap=8):
    for item in items:
        c.setFillColor(bullet_color)
        c.circle(x + 3, y + 4, 2.3, stroke=0, fill=1)
        y = paragraph(c, item, x + 15, y, width - 15, size=size, color=color)
        y -= gap
    return y


def tag(c, label, x, y, color=GREEN):
    c.setFillColor(color)
    c.setFont("PymIA-BodyBold", 7.5)
    c.drawString(x, y, label.upper())


def title(c, heading, x=54, y=432, width=720, accent=None):
    font = "PymIA-Display"
    size = 39
    rows = wrap(heading, font, size, width)
    c.setFillColor(INK)
    c.setFont(font, size)
    for i, row in enumerate(rows):
        c.drawString(x, y - i * 43, row)
    if accent:
        c.setFillColor(GREEN)
        c.setFont("PymIA-Display", size)
        accent_rows = wrap(accent, "PymIA-Display", size, width)
        for i, row in enumerate(accent_rows):
            c.drawString(x, y - (len(rows) + i) * 43, row)
        return y - (len(rows) + len(accent_rows)) * 43 - 20
    return y - len(rows) * 43 - 20


def header(c, page, section):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if LOGO.exists():
        c.drawImage(ImageReader(str(LOGO)), 52, H - 68, 42, 42, mask="auto")
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 18)
    c.drawString(105, H - 46, "PymIA")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 8)
    c.drawString(106, H - 60, "Operaciones conectadas")
    tag(c, section, 695, H - 45, GREEN)
    line(c, 52, H - 79, W - 52, H - 79)
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 8)
    c.drawRightString(W - 52, 24, f"PymIA  /  {page:02d}")


def node(c, x, y, label, sublabel=None, fill=CREAM, border=INK, w=118, h=48):
    c.setFillColor(fill)
    c.setStrokeColor(border)
    c.roundRect(x, y, w, h, 3, fill=1, stroke=1)
    c.setFillColor(INK)
    c.setFont("PymIA-BodyBold", 10)
    c.drawCentredString(x + w / 2, y + h / 2 + 3, label)
    if sublabel:
        c.setFillColor(MUTED)
        c.setFont("PymIA-Body", 7.4)
        c.drawCentredString(x + w / 2, y + 10, sublabel)


def qr_code(c, url, x, y, size):
    widget = qr.QrCodeWidget(url)
    x1, y1, x2, y2 = widget.getBounds()
    scale = size / max(x2 - x1, y2 - y1)
    drawing = Drawing(size, size, transform=[scale, 0, 0, scale, 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)


def slide_cover(c):
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if LOGO.exists():
        c.drawImage(ImageReader(str(LOGO)), 55, H - 103, 64, 64, mask="auto")
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 26)
    c.drawString(132, H - 67, "PymIA")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 9)
    c.drawString(133, H - 84, "Tecnología para operaciones reales")
    tag(c, "PRESENTACIÓN COMERCIAL", 690, H - 66)
    line(c, 55, H - 119, W - 55, H - 119)

    c.setFillColor(INK)
    c.setFont("PymIA-Display", 54)
    c.drawString(55, 332, "Tecnología que trabaja")
    c.drawString(55, 273, "con tu operación real.")
    c.setFillColor(GREEN)
    c.setFont("PymIA-Display", 38)
    c.drawString(55, 214, "Sin tirar a la basura lo que ya usás.")
    paragraph(c, "Conectamos sistemas, encontramos cuellos de botella y construimos la pieza puntual que te falta.", 58, 158, 510, size=16, leading=23, color=INK)
    c.setFillColor(INK)
    c.roundRect(57, 72, 368, 42, 2, fill=1, stroke=0)
    c.setFillColor(CREAM)
    c.setFont("PymIA-BodyBold", 12)
    c.drawString(75, 88, "MERCADO LIBRE  ·  EXCEL  ·  ERP  ·  WHATSAPP")

    # Signature network diagram
    cx, cy = 741, 250
    points = [(620, 330, "Mercado Libre"), (748, 375, "Excel"), (847, 292, "Sistema"), (820, 162, "WhatsApp"), (652, 148, "Equipo")]
    for px, py, _ in points:
        line(c, cx, cy, px, py, LINE, 0.9)
    c.setFillColor(PAPER)
    c.setStrokeColor(INK)
    c.circle(cx, cy, 52, fill=1, stroke=1)
    c.setFillColor(GREEN)
    c.setFont("PymIA-Display", 16)
    c.drawCentredString(cx, cy + 5, "PymIA")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 7.5)
    c.drawCentredString(cx, cy - 11, "la pieza que falta")
    for px, py, label in points:
        c.setFillColor(CREAM)
        c.setStrokeColor(INK)
        c.circle(px, py, 5, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("PymIA-BodyBold", 9)
        c.drawCentredString(px, py - 20, label)
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 8)
    c.drawString(55, 26, "Buenos Aires, Argentina")


def slide_problem(c):
    header(c, 2, "EL PROBLEMA")
    y = title(c, "Tu negocio ya tiene sistemas.", width=700, accent="El problema aparece entre ellos.")
    paragraph(c, "Muchas empresas ya usan herramientas valiosas. Aun así, se pierden tiempo, plata y control cuando la información no circula bien.", 55, y - 6, 450, size=14, leading=20)

    labels = [(85, 208, "Mercado Libre", "ventas"), (255, 208, "Excel", "registro"), (425, 208, "Sistema", "gestión"), (595, 208, "Administración", "control"), (765, 208, "WhatsApp", "consulta")]
    for i in range(len(labels) - 1):
        line(c, labels[i][0] + 118, 232, labels[i + 1][0], 232, LINE, 1.2)
    for x, y0, label, sub in labels:
        node(c, x, y0, label, sub, w=118)
    warnings = [(205, "doble carga"), (375, "dato viejo"), (545, "control tardío"), (715, "nadie ve todo")]
    for x, label in warnings:
        c.setFillColor(RED)
        c.circle(x, 278, 7, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont("PymIA-BodyBold", 8)
        c.drawCentredString(x, 294, label)
    c.setFillColor(WARM)
    c.roundRect(55, 72, 850, 76, 3, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 23)
    c.drawString(76, 111, "No siempre falta un sistema nuevo.")
    paragraph(c, "A veces falta una conexión, un control, una alerta o una forma más clara de mirar lo que ya está pasando.", 470, 115, 395, size=12.5, leading=17)


def slide_sellers(c):
    header(c, 3, "SELLERS")
    y = title(c, "Vendés en Mercado Libre.", width=590, accent="El problema muchas veces está entre los sistemas.")
    paragraph(c, "No se trata sólo de vender. Se trata de saber qué margen queda, qué stock tenés, qué precio actualizar y dónde se está trabando la operación.", 55, y - 6, 430, size=14, leading=19)
    bullet_list(c, ["No sé cuánto margen real me queda.", "El stock no coincide.", "Actualizo precios a mano.", "Cargo la misma información dos veces.", "Me entero del problema cuando ya pasó."], 58, 211, 390, size=12.5, gap=5)
    # radial map
    cx, cy = 705, 239
    topics = [(705, 363, "margen"), (818, 288, "stock"), (782, 158, "precios"), (628, 158, "facturación"), (590, 288, "publicaciones")]
    for px, py, label in topics:
        line(c, cx, cy, px, py, LINE, 1)
        c.setFillColor(CREAM)
        c.setStrokeColor(INK)
        c.circle(px, py, 35, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("PymIA-BodyBold", 9)
        c.drawCentredString(px, py - 3, label)
    c.setFillColor(GREEN)
    c.circle(cx, cy, 54, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("PymIA-Display", 16)
    c.drawCentredString(cx, cy + 4, "OPERACIÓN")
    c.setFont("PymIA-Body", 8)
    c.drawCentredString(cx, cy - 12, "Mercado Libre")
    tag(c, "EJEMPLOS DE LO QUE PODEMOS CONSTRUIR", 533, 74)
    paragraph(c, "Controles de margen · alertas de stock · automatización de precios · reportes · conexiones con tu sistema", 533, 53, 345, size=11.3, leading=15)


def slide_admin(c):
    header(c, 4, "CONTADORES Y ADMINISTRACIÓN")
    y = title(c, "Cuando la operación y la administración no hablan, alguien termina haciendo el trabajo dos veces.", width=820)
    paragraph(c, "El problema aparece cuando ventas, stock, facturación, comprobantes y reportes viven en circuitos separados.", 55, y - 3, 520, size=14, leading=19)
    # rails
    c.setFillColor(LIGHT_GREEN)
    c.roundRect(55, 122, 345, 160, 4, fill=1, stroke=0)
    c.setFillColor(WARM)
    c.roundRect(560, 122, 345, 160, 4, fill=1, stroke=0)
    tag(c, "OPERACIÓN", 78, 253)
    tag(c, "ADMINISTRACIÓN", 583, 253, RED)
    bullet_list(c, ["ventas y pedidos", "stock y entregas", "costos", "información del cliente"], 77, 226, 275, size=12, gap=4)
    bullet_list(c, ["facturación", "comprobantes", "conciliación", "cierres y reportes"], 582, 226, 275, size=12, bullet_color=RED, gap=4)
    line(c, 402, 202, 558, 202, RED, 2)
    c.setFillColor(RED)
    c.circle(480, 202, 20, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("PymIA-BodyBold", 8)
    c.drawCentredString(480, 199, "FRICCIÓN")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 9)
    c.drawCentredString(480, 171, "carga manual · versiones distintas · controles tardíos")
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 22)
    c.drawString(55, 82, "Podemos construir circuitos más claros.")
    paragraph(c, "Integraciones, controles previos al cierre, alertas de diferencias, conciliaciones y reportes para cada rol.", 470, 87, 405, size=12.5, leading=17)


def slide_developers(c):
    header(c, 5, "DEVELOPERS E INTEGRADORES")
    y = title(c, "¿Tus clientes te piden algo que no querés volver a construir?", width=780)
    paragraph(c, "Vos mantenés tu producto. Nosotros podemos construir la pieza especializada y dejarla lista para integrarse.", 55, y - 5, 500, size=14, leading=20)
    node(c, 80, 178, "Cliente", "necesidad concreta", fill=PAPER, w=155, h=64)
    node(c, 375, 178, "Tu producto", "lo que ya mantenés", fill=LIGHT_GREEN, border=GREEN, w=175, h=64)
    node(c, 690, 178, "Capability PymIA", "pieza integrada", fill=WARM, border=INK, w=175, h=64)
    line(c, 235, 210, 375, 210, GREEN, 1.8)
    line(c, 550, 210, 690, 210, GREEN, 1.8)
    for x in (302, 617):
        c.setFillColor(GREEN)
        c.circle(x, 210, 4, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 22)
    c.drawString(55, 120, "Piezas que podemos desarrollar")
    items = ["APIs y servicios", "módulos reutilizables", "integraciones", "automatizaciones", "soluciones con tu marca", "WhatsApp con datos del cliente"]
    for index, item in enumerate(items):
        x = 58 + (index % 3) * 280
        yy = 85 - (index // 3) * 32
        c.setFillColor(GREEN)
        c.rect(x, yy, 9, 9, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("PymIA-BodyBold", 11)
        c.drawString(x + 17, yy, item)


def slide_excel(c):
    header(c, 6, "EXCEL BAJO CONTROL")
    y = title(c, "¿Tu Excel dice que ganaste pero la plata no cierra?", width=760)
    paragraph(c, "Excel puede ser una pieza central del negocio. También puede esconder errores difíciles de ver hasta que ya impactaron en una decisión.", 55, y - 7, 490, size=14, leading=19)
    # spreadsheet graphic
    sx, sy, sw, sh = 570, 120, 320, 255
    c.setFillColor(PAPER)
    c.setStrokeColor(INK)
    c.rect(sx, sy, sw, sh, fill=1, stroke=1)
    for i in range(1, 6):
        line(c, sx, sy + i * 38, sx + sw, sy + i * 38, LINE, 0.6)
    for i in range(1, 4):
        line(c, sx + i * 80, sy, sx + i * 80, sy + sh, LINE, 0.6)
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 8)
    for r in range(5):
        c.drawString(sx + 11, sy + sh - 24 - r * 38, f"Fila {r + 1}")
    alerts = [(sx + 158, sy + 190, "fórmula"), (sx + 238, sy + 114, "dato viejo"), (sx + 78, sy + 76, "rango"), (sx + 238, sy + 38, "referencia")]
    for ax, ay, label in alerts:
        c.setFillColor(RED)
        c.circle(ax, ay, 8, fill=1, stroke=0)
        c.setFillColor(RED)
        c.setFont("PymIA-BodyBold", 7.5)
        c.drawString(ax + 12, ay - 3, label)
    bullet_list(c, ["costos desactualizados", "fórmulas modificadas", "rangos incompletos", "valores cargados a mano", "referencias equivocadas", "unidades mezcladas"], 58, 203, 350, size=12.5, gap=4)
    tag(c, "EJEMPLOS DE LO QUE PODEMOS CONSTRUIR", 55, 83)
    paragraph(c, "Validaciones, controles de consistencia, automatizaciones, conexiones con otras fuentes y reportes claros.", 55, 61, 465, size=12, leading=16)


def slide_deterministic(c):
    header(c, 7, "TECNOLOGÍA CON CRITERIO")
    y = title(c, "Precisión donde importa.", width=610, accent="IA donde aporta.")
    c.setFillColor(LIGHT_GREEN)
    c.roundRect(55, 118, 390, 205, 4, fill=1, stroke=0)
    c.setFillColor(WARM)
    c.roundRect(515, 118, 390, 205, 4, fill=1, stroke=0)
    tag(c, "SOFTWARE DETERMINÍSTICO", 78, 292)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 23)
    c.drawString(78, 255, "El programa controla")
    c.drawString(78, 227, "lo que no puede fallar.")
    bullet_list(c, ["cálculos", "reglas", "validaciones", "evidencia y trazabilidad"], 80, 186, 265, size=11.5, gap=3)
    tag(c, "IA CONVERSACIONAL", 538, 292, RED)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 23)
    c.drawString(538, 255, "La IA ayuda a entender")
    c.drawString(538, 227, "lo que está pasando.")
    bullet_list(c, ["comprensión", "contexto", "conversación", "explicaciones claras"], 540, 186, 265, size=11.5, bullet_color=RED, gap=3)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 22)
    c.drawCentredString(W / 2, 76, "La IA ayuda a entender. El programa controla lo que tiene que ser exacto.")


def slide_whatsapp(c):
    header(c, 8, "WHATSAPP")
    y = title(c, "Tu negocio también puede hablarte por WhatsApp.", width=760)
    paragraph(c, "No como un chatbot genérico: como una forma de consultar información real de tu operación y recibir sólo lo que merece atención.", 55, y - 6, 485, size=14, leading=19)
    # Phone/chat surface
    c.setFillColor(INK)
    c.roundRect(590, 92, 255, 320, 24, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.roundRect(605, 108, 225, 288, 16, fill=1, stroke=0)
    tag(c, "EJEMPLO", 624, 369)
    c.setFillColor(LIGHT_GREEN)
    c.roundRect(623, 298, 174, 46, 8, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PymIA-BodyBold", 9.5)
    c.drawString(635, 325, "¿Hay algo que tenga")
    c.drawString(635, 312, "que mirar hoy?")
    c.setFillColor(WARM)
    c.roundRect(640, 205, 170, 72, 8, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PymIA-Body", 8.8)
    c.drawString(650, 252, "Hay diferencias de stock")
    c.drawString(650, 239, "y publicaciones donde")
    c.drawString(650, 226, "conviene revisar margen.")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 7.5)
    c.drawString(623, 142, "Ejemplo de lo que podemos construir")
    bullet_list(c, ["consultas sin abrir cinco sistemas", "alertas relevantes", "explicaciones con datos reales", "un canal cotidiano para el dueño y el equipo"], 58, 218, 390, size=12.5, gap=7)


def slide_integrate(c):
    header(c, 9, "INTEGRAR ANTES QUE MIGRAR")
    y = title(c, "Primero integramos.", width=560, accent="Migrar es la última opción.")
    paragraph(c, "No hace falta tirar abajo toda la casa para arreglar la habitación donde está el problema.", 55, y - 6, 440, size=14, leading=20)
    cx, cy = 695, 232
    systems = [(695, 372, "Mercado Libre"), (828, 290, "Excel"), (805, 145, "Sistema de gestión"), (585, 145, "Sistema propio"), (557, 290, "WhatsApp")]
    for px, py, label in systems:
        line(c, cx, cy, px, py, LINE, 1)
        c.setFillColor(PAPER)
        c.setStrokeColor(INK)
        c.circle(px, py, 36, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("PymIA-BodyBold", 8)
        for j, row in enumerate(wrap(label, "PymIA-BodyBold", 8, 58)):
            c.drawCentredString(px, py + 2 - j * 10, row)
    c.setFillColor(GREEN)
    c.circle(cx, cy, 61, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("PymIA-Display", 18)
    c.drawCentredString(cx, cy + 5, "PymIA")
    c.setFont("PymIA-Body", 8)
    c.drawCentredString(cx, cy - 13, "la pieza que falta")
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 22)
    c.drawString(55, 104, "Podemos convivir con lo que ya usás.")
    paragraph(c, "Mercado Libre, Excel, ERP, sistemas propios, herramientas especializadas, suites verticales y otros canales.", 55, 81, 465, size=12, leading=16)


def slide_process(c):
    header(c, 10, "CÓMO TRABAJAMOS")
    y = title(c, "De un problema concreto a una solución puntual.", width=760)
    steps = [
        ("01", "Diagnosticamos", "Encontramos dónde se corta realmente tu operación."),
        ("02", "Entendemos", "Miramos personas, datos y sistemas existentes."),
        ("03", "Integramos", "Conectamos lo que ya usás cuando esa es la mejor salida."),
        ("04", "Construimos", "Desarrollamos la capacidad, control o automatización que falta."),
        ("05", "Medimos", "Verificamos si resolvió el problema y con qué evidencia."),
    ]
    start_x, y0, gap = 55, 214, 174
    for i, (num, head, body) in enumerate(steps):
        x = start_x + i * gap
        if i < len(steps) - 1:
            line(c, x + 125, y0 + 42, x + gap, y0 + 42, LINE, 1.2)
        c.setFillColor(GREEN if i in (0, 3) else INK)
        c.circle(x + 28, y0 + 42, 24, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("PymIA-BodyBold", 10)
        c.drawCentredString(x + 28, y0 + 38, num)
        c.setFillColor(INK)
        c.setFont("PymIA-Display", 17)
        c.drawString(x, y0 - 5, head)
        paragraph(c, body, x, y0 - 29, 145, size=10.5, leading=14)
    c.setFillColor(WARM)
    c.roundRect(55, 66, 850, 62, 3, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 21)
    c.drawString(78, 98, "Dolor → contexto → sistemas existentes → pieza puntual → evidencia")
    c.setFont("PymIA-Body", 10.5)
    c.drawString(79, 77, "No empezamos por la tecnología. Empezamos por la consecuencia concreta que te está frenando.")


def slide_capabilities(c):
    header(c, 11, "CAPACIDADES")
    y = title(c, "Una pieza específica puede destrabar una operación entera.", width=790)
    cards = [
        (55, 112, "SELLERS", ["margen", "stock", "precios", "publicaciones", "facturación"], LIGHT_GREEN),
        (282, 112, "CONTADORES Y ADMINISTRACIÓN", ["conciliaciones", "controles", "cierres", "circuitos", "reportes"], WARM),
        (509, 112, "EXCEL Y OPERACIÓN", ["validaciones", "automatizaciones", "consistencia", "conexiones", "alertas"], LIGHT_GREEN),
        (736, 112, "INTEGRADORES", ["APIs", "módulos", "integraciones", "white-label", "servicios"], WARM),
    ]
    for x, yy, heading, items, fill in cards:
        c.setFillColor(fill)
        c.roundRect(x, yy, 170, 210, 4, fill=1, stroke=0)
        tag(c, heading, x + 16, yy + 178, GREEN if fill == LIGHT_GREEN else RED)
        c.setFillColor(INK)
        c.setFont("PymIA-BodyBold", 10)
        current = yy + 145
        for item in items:
            c.setFillColor(GREEN if fill == LIGHT_GREEN else RED)
            c.circle(x + 20, current + 3, 2.5, fill=1, stroke=0)
            c.setFillColor(INK)
            c.drawString(x + 32, current, item)
            current -= 26
    c.setFillColor(INK)
    c.setFont("PymIA-Display", 20)
    c.drawString(55, 74, "No es un catálogo cerrado.")
    paragraph(c, "Podemos conectar, revisar, construir, automatizar o integrar según el problema, el contexto y los sistemas que ya tenés.", 360, 80, 530, size=12.5, leading=17)


def slide_cta(c):
    c.setFillColor(INK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    if LOGO.exists():
        c.drawImage(ImageReader(str(LOGO)), 55, H - 100, 56, 56, mask="auto")
    c.setFillColor(CREAM)
    c.setFont("PymIA-Display", 23)
    c.drawString(124, H - 68, "PymIA")
    tag(c, "LA CONVERSACIÓN EMPIEZA ACÁ", 642, H - 66, MINT)
    c.setFillColor(CREAM)
    c.setFont("PymIA-Display", 52)
    c.drawString(55, 337, "¿Qué problema")
    c.drawString(55, 279, "te está frenando hoy?")
    c.setFillColor(MINT)
    c.setFont("PymIA-Display", 29)
    c.drawString(57, 218, "Contanos dónde se corta tu operación.")
    paragraph(c, "Vemos si conviene conectar lo que ya tenés, automatizar una tarea o construir la pieza puntual que falta.", 58, 165, 500, size=15, leading=21, color=CREAM)
    c.setFillColor(GREEN)
    c.roundRect(57, 76, 340, 48, 2, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("PymIA-BodyBold", 13)
    c.drawString(79, 94, "HABLEMOS POR WHATSAPP  ↗")
    # QR panel
    c.setFillColor(CREAM)
    c.roundRect(657, 85, 205, 266, 2, fill=1, stroke=0)
    qr_code(c, SURVEY_URL, 685, 157, 150)
    c.setFillColor(INK)
    c.setFont("PymIA-BodyBold", 12)
    c.drawCentredString(759, 129, "ESCANEÁ Y CONTANOS TU CASO")
    c.setFillColor(MUTED)
    c.setFont("PymIA-Body", 8)
    c.drawCentredString(759, 112, "Encuesta de diagnóstico PymIA")
    c.setFillColor(MINT)
    c.setFont("PymIA-Body", 8)
    c.drawString(55, 28, "Las capacidades se definen según el problema, los sistemas existentes y el contexto de cada operación.")


def build_pdf():
    register_fonts()
    c = canvas.Canvas(str(OUT), pagesize=(W, H))
    c.setTitle("PymIA — Desarrollos para operaciones reales")
    c.setAuthor("PymIA")
    c.setSubject("Presentación comercial de capacidades de desarrollo e integración")
    slides = [
        slide_cover,
        slide_problem,
        slide_sellers,
        slide_admin,
        slide_developers,
        slide_excel,
        slide_deterministic,
        slide_whatsapp,
        slide_integrate,
        slide_process,
        slide_capabilities,
        slide_cta,
    ]
    for slide in slides:
        slide(c)
        c.showPage()
    c.save()
    print(f"Created {OUT}")


if __name__ == "__main__":
    build_pdf()
