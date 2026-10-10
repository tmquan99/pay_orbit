# Logo PAY ORBIT — Relay / Manrope 600

Đã chốt ngày 11/10/2026: biểu tượng A **Relay** và typography **01 — Manrope 600**, theo lựa chọn của người dùng. Hai nhánh đối nhau gợi các tuyến kết nối quanh một khoảng mở chung; dùng màu phẳng và hình học đơn giản, phù hợp hạ tầng mạng và bảo mật doanh nghiệp.

## Artwork và phiên bản

Nguồn vector nằm tại `public/assets/brand/`. Tất cả chữ trong SVG đã chuyển thành đường path: file logo không phụ thuộc font trên máy người nhận.

| File | Dùng cho |
| --- | --- |
| `pay-orbit-mark.svg` | Biểu tượng xanh sáng, header/footer nền tối |
| `pay-orbit-mark-on-light.svg` | Biểu tượng xanh đậm trên nền sáng |
| `pay-orbit-logo-on-light.svg` / `.png` | Logo ngang nền sáng, chữ xanh đen |
| `pay-orbit-logo-on-dark.svg` / `.png` | Logo ngang nền tối, chữ sáng |
| `pay-orbit-stacked-on-light.svg`, `pay-orbit-stacked-on-dark.svg` | Logo biểu tượng trên, tên bên dưới |
| `pay-orbit-wordmark-on-light.svg`, `pay-orbit-wordmark-on-dark.svg` | Chỉ tên thương hiệu |
| `*-black.svg`, `*-white.svg`, `*-blue.svg` | Phiên bản một màu |
| `pay-orbit-mark-small.svg`, `pay-orbit-favicon.svg` | Bản đóng khung gần hơn cho kích thước nhỏ |
| `pay-orbit-favicon.png`, `favicon.ico` | Favicon PNG 64px, ICO 16/32/48px |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png` | Apple touch, web app, maskable icon |
| `pay-orbit-mark.png`, `pay-orbit-mark-web.png` | PNG trong suốt 1024px và 192px |

## Màu và chữ

| Màu | HEX | RGB | CMYK gần đúng |
| --- | --- | --- | --- |
| Xanh trên nền sáng | `#1768E8` | 23, 104, 232 | 90, 55, 0, 9 |
| Xanh trên nền tối | `#4098FF` | 64, 152, 255 | 75, 40, 0, 0 |
| Chữ trên nền sáng | `#0D1218` | 13, 18, 24 | 46, 25, 0, 91 |
| Chữ trên nền tối | `#E5ECF6` | 229, 236, 246 | 7, 4, 0, 4 |
| Nền tối | `#02060F` | 2, 6, 15 | 87, 60, 0, 94 |

CMYK là quy đổi toán học tham khảo; cần proof theo giấy/profile khi in. Không chỉ định Pantone cho bộ logo website này.

Tên thương hiệu viết **PAY ORBIT**, Manrope 600, tracking `0.015em`. Khoảng PAY–ORBIT bằng khoảng `0.2083em`, với kerning gốc của font. Không kéo ngang hoặc bóp chữ để vừa khung. Biểu tượng và typography được lấy trực tiếp từ hướng đã duyệt, không thêm hiệu ứng.

Website dùng biểu tượng SVG và chữ HTML với Manrope 600 local. Font WOFF2 chỉ chứa các ký tự của tên thương hiệu và pháp nhân; không dùng cho nội dung. Giữ giấy phép SIL Open Font License ở `public/assets/fonts/manrope/OFL.txt`. Các font nội dung Bricolage Grotesque và Be Vietnam Pro giữ nguyên.

## Khoảng trống, kích thước và nền

- Khoảng trống ngoài logo tối thiểu bằng một bề dày nhánh: **32 đơn vị trên lưới 256**. Không tính phần padding có sẵn hai lần.
- Biểu tượng riêng tối thiểu **16px** với bản small/favicon; logo ngang tối thiểu khoảng **160px**. Ở chỗ hẹp hơn dùng biểu tượng riêng và tên truy cập phù hợp.
- Header dùng tên 24px và biểu tượng 32px; mobile tên 18px và biểu tượng 32px. Footer giữ đầy đủ **PAY ORBIT PTY. LTD** và tagline song ngữ.
- Nền sáng dùng bản on-light; nền tối dùng on-dark. Trên ảnh phức tạp, đặt logo trên bề mặt đơn sắc. Bản trắng có nhánh mỏng hơn một chút để bù cảm giác nặng trên nền tối.
- Không kéo méo, xoay, thêm gradient/bóng/viền, đổi khoảng cách từng phần, thay kiểu chữ, hoặc trộn lại màu cyan từ logo cũ.

## Xuất lại và kiểm tra

`node scripts/export-logo.mjs` xuất PNG, ICO, web icons và cập nhật hash trong `content/brand-assets.json` từ các SVG đã outline; cần sharp trong môi trường phát triển. Website tĩnh không cần thư viện này.

`python scripts/build-logo-vectors.py` dựng lại master và font subset từ Manrope gốc đã giữ trong `design/logo-minimal-2026-10-11/typography/fonts/manrope/`. Công cụ dựng cần `fonttools`, `uharfbuzz`, `brotli`; có thể đặt `LOGO_PYTHON_DEPS` đến thư mục cài công cụ. Typography SVG được shape bằng HarfBuzz trước khi outline.

`node tests/logo.mjs` kiểm tra 12 route, tên truy cập, PNG alpha và hash SVG/PNG. Browser checks xác nhận font thật, biểu tượng vuông, favicon tải được và các kích thước màn hình. Kiểm tra cấu trúc SVG báo góc chữ A của font và số điểm outline; đây là hình dạng font gốc được giữ nguyên. Bản ngang rộng có bản stacked và symbol riêng đi kèm.

Đây là thiết kế mới cho website. Việc đối chiếu thư viện hình và kiểm tra render không thay cho tra cứu nhãn hiệu.
