# Logo PAY ORBIT

Theo yêu cầu thiết kế logo cho website, dùng biểu tượng chữ P với hai dải kết nối màu Electric Blue và Cyan, đi cùng tên PAY ORBIT bằng Bricolage Grotesque 700 đã có trong dự án. Cách xử lý này gắn với chủ đề hạ tầng kết nối; không dùng quỹ đạo, quả cầu, ổ khóa, logo hãng hoặc tuyên bố quan hệ đối tác.

Biểu tượng được tạo và tinh chỉnh bằng công cụ ImageGen tích hợp. Tệp gốc được giữ lại, có alpha trong suốt thật ở nền và khoảng rỗng chữ P. Website dùng bản 192px phù hợp kích thước hiển thị, favicon dùng bản 64px. Không kéo méo hoặc đổi tỷ lệ biểu tượng.

| Tệp | Công dụng |
| --- | --- |
| `public/assets/brand/pay-orbit-mark.png` | Biểu tượng gốc 1254×1254, PNG nền trong suốt |
| `public/assets/brand/pay-orbit-mark-web.png` | Bản 192×192 dùng trong header và footer |
| `public/assets/brand/pay-orbit-favicon.png` | Bản 64×64 cho tab trình duyệt |
| `public/assets/brand/pay-orbit-logo-on-light.png` | Logo ngang với chữ xanh đen, dùng trên nền sáng; 1456×448, nền trong suốt |
| `public/assets/brand/pay-orbit-logo-on-dark.png` | Logo ngang với chữ sáng, dùng trên nền tối; 1456×448, nền trong suốt |

Chữ trong hai logo ngang được render bằng font local đã tải thực, không phải chữ do ImageGen vẽ. Giữ giấy phép OFL cùng font. `scripts/export-logo.mjs` xuất hai logo ngang và hai phiên bản kích thước web từ biểu tượng gốc, kiểm tra FontFace đã loaded và `document.fonts.check` trước khi xuất.

Website dùng biểu tượng ảnh với chữ HTML để giữ độ nét và tên truy cập. Chữ PAY ORBIT trong header vẫn dẫn về trang chủ của ngôn ngữ hiện tại. Footer giữ đầy đủ PAY ORBIT PTY. LTD và tagline song ngữ. Ảnh có `alt=""` và `aria-hidden="true"` vì tên thương hiệu đã nằm trong chữ hoặc accessible label, không đọc lặp biểu tượng.

Header dùng biểu tượng 40px trên desktop và 32px trên mobile; điều chỉnh cỡ tên thương hiệu ở compact để giữ đủ chỗ cho VI/EN và Menu. Không thêm logo trang trí trong các phần nội dung hoặc chuyển động lặp cho logo. Các phần nội dung, ảnh, URL và hành vi biểu mẫu không thay đổi.

Prompt tạo và tinh chỉnh, các tệp nguồn, cách typeset, kích thước và SHA-256 nằm tại `content/brand-assets.json`. Đây là thiết kế mới theo yêu cầu của người dùng, thay thế lựa chọn tên bằng chữ trong pha trước. Không coi logo này là tài sản đã tồn tại trong workbook.
