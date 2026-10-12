> Cập nhật 12/10/2026: website chỉ còn tiếng Anh. Quyết định này thay thế mọi mô tả song ngữ bên dưới; xem `english-only.md`.

# Nội dung Việt / Anh

Website dùng hai bản HTML cho mỗi trang: tiếng Anh dùng sáu URL gốc, tiếng Việt nằm dưới `/vi/`. Các trang dùng cùng template, CSS, ảnh, icon và JavaScript, không tạo ứng dụng hoặc pipeline thứ hai.

Ngôn ngữ được xác định hoàn toàn bằng URL: `/about/` là tiếng Anh, `/vi/about/` là tiếng Việt; quy tắc áp dụng cho cả sáu trang và cả khi tắt JavaScript. Không chuyển hướng theo localStorage hoặc ngôn ngữ trình duyệt. Nút VI/EN giữ đúng trang và fragment khi có JavaScript. Các alternate `x-default` trỏ đến bản Anh.

| Trang | Tiếng Việt | Tiếng Anh | Nguồn nội dung chính |
| --- | --- | --- | --- |
| Trang chủ | `/vi/` | `/` | `01_Home!B7:B8,C7:C8`, `02_Company_Intro!B5,C5`; hero mới đã duyệt trong `ui.en.json` |
| Giới thiệu | `/vi/about/` | `/about/` | `02_Company_Intro!B5:B9,C5:C9` |
| Giải pháp | `/vi/solutions/` | `/solutions/` | `03_Solutions!B5:C8`, lợi ích tại `D5:D8` |
| Dịch vụ | `/vi/services/` | `/services/` | `04_Services!B5:D9` |
| Sản phẩm & công nghệ | `/vi/products/` | `/products/` | `05_Products_Tech!B5:C11` |
| Liên hệ | `/vi/contact/` | `/contact/` | `06_Contact!B5:C8`, nhãn trường tại `D10` |

`content/workbook.json` giữ nguyên bản trích tài liệu. Đã kiểm tra lại tệp trong Downloads bằng luồng đọc dùng chung khi Excel đang mở; SHA-256 khớp bản trích: `7f6e874867cb5cccff9918e4d9ff066665ec042246e30cbc21c00e07449b5411`.

Các mô tả đầy đủ lấy trực tiếp từ cột B cho tiếng Anh và cột C cho tiếng Việt. Riêng hero dùng copy đã duyệt “Kết nối vững. Bảo mật sâu.” / “Built to Connect. Designed to Protect.” và mô tả ngắn trong `content/ui.en.json`, thay nguyên văn ô Home B5/C5. Tagline dùng `00_Overview!B6` hoặc `B7`; tiêu đề, mô tả SEO trang chủ và ghi chú nhãn hiệu dùng `07_SEO_Dev_Notes!B5:B7,C5:C7`. Phạm vi dịch vụ tiếng Anh giữ nguyên các mục cột D. Lợi ích giải pháp cột D chỉ có tiếng Việt, nên bản Anh dùng bản dịch tương đương.

`content/ui.en.json` chứa bản dịch của nhãn giao diện, tiêu đề tổ chức trang, phần tóm tắt đã có, chú thích infographic, alt ảnh và thông báo biểu mẫu. Ngoại lệ đã duyệt: các đoạn About B6:B9/C6:C9 dùng bản viết gọn với câu dẫn, nhóm ý hoặc luồng năm bước và đoạn kết; bản Anh tương ứng cũng nằm trong từ điển này. Không bổ sung dữ kiện kinh doanh.

Nút VI/EN luôn có trên header, vùng bấm tối thiểu 44px, chỉ trạng thái ngôn ngữ hiện tại bằng `aria-current`. Chuyển ngôn ngữ dẫn tới cùng trang; khi JavaScript chạy, fragment của giải pháp hoặc dịch vụ cũng được giữ. Menu, footer, CTA và liên kết infographic tiếp tục dùng ngôn ngữ của URL. URL là nguồn xác định ngôn ngữ, không tự chuyển theo vị trí hoặc ngôn ngữ trình duyệt và không thêm lưu trữ dữ liệu biểu mẫu.

Mỗi bản có `html lang` và liên kết alternate Việt/Anh/x-default. Chưa có tên miền xuất bản nên các đường dẫn alternate dùng đường dẫn trong cùng website. Không tự đặt domain hoặc canonical ngoài dự án.

Biểu mẫu vẫn chỉ sao chép nội dung. Nhãn trường, lỗi nhập liệu, nội dung clipboard và thông báo thành công hoặc sao chép thủ công đều theo ngôn ngữ hiện tại. Câu hứa liên hệ lại ở `06_Contact!B10,C10` không được hiển thị vì thao tác clipboard không gửi yêu cầu. Không đưa email placeholder hoặc ghi chú nội bộ lên trang.

Kiểm tra tự động đối chiếu đầy đủ các đoạn tài liệu ở cả hai ngôn ngữ, các URL trực tiếp, liên kết trang/anchor, chuyển ngôn ngữ bằng bàn phím, menu và biểu mẫu. Browser kiểm tra 12 trang tại 360, 390, 768, 1024 và 1440px, cùng chế độ không JavaScript và reduced motion.

Verify before publishing: các nhãn và tóm tắt giao diện bổ sung được dịch từ bản website hiện có, các lợi ích chỉ có tiếng Việt được dịch sang tiếng Anh. Thông tin doanh nghiệp và liên hệ vẫn là tài liệu người dùng cung cấp; hình ảnh là minh họa. Biểu mẫu không phải kênh nhận yêu cầu trực tuyến.
