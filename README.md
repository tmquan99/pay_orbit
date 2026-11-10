# PAY ORBIT

Website giới thiệu PAY ORBIT PTY. LTD, tập trung vào hạ tầng mạng doanh nghiệp và an ninh mạng. Website chỉ có tiếng Anh, gồm Home, About Us, Solutions, Services, Products & Technology và Contact.

Dự án dùng HTML, CSS và JavaScript thuần, với ảnh, font và thư viện lưu cục bộ. Form Contact dùng PHP 8.2+ và Titan SMTP; hosting không cần Node.js.

## Chạy local

Yêu cầu Node.js 22 trở lên. Chạy và build không cần cài dependency.

```powershell
npm run dev -- --port 3001
```

Mở http://127.0.0.1:3001/.

## Build và đưa lên hosting

```powershell
npm run check
npm run build
node tests/deployment.mjs
```

Upload **nội dung bên trong `dist/`** vào Document Root của tên miền, để `index.html` nằm ngay tại thư mục gốc. Build chỉ xuất tài nguyên đang dùng và giấy phép cần phân phối. Nếu deploy vào thư mục con, đặt `SITE_BASE_PATH` trước khi build.

Biểu mẫu Contact gửi enquiry về `sales@payorbit.com.au`, bắt buộc Name, Email và Requirement. Trước khi dùng, làm theo [hướng dẫn cấu hình Titan SMTP](docs/mail-setup.md). Mật khẩu đặt ngoài `public_html`, không đưa vào Git hoặc `dist/`. Lệnh dev dùng Node chỉ xem giao diện; gửi email cần hosting PHP.

## Cấu trúc và bảo trì

- `src/`: CSS và JavaScript dùng trên website.
- `scripts/`: tạo HTML, chạy local và build production.
- `content/`: nội dung nguồn và thông tin nguồn gốc tài nguyên.
- `public/assets/`: ảnh WebP, nhận diện thương hiệu, font, icon và thư viện.
- `api/`: endpoint gửi enquiry và PHPMailer; cấu hình riêng đặt ngoài Document Root.
- `tests/`: kiểm tra nội dung, responsive và tương tác.

Sửa nội dung/template rồi chạy lại `npm run build`; các file HTML ở thư mục gốc và trang con được tạo tự động. `npm test` cần Playwright, Chrome, PHP CLI với OpenSSL và lệnh OpenSSL. Giữ các file LICENSE/OFL khi phân phối thư viện và tài nguyên.
