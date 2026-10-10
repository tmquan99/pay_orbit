"""Build original logo proposals; keep production website assets untouched."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
INK = '#101820'
VERSION = 'v2'

GLYPHS = {
    'P': (56, 'M0 80V0H30C46 0 56 9 56 24S46 48 30 48H10V80ZM10 10V38H29C40 38 46 33 46 24S40 10 29 10Z'),
    'A': (66, 'M0 80L27 0H39L66 80H54L45 57H21L12 80ZM25 47H41L33 26Z'),
    'Y': (64, 'M0 0H12L32 33L52 0H64L37 43V80H27V43Z'),
    'O': (64, 'M28 -1H36C54 -1 64 10 64 29V51C64 70 54 81 36 81H28C10 81 0 70 0 51V29C0 10 10 -1 28 -1ZM28 9C16 9 10 16 10 30V50C10 64 16 71 28 71H36C48 71 54 64 54 50V30C54 16 48 9 36 9Z'),
    'R': (61, 'M0 80V0H30C46 0 56 9 56 24C56 36 49 44 37 47L61 80H48L25 48H10V80ZM10 10V38H29C40 38 46 33 46 24S40 10 29 10Z'),
    'B': (59, 'M0 80V0H29C46 0 54 8 54 21C54 30 50 35 43 39C54 42 59 48 59 60C59 73 49 80 32 80ZM10 10V34H29C39 34 44 30 44 22S39 10 29 10ZM10 44V70H31C43 70 49 66 49 58S43 44 31 44Z'),
    'I': (10, 'M0 0H10V80H0Z'),
    'T': (60, 'M0 0H60V10H35V80H25V10H0Z'),
}
O_CORNER = 'M24 -1H48A16 16 0 0 1 64 15V57A24 24 0 0 1 40 81H16A16 16 0 0 1 0 65V23A24 24 0 0 1 24 -1ZM24 9A14 14 0 0 0 10 23V65A6 6 0 0 0 16 71H40A14 14 0 0 0 54 57V15A6 6 0 0 0 48 9Z'

def wordmark(corner=False):
    x = 0
    parts = []
    for letter in 'PAY ORBIT':
        if letter == ' ':
            x += 23
            continue
        width, d = GLYPHS[letter]
        if corner and letter == 'O':
            d = O_CORNER
        parts.append(f'<path transform="translate({x} 0)" fill-rule="evenodd" d="{d}"/>')
        x += width + 10
    return ''.join(parts), x - 10

def svg(title, body, width=256, height=256):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" role="img" aria-labelledby="title"><title id="title">{title}</title><g fill="{INK}">{body}</g></svg>\n'

symbols = {
    'a': '<path d="M40 144V88A48 48 0 0 1 88 40H216V72H88A16 16 0 0 0 72 88V144ZM216 112V168A48 48 0 0 1 168 216H40V184H168A16 16 0 0 0 184 168V112Z"/>',
    'b': '<path fill-rule="evenodd" d="M24 224V32H72A48 48 0 0 1 120 80V96A48 48 0 0 1 72 144H48V224ZM48 56V120H72A24 24 0 0 0 96 96V80A24 24 0 0 0 72 56ZM184 32A48 48 0 0 1 232 80V176A48 48 0 0 1 184 224A48 48 0 0 1 136 176V80A48 48 0 0 1 184 32ZM184 56A24 24 0 0 0 160 80V176A24 24 0 0 0 184 200A24 24 0 0 0 208 176V80A24 24 0 0 0 184 56Z"/>',
    'c': '<path fill-rule="evenodd" d="M80 32H192A32 32 0 0 1 224 64V176A48 48 0 0 1 176 224H64A32 32 0 0 1 32 192V80A48 48 0 0 1 80 32ZM80 64A16 16 0 0 0 64 80V192H176A16 16 0 0 0 192 176V64Z"/>',
}

names = {'a': 'Relay', 'b': 'Twin pillars', 'c': 'Quiet wordmark'}
for key, body in symbols.items():
    (ROOT / f'concept-{key}-symbol-{VERSION}.svg').write_text(svg(f'PAY ORBIT — {names[key]}', body), encoding='utf-8')
    letters, length = wordmark(corner=key == 'c')
    if key == 'c':
        lockup = svg('PAY ORBIT — custom wordmark proposal', f'<g transform="translate(24 54) scale(1.8)">{letters}</g>', round(length*1.8+48), 256)
    else:
        lockup = svg(f'PAY ORBIT — {names[key]} horizontal proposal', f'<g transform="translate(8 16) scale(.875)">{body}</g><g transform="translate(280 56) scale(1.8)">{letters}</g>', round(length*1.8+304), 256)
    (ROOT / f'concept-{key}-lockup-{VERSION}.svg').write_text(lockup, encoding='utf-8')

brief = {
    'date': '2026-10-11',
    'brand': 'PAY ORBIT',
    'business': 'Hạ tầng mạng và bảo mật doanh nghiệp; không phải sản phẩm thanh toán.',
    'request': 'Logo mới, clean/minimal; biểu tượng mới, giữ tông xanh.',
    'audience': 'Người phụ trách IT và người mua giải pháp B2B.',
    'qualities': ['tối giản', 'chính xác', 'đáng tin', 'rõ ở kích thước nhỏ'],
    'color': 'Giữ họ xanh của website: #1768E8 nền sáng / #4098FF nền tối; thử hình dáng bằng một màu trước.',
    'avoid': ['quả cầu/quỹ đạo minh họa', 'ổ khóa/khiên chung chung', 'chi tiết mạch điện', 'hai dải màu đan như logo cũ', 'gradient/bóng/3D'],
    'wordmap': ['kết nối → hai tuyến → chung một khoảng mở', 'hạ tầng → hai trụ → monogram PO', 'chính xác → khoảng cách đều → chữ gọn'],
    'longlist': [
        {'idea': 'Hai góc đối nhau tạo một khung mở, gợi hai tuyến kết nối quanh cùng tâm.', 'score': 23, 'selected': 'a'},
        {'idea': 'P và O là hai trụ hẹp song song với cùng bán kính và đường cơ sở.', 'score': 21, 'selected': 'b'},
        {'idea': 'Wordmark tự dựng, chữ O có hai góc vuông đối hai góc bo làm dấu riêng.', 'score': 22, 'selected': 'c'},
        {'idea': 'P mở bụng một nét duy nhất.', 'score': 18, 'reason': 'Quá gần biểu tượng P cũ.'},
        {'idea': 'Hai thanh tín hiệu chéo lệch nhau.', 'score': 15, 'reason': 'Dễ thành icon dấu bằng hoặc giống logo công nghệ khác.'},
        {'idea': 'Hai cổng đối xứng gợi hạ tầng dự phòng.', 'score': 17, 'reason': 'Đọc như chữ H chung chung.'},
        {'idea': 'Vòng O hở với một nút nhỏ.', 'score': 13, 'reason': 'Gần motif quỹ đạo và cần chi tiết nhỏ.'},
        {'idea': 'Chữ O vuông chứa một đường nối ngang.', 'score': 16, 'reason': 'Dễ thành nút nguồn/thiết bị.'},
        {'idea': 'Ba mô-đun tạo mũi tên chuyển tiếp.', 'score': 14, 'reason': 'Mũi tên quen thuộc, nhiều mảnh.'},
        {'idea': 'P và O ghép thành mắt xích.', 'score': 15, 'reason': 'Mắt xích quá trực tiếp và junction khó ở 16 px.'},
    ],
    'geometry': {
        'a': 'Canvas256; nét32; bo ngoài48, bo trong16; hai nhánh quay180; khe40.',
        'b': 'Canvas256; hai chữ rộng96, stem24; khe16; bán kính ngoài48 trong24.',
        'c': 'Canvas256; thành32; bo48/16 ở hai góc đối, bo32/0 ở hai góc còn lại; wordmark path stem10/height80.',
    },
    'stage': 'Concept review only; no production logo or website file replaced.',
    'typography': 'Custom geometric vector letterforms drawn specifically for these proposals; no external font dependency in artwork.',
    'limitations': 'Library comparison is a visual reference check, not a trademark clearance.',
    'refinement': 'V1 B đọc như AD nên tách PO thành hai trụ; V1 C quá giống D nên bo nhẹ hai góc còn lại. Giữ v1 để đối chiếu.',
}
(ROOT / 'brief-and-exploration.json').write_text(json.dumps(brief, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Created 3 symbol proposals, 3 lockups, and design brief in', ROOT)
