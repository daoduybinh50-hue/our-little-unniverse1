# Website 20/10 gửi Tuyết Mai

Trang web tĩnh: HTML + CSS + JavaScript thuần, không backend, không thư viện. Chạy tốt trên điện thoại và máy tính.

## Cấu trúc

```
tuyet-mai-20-10/
├── index.html
├── style.css
├── script.js
└── README.md   (file này, có thể không đăng lên)
```

Trình tự trang: phong bì → ngày đầu tiên → một cái bấm nút → quiz 3 câu → điều quý nhất → lá thư kết thúc (có nút xem lại).

## Xem thử trên máy

Cách nhanh nhất: bấm đúp vào `index.html`. Hoặc chạy server nhỏ trong thư mục này:

```
python3 -m http.server 8000
```

rồi mở `http://localhost:8000`.

Lưu ý: chữ viết tay (Dancing Script) và chữ thân bài (Lora) tải từ Google Fonts nên cần có mạng. Nếu không có mạng, trang tự dùng font thay thế (Georgia, Segoe Script) và vẫn hoạt động bình thường.

## Đăng lên GitHub Pages, từng bước

### Cách 1: giao diện web (không cần dùng dòng lệnh)

1. Đăng nhập GitHub, bấm dấu **+** ở góc trên bên phải → **New repository**.
2. Đặt tên repo. Nên đặt một cái tên khó đoán (ví dụ `mot-la-thu-nho-8x2k`), vì địa chỉ trang sẽ chứa tên này.
3. Chọn **Public**. (Tài khoản GitHub miễn phí chỉ bật được Pages với repo Public.)
4. Bấm **Create repository**.
5. Ở trang repo vừa tạo, bấm **uploading an existing file**, kéo thả 3 file `index.html`, `style.css`, `script.js` vào. Nếu muốn dùng nhạc riêng, kéo thả luôn file âm thanh (xem phần Nhạc bên dưới).
6. Kéo xuống, bấm **Commit changes**.
7. Vào tab **Settings** của repo → mục **Pages** ở thanh bên trái.
8. Ở phần **Build and deployment** → **Source**, chọn **Deploy from a branch**.
9. Ở **Branch**, chọn `main`, thư mục `/ (root)`, bấm **Save**.
10. Đợi khoảng 1 đến 3 phút, tải lại trang Settings → Pages sẽ hiện địa chỉ dạng:
    `https://TEN-TAI-KHOAN.github.io/TEN-REPO/`
11. Mở địa chỉ đó trên điện thoại để kiểm tra, rồi gửi riêng cho Mai.

### Cách 2: dùng Git

```
cd tuyet-mai-20-10
git init
git add index.html style.css script.js
git commit -m "20/10"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/TEN-REPO.git
git push -u origin main
```

Sau đó làm lại các bước 7 đến 11 ở trên.

### Cập nhật nội dung sau khi đã đăng

Sửa file trên GitHub (bấm vào file → biểu tượng bút chì → sửa → Commit changes), đợi 1 đến 2 phút rồi tải lại trang. Nếu vẫn thấy bản cũ, mở bằng tab ẩn danh hoặc thêm `?v=2` vào cuối địa chỉ.

## Về sự riêng tư

Trang đã có thẻ `noindex` để các công cụ tìm kiếm không lập chỉ mục, nhưng ai có đường link vẫn mở được. Vì vậy:

- Chỉ gửi link trực tiếp cho Mai qua tin nhắn riêng.
- Đừng đăng link lên nơi công khai (story, nhóm lớp).
- Tên repo càng khó đoán càng tốt.
- Nếu sau 20/10 muốn gỡ, vào Settings → Pages để tắt, hoặc đổi repo sang Private.

## Nhạc piano

Mặc định `musicUrl` để trống: trình duyệt tự phát một giai điệu piano nhẹ do code tạo ra (Am – F – C – G), không dùng file ngoài nào, nên không có đường dẫn nào bị hỏng. Nhạc chỉ bắt đầu sau khi Mai chạm vào phong bì (trình duyệt không cho tự phát nhạc trước khi người dùng thao tác). Góc phải trên có nút ♪ để tắt/bật.

Nếu muốn dùng bài piano riêng:

1. Chọn một file piano bạn có quyền sử dụng (nhạc tự thu, nhạc miễn phí bản quyền, hoặc file bạn đã mua).
2. Đặt file vào cùng thư mục với `index.html`, đặt tên đơn giản, ví dụ `piano.mp3`, và nhớ commit lên GitHub cùng 3 file kia.
3. Mở `script.js`, tìm dòng đầu phần `CONFIG`, sửa:
   ```js
   musicUrl: 'piano.mp3',
   ```
   Hoặc dán một URL `https://...` trỏ thẳng tới file âm thanh (không phải trang web chứa trình phát).
4. Nếu file không tải được (sai tên, sai đường dẫn), trang tự quay về nhạc piano tổng hợp.

Mẹo: file nên dưới khoảng 5 MB để mở nhanh trên 4G.

## Tùy chỉnh nội dung

- **Lời trong từng cảnh**: sửa các dòng `data-text="..."` trong `index.html`. Muốn xuống dòng mới, thêm một thẻ `<p class="line" data-text="..."></p>`.
- **Quiz**: sửa mảng `QUIZ` ở đầu `script.js`. Mỗi lựa chọn có hai phần: nội dung và lời đáp.
- **Tốc độ gõ chữ**: `typeDelay` và `linePause` trong `CONFIG`.
- **Màu sắc**: các biến màu ở đầu `style.css` (`--cream`, `--ink`, `--accent`...).
- **Hình minh họa**: là SVG vẽ trực tiếp trong `index.html` nên không cần file ảnh. Muốn thay bằng ảnh của riêng bạn, thay khối `<svg>...</svg>` bằng `<img src="ten-anh.jpg" alt="mô tả">` (ảnh đặt cùng thư mục).

## Mẹo khi dùng

- Chạm vào chỗ trống trên màn hình khi chữ đang gõ để hiện nhanh toàn bộ đoạn đó.
- Máy bật chế độ "giảm chuyển động" thì các hiệu ứng nặng (hạt bụi, grain, zoom) tự tắt và chữ hiện ngay.
- Bật âm lượng điện thoại và tắt chế độ im lặng trước khi mở, vì iPhone chặn âm thanh khi gạt công tắc im lặng.

## Kiểm tra nhanh nếu có lỗi

| Hiện tượng | Cách xử lý |
| --- | --- |
| Trang 404 sau khi bật Pages | Đợi thêm vài phút; kiểm tra file tên đúng là `index.html` (viết thường) và nằm ở thư mục gốc repo |
| Mất định dạng, chữ trơ | Kiểm tra `style.css` đã được upload và cùng thư mục với `index.html` |
| Bấm phong bì không phản ứng | Kiểm tra `script.js` đã upload; mở DevTools (F12) → Console xem lỗi |
| Không có nhạc | Kiểm tra âm lượng, nút ♪ ở góc phải, và nếu dùng file riêng thì tên file trong `musicUrl` khớp chính xác (phân biệt hoa thường) |
