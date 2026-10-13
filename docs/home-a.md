> Cập nhật 12/10/2026: website chỉ còn tiếng Anh. Quyết định này thay thế mọi mô tả song ngữ bên dưới; xem `english-only.md`.

# Home A, 12/10/2026

Hướng đã duyệt: mở đầu bằng nhu cầu doanh nghiệp, giữ logo Relay, màu xanh và font hiện có. Template dùng chung tại `scripts/home-markup.mjs`, style riêng `src/home.css`; renderer tạo bản Anh `/` và Việt `/vi/`.

Thứ tự: hero sáng toàn chiều ngang với một CTA; panorama; ba nhu cầu; bốn giải pháp quanh minh họa; năm bước dịch vụ; hai dòng Cisco/Palo Alto; giới thiệu ngắn; lời mời tư vấn xanh. Tất cả CTA là liên kết native tới trang và anchor có sẵn. Home thay copy giới thiệu dài của workbook bằng phần tóm tắt đã duyệt; nội dung workbook trên các trang chi tiết giữ nguyên.

Mobile chuyển nhu cầu, giải pháp và timeline thành danh sách dọc, giữ menu hiện có và vùng bấm ít nhất 44px. Ảnh company chỉ trang trí ở desktop nên dùng CSS background, ẩn ở mobile. Hai minh họa nội dung có alt và kích thước cố định; nhãn panorama là HTML. Không có claim dự án, số liệu khách hàng hoặc quan hệ đối tác mới.

Hero có bốn entrance 650ms. Nhu cầu và minh họa giải pháp xuất hiện nhẹ khi cuộn. Panorama có một tín hiệu sáng chạy lần lượt qua bốn đoạn cáp Office → Branch → Gateway → Data Center → Cloud, chu kỳ 9 giây với vệt sáng ngắn, dùng chung controller với Solutions. SVG dùng đúng tọa độ ảnh 2172×724 và co giãn theo ảnh; nét sáng giữ độ rõ ở mobile. Chỉ một đoạn có tín hiệu tại mỗi thời điểm, chạy hết tuyến mới lặp. Animation tạm dừng ngoài viewport hoặc khi tab ẩn; reduced motion hủy animation và không JavaScript giữ ảnh gốc. Trang Giải pháp giữ hình và chu kỳ cáp hiện có.

Footer dùng chung trên cả sáu trang, gồm graphic logo bản E, tên công ty, tagline, Contact outline và thông báo nhãn hiệu. Style tập trung tại `src/footer.css`, bỏ các override riêng của Home. Desktop rộng 1440px có footer khoảng 182px; mobile tự tăng chiều cao theo nội dung, không đặt chiều cao cố định. Graphic nằm ở lớp nền và được crop theo khung footer gọn.

Nguồn mockup và prompt: `design/home-a-mockup-2026-10-12/`. Ba ảnh khái niệm được tạo riêng, không phải công trình thực tế. PNG gốc và WebP 720/full-size được lưu local; `node scripts/optimize-home-a-images.mjs` tái xuất WebP quality 88 và cập nhật SHA-256 trong `content/visual-assets.json`. Không thêm dependency ứng dụng.

Kiểm chứng: `npm run build`, `npm run check`, `npm test`; `tests/home-layout.mjs` kiểm tra VI/EN, đúng anchor, bàn phím, focus CTA tương phản trên nền xanh, không che nút hero, wrap/overflow ở 320–1440px, reduced motion và luồng liên hệ không JavaScript. `tests/home-motion.mjs` giữ contract animation mới. Báo cáo hình ảnh và giới hạn so sánh nằm tại `design-qa.md`.

Theo yêu cầu mới, panorama hiển thị nguyên tỷ lệ ảnh, không crop. Nhãn HTML nằm trên lớp nền trống ở 82% chiều cao ảnh, sát chân các công trình (mốc khoảng 80%) và căn theo vị trí từng đối tượng. Chữ có lớp xếp chồng riêng để luôn nằm trên ảnh. Khung minh họa giải pháp vẫn chặn phần nền tràn ngoài cột giữa. Test Home kiểm tra tỷ lệ ảnh nguyên vẹn, khoảng cách nhãn tới chân công trình, nhãn nằm trong figure và ảnh giải pháp không giao với bốn node trên cả VI/EN tại sáu chiều rộng.

Mã nguồn của thay đổi được quản lý trên nhánh `codex/home-needs-layout`.

Arrow Home: toàn bộ 13 link/CTA có mũi tên dùng Lucide `arrow-up-right`. Hover dịch icon chéo lên phải 2px trong 160ms ease-out, cùng thông số với các trang chi tiết; chế độ reduced motion giữ icon đứng yên. Nút lên đầu trang giữ hướng lên theo chức năng. Test Home kiểm tra từng arrow ở cả VI/EN, hiệu ứng hover và reduced motion, cùng các kiểm tra layout hiện có.

CTA liên hệ chung (13/10/2026): Home và bốn trang chi tiết dùng cùng animation.
Tiêu đề, mô tả và nút bên trái xuất hiện cách nhau 160ms, mỗi phần chạy 960ms.
Ba dòng checklist bên phải lần lượt bắt đầu ở 160/320/480ms, theo ngay sau
tiêu đề bên trái với cùng hiệu ứng mờ dần và trượt lên 40px. Chạy một lần khi
khối đi vào vùng nhìn; reduced motion và không JavaScript hiển thị ngay toàn bộ.

Màu arrow ở các text link kế thừa màu chữ thay vì bị ép sang accent xanh sáng. Test đối chiếu màu nét SVG với màu nhãn của các text link và button để tránh lệch màu khi đổi theme hoặc style.

Header Home đã chuyển sang dùng chung style với các trang chi tiết theo yêu cầu mới: nền tối, logo dành cho nền tối, màu chữ, Contact, trạng thái active/hover/focus và menu mobile. Bỏ các CSS ghi đè header riêng của Home; khoảng cách container riêng chỉ áp dụng cho nội dung và footer. `tests/header-consistency.mjs` đối chiếu Home với About tại 1440, 1024, 768, 390, 360 và 320px, gồm cả menu mở rộng. Thay đổi này thay thế header trắng trong mockup A.

Section Technology đã áp mockup logo được duyệt: hai hàng dùng SVG gốc Cisco và Palo Alto Networks, giữ màu và tỷ lệ; mô tả nằm cùng cột với đường phân cách trên desktop, xuống dưới logo trên mobile. Link giữ nguyên `/products/#cisco` và `/products/#palo-alto-networks`, arrow giữ hiệu ứng chéo và reduced motion. Nguồn và SHA-256 nằm tại `public/assets/brand/vendors/provenance.json`. Mockup và ảnh thực tế desktop/mobile nằm tại `design/technology-logos-mockup-2026-10-12/`. Logo có alt làm tên hãng cho link; test Home kiểm tra ảnh tải, tỷ lệ, không giao với chữ và không tràn hàng ở sáu chiều rộng.

Hero desktop bổ sung minh họa khiên kính và quỹ đạo dữ liệu theo mockup đã duyệt
ngày 13/10/2026. Ảnh WebP có alpha thật, đứng cạnh cụm chữ và dùng cùng entrance
650ms. Ở màn hình dưới 768px, cả khung ảnh bị ẩn; picture chỉ chọn WebP trên
desktop nên mobile không tải minh họa mới. Panorama gốc vẫn hiện đủ, không crop.
Prompt, PNG/WebP, nguồn và SHA-256 được ghi tại
`design/home-hero-security-2026-10-13/asset.json` và `content/visual-assets.json`.
Ảnh đối chiếu và kết quả browser nằm trong thư mục `verification` cùng bộ thiết kế.
