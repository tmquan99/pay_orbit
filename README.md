# PAY ORBIT

Website tĩnh sử dụng HTML, CSS và JavaScript native. Không có dependency ứng dụng.

Website có sáu trang với hai ngôn ngữ Việt/Anh, dùng chung menu, footer, font và các tài sản đã có. Bản Anh có cùng đường dẫn dưới `/en/`; nút VI/EN chuyển tới cùng trang:

Trang chủ được nâng cấp theo bản duyệt ngày 09/10/2026: hero ngắn, hai nhóm giải pháp, ảnh minh họa đội kỹ thuật và sơ đồ kết nối chạy một lần khi cuộn đến. Chi tiết và nguồn ảnh tại `docs/home-motion.md`; reduced motion và chế độ không JavaScript luôn có bản tĩnh đọc được.

Trang Giới thiệu có bản thử Scrolltelling hai chương tại `/about/#about_story`: sơ đồ giữ vị trí trên desktop, chuyển từ nhu cầu kết nối sang kiến trúc cùng bảo mật và trở về khi cuộn ngược. Mobile, cửa sổ thấp, reduced motion và không JavaScript có minh họa tĩnh riêng. Nội dung workbook giữ đủ VI/EN; chi tiết tại `docs/about-scrolltelling.md`.

Ảnh trên Home dùng WebP có hai kích thước; PNG gốc vẫn lưu trong dự án. Lệnh tái xuất tùy chọn `node scripts/optimize-home-images.mjs` dùng sharp trong môi trường phát triển, không bắt buộc khi chạy hoặc build website.

| Trang | URL | Nội dung từ tài liệu |
| --- | --- | --- |
| Trang chủ | `/` | Hero, bốn giải pháp tổng quan, giới thiệu ngắn, trọng tâm công nghệ, cách tiếp cận |
| Giới thiệu | `/about/` | Đủ năm phần trong `02_Company_Intro` |
| Giải pháp | `/solutions/` | Bốn giải pháp và lợi ích tương ứng trong `03_Solutions` |
| Dịch vụ | `/services/` | Năm dịch vụ và phạm vi điển hình trong `04_Services` |
| Sản phẩm & công nghệ | `/products/` | Bốn nhóm Cisco và ba nhóm Palo Alto Networks trong `05_Products_Tech` |
| Liên hệ | `/contact/` | Thông tin công ty, người đại diện, địa chỉ, số điện thoại và năm trường biểu mẫu |

Nguồn nội dung là `PAY_ORBIT_Website_Content_v2_Simplified.xlsx`. Bản trích theo ô và mã SHA-256 nằm tại `content/workbook.json`; bảng đối chiếu ở `docs/content-mapping.md`. Các trang chi tiết giữ nguyên các đoạn tiếng Việt từ cột C và tiếng Anh từ cột B. Phạm vi dịch vụ dùng bản tiếng Anh gốc ở cột D và bản dịch tiếng Việt. Nhãn giao diện, chú thích ảnh và thông báo được dịch tại `content/ui.en.json`; chi tiết ở `docs/bilingual-content.md`.

`scripts/render-pages.mjs` là template chung tạo 12 bản HTML. `scripts/localize.mjs` đối chiếu nội dung theo cột tài liệu và chặn nhãn tiếng Việt chưa dịch trong bản Anh. Khi chỉnh nội dung hoặc template, chạy `node scripts/render-pages.mjs` hoặc `npm run build`. Không sửa riêng từng bản HTML rồi chạy build, vì build sẽ tạo lại HTML từ nguồn chung.

- `npm run dev -- --host 127.0.0.1 --port 3000`: phục vụ website local.
- `npm run check`: kiểm tra cú pháp, quy tắc chuyển động và tài sản.
- `npm run build`: tạo lại 12 bản trang Việt/Anh và xuất thư mục `dist` để phục vụ bằng web server tĩnh có hỗ trợ `index.html` trong thư mục con.
- `npm test`: kiểm tra URL, menu, đủ nội dung gốc ở cả hai ngôn ngữ và browser với Playwright có sẵn trong môi trường Codex. Có thể đặt `NODE_PATH` hoặc `CHROME_PATH` khi dùng môi trường khác. Đặt `TEST_DIST=1` để kiểm tra bản build.

Biểu mẫu trên trang Liên hệ chỉ chuẩn bị và sao chép nội dung, không gửi yêu cầu hoặc lưu dữ liệu. Kênh liên hệ chính là số điện thoại trong tài liệu. Email của công ty trong workbook là `[Cập nhật sau]`, nên không hiển thị địa chỉ giả và không hứa sẽ liên hệ lại từ thao tác sao chép.

Hai ảnh hạ tầng và hai ảnh infographic được tạo để minh họa, không phải ảnh công trình PAY ORBIT. Infographic có nhãn HTML dễ đọc, luồng năm bước chuyển dọc trên mobile. Icon Lucide được lưu local kèm nguồn và giấy phép, không tải CDN. Chi tiết tại `docs/visual-enhancements.md`; prompt và SHA-256 ảnh mới nằm trong `content/visual-assets.json`. Font Bricolage Grotesque và giấy phép OFL nằm trong `public/assets/fonts`.

Logo PAY ORBIT gồm biểu tượng P màu xanh/Cyan và chữ dùng font hiện tại, có ở header, footer và favicon cho cả hai ngôn ngữ. Bộ PNG trong suốt dùng trên nền sáng hoặc tối nằm tại `public/assets/brand`; chi tiết tại `docs/logo.md`, nguồn và prompt tại `content/brand-assets.json`. Chạy `node scripts/export-logo.mjs` để xuất lại logo ngang và bản kích thước web từ biểu tượng gốc bằng font thật.

Tài liệu XLSX cung cấp nội dung và hướng màu, không cung cấp mockup UI. Bố cục thực hiện dùng các mặc định responsive được ghi trong `.taste/implementation-notes.md`; không tuyên bố khớp pixel với ảnh tham chiếu chưa có.

Trang `/about/#about_story` có Scrolltelling bốn chương từ nhu cầu, kiến trúc, triển khai đến hỗ trợ dài hạn. Desktop đủ rộng/cao giữ sơ đồ bên trái; tablet và các fallback desktop hiển thị bốn minh họa tĩnh. Mobile dưới 768px chỉ dùng timeline bốn bước, không có diagram hay nút mở diagram; nội dung vẫn đọc được khi tắt JavaScript. Chi tiết và cách kiểm tra nằm tại `docs/about-scrolltelling.md`.
