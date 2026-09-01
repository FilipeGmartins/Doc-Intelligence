from html import escape
from pathlib import Path
import re
from urllib.request import urlretrieve

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "CLOSING_LETTER.md"
FONT_DIR = ROOT / "tmp" / "fonts"
OUTPUT = ROOT / "output" / "pdf" / "CARTA_ENCERRAMENTO_DOC_INTELLIGENCE.pdf"

FONT_URLS = {
    "Roboto-Regular.ttf": "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf",
    "Roboto-Bold.ttf": "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Bold.ttf",
}

BLUE = HexColor("#285BD4")
DARK = HexColor("#1C2739")
MUTED = HexColor("#697588")
RULE = HexColor("#D7E2F8")


def register_fonts():
    FONT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, url in FONT_URLS.items():
        destination = FONT_DIR / filename
        if destination.exists():
            continue
        temporary = destination.with_suffix(".part")
        urlretrieve(url, temporary)
        temporary.replace(destination)

    regular = FONT_DIR / "Roboto-Regular.ttf"
    bold = FONT_DIR / "Roboto-Bold.ttf"
    pdfmetrics.registerFont(TTFont("Roboto", regular))
    pdfmetrics.registerFont(TTFont("Roboto-Bold", bold))
    pdfmetrics.registerFontFamily("Roboto", normal="Roboto", bold="Roboto-Bold")


def inline_markup(text):
    escaped = escape(" ".join(line.strip() for line in text.splitlines()))
    return re.sub(r"`([^`]+)`", r"<b>\1</b>", escaped)


def read_sections():
    blocks = [block.strip() for block in SOURCE.read_text(encoding="utf-8").split("\n\n") if block.strip()]
    sections = []
    current_heading = None
    current_paragraphs = []
    skip_overview = True

    for block in blocks:
        if block.startswith("# Carta"):
            continue
        if block == "## Visão geral":
            skip_overview = True
            continue
        if block.startswith("## "):
            if current_heading:
                sections.append((current_heading, current_paragraphs))
            current_heading = block[3:]
            current_paragraphs = []
            skip_overview = False
            continue
        if not skip_overview and current_heading:
            current_paragraphs.append(block)

    if current_heading:
        sections.append((current_heading, current_paragraphs))
    return sections


def draw_page(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.7)
    canvas.line(2.0 * cm, height - 1.35 * cm, width - 2.0 * cm, height - 1.35 * cm)
    canvas.setFont("Roboto-Bold", 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(2.0 * cm, height - 1.05 * cm, "DOC Intelligence  |  Trilha B")
    canvas.setFont("Roboto", 8.5)
    canvas.drawRightString(width - 2.0 * cm, 1.05 * cm, f"Página {document.page}")
    canvas.restoreState()


def build_pdf():
    register_fonts()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=2.0 * cm,
        rightMargin=2.0 * cm,
        topMargin=1.7 * cm,
        bottomMargin=1.55 * cm,
        title="Carta de encerramento - DOC Intelligence",
        author="Filipe Gomes Martins",
        subject="Desafio técnico - Trilha B",
    )

    title_style = ParagraphStyle(
        "Title",
        fontName="Roboto-Bold",
        fontSize=17,
        leading=19.5,
        textColor=DARK,
        alignment=TA_LEFT,
        spaceAfter=3,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        fontName="Roboto-Bold",
        fontSize=10.5,
        leading=12,
        textColor=BLUE,
        alignment=TA_LEFT,
        spaceAfter=3,
    )
    metadata_style = ParagraphStyle(
        "Metadata",
        fontName="Roboto",
        fontSize=8.5,
        leading=10,
        textColor=MUTED,
        alignment=TA_LEFT,
        spaceAfter=10,
    )
    heading_style = ParagraphStyle(
        "Heading",
        fontName="Roboto-Bold",
        fontSize=12,
        leading=13.8,
        textColor=BLUE,
        alignment=TA_LEFT,
        spaceBefore=6,
        spaceAfter=4,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "Body",
        fontName="Roboto",
        fontSize=11,
        leading=12.65,
        textColor=DARK,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        splitLongWords=False,
        allowWidows=0,
        allowOrphans=0,
    )

    story = [
        Spacer(1, 5),
        Paragraph("CARTA DE ENCERRAMENTO", title_style),
        Paragraph("DOC Intelligence - Processamento e conferência assistida de documentos", subtitle_style),
        Paragraph("Front-end com API, banco e IA simulados  |  Setembro de 2026", metadata_style),
    ]

    for heading, paragraphs in read_sections():
        block = [Paragraph(escape(heading), heading_style)]
        block.extend(Paragraph(inline_markup(paragraph), body_style) for paragraph in paragraphs)
        story.append(KeepTogether(block) if len(paragraphs) == 1 else block[0])
        if len(paragraphs) > 1:
            story.extend(block[1:])

    document.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
