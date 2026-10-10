# Các lựa chọn thực hiện

Không có framework, package manager, build pipeline hay mã ứng dụng trong workspace trước Build. Ứng dụng đầu tiên dùng HTML/CSS/JavaScript native và script Node không dependency. Không tạo ứng dụng thứ hai, không sửa bốn artifact đầu vào hoặc các tệp tài sản gốc.

`user-reference-1` là workbook nội dung, không phải mockup. Thiếu screenshot không được chuyển thành tuyên bố đã đối chiếu pixel. Các giá trị dưới đây là quyết định triển khai theo nội dung và Brand, không phải số đo reference.

- Expanded: khung nội dung tối đa 1200px, lề tối thiểu 48px. Hero toàn chiều ngang, vùng chữ bên trái có bề mặt Dark Canvas opaque để đọc rõ; ảnh vẫn một tệp. Heading 72px tối đa, theo Brand.
- Company: prose và ảnh 3:2 chia hai vùng bằng nhau, gap 64px; dưới 1024px giữ prose trước ảnh.
- Solutions: bốn feature article, hai cột ở expanded/medium và một cột ở compact, gap 24/16px. Nền Light Surface Alt và heading Accent Text là treatment accent lặp lại.
- Services: danh sách native mở, không dùng thẻ, đường nối hoặc số trang trí. Hai vùng mở ở expanded; đọc theo source order ở compact.
- Technology: bản một trang trước dùng hai nhóm disclosure; bản sửa theo yêu cầu ngày 09/10/2026 chuyển thành trang `/products/` với đủ bảy nhóm sản phẩm theo workbook, không tạo logo hãng hoặc screenshot sản phẩm.
- Products cập nhật 10/10/2026: giữ nguyên hero, grid, padding và kích thước chữ; card nền trắng và viền/bóng tạo chiều sâu. Overlay SVG chỉ vẽ tín hiệu trên các đường cáp của ảnh có sẵn, không thay icon thư viện; icon motion hữu hạn, hero lặp 6 giây và chỉ chạy trong viewport. Không thêm dependency, scroll hijack hoặc số liệu giả. Báo giá mang theo mã nhóm công nghệ và giữ bản nháp khi quay lại.
- Contact: thông tin đi trước biểu mẫu trong source order. Năm trường được giữ nguyên; hành động clipboard và gọi điện đã được Page ghi nhận, không giả lập gửi thành công.
- Nút sao chép dùng type="button", chỉ được bật sau khi gắn handler. Khi JavaScript lỗi, form không có nút submit mặc định và nhiều trường chặn implicit submission, tránh gửi dữ liệu cá nhân bằng GET. Navigation vẫn hiển thị đủ và số điện thoại vẫn hoạt động.
- Footer: tên, tagline và disclaimer đúng tài liệu, không thêm chứng nhận hoặc liên kết chính sách chưa tồn tại.
- Compact dưới 640px, medium dưới 1024px; menu collapse khi navigation cần thêm chỗ (1100px). Không cắt bớt nội dung hoặc trạng thái.
- Hero entrance dùng transform-only để tránh visible-hidden-visible sau first paint. Reveals chỉ chuẩn bị các leaf group dưới viewport, dùng threshold 0, rootMargin 80px, unobserve ngay và giữ trạng thái cuối. Fast-scroll scan hoàn tất các nhóm bị vượt qua.
- Repair 1, desktop_hero_focal_crop: khung ảnh desktop bắt đầu ngay tại cạnh phải vùng chữ; object-fit: cover cắt theo khung này với object-position: 50% 50%, giữ hành lang và rack. Đây là sửa crop của ảnh đã duyệt, không phải thay composition hoặc reference. Khung hero, heading và CTA có số đo không đổi tại 1440/1280/1100/1024/768/390/360px; vùng ảnh dưới 1024px có SHA-256 ảnh chụp không đổi. Bằng chứng tại .taste/verification/repair-hero.json và repair-hero-1440/1024/390.png. Bộ 21 kiểm tra browser chạy trên dist bằng request interception đọc tệp local, không mở HTTP hoặc preview server.

## Sửa cấu trúc trang theo yêu cầu người dùng ngày 09/10/2026

Website có sáu URL: `/`, `/about/`, `/solutions/`, `/services/`, `/products/`, `/contact/`. Bốn mục người dùng chỉ định trở thành các trang HTML riêng, không còn anchor trên Home. Menu và footer chung, một h1 và trạng thái `aria-current` riêng cho mỗi trang. Nguồn theo ô nằm tại `content/workbook.json`; `scripts/render-pages.mjs` tạo HTML trong pipeline Node hiện có.

Trang chủ giữ các nhóm tổng quan của sheet Home. Các trang chi tiết giữ đủ 21 đoạn gốc trong bốn sheet tương ứng, bổ sung lợi ích giải pháp và bản dịch phạm vi dịch vụ. Những quyết định một trang trong artifact pha cũ đã bị yêu cầu mới thay thế, các artifact lịch sử không được dùng để cắt bỏ nội dung tài liệu.

Verify before publishing: hai ảnh là ảnh minh họa được tạo, không phải ảnh dự án hoặc địa điểm PAY ORBIT. Website có sáu trang riêng và biểu mẫu sao chép nội dung, không gửi yêu cầu. Nội dung công ty và thông tin liên hệ lấy từ workbook của người dùng; không tự thêm khách hàng, số liệu, chứng nhận hoặc quan hệ đối tác.
- Tinh chỉnh Products: tín hiệu dùng chung timeline 6 giây, các đoạn không chồng nhau và chỉ lặp sau khi tới Cloud. Bỏ viền trái riêng của hãng đang đọc; icon hãng chuyển nền trắng khi hover để tách khỏi nền card xanh. Kiểm tra lấy mẫu hai chu kỳ xác nhận tối đa một tín hiệu hiển thị.
- Sửa lỗi tín hiệu Products chớp lại: stroke-dasharray 13 100 lặp sau 113 đơn vị, khiến dash kế tiếp quay về đầu cáp khi dash chính thoát cuối cáp. Tăng khoảng trống lên 200 trên pathLength 100. Kiểm thử raster SVG trong Chromium tái hiện lỗi ở cả ba đoạn trước sửa và xác nhận không còn pixel tín hiệu tại đầu đoạn khi tín hiệu đã rời đi.
- Collaboration: dùng cùng hiệu ứng vẽ nét và easing 520ms với các icon outline còn lại. Hai nét camera chạy đồng thời, giữ opacity 1 để tránh nhấp nháy; không zoom. Regression kiểm tra stroke drawing, nhịp chung, độ rõ của nét và cleanup về trạng thái tĩnh.
- Hover Products: trên thiết bị có chuột, hover một card giữ card đó opacity 1 và giảm các card sản phẩm còn lại xuống .75 qua transition 240ms. CSS :has bảo đảm rời card sẽ tự trở về 1, không có state JS bị treo; touch không dim, reduced motion đổi ngay.
- 11/10/2026: chuyển hero luồng tín hiệu sang Giải pháp (giữ dash gap 200 tránh chớp ngược). Hero Sản phẩm thay bằng hai bảng catalogue Cisco/Palo Alto, bảy nhóm công nghệ nổi lần lượt trong 10,5 giây. Giữ cùng tông, icon thư viện, layout hero hai cột và hiệu ứng card; mobile thu gọn Cisco 2x2, Palo 3 cột. Controller riêng quản lý viewport/tab pause, reduced motion và BFCache; regression nét cáp chuyển theo sang trang Giải pháp.
