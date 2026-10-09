# Icon và infographic cho PAY ORBIT

Theo yêu cầu bổ sung hình ảnh để website sinh động và dễ tiếp cận, giữ nguyên sáu trang, nội dung nguồn, bảng màu xanh và Bricolage Grotesque. Không thay ảnh hero hoặc tạo logo hãng.

## Các hình đã bổ sung

- `public/assets/images/enterprise-ecosystem.png`: minh họa văn phòng, lớp bảo mật, rack máy chủ và Cloud. Dùng ở phần công nghệ Home, phần mở đầu Giải pháp và Sản phẩm & công nghệ. Đây là minh họa khái niệm cho những nhóm trong workbook, không phải kiến trúc triển khai thực tế.
- `public/assets/images/service-lifecycle.png`: minh họa năm giai đoạn khảo sát, thiết kế, cung cấp, triển khai và hỗ trợ. Dùng ở phần mở đầu Dịch vụ.
- Cả hai ảnh được tạo bằng công cụ image_gen tích hợp, đã xem và kiểm tra bố cục, không có logo hoặc chữ nhúng, đều 1536×1024. Giữ nguyên ảnh gốc và tỷ lệ; CSS dùng `object-fit: contain` để không cắt nội dung.
- Bộ icon Lucide được lấy từ kho chính thức và khóa theo commit trong `public/assets/icons/lucide/provenance.json`. Giữ đầy đủ giấy phép ISC và MIT ở `LICENSE.txt`. Icon biểu thị nhóm giải pháp, phạm vi dịch vụ, nhóm công nghệ, thông tin liên hệ và hành động.

Prompt đầy đủ, nguồn, đường dẫn, kích thước và SHA-256 của hai ảnh nằm tại `content/visual-assets.json`. Không tải icon từ CDN ở runtime và không thêm dependency ứng dụng.

## Cách trình bày

- Icon theo một kích cỡ nét, màu và bề mặt nhất quán; icon trang trí có `aria-hidden` và không thay nhãn chữ.
- Trang Giải pháp có tổng quan bốn nhóm bằng icon, nhãn, mô tả và liên kết tới đúng phần chi tiết.
- Trang Dịch vụ có infographic HTML năm bước, đi ngang ở desktop, ba bước mỗi hàng ở tablet và chuyển thành luồng dọc trên mobile. Số thứ tự là thứ tự quy trình nguồn, không phải số liệu kinh doanh.
- Trang Giới thiệu dùng phiên bản quy trình gọn, mỗi bước dẫn tới dịch vụ tương ứng. Sản phẩm & công nghệ có hai nhóm hãng và icon riêng cho đủ bảy nhóm công nghệ.
- Nhãn và mô tả nằm trong HTML, không raster hóa vào ảnh. Đọc được khi ảnh không tải, khi tắt JavaScript và trên mobile. Không ẩn nội dung gốc hoặc tạo số liệu để lấp infographic.
- Các ảnh dưới viewport tiếp tục dùng reveal một lần trong khung cố định. Phản hồi hover chỉ chạy với chuột; reduced motion bỏ chuyển động icon. Không có chuyển động lặp hoặc sơ đồ tự chạy.

Verify before publishing: hai ảnh mới là ảnh minh họa khái niệm được tạo, không chứng minh thiết bị hãng, cấu hình, công trình hoặc năng lực đã đo của PAY ORBIT. Các node và thứ tự quy trình lấy từ workbook, không phải số liệu vận hành. Biểu mẫu liên hệ vẫn chỉ chuẩn bị và sao chép nội dung.
