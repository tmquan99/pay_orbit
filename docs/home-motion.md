# Nâng cấp trang chủ, 09/10/2026

Hướng được người dùng duyệt: giữ thương hiệu xanh và Bricolage Grotesque, rút gọn hero, tạo nhịp cho bốn giải pháp và thêm một chuyển động giải thích kết nối.

Hero mới “Kết nối vững. Bảo mật sâu.” / “Connected. Protected.” thay copy Home C5. Hai nhóm kết nối và bảo mật giữ đủ bốn giải pháp và liên kết tới các phần chi tiết. Nội dung nguyên bản trên About, Solutions, Services và Products giữ nguyên. Header chung giảm từ 88px xuống 72px ở desktop; các trang chi tiết không tải stylesheet Home.

`src/home.css` quản lý bố cục Home. `connectionScene()` trong `scripts/visuals.mjs` tạo minh họa và bốn nhãn HTML. `src/connection-scene.js` dùng IntersectionObserver và Web Animations API: đường nối mở dần và bốn điểm được nhấn một lần; sau 1,8 giây cảnh trở lại trạng thái tĩnh. Tắt chuyển động khi reduced motion, tab bị ẩn hoặc đổi trục sơ đồ giữa playback. Không có vòng lặp, scroll hijack hay dependency ứng dụng mới. Sơ đồ chỉ biểu thị các nhóm giải pháp, không mô tả một kiến trúc hay dữ liệu vận hành thực tế.

Ảnh `public/assets/images/infrastructure-team-illustration.png` tạo bằng công cụ imagegen tích hợp, 1536×1024. Prompt đầy đủ và SHA-256 ở `content/visual-assets.json`. Ảnh là minh họa, không phải nhân sự, khách hàng hay công trình thực tế của PAY ORBIT; chú thích hiển thị ngay dưới ảnh. Hai ảnh hạ tầng gốc và các ảnh infographic khác được giữ lại.

Panel “Bảo vệ hạ tầng số” dùng minh họa 3D: một lớp khiên bảo mật bao quanh hệ thống máy chủ và kết nối Cloud, thể hiện trực tiếp ý nghĩa bảo vệ hạ tầng. Ảnh `public/assets/images/digital-infrastructure-protection.png` tạo bằng imagegen, dùng ảnh mạng ở panel trái làm tham chiếu màu navy, ánh sáng xanh và vật liệu thiết bị. Prompt, tham chiếu và SHA-256 lưu trong `content/visual-assets.json`; alt text có cả VI/EN. Ảnh dùng object-fit contain trên nền navy để giữ trọn hình khiên ở desktop và mobile; hai panel giữ cùng chiều cao ảnh và hiệu ứng hover. Phương án ảnh thiết bị cũ được đánh dấu superseded trong ledger và không còn được trang chủ sử dụng.

Xác minh sau thay ảnh bảo vệ: build, check, pages và bilingual đạt; xem thực tế bản Việt desktop và bản Anh mobile 390px, ảnh tải đủ, hình khiên không bị cắt và mobile không tràn ngang.

Home phục vụ bản WebP của năm ảnh, có `srcset` cho bản 720px và bản đầy đủ. Tổng năm bản đầy đủ khoảng 556 KiB; ảnh gốc vẫn giữ để truy xuất nguồn. `scripts/optimize-home-images.mjs` tái xuất các bản WebP bằng sharp trong runtime phát triển, không chạy trong build và không thêm dependency ứng dụng. Khi dùng ngoài Codex, cần cài sharp ở môi trường phát triển để tái xuất; các tệp WebP đã xuất có sẵn trong dự án. `content/visual-assets.json` ghi nguồn, kích thước, chất lượng, dung lượng và SHA-256 của từng bản.

Kiểm chứng: test hành vi `tests/home-motion.mjs` chạy với Chromium thật; suite hiện có kiểm tra đủ 12 URL, nội dung workbook trên trang chi tiết, menu, form, logo, 5 kích thước viewport và reduced motion. Không thay kiểm tra nội dung chi tiết; chỉ cập nhật contract Home C5 vì copy này đã được duyệt thay thế.

Kết quả bản nâng cấp ban đầu: build, check, pages, bilingual, logo, 81 browser checks và home-motion đều đạt. Review độc lập đã xác nhận bản ảnh hero đầy đủ được chọn ở desktop 1101px và 1440px DPR1; test đo độ phân giải so với khung phủ ảnh được bổ sung để tránh ảnh bị phóng mờ. Lighthouse local mô phỏng mobile sau tối ưu ảnh, trước khi bổ sung ảnh panel bảo mật: Performance 80, Accessibility 100, Best Practices 100, SEO 91; payload khoảng 956 KiB, CLS 0, LCP 5,3 giây. Đây là đo trong phòng thử nghiệm, chưa phải số liệu người dùng thực hay xác nhận Core Web Vitals production. Cần đo lại khi triển khai trên domain và hosting thực tế.

Quyết định thực hiện: dùng nhánh `codex/home-motion` trong checkout hiện tại để giữ preview đang chạy và không sửa trực tiếp nhánh main. Không tạo worktree hoặc thay đổi remote.
