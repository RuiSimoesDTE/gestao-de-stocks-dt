from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

OUT = Path(__file__).resolve().parent
PDF = OUT / "CV_Rui_Simoes.pdf"

NAVY = colors.HexColor("#17324D")
TEAL = colors.HexColor("#147D82")
INK = colors.HexColor("#25313B")
MUTED = colors.HexColor("#60717F")
PALE = colors.HexColor("#F5F8F9")
GRID = colors.HexColor("#D8E4E6")

font_regular = "Helvetica"
font_bold = "Helvetica-Bold"

styles = getSampleStyleSheet()
body = ParagraphStyle(
    "CVBody", fontName=font_regular, fontSize=8.55, leading=10.4,
    textColor=INK, spaceAfter=2.1*mm
)
small = ParagraphStyle(
    "CVSmall", parent=body, fontSize=8.0, leading=9.6, spaceAfter=0
)
section = ParagraphStyle(
    "CVSection", fontName=font_bold, fontSize=9.4, leading=11.2,
    textColor=NAVY, spaceBefore=3.1*mm, spaceAfter=1.7*mm,
    borderColor=TEAL, borderWidth=0, borderBottomWidth=0.8,
    borderPadding=1.5
)
role_title = ParagraphStyle(
    "RoleTitle", fontName=font_bold, fontSize=9.0, leading=10.6,
    textColor=NAVY, spaceAfter=0
)
role_meta = ParagraphStyle(
    "RoleMeta", fontName=font_bold, fontSize=8.0, leading=9.3,
    textColor=MUTED, spaceAfter=1.0*mm
)
bullet_style = ParagraphStyle(
    "CVBullet", parent=body, fontSize=8.1, leading=9.7,
    leftIndent=4.5*mm, firstLineIndent=-3.5*mm, bulletIndent=0.5*mm,
    spaceAfter=0.85*mm
)


def sec(title):
    return Paragraph(title.upper(), section)


def bullet(text):
    return Paragraph(f"• {text}", bullet_style)


def role(title, org, dates, bullets, location=""):
    title_table = Table(
        [[Paragraph(title, role_title), Paragraph(dates, ParagraphStyle(
            "date", parent=role_title, alignment=TA_RIGHT, textColor=TEAL, fontSize=8.2
        ))]],
        colWidths=[132*mm, 50*mm],
    )
    title_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    meta = org + (f"  |  {location}" if location else "")
    items = [title_table, Paragraph(meta, role_meta)]
    items.extend(bullet(x) for x in bullets)
    return KeepTogether(items)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GRID)
    canvas.setLineWidth(0.4)
    canvas.line(14*mm, 11*mm, 196*mm, 11*mm)
    canvas.setFillColor(MUTED)
    canvas.setFont(font_regular, 7)
    canvas.drawString(14*mm, 7*mm, "Rui Simões  •  Curriculum Vitae")
    canvas.drawRightString(196*mm, 7*mm, f"{doc.page}")
    canvas.restoreState()


doc = SimpleDocTemplate(
    str(PDF), pagesize=A4,
    rightMargin=14*mm, leftMargin=14*mm, topMargin=11*mm, bottomMargin=15*mm,
    title="Curriculum Vitae - Rui Simões", author="Rui Simões"
)

story = []
story.append(Paragraph("RUI SIMÕES", ParagraphStyle(
    "Name", fontName=font_bold, fontSize=23, leading=24, textColor=NAVY, spaceAfter=1.3*mm
)))
story.append(Paragraph(
    "ADMINISTRAÇÃO  •  OPERAÇÕES  •  LOGÍSTICA  •  COORDENAÇÃO",
    ParagraphStyle("Tag", fontName=font_bold, fontSize=8.8, leading=10,
                   textColor=TEAL, borderColor=TEAL, borderBottomWidth=1.7,
                   borderPadding=2.3, spaceAfter=2.3*mm)
))
story.append(Paragraph(
    "Azambuja, Portugal  |  +351 912 654 164  |  rui16simoes@gmail.com<br/>"
    "linkedin.com/in/rui-simões-ab0586b7",
    ParagraphStyle("Contact", fontName=font_regular, fontSize=8.1, leading=9.8,
                   alignment=TA_CENTER, textColor=MUTED, spaceAfter=1.5*mm)
))

story += [
    sec("Perfil profissional"),
    Paragraph(
        "Profissional com mais de 20 anos de experiência em ambientes operacionais e de serviço, "
        "com percurso consolidado em apoio administrativo à produção, logística, gestão de stocks, "
        "transportes, coordenação de equipas e atendimento. Experiência em projetos ferroviários, "
        "controlo de materiais em SAP, compras, planeamento de recursos e articulação entre diferentes "
        "intervenientes. Perfil organizado, responsável e versátil, com forte capacidade de liderança, "
        "comunicação, resolução de problemas e adaptação a contextos exigentes.",
        body
    ),
    sec("Competências-chave")
]

skills = [
    "Apoio administrativo à produção", "Gestão operacional e planeamento", "Logística, stocks e aprovisionamento",
    "SAP e controlo de materiais", "Compras e consulta ao mercado", "Coordenação de equipas e turnos",
    "Gestão documental e relatórios", "Transportes e expedição", "Comunicação e atendimento",
]
skill_data = [
    [Paragraph(skills[r*3+c], ParagraphStyle(
        f"skill{r}{c}", parent=small, fontName=font_bold, textColor=NAVY, leading=9
    )) for c in range(3)] for r in range(3)
]
skill_table = Table(skill_data, colWidths=[60.67*mm]*3)
skill_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), PALE),
    ("BACKGROUND", (0, 2), (-1, 2), PALE),
    ("GRID", (0, 0), (-1, -1), 0.35, GRID),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.append(skill_table)
story.append(sec("Experiência profissional"))
story.append(role(
    "Técnico Administrativo de Produção", "DTE - Instalações Especiais",
    "out 2025 - atual",
    [
        "Apoio administrativo e operacional à Direção de Produção em projetos ferroviários, assegurando a organização de processos e o suporte às operações em obra.",
        "Coordenação administrativa entre equipas de obra, fiscalização e dono de obra; controlo de assiduidade, entradas e saídas, turnos diurnos e noturnos.",
        "Gestão de compras, consulta ao mercado, alojamentos e mobilização de equipas; registo e controlo de materiais, ferramentas e equipamentos em SAP.",
        "Preparação de documentação técnica e administrativa, apoio a autos de medição, mapas económico-financeiros, relatórios e comunicações internas.",
    ]
))
story.append(role(
    "Chefe de Estação", "Boa Viagem", "ago 2015 - out 2025",
    [
        "Coordenação de movimentos de autocarros, equipas e recursos, garantindo a execução do serviço e o cumprimento dos horários.",
        "Colaboração na elaboração de horários, gestão de substituições de pessoal e viaturas e mobilização de veículos suplementares em períodos de maior afluência.",
        "Controlo do serviço diário e de registos tacográficos, análise de atrasos, gestão de ocorrências, elaboração de relatórios e receção de contas de motoristas.",
    ], "Arruda dos Vinhos"
))
story.append(role(
    "Administrativo de Logística e Gestão de Stocks", "STEF Portugal",
    "2008 - 2015",
    [
        "Gestão de stocks, receção, expedição e aprovisionamento; apoio administrativo aos clientes Auchan, GL, Sogenave, Ferrero, Spar e Terras de Alter.",
        "Responsabilidade pelo economato da plataforma de Alverca e apoio aos processos de qualidade, higienização de armazém e serviço ao cliente.",
    ], "Alverca, Azambuja e Póvoa de Santa Iria"
))

story.append(sec("Experiência profissional — continuação"))
story.append(role("Assistente Comercial", "Companhia Geral de Leilões / Leilocar", "2007 - 2008",
                  ["Apoio comercial e administrativo numa leiloeira de automóveis, com contacto regular com clientes e suporte aos processos de venda."]))
story.append(role("Administrativo", "Hospital CUF Infante Santo", "2006 - 2007",
                  ["Marcação telefónica de exames e consultas e atendimento administrativo a utentes."]))
story.append(role("Administrativo de Receção", "El Corte Inglés Portugal", "2005 - 2006",
                  ["Receção administrativa e controlo de produtos destinados à loja."], "Lisboa"))

story.append(PageBreak())
story.append(sec("Projetos, liderança e comunicação"))
story.append(role(
    "Fundador e Responsável Editorial", "Zona Técnica Futsal Portugal", "2014 - atual",
    [
        "Criação e gestão editorial de uma plataforma digital especializada em futsal português, incluindo estratégia de conteúdos, notícias, entrevistas, análises táticas e cobertura de competições.",
        "Gestão do site e plataformas digitais, coordenação do calendário editorial e cobertura internacional de Campeonatos da Europa e UEFA Futsal Champions League.",
    ]
))
story.append(role(
    "Treinador de Guarda-Redes, Analista e Coordenador", "Vários clubes e projetos de futsal", "2011 - atual",
    [
        "Experiência em treino de guarda-redes, observação e análise de jogo, coordenação técnica e apoio à gestão de equipas, incluindo SL Benfica S17/S20, Reguilas Tires, AF Santarém, Futsal Oeiras e UPVN.",
        "Participação no Campeonato do Mundo de Futsal de 2022 e colaboração com a Seleção Nacional de Pessoas com Diabetes.",
    ]
))

story.append(sec("Educação e formação"))
education = [
    ["2025 - atual", "TeSP em Gestão Administrativa de Recursos Humanos — ISLA Santarém | Em curso desde setembro de 2025"],
    ["2009 - 2010", "Frequência do 1.º ano da licenciatura em Gestão de Empresas — Escola Superior de Gestão de Santarém"],
    ["2002 - 2005", "Curso Técnico de Transportes — IPTrans, Loures | Equivalência ao 12.º ano, nível III | 14 valores"],
    ["1996 - 2001", "9.º ano — Instituto Militar dos Pupilos do Exército"],
]
edu_data = [[Paragraph(a, ParagraphStyle("edate", parent=small, fontName=font_bold, textColor=TEAL)),
             Paragraph(b, small)] for a, b in education]
edu = Table(edu_data, colWidths=[30*mm, 152*mm])
edu.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), PALE),
    ("BACKGROUND", (0, 2), (-1, 2), PALE),
    ("GRID", (0, 0), (-1, -1), 0.35, GRID),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.append(edu)

story.append(sec("Formação complementar selecionada"))
for item in [
    "Curso de Treinador de Futsal Nível II (2023) e formação contínua em metodologia, plano de jogo, microciclo e treino de jovens (2023-2024).",
    "Formação de Tutores de Futsal (2024).",
    "Ações de formação em combate a incêndios (2015 e 2023).",
    "Curso Europeu de Primeiros Socorros (2009).",
    "Formação em atendimento, serviço ao cliente, higienização e qualidade.",
    "Curso de Mediador de Seguros Ligado - Ramo Não Vida (2008).",
]:
    story.append(bullet(item))

story.append(sec("Idiomas e ferramentas"))
story.append(Paragraph(
    "<b>Português</b> — língua materna &nbsp;&nbsp;|&nbsp;&nbsp; <b>Inglês</b> — nível básico (A2)<br/>"
    "<b>Ferramentas e sistemas:</b> SAP; ferramentas de gestão documental e operacional; "
    "Video Observer; plataformas digitais e gestão de conteúdos.",
    body
))

doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(PDF)
