#!/usr/bin/env python3
"""Generate the 'Consumerism & Fast Fashion' PowerPoint deck (compact, 10 slides).

Speaker notes are stored in each slide's Notes pane (visible in PowerPoint
Presenter view while recording).

Output (next to this script):
  - Fast_Fashion_Presentation.pptx
"""

import math
import os

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Palette & fonts  —  clean white + light blue + navy
# ---------------------------------------------------------------------------
PRIMARY = RGBColor(0x1D, 0x44, 0x6E)    # deep navy blue (headings, bars, nodes)
SECONDARY = RGBColor(0xB7, 0xCF, 0xE8)  # light blue (connector lines)
ACCENT = RGBColor(0x2F, 0x6F, 0xB0)     # medium blue (rules, bullets, eyebrow)
LIGHTBLUE = RGBColor(0xEA, 0xF1, 0xFA)  # very light blue (title / closing bg)
BG = RGBColor(0xFF, 0xFF, 0xFF)         # white content background
INK = RGBColor(0x2A, 0x2E, 0x33)        # near-black body text
MUTED = RGBColor(0x7C, 0x84, 0x8C)      # grey
MUTED_DARK = RGBColor(0x44, 0x4C, 0x55)
NODE_SUB = RGBColor(0xC9, 0xDC, 0xEF)   # light blue (Danish term in nodes)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

HEAD = "Georgia"
BODY = "Calibri"

# ---------------------------------------------------------------------------
# Content (compact: 10 slides)
# ---------------------------------------------------------------------------
SLIDES = [
    {
        "type": "title",
        "title": "Consumerism & Fast Fashion",
        "subtitle": "The hidden cost of cheap clothes",
        "meta": [
            "English – Group Presentation (makkerskab)",
            "By: [Your name] & [Your name]",
            "Deadline: 24/05-2026",
        ],
        "notes": (
            "Hello and welcome to our presentation on consumerism and fast fashion. We are "
            "[Name] and [Name]. We will look at the hidden cost behind the cheap clothes "
            "many of us buy, based on two texts: the Earth.org article 'Fast Fashion: The "
            "Danger of Sweatshops' and the chapter 'The Greening of Throwaway Stuff' from "
            "the textbook BusinessLike."
        ),
    },
    {
        "tag": "Overview",
        "title": "Agenda",
        "bullets": [
            "Key terms: consumerism, materialism & fast fashion",
            "Rhetorical pentagram analysis of the Earth.org article",
            "Modes of persuasion, rhetorical devices, message & intention",
            "Discussion: pros & cons, responsibility & what we can do",
        ],
        "notes": (
            "Here is our plan. First we define three key terms. Then we analyse the Earth.org "
            "article using the rhetorical pentagram. After that we look at its modes of "
            "persuasion and rhetorical devices, and its message and intention. Finally we "
            "discuss the pros and cons of fast fashion, how much responsibility we as "
            "consumers have, and what we can do about it. Our two texts are the Earth.org "
            "article and 'The Greening of Throwaway Stuff' from BusinessLike."
        ),
    },
    {
        "tag": "Definitions",
        "title": "Key terms",
        "bullets": [
            "Consumerism – a society that constantly encourages us to buy more",
            "Materialism – the mindset that owning things & money bring status and happiness",
            "Fast fashion – cheap, trend-copying clothes made to be thrown away (Shein, H&M, Zara)",
            "The chain: consumerism (society) → materialism (mindset) → fast fashion (product)",
        ],
        "notes": (
            "Three terms first. Consumerism is a social and economic order that encourages "
            "people to keep buying more and more goods – a society where consumption equals "
            "happiness and status. Materialism is the individual mindset behind it: the "
            "belief that owning things and money matter more than, say, relationships or "
            "experiences. Fast fashion is the concrete product of both: cheap, mass-produced "
            "clothing that copies trends at high speed and is designed to be thrown away "
            "quickly. So there is a chain: consumerism is the society, materialism is the "
            "mindset, and fast fashion is the product. Our second text, 'The Greening of "
            "Throwaway Stuff', calls exactly this our 'throwaway culture'."
        ),
    },
    {
        "type": "pentagram",
        "tag": "Rhetorical analysis",
        "title": "The rhetorical pentagram",
        "lead": "A model of the communication situation — five connected points that all influence each other:",
        "points": [
            ("Sender", "Earth.org, a mission-driven environmental org → institutional ethos"),
            ("Receiver", "eco-conscious, educated Western consumers — rational & moral"),
            ("Topic", "the human & environmental cost of sweatshops"),
            ("Language", "formal yet emotive — facts + loaded words"),
            ("Circumstances", "climate debate, ultra-fast fashion, published online"),
        ],
        "notes": (
            "To analyse the article we use the rhetorical pentagram – five connected points. "
            "First, the SENDER is Earth.org, an environmental, non-profit organisation, not a "
            "single famous author. That gives it an institutional, 'expert' ethos – but it is "
            "mission-driven, so it is not neutral. Second, the RECEIVER is environmentally "
            "conscious, educated Western consumers – the people who actually buy fast fashion "
            "– addressed as both rational and moral beings. Third, the TOPIC is the human and "
            "environmental cost of fast-fashion sweatshops: poverty wages, child labour, the "
            "Rana Plaza collapse in 2013 where over a thousand workers died, and huge textile "
            "waste. Fourth, the LANGUAGE is formal but accessible, mixing hard facts and "
            "figures with emotive, loaded words like 'cruel' and 'inhumane'. Fifth, the "
            "CIRCUMSTANCES: it is written in the middle of the climate debate, during the boom "
            "of ultra-fast fashion like Shein, and published online so it is free and easily "
            "shared. All five points reinforce each other."
        ),
    },
    {
        "type": "twocol",
        "tag": "Rhetoric",
        "title": "Persuasion & rhetorical devices",
        "columns": [
            ("Modes of persuasion", [
                "Ethos – Earth.org’s authority; sober, well-sourced tone",
                "Logos – statistics & cause–effect",
                (1, "60% of surveyed Indian mill workers under 18"),
                (1, "1,000+ Rana Plaza deaths; wages cover only 1/5–1/2 of needs"),
                "Pathos – emotive language; women & children; cruel conditions",
            ]),
            ("Other devices", [
                "Loaded / connotative language → guilt & moral appeal",
                "Vivid imagery & near-hyperbole",
                (1, "“a truckload burned every second”"),
                "Contrast: cheap clothes ↔ high human cost",
                "Authority & evidence – surveys, named events",
            ]),
        ],
        "notes": (
            "Now the rhetoric. The article uses all three appeals. ETHOS comes from "
            "Earth.org's authority as an environmental organisation and its sober, "
            "well-sourced tone. LOGOS comes from statistics and cause-and-effect – for "
            "example that 60 percent of workers in surveyed Indian mills were under 18, the "
            "more than a thousand deaths at Rana Plaza, and that wages cover only a fifth to a "
            "half of what a family needs. PATHOS comes from emotive language and the focus on "
            "women and children in cruel conditions. Beyond the appeals, it uses loaded "
            "language that creates guilt, vivid almost-hyperbolic imagery like 'a truckload "
            "burned every second', a clear contrast between our cheap clothes and the high "
            "human cost, and constant evidence to back the emotion up."
        ),
    },
    {
        "tag": "Interpretation",
        "title": "Message, intention & language",
        "bullets": [
            "Message: the cheap price hides the true human & environmental cost",
            "Intention: to inform AND persuade — a call to rethink consumption",
            "Sender ↔ receiver language largely matches – formal yet emotive fits informed, value-driven readers",
            "Small risk: very emotive words may feel one-sided / ‘preaching to the choir’",
        ],
        "notes": (
            "What is the message and intention? The message is that the low price of fast "
            "fashion is really paid by exploited workers and a damaged planet – the true cost "
            "is hidden. The intention is twofold: to inform and to persuade – essentially a "
            "call to action to rethink how we consume. Does the language between sender and "
            "receiver match? Largely, yes: an environmental organisation writing for informed, "
            "value-driven readers uses exactly this formal-but-emotive register, mixing data "
            "with feeling. The only small mismatch is that the very emotive words could feel "
            "one-sided to a sceptic – but the likely audience already cares, so it fits well."
        ),
    },
    {
        "type": "twocol",
        "tag": "Discussion",
        "title": "Fast fashion: pros & cons",
        "columns": [
            ("Pros", [
                "Affordable & accessible – style for low incomes",
                "Jobs & income in developing countries",
                "Fast, varied; drives economic activity",
            ]),
            ("Cons", [
                "Exploitation: poverty wages, child labour, unsafe factories",
                "Environment: water pollution, textile waste, CO₂, microplastics",
                "Throwaway culture & overconsumption",
                "Greenwashing by brands",
            ]),
        ],
        "notes": (
            "Let's discuss fast fashion. It is not only negative. On the PRO side, it is "
            "affordable and accessible, so people on low incomes can follow trends; it creates "
            "jobs and income in developing countries; and it is fast and varied, driving a lot "
            "of economic activity. But the CONS are serious: labour exploitation – poverty "
            "wages, child labour, unsafe factories; environmental harm – water pollution, "
            "textile waste, CO2 and microplastics; a throwaway culture of overconsumption; and "
            "greenwashing, where brands look sustainable without really changing. So the cheap "
            "price hides a very high cost."
        ),
    },
    {
        "type": "twocol",
        "tag": "Discussion",
        "title": "Responsibility & what we can do",
        "columns": [
            ("How much responsibility?", [
                "Shared – consumers create the demand",
                "But firms & governments hold more power & information",
                "Fairness: not everyone can afford ethical options",
                "Still, we ‘vote with our wallets’",
            ]),
            ("What we can do", [
                "Buy less, buy better (cost-per-wear)",
                "Second-hand, swap, repair & care",
                "Support ethical brands; demand transparency",
                "Recycle & donate → ‘slow fashion’",
            ]),
        ],
        "notes": (
            "So how much responsibility does the consumer have? It is shared. We create the "
            "demand that drives the system – but big companies and governments hold far more "
            "power and information, and it is a question of fairness, because not everyone can "
            "afford ethical alternatives. Still, our choices matter: we vote with our wallets, "
            "and when enough people change, companies have to follow. What can we do? Buy less "
            "but better, thinking about cost-per-wear; buy second-hand, swap and repair; "
            "support ethical brands and demand transparency; and recycle and donate. All of "
            "this is the idea of 'slow fashion' – the opposite of the fast, throwaway model."
        ),
    },
    {
        "tag": "Wrap-up",
        "title": "Conclusion",
        "bullets": [
            "Fast fashion is a clear product of consumerism & materialism",
            "Earth.org uses logos + pathos on a base of institutional ethos to expose the hidden cost",
            "Responsibility is shared – but small changes, by many, add up",
        ],
        "sources": [
            "Earth.org, “Fast Fashion: The Danger of Sweatshops” – earth.org/sweatshops/",
            "“The Greening of Throwaway Stuff”, BusinessLike, Systime",
        ],
        "notes": (
            "To conclude: fast fashion is a clear product of consumerism and materialism. In "
            "its article, Earth.org uses a strong mix of logos and pathos, on a base of solid "
            "institutional ethos, to expose the hidden human and environmental cost of cheap "
            "clothing. Responsibility is shared between consumers, companies and governments – "
            "but we are not powerless, and small changes made by many people really do add up. "
            "Our sources are the Earth.org article and 'The Greening of Throwaway Stuff'. "
            "Thank you."
        ),
    },
    {
        "type": "closing",
        "title": "Thank you",
        "subtitle": "Any questions?",
        "notes": "Thank you for listening. We are happy to take any questions.",
    },
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def set_bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def add_rect(slide, x, y, w, h, color):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    shp.fill.solid()
    shp.fill.fore_color.rgb = color
    shp.line.fill.background()
    shp.shadow.inherit = False
    return shp


def add_text(slide, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
             space_after=8, line_spacing=1.1):
    """runs: list of paragraphs; each paragraph is a list of (text, font, size, color, bold)."""
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(space_after)
        p.line_spacing = line_spacing
        for (text, font, size, color, bold) in para:
            r = p.add_run()
            r.text = text
            r.font.name = font
            r.font.size = Pt(size)
            r.font.color.rgb = color
            r.font.bold = bold
    return tb


def bullet_paras(items, l0=19, l1=16):
    """Build paragraph-run-lists for a list of bullet items (str or (level, str))."""
    paras = []
    for item in items:
        level, text = item if isinstance(item, tuple) else (0, item)
        if level == 0:
            paras.append([("▸  ", BODY, int(l0 * 0.85), ACCENT, True),
                          (text, BODY, l0, INK, False)])
        else:
            paras.append([("      –  ", BODY, int(l1 * 0.95), MUTED, False),
                          (text, BODY, l1, MUTED_DARK, False)])
    return paras


def header(slide, prs, data, page=True):
    """Standard white-slide header (left bar, tag, title, rule, footer). Returns body-top in inches."""
    set_bg(slide, BG)
    add_rect(slide, Inches(0), Inches(0), Inches(0.16), Inches(7.5), PRIMARY)
    top = 0.55
    if data.get("tag"):
        add_text(slide, Inches(0.7), Inches(top), Inches(11.8), Inches(0.4),
                 [[(data["tag"].upper(), BODY, 13, ACCENT, True)]])
        top += 0.42
    add_text(slide, Inches(0.7), Inches(top), Inches(12.0), Inches(1.0),
             [[(data["title"], HEAD, 30, PRIMARY, True)]])
    add_rect(slide, Inches(0.72), Inches(top + 0.92), Inches(1.7), Inches(0.045), ACCENT)
    add_text(slide, Inches(0.7), Inches(7.05), Inches(8.0), Inches(0.35),
             [[("Consumerism & Fast Fashion", BODY, 10, MUTED, False)]])
    if page:
        idx = len(prs.slides._sldIdLst)
        add_text(slide, Inches(12.0), Inches(7.05), Inches(0.9), Inches(0.35),
                 [[(str(idx), BODY, 10, MUTED, False)]], align=PP_ALIGN.RIGHT)
    return top + 1.25


# ---------------------------------------------------------------------------
# Slide builders
# ---------------------------------------------------------------------------
def add_content_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    body_top = header(slide, prs, data)
    if data.get("bullets"):
        add_text(slide, Inches(0.95), Inches(body_top), Inches(11.6), Inches(4.4),
                 bullet_paras(data["bullets"]), space_after=12, line_spacing=1.14)
    if data.get("sources"):
        add_text(slide, Inches(0.95), Inches(5.65), Inches(11.6), Inches(0.3),
                 [[("SOURCES", BODY, 11, ACCENT, True)]])
        src = [[(s, BODY, 12, MUTED, False)] for s in data["sources"]]
        add_text(slide, Inches(0.95), Inches(6.0), Inches(11.6), Inches(1.0),
                 src, space_after=2, line_spacing=1.1)
    slide.notes_slide.notes_text_frame.text = data.get("notes", "")
    return slide


def add_twocol_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    body_top = header(slide, prs, data)
    cols = data["columns"]
    xs = [0.85, 6.95]
    cw = 5.5
    for (heading, items), x in zip(cols, xs):
        # column heading
        add_text(slide, Inches(x), Inches(body_top), Inches(cw), Inches(0.5),
                 [[(heading, HEAD, 19, PRIMARY, True)]])
        add_rect(slide, Inches(x + 0.02), Inches(body_top + 0.5), Inches(0.9), Inches(0.04), ACCENT)
        # column bullets
        add_text(slide, Inches(x), Inches(body_top + 0.72), Inches(cw), Inches(3.6),
                 bullet_paras(items, l0=16, l1=14), space_after=9, line_spacing=1.12)
    slide.notes_slide.notes_text_frame.text = data.get("notes", "")
    return slide


def add_pentagram_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    body_top = header(slide, prs, data)

    # left: lead line + five labelled points
    paras = [[(data["lead"], BODY, 15, MUTED_DARK, False)]]
    for label, desc in data["points"]:
        paras.append([("▸  ", BODY, 13, ACCENT, True),
                      (label + ": ", BODY, 15, PRIMARY, True),
                      (desc, BODY, 15, INK, False)])
    add_text(slide, Inches(0.95), Inches(body_top), Inches(5.0), Inches(4.4),
             paras, space_after=11, line_spacing=1.12)

    # right: the pentagram diagram
    labels = [("Topic", "Emne"), ("Receiver", "Modtager"), ("Language", "Sprog"),
              ("Circumstances", "Omstændigheder"), ("Sender", "Afsender")]
    cx, cy, r = 9.5, 4.35, 1.9
    pts = [(cx + r * math.cos(math.radians(-90 + 72 * i)),
            cy + r * math.sin(math.radians(-90 + 72 * i))) for i in range(5)]
    for i in range(5):
        for j in range(i + 1, 5):
            conn = slide.shapes.add_connector(
                MSO_CONNECTOR.STRAIGHT, Inches(pts[i][0]), Inches(pts[i][1]),
                Inches(pts[j][0]), Inches(pts[j][1]))
            conn.line.color.rgb = SECONDARY
            conn.line.width = Pt(1.25)
    add_text(slide, Inches(cx - 1.1), Inches(cy - 0.3), Inches(2.2), Inches(0.6),
             [[("the text", HEAD, 13, MUTED, False)], [("& its situation", HEAD, 13, MUTED, False)]],
             align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE, space_after=0, line_spacing=1.0)
    nw, nh = 2.0, 0.72
    for (en, da), (px, py) in zip(labels, pts):
        node = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                      Inches(px - nw / 2), Inches(py - nh / 2), Inches(nw), Inches(nh))
        node.fill.solid()
        node.fill.fore_color.rgb = PRIMARY
        node.line.color.rgb = PRIMARY
        node.shadow.inherit = False
        tf = node.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        p1.line_spacing = 0.95
        r1 = p1.add_run(); r1.text = en
        r1.font.name = BODY; r1.font.size = Pt(15); r1.font.bold = True; r1.font.color.rgb = WHITE
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        p2.line_spacing = 0.95
        r2 = p2.add_run(); r2.text = da
        r2.font.name = BODY; r2.font.size = Pt(11); r2.font.italic = True; r2.font.color.rgb = NODE_SUB

    slide.notes_slide.notes_text_frame.text = data.get("notes", "")
    return slide


def add_title_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, LIGHTBLUE)
    add_rect(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), PRIMARY)
    add_text(slide, Inches(1.0), Inches(1.7), Inches(11.0), Inches(0.5),
             [[("GROUP PRESENTATION", BODY, 16, ACCENT, True)]])
    add_text(slide, Inches(1.0), Inches(2.3), Inches(11.3), Inches(1.8),
             [[(data["title"], HEAD, 50, PRIMARY, True)]])
    add_rect(slide, Inches(1.05), Inches(3.95), Inches(2.4), Inches(0.06), ACCENT)
    add_text(slide, Inches(1.0), Inches(4.15), Inches(11.0), Inches(0.7),
             [[(data["subtitle"], HEAD, 24, MUTED_DARK, False)]])
    meta_paras = [[(line, BODY, 15, MUTED, False)] for line in data["meta"]]
    add_text(slide, Inches(1.0), Inches(5.5), Inches(11.0), Inches(1.6),
             meta_paras, space_after=4, line_spacing=1.2)
    slide.notes_slide.notes_text_frame.text = data.get("notes", "")
    return slide


def add_closing_slide(prs, data):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_bg(slide, LIGHTBLUE)
    add_rect(slide, Inches(0), Inches(0), Inches(0.3), Inches(7.5), PRIMARY)
    add_text(slide, Inches(1.0), Inches(2.7), Inches(11.3), Inches(1.6),
             [[(data["title"], HEAD, 54, PRIMARY, True)]])
    add_rect(slide, Inches(1.05), Inches(4.35), Inches(2.4), Inches(0.06), ACCENT)
    add_text(slide, Inches(1.0), Inches(4.6), Inches(11.0), Inches(0.8),
             [[(data["subtitle"], HEAD, 26, MUTED_DARK, False)]])
    slide.notes_slide.notes_text_frame.text = data.get("notes", "")
    return slide


def build_pptx():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    dispatch = {
        "title": add_title_slide,
        "closing": add_closing_slide,
        "pentagram": add_pentagram_slide,
        "twocol": add_twocol_slide,
    }
    for data in SLIDES:
        dispatch.get(data.get("type"), add_content_slide)(prs, data)
    out = os.path.join(HERE, "Fast_Fashion_Presentation.pptx")
    prs.save(out)
    return out


if __name__ == "__main__":
    print("Wrote:", build_pptx())
