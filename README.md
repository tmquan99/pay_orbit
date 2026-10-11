# PAY ORBIT

Website tĩnh sử dụng HTML, CSS và JavaScript native; không cần bundler. Lenis được lưu cục bộ và khóa phiên bản để thử cuộn mượt trên desktop.

Website có sáu trang với hai ngôn ngữ Việt/Anh, dùng chung menu, footer, font và các tài sản đã có. Tiếng Anh là bản mặc định tại `/`, `/about/`, …; tiếng Việt dùng `/vi/`, `/vi/about/`, … Nút VI/EN chuyển tới cùng trang, ngôn ngữ luôn theo URL và hoạt động cả khi tắt JavaScript.

Trang chủ được nâng cấp theo bản duyệt ngày 09/10/2026: hero ngắn, hai nhóm giải pháp, ảnh minh họa đội kỹ thuật và sơ đồ kết nối lặp chu kỳ 4 giây khi cuộn đến, có nhịp nghỉ và tạm dừng khi ngoài viewport hoặc tab bị ẩn. Chi tiết và nguồn ảnh tại `docs/home-motion.md`; reduced motion và chế độ không JavaScript luôn có bản tĩnh đọc được.

Trang Giới thiệu có bản thử Scrolltelling hai chương tại `/about/#about_story`: sơ đồ giữ vị trí trên desktop, chuyển từ nhu cầu kết nối sang kiến trúc cùng bảo mật và trở về khi cuộn ngược. Mobile, cửa sổ thấp, reduced motion và không JavaScript có minh họa tĩnh riêng. Nội dung workbook giữ đủ VI/EN; chi tiết tại `docs/about-scrolltelling.md`.

Trang Dịch vụ dùng hero gọn với CTA và điều hướng năm giai đoạn. Desktop từ 1024px có danh sách ngang native scroll-snap, panel chính ở giữa và hé các panel kế bên. Có nút trước/sau, liên kết từng dịch vụ, phím trái/phải và Home/End khi focus danh sách; cuộn chuột dọc vẫn cuộn trang. IntersectionObserver theo dõi panel đang đọc, phần ngoài vùng đọc được đặt inert; vị trí đọc được giữ khi quay lại từ BFCache. Mô tả workbook VI/EN đầy đủ mở ngay trong từng card bằng details native; card giãn theo nội dung, không tạo khung cuộn dọc lồng nhau. Chuyển dịch vụ tự thu gọn mô tả của mục trước. Mobile giữ liên kết hai cột và các dịch vụ dọc; mô tả luôn nằm trong đúng mục khi resize. Không JavaScript dùng toàn bộ bố cục dọc và details native. CSS view timeline tạo zoom/giảm độ nổi khi chuyển panel; reduced motion dùng chuyển mục tức thì và nội dung tĩnh.

Thanh điều hướng Dịch vụ trên desktop nối liền năm mốc có thể bấm. Phần xanh dùng CSS scroll timeline theo vị trí cuộn ngang thực tế; reduced motion và trình duyệt không hỗ trợ timeline dùng vị trí mục hiện tại. Thanh chỉ biểu thị vị trí đọc, không hiển thị phần trăm hoặc trạng thái hoàn thành. Mobile giữ điều hướng gọn, không thêm thanh ngang.

Trang Giải pháp dùng CSS view timeline để phóng nội dung từ 88% lên 102,5% khi vào vùng đọc, đồng thời giảm opacity toàn bộ mục chưa active, bao gồm CTA, xuống 60% trên desktop và 75% trên mobile. Chỉ mục đang active có nền xanh, các mục khác dùng nền trắng trung tính; nền và opacity chuyển mềm trong 260ms khi đổi vùng đọc. Màu xanh tiêu đề và vạch nhấn tiếp tục bám vị trí cuộn. Mobile giữ mức zoom 95% đến 101%. Mục active giữ tương phản AA và vùng bấm ít nhất 44px sau khi thu nhỏ. Chuyển động gắn trực tiếp với vị trí cuộn, không thêm chiều cao hay giữ màn hình; điều hướng desktop theo vùng đọc bằng IntersectionObserver. Con trỏ đặt trên mục không làm mất hiệu ứng chìm. Timeline dùng một mốc riêng loại trừ chiều cao mô tả đang xổ bằng ResizeObserver, nên mở/thu hoặc focus không tự kích hoạt zoom và màu tiêu đề; opacity và nền chỉ theo mục active, kể cả khi mục trước vẫn mở hoặc còn focus. Mô tả đầy đủ mở và thu bằng native details trong 360ms; toàn bộ khoảng cách nằm trong phần nội dung được animate để không giật ở cuối khi đóng. Trình duyệt không hỗ trợ nội suy chiều cao giữ cách mở/đóng native. Reduced motion hoặc trình duyệt không hỗ trợ view timeline dùng nội dung tĩnh, rõ hoàn toàn.

Trang Sản phẩm & công nghệ giữ bố cục hero và lưới bảy card. `src/products.css` thêm bề mặt trắng, nền xanh khi hover và giảm các card khác xuống opacity .75; icon vẽ nét một lượt khi xuất hiện hoặc tương tác. Hero dùng hai bảng công nghệ Cisco/Palo Alto với bảy nhóm được nhấn lần lượt, chu kỳ 10,5 giây. Hero Giải pháp dùng ảnh hạ tầng cũ với một tín hiệu chạy tuần tự hết ba đoạn cáp, chu kỳ 6 giây. `src/hero-graphics.js` quản lý cả hai, dừng ngoài viewport/tab ẩn, hủy với reduced motion và khởi tạo lại khi BFCache khôi phục. Bản mobile Giải pháp tiếp tục ẩn hình như bố cục trước; catalogue Sản phẩm thu gọn thành bảng dễ đọc. Không JavaScript vẫn giữ nội dung tĩnh. Nút báo giá truyền mã công nghệ sang form liên hệ cùng ngôn ngữ, chỉ điền khi trường nhu cầu còn trống. `node tests/products-motion.mjs` và `node tests/hero-graphics.mjs` kiểm tra cả VI/EN, motion, tương tác và fallback.

Ảnh trên Home và hero Dịch vụ, Giải pháp dùng WebP có hai kích thước; PNG gốc vẫn lưu trong dự án. Lệnh tái xuất tùy chọn `node scripts/optimize-home-images.mjs` dùng sharp trong môi trường phát triển, không bắt buộc khi chạy hoặc build website.

Bản thử Lenis 1.3.26 làm mềm cuộn dọc bằng wheel trên desktop từ 1024px có con trỏ fine, với `lerp: 0.18` để bám thao tác nhanh và giữ quãng cuộn gốc. Mobile, thiết bị cảm ứng và reduced motion dùng cuộn native; thay đổi kích thước hoặc tùy chọn chuyển động có hiệu lực ngay. Carousel ngang Dịch vụ, textarea, bàn phím và lịch sử anchor vẫn dùng hành vi native. Instance được hủy khi rời trang và tạo lại khi BFCache khôi phục. Thêm `?scroll=native` vào URL (trước `#anchor`) để so sánh bản cuộn cũ, ví dụ `/solutions/?scroll=native`. Thư viện MIT, stylesheet và provenance nằm tại `public/assets/vendor/lenis/`; `node scripts/vendor-lenis.mjs` tái lấy đúng phiên bản từ npm và kiểm tra integrity. Website không tải thư viện từ CDN khi chạy.

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
- GitHub Pages: workflow `.github/workflows/pages.yml` tự build và deploy khi push `main`. Bản public ở `https://tmquan99.github.io/pay_orbit/`. Biến `SITE_BASE_PATH=/pay_orbit` chỉ thêm tiền tố URL trong `dist`; website local giữ đường dẫn cũ. Workflow lấy đường dẫn từ `configure-pages`, nên cũng hỗ trợ custom domain. `node tests/deployment.mjs` kiểm tra đường dẫn bản build (dùng cùng `SITE_BASE_PATH` với build).
- `npm test`: kiểm tra URL, menu, đủ nội dung gốc ở cả hai ngôn ngữ và browser với Playwright có sẵn trong môi trường Codex. Có thể đặt `NODE_PATH` hoặc `CHROME_PATH` khi dùng môi trường khác. Đặt `TEST_DIST=1` để kiểm tra bản build.

Biểu mẫu trên trang Liên hệ chỉ chuẩn bị và sao chép nội dung, không gửi yêu cầu hoặc lưu dữ liệu. Kênh liên hệ chính là số điện thoại trong tài liệu. Email của công ty trong workbook là `[Cập nhật sau]`, nên không hiển thị địa chỉ giả và không hứa sẽ liên hệ lại từ thao tác sao chép.

Hai ảnh hạ tầng và hai ảnh infographic được tạo để minh họa, không phải ảnh công trình PAY ORBIT. Infographic có nhãn HTML dễ đọc, luồng năm bước chuyển dọc trên mobile. Icon Lucide được lưu local kèm nguồn và giấy phép, không tải CDN. Chi tiết tại `docs/visual-enhancements.md`; prompt và SHA-256 ảnh mới nằm trong `content/visual-assets.json`. Typography dùng Bricolage Grotesque cho tiêu đề và nhận diện, Be Vietnam Pro cho nội dung và giao diện. Font, giấy phép OFL và nguồn Be Vietnam Pro nằm trong `public/assets/fonts`; ba độ đậm 400/500/600 được lưu WOFF2 với các tập ký tự Latin, Latin mở rộng và tiếng Việt, không tải font từ CDN.

Logo PAY ORBIT dùng biểu tượng Relay và typography Manrope 600 đã duyệt, có ở header, footer và favicon cho cả hai ngôn ngữ. Bộ SVG có chữ đã outline, PNG trong suốt, bản nền sáng/tối và web icons nằm tại `public/assets/brand`; hướng dẫn tại `docs/logo.md`, nguồn và hash tại `content/brand-assets.json`. Chạy `node scripts/export-logo.mjs` để xuất lại PNG và icon từ master SVG; font Manrope chỉ áp dụng cho thương hiệu.

Tài liệu XLSX cung cấp nội dung và hướng màu, không cung cấp mockup UI. Bố cục thực hiện dùng các mặc định responsive được ghi trong `.taste/implementation-notes.md`; không tuyên bố khớp pixel với ảnh tham chiếu chưa có.

Tất cả 12 trang VI/EN có nút “Lên đầu trang” / “Back to top” 48px ở góc dưới phải, ẩn lúc đầu và xuất hiện khi cuộn qua khoảng 70% viewport (tối đa 560px, giảm ngưỡng trên trang ngắn). `src/back-to-top.js` dùng IntersectionObserver và ResizeObserver, không nghe scroll liên tục. Nút dùng Lenis nếu đang hoạt động, cuộn native trên mobile và cuộn tức thì khi reduced motion; trả focus về header, giữ nguyên URL, dọn listeners khi rời trang và khởi tạo lại khi khôi phục BFCache. Không hiển thị khi tắt JavaScript. Kiểm tra bằng `node tests/back-to-top.mjs`.

Trang `/about/#about_story` có Scrolltelling bốn chương từ nhu cầu, kiến trúc, triển khai đến hỗ trợ dài hạn. Desktop đủ rộng/cao giữ sơ đồ bên trái; tablet và các fallback desktop hiển thị bốn minh họa tĩnh. Mobile dưới 768px chỉ dùng timeline bốn bước, không có diagram hay nút mở diagram; nội dung vẫn đọc được khi tắt JavaScript. Chi tiết và cách kiểm tra nằm tại `docs/about-scrolltelling.md`.
