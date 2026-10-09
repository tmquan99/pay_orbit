# Đối chiếu nội dung website với tài liệu

Nguồn: `PAY_ORBIT_Website_Content_v2_Simplified.xlsx` trong Downloads của người dùng. Cả tám sheet đã được đọc lại. `content/workbook.json` giữ nội dung theo địa chỉ ô và SHA-256 của tệp nguồn, không sửa workbook.

Yêu cầu mới thay thế lựa chọn một trang dùng anchor của pha thiết kế trước: Giới thiệu, Giải pháp, Dịch vụ và Sản phẩm & công nghệ phải là các trang riêng. Trang Liên hệ được tách theo menu sáu mục trong `00_Overview!B10`. Tiếng Việt và hệ màu, font, ảnh đã duyệt tiếp tục được sử dụng.

| URL | Sheet / ô | Cách thực hiện |
| --- | --- | --- |
| `/` | `01_Home!C7:C8`, `02_Company_Intro!C5`, tóm tắt từ `03_Solutions` | Hero rút gọn theo bản duyệt ngày 09/10/2026; bốn giải pháp trong hai nhóm kết nối/bảo mật; trọng tâm công nghệ, sơ đồ minh họa và cách tiếp cận. Có liên kết sang trang Giới thiệu. |
| `/about/` | `02_Company_Intro!C5:C9` | C5 giữ nguyên; C6:C9 được duyệt diễn đạt gọn với câu dẫn, nhóm ý và đoạn kết. C8 dùng luồng năm bước để trình bày quy trình, giữ các liên kết dịch vụ. Một ảnh công nghệ, năm giai đoạn theo `E8`. |
| `/solutions/` | `03_Solutions!C5:D8` | Giữ đủ bốn mô tả; tách lợi ích từ cột D thành danh sách. Không thêm SKU hoặc tên model. |
| `/services/` | `04_Services!C5:D9` | Giữ đủ năm mô tả, tư vấn đặt đầu tiên. Dịch phạm vi điển hình từ cột D. Giữ điều kiện phạm vi hỗ trợ theo dự án hoặc thỏa thuận. |
| `/products/` | `05_Products_Tech!C5:C11`, `E5:E11` | Giữ đầy đủ tên công nghệ, chia bốn nhóm Cisco và ba nhóm Palo Alto Networks. Mỗi nhóm có hành động Yêu cầu báo giá dẫn tới Liên hệ. |
| `/contact/` | `06_Contact!C5:C8`, `C10:D10` | Giữ tên, người đại diện, địa chỉ, số điện thoại và năm trường. Mời trao đổi nhu cầu nhưng không hứa gửi hoặc phản hồi tự động. |
| Footer chung | `00_Overview!B4,B7`, `07_SEO_Dev_Notes!C7` | Tên công ty, tagline tiếng Việt và ghi chú nhãn hiệu giữ nguyên. |

Phần tổng quan giải pháp trên Home là mô tả rút gọn từ `03_Solutions`; các nguyên tắc trong phần cách tiếp cận được diễn đạt từ `01_Home!C8` và `02_Company_Intro!C6,C8,C9`. Không thêm khách hàng, dự án, số liệu, chứng nhận hoặc quan hệ đối tác.

Người dùng đã duyệt thay copy hero Home C5 bằng “Kết nối vững. Bảo mật sâu.” và mô tả ngắn. Nội dung gốc vẫn nằm trong workbook; kiểm tra nguyên văn của các trang chi tiết giữ nguyên. Chi tiết giao diện và chuyển động tại `home-motion.md`.

Không đưa các ghi chú nội bộ về UI, ưu tiên và nguồn vào nội dung công khai. Không xuất bản email `[Cập nhật sau]`. Hướng màu và chủ đề ảnh đến từ workbook; workbook không có mockup giao diện để đối chiếu pixel.

Chọn các trang HTML độc lập thay vì một SPA dùng router: tận dụng dự án tĩnh hiện có, mở trực tiếp URL và đọc nội dung khi JavaScript lỗi, không thêm framework hay dependency. Menu và footer được tạo từ một template chung để tránh lệch giữa các trang.

Các bổ sung hình ảnh theo yêu cầu tiếp theo được ghi tại `visual-enhancements.md`: icon Lucide, hai ảnh khái niệm và infographic HTML theo đúng nhóm nội dung và thứ tự quy trình của tài liệu. Các đoạn gốc trong bốn trang chi tiết tiếp tục giữ nguyên.

Website được bổ sung bản tiếng Anh theo yêu cầu tiếp theo: cùng sáu trang dưới `/en/`, lấy các mô tả trực tiếp từ cột B, giữ bản Việt ở cột C. Nội dung và hành vi chuyển ngôn ngữ được đối chiếu tại `bilingual-content.md`; thông tin liên hệ, tài sản và chức năng clipboard giữ nguyên.

Verify before publishing: thông tin công ty và liên hệ là nội dung người dùng cung cấp. Hai ảnh hạ tầng và hai infographic là ảnh minh họa được tạo, không chứng minh công trình hoặc địa điểm của PAY ORBIT. Biểu mẫu chỉ sao chép nội dung; việc nhận yêu cầu trực tuyến cần một email hoặc endpoint thực được xác nhận riêng.
