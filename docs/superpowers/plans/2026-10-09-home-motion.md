# PAY ORBIT: kế hoạch nâng cấp trang chủ

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Người dùng đã duyệt hướng thiết kế và yêu cầu thực hiện trong cuộc trò chuyện hiện tại.

**Goal:** Trang chủ rõ thông điệp, có nhịp bố cục và một sơ đồ kết nối chuyển động có mục đích.

**Architecture:** Tiếp tục template HTML chung, CSS native và Web Animations API. CSS trang chủ tải riêng; module sơ đồ tự bỏ qua các trang không có sơ đồ. Giữ sáu URL, menu, logo, liên hệ và toàn bộ nội dung chi tiết của workbook.

**Tech Stack:** HTML, CSS Grid, JavaScript, IntersectionObserver, Web Animations API, Node.js và Playwright hiện có.

**Spec:** Đề xuất được người dùng duyệt ngày 09/10/2026: hero gọn hơn; hai nhóm giải pháp kết nối/bảo mật; ảnh minh họa kỹ thuật có con người; sơ đồ giải thích kết nối chuyển động một lần; VI/EN, mobile và reduced motion tương đương.

## Ràng buộc

- DESIGN_VARIANCE 6, MOTION_INTENSITY 4, VISUAL_DENSITY 4. Giữ Bricolage Grotesque, xanh thương hiệu và nền sáng hiện có, header/hero tối.
- Hero dùng “Kết nối vững. Bảo mật sâu.” / “Connected. Protected.” và mô tả ngắn. Đây là thay đổi copy đã được duyệt, thay yêu cầu chép nguyên ô Home C5 ở màn hình đầu. Các đoạn nguồn trên trang chi tiết vẫn đầy đủ.
- Giữ ảnh hero gốc. Ảnh đội kỹ thuật mới ghi rõ là ảnh minh họa, lưu prompt và SHA-256.
- Bốn giải pháp và các liên kết đích giữ nguyên; trình bày trong hai panel không đối xứng.
- Sơ đồ có bốn nhãn HTML, đọc được khi tắt JS; minh họa các nhóm giải pháp, không phải telemetry hay cấu hình triển khai thực tế.
- Luồng sáng chạy một lần khi sơ đồ vào viewport, dừng khi tab ẩn hoặc reduced motion; không chiếm quyền cuộn và không có vòng lặp.
- Chỉ animate transform/opacity; mobile đổi sơ đồ ngang thành dọc. Không thêm dependency ứng dụng.

## Task 1: trang chủ và tài sản

- [x] Điều chỉnh template Home, dịch nhãn mới và tải stylesheet riêng.
- [x] Hero hai dòng, CTA thấy sớm; header desktop 72px; hai panel giải pháp có hình và màu nền khác nhau.
- [x] Thêm ảnh kỹ thuật vào Home, giữ ảnh cũ cho trang About và panel mạng; ghi provenance.
- [x] Cập nhật kiểm tra nguồn Home theo copy đã duyệt, giữ nguyên kiểm tra các trang chi tiết.

## Task 2: sơ đồ kết nối

- [x] Viết và chạy test hành vi trước: vào viewport có chuyển động, quay lại không replay, reduced motion tắt ngay, mobile không tràn, no-JS vẫn đọc được.
- [x] Thêm markup sơ đồ trong scripts/visuals.mjs và module src/connection-scene.js, tích hợp cleanup với pagehide hiện có.
- [x] Chạy test hành vi lại và sửa lỗi.

## Task 3: xác minh và bàn giao

- [x] Build, check, toàn bộ suite kiểm tra hiện có và test motion mới.
- [x] Xem thực tế Home VI/EN desktop/mobile và chụp ảnh kết quả, kiểm tra layout và copy.
- [x] Review diff độc lập, giải quyết vấn đề quan trọng và xác minh lại phần bị ảnh hưởng.
- [x] Mở bản local đã cập nhật và báo cáo kết quả, hạn chế và bước tiếp theo.

## Review Focus

- Scene dưới viewport không chạy sớm; sau chạy/fast scroll nội dung vẫn hiển thị.
- Đổi reduced motion giữa playback hủy mọi animation thuộc scene.
- Đổi breakpoint trong playback không làm thanh kết nối sai trục.
- VI/EN giữ đúng route và nhãn, không thêm tiếng Việt vào trang Anh.
- Không thay các contract form, logo, các đoạn workbook trên trang chi tiết.
