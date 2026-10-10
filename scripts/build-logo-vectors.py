"""Build approved Relay/Manrope 600 vector masters and a small web font.

Requires fonttools, uharfbuzz, brotli. Optional LOGO_PYTHON_DEPS adds an
isolated dependency directory; the default is %LOCALAPPDATA%/Codex/logo-tools.
"""
from pathlib import Path
import os
import sys
import json
import hashlib

deps = os.environ.get('LOGO_PYTHON_DEPS', str(Path(os.environ.get('LOCALAPPDATA', '.')) / 'Codex/logo-tools'))
sys.path.insert(0, deps)
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
BRAND = ROOT / 'public/assets/brand'
FONT = ROOT / 'public/assets/fonts/manrope'
SOURCE = ROOT / 'design/logo-minimal-2026-10-11/typography/fonts/manrope/Manrope[wght].ttf'
FONT.mkdir(parents=True, exist_ok=True)
BRAND.mkdir(parents=True, exist_ok=True)
source_font = TTFont(SOURCE)
font = instantiateVariableFont(source_font, {'wght': 600}, inplace=False)
static_path = FONT / 'Manrope-600.ttf'
font.save(static_path)
data = static_path.read_bytes()
face = hb.Face(data)
hbfont = hb.Font(face)
hb.ot_font_set_funcs(hbfont)
upem = face.upem
glyphs = font.getGlyphSet()
order = font.getGlyphOrder()
size = 72 / 94 * 256
scale = size / upem
tracking = .015 * size
word_gap = 15 / 72 * size
cap = font['OS/2'].sCapHeight * scale
baseline = 128 + cap / 2

def shape(text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True})
    x = 0
    result = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        pen = SVGPathPen(glyphs)
        glyphs[order[info.codepoint]].draw(pen)
        d = pen.getCommands()
        result.append(f'<path transform="translate({x + pos.x_offset * scale:.3f} {baseline - pos.y_offset * scale:.3f}) scale({scale:.6f} {-scale:.6f})" d="{d}"/>')
        x += pos.x_advance * scale + tracking
    return ''.join(result), x - tracking

pay, pay_width = shape('PAY')
orbit, orbit_width = shape('ORBIT')
text_width = pay_width + word_gap + orbit_width
letters = pay + f'<g transform="translate({pay_width + word_gap:.3f} 0)">{orbit}</g>'
mark = 'M40 144V88A48 48 0 0 1 88 40H216V72H88A16 16 0 0 0 72 88V144ZM216 112V168A48 48 0 0 1 168 216H40V184H168A16 16 0 0 0 184 168V112Z'
# White silhouettes need a slight optical reduction of weight on dark surfaces.
reverse_mark = 'M40 143V88A48 48 0 0 1 88 40H215V71H88A17 17 0 0 0 71 88V143ZM216 113V168A48 48 0 0 1 168 216H41V185H168A17 17 0 0 0 185 168V113Z'

def svg(title, body, width=256, height=256, view=None):
    vb = view or f'0 0 {width:g} {height:g}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{width:g}" height="{height:g}" role="img" aria-labelledby="logo-title"><title id="logo-title">{title}</title>{body}</svg>\n'

def write(name, body, width=256, height=256, view=None):
    (BRAND / name).write_text(svg('PAY ORBIT — Relay / Manrope 600', body, width, height, view), encoding='utf-8')

variants = [
    ('on-light', '#1768E8', '#0D1218'),
    ('on-dark', '#4098FF', '#E5ECF6'),
    ('black', '#000000', '#000000'),
    ('white', '#FFFFFF', '#FFFFFF'),
    ('blue', '#1768E8', '#1768E8'),
]
text_x = 256 + 20 / 94 * 256
width = round(text_x + text_width + 36)
for name, blue, ink in variants:
    symbol = reverse_mark if name == 'white' else mark
    symbol_body = f'<path fill="{blue}" d="{symbol}"/>'
    word_body = f'<g fill="{ink}">{letters}</g>'
    write(f'pay-orbit-mark-{name}.svg', symbol_body)
    write(f'pay-orbit-logo-{name}.svg', symbol_body + f'<g transform="translate({text_x:.3f} 0)">{word_body}</g>', width)
    write(f'pay-orbit-wordmark-{name}.svg', word_body, round(text_width + 8), cap+6, f'-4 {128-cap/2-3:.3f} {text_width+8:.3f} {cap+6:.3f}')
    # Uniform scale for the whole wordmark; its proportions are never stretched.
    stacked_width = max(text_width+80, 512)
    symbol_x = (stacked_width - 256) / 2
    write(f'pay-orbit-stacked-{name}.svg', f'<g transform="translate({symbol_x:.3f} 0)">{symbol_body}</g><g transform="translate(40 264)">{word_body}</g>', round(stacked_width), 520)
write('pay-orbit-mark.svg', f'<path fill="#4098FF" d="{mark}"/>')
write('pay-orbit-mark-small.svg', f'<path fill="#1768E8" d="{mark}"/>', view='24 24 208 208')
write('pay-orbit-favicon.svg', f'<path fill="#1768E8" d="{mark}"/>', view='24 24 208 208')
write('pay-orbit-app-icon.svg', f'<rect width="256" height="256" rx="52" fill="#02060F"/><path fill="#4098FF" d="{mark}"/>')
write('pay-orbit-maskable.svg', f'<rect width="256" height="256" fill="#02060F"/><g transform="translate(25.6 25.6) scale(.8)"><path fill="#4098FF" d="{mark}"/></g>')

options = subset.Options()
options.flavor = 'woff2'
sub = subset.Subsetter(options=options)
sub.populate(text='PAY ORBIT PTY. LTD')
sub.subset(font)
font.flavor = 'woff2'
font.save(FONT / 'Manrope-600-brand.woff2')
(FONT / 'OFL.txt').write_bytes((SOURCE.parent / 'OFL.txt').read_bytes())
(FONT / 'provenance.json').write_text(json.dumps({
    'family': 'Manrope', 'weight': 600, 'license': 'SIL Open Font License 1.1',
    'source': 'https://github.com/google/fonts/tree/main/ofl/manrope',
    'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'webSubset': 'PAY ORBIT PTY. LTD',
    'file': 'public/assets/fonts/manrope/Manrope-600-brand.woff2',
    'sha256': hashlib.sha256((FONT / 'Manrope-600-brand.woff2').read_bytes()).hexdigest(),
}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(BRAND / 'vector-build.json').write_text(json.dumps({
    'approved': 'Relay A + typography 01 Manrope 600',
    'fontSize': size, 'capHeight': cap, 'trackingEm': .015,
    'wordGapEm': 15/72, 'symbolGap': text_x-256,
    'typeConstruction': 'Manrope 600 static outlines, shaped with HarfBuzz kerning; no live SVG text.',
    'symbolConstruction': 'Two 180-degree paired open routes; stem32, outer radius48, inner radius16, gap40 on 256 grid.',
    'horizontalWidth': width, 'horizontalHeight': 256,
    'vectorFiles': sorted(p.name for p in BRAND.glob('*.svg')),
}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Built outlined SVG logo variants, Manrope 600 WOFF2 ({(FONT / "Manrope-600-brand.woff2").stat().st_size} bytes), and provenance.')
