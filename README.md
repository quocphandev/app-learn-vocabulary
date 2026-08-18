# Học từ vựng TOEIC

App học từ vựng TOEIC dùng phương pháp lặp lại ngắt quãng (spaced repetition, thuật toán FSRS). Chạy hoàn toàn phía trình duyệt, dữ liệu lưu local (IndexedDB) trên từng thiết bị — không có server/database riêng.

## 1. Chạy trên máy (local)

Yêu cầu: [Node.js](https://nodejs.org) bản 20 trở lên.

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

Lệnh khác:

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy dev server (có hot reload) |
| `npm run build` | Build bản production vào thư mục `dist/` |
| `npm run preview` | Xem thử bản build vừa tạo |
| `npm run gen:vocab` | Parse lại `2.TỪ VỰNG NGỮ PHÁP CĂN BẢN.pdf` → `src/data/vocabulary.json` (chỉ cần chạy lại nếu thay PDF nguồn) |

> File PDF gốc **không** được đưa lên git (xem `.gitignore`) vì đây là tài liệu có tác giả biên soạn riêng — app chỉ cần `src/data/vocabulary.json` đã trích xuất sẵn để chạy.

## 2. Deploy lên GitHub Pages (miễn phí)

Repo đã có sẵn workflow tự động tại `.github/workflows/deploy.yml`: mỗi lần push lên nhánh `main`, GitHub Actions sẽ tự build và deploy.

### Bật GitHub Pages (chỉ làm 1 lần)

1. Vào **Settings → Pages** của repo (`https://github.com/<user>/<repo>/settings/pages`).
2. Ở mục **Build and deployment → Source**, chọn **"GitHub Actions"** (không chọn "Deploy from a branch"). Đây là bước bắt buộc để GitHub khởi tạo môi trường Pages cho repo — nếu bỏ qua, workflow sẽ chạy nhưng báo lỗi `Failed to create deployment (status: 404)` ở bước deploy.
3. Push code lên `main` (hoặc vào tab **Actions → Deploy to GitHub Pages → Run workflow** để chạy lại thủ công mà không cần push mới).
4. Đợi workflow chạy xong (dấu ✔ xanh trong tab Actions, khoảng 1-2 phút).
5. App sẽ chạy tại: `https://<user>.github.io/<repo>/`

### Cập nhật sau này

Chỉ cần `git push` lên `main`, site tự build & deploy lại — không cần thao tác gì thêm trên GitHub.

### Dùng trên điện thoại

Mở link Pages ở trên bằng trình duyệt điện thoại → menu trình duyệt → **"Thêm vào Màn hình chính" / "Add to Home Screen"**. App đã có sẵn web manifest + icon nên sẽ hiện như một app riêng, mở toàn màn hình (không có thanh địa chỉ).

### Xử lý lỗi thường gặp

- **`Failed to create deployment (status: 404)`**: chưa bật Source = "GitHub Actions" ở bước 2, hoặc bật sau khi workflow đã chạy. Bật xong rồi chạy lại workflow theo bước 3.
- **`Permission ... denied to <user>` khi `git push`**: máy đang cache tài khoản Git khác với chủ repo. Xoá credential cũ rồi push lại để đăng nhập lại đúng tài khoản:
  ```bash
  git-credential-manager github logout <tên-tài-khoản-cũ>
  git push -u origin main
  ```

## 3. Cấu trúc project

```
scripts/generate-vocabulary.mjs   Parse PDF → src/data/vocabulary.json
src/data/vocabulary.json          1115 từ vựng đã trích xuất (word, pos, nghĩa, IPA)
src/lib/fsrs.ts                   Wrapper thuật toán FSRS (ts-fsrs) + seed 300 từ nền tảng
src/lib/db.ts                     Lớp lưu trữ IndexedDB (idb)
src/lib/queue.ts                  Xây hàng đợi học mỗi ngày (ôn tập + từ mới trong hạn mức)
src/components/modes/             4 chế độ học: Flashcard, Trắc nghiệm, Gõ lại từ, Nghe & gõ lại
src/components/Dashboard/         Màn hình tổng quan
src/components/Settings/          Cài đặt: số từ mới/ngày, bật/tắt chế độ, reset tiến độ
```

## 4. Công nghệ dùng

React + TypeScript + Vite, [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) (thuật toán FSRS), [`idb`](https://github.com/jakearchibald/idb) (IndexedDB), `zustand` (state UI nhẹ).
