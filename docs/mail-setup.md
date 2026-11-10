# Contact form — Crazy Domains + Titan

## Bật gửi email trên hosting

1. Trong cPanel, chọn PHP 8.2 trở lên và bật extension OpenSSL. Upload **nội dung của `dist/`** vào Document Root của website (thường là `public_html`), gồm cả thư mục `api/` và file ẩn `api/lib/.htaccess`.
2. Đăng nhập Titan Webmail bằng `sales@payorbit.com.au`. Vào Settings → **Enable Titan on Other Apps** và bật quyền truy cập. Nếu đang hiện **Configure 3rd party apps**, quyền này đã được bật. [Hướng dẫn Titan](https://support.titan.email/hc/en-us/articles/25005307786905-Enable-Titan-on-other-apps).
3. Copy nội dung `config/payorbit-mail.example.php` thành file **`/home/TEN_USER_CPANEL/payorbit-mail.php`**, nằm cùng cấp với `public_html`, không nằm bên trong. Điền mật khẩu hộp thư `sales@payorbit.com.au` trực tiếp trong file này. Nếu có ký tự `'` hoặc `\`, phải escape theo cú pháp chuỗi PHP. Giới hạn quyền đọc file cho tài khoản hosting (thường `0600`). Không gửi mật khẩu vào chat, đưa vào Git, hoặc chèn trong JavaScript.
4. Mặc định dùng `smtp.titan.email`, port **465**, TLS và xác thực tài khoản sales. Địa chỉ gửi/nhận cố định là `sales@payorbit.com.au`; email khách là `Reply-To`. [Cấu hình chính thức của Titan](https://support.titan.email/hc/en-us/articles/4405162224665-Configuring-Titan-on-Email-Scripts).
5. `allowed_origins` trong file mẫu cho phép `https://payorbit.com.au` và `https://www.payorbit.com.au`. Nếu dùng domain staging, thêm đúng origin của staging vào file cấu hình trên server. Endpoint chỉ đọc `Origin` từ danh sách này, không có CORS cho website ngoài.
6. Mở trang Contact trên domain thật, gửi một enquiry thử từ email của mày, rồi kiểm tra Inbox/Spam của sales và bấm Reply để kiểm tra địa chỉ khách. Thông báo thành công nghĩa là SMTP đã chấp nhận thư; cần bước này để xác nhận thư thực sự đến hộp thư.

Mặc định endpoint tìm `payorbit-mail.php` ở thư mục cha của Document Root. Nếu thư mục cha này vẫn nằm trong `public_html` (ví dụ addon domain dùng thư mục con), dùng biến môi trường **server** `PAYORBIT_MAIL_CONFIG` để chỉ định đường dẫn tuyệt đối nằm ngoài mọi thư mục public. File cấu hình không được phục vụ qua HTTP.

## Khi gửi lỗi

- `422`: thiếu/sai trường bắt buộc hoặc trường chống bot được điền.
- `429`: tối đa 5 lượt gửi hợp lệ trong 10 phút mỗi IP; các lượt lỗi SMTP cũng tính vào giới hạn. Chờ hết thời gian hoặc liên hệ trực tiếp qua email. Thư mục tạm PHP cần có quyền ghi để lưu bộ đếm; bộ đếm chỉ lưu dấu thời gian theo mã băm, không lưu nội dung enquiry.
- `503`: thiếu cấu hình, chưa điền mật khẩu hoặc không ghi được bộ đếm.
- `502`: SMTP không gửi được. Kiểm tra mật khẩu sales, quyền third-party của Titan, OpenSSL và kết nối outbound port 465 từ hosting. Không tắt xác minh chứng chỉ TLS. Nếu vẫn lỗi, nhờ hosting kiểm tra kết nối tới `smtp.titan.email:465`.
- Không đưa SMTP debug/credential ra response HTTP. Log ứng dụng chỉ ghi loại lỗi chung, không ghi nội dung khách hoặc mật khẩu.

## Kiểm thử local

`npm run dev` không thực thi PHP; endpoint sẽ trả lỗi thay vì trả mã PHP hoặc báo gửi thành công giả. GitHub Pages cũng chỉ xem được giao diện; để gửi thật cần hosting PHP.

```powershell
npm run build
php -S 127.0.0.1:3001 -t dist
```

Đặt biến môi trường `PAYORBIT_MAIL_CONFIG` trỏ đến file cấu hình riêng ngoài thư mục phục vụ. Thêm `http://127.0.0.1:3001` vào `allowed_origins` của cấu hình local. Không dùng mật khẩu thật trong test tự động.

```powershell
npm run test:enquiry
```

Test cần PHP CLI, extension OpenSSL, lệnh OpenSSL, Playwright và Chrome. Có thể đặt `PHP_PATH`/`OPENSSL_PATH`/`CHROME_PATH` nếu runtime không có trong PATH. Bài kiểm tra dùng SMTP TLS giả lập trên loopback, không gửi email ra ngoài.
