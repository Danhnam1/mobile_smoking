# Tính năng Kiểm tra Trạng thái Thanh toán PayPal

## Tổng quan
Tính năng này cho phép ứng dụng tự động kiểm tra trạng thái thanh toán PayPal khi người dùng quay lại app sau khi hoàn tất thanh toán.

## Cách hoạt động

### 1. Khi bắt đầu thanh toán
- Khi người dùng chọn thanh toán bằng PayPal, app sẽ:
  - Tạo đơn hàng PayPal
  - Lưu thông tin đơn hàng vào AsyncStorage
  - Chuyển hướng người dùng đến PayPal
  - Hiển thị thông báo hướng dẫn

### 2. Khi quay lại app
- App sẽ tự động kiểm tra trạng thái thanh toán sau 1 giây
- Hiển thị thông báo phù hợp dựa trên trạng thái:
  - ✅ **Thành công**: Kích hoạt gói thành viên và chuyển về Home
  - ⏳ **Đang xử lý**: Cho phép kiểm tra lại hoặc để sau
  - ❌ **Thất bại**: Cho phép thử lại hoặc hủy
  - ❓ **Không xác định**: Liên hệ hỗ trợ

### 3. Lưu trữ dữ liệu
- Thông tin đơn hàng được lưu trong AsyncStorage
- Tự động xóa sau 24 giờ hoặc khi thanh toán hoàn tất
- Chỉ lưu cho user hiện tại

## Các trạng thái thanh toán

| Trạng thái | Mô tả | Hành động |
|------------|-------|-----------|
| `completed` / `success` | Thanh toán thành công | Kích hoạt gói, chuyển về Home |
| `pending` / `processing` | Đang xử lý | Cho phép kiểm tra lại |
| `failed` / `cancelled` / `denied` | Thất bại | Cho phép thử lại |
| Khác | Không xác định | Liên hệ hỗ trợ |

## Tính năng bổ sung

### 1. Giao diện cải tiến
- Thông báo rõ ràng với emoji
- Nút kiểm tra trạng thái nổi bật
- Loading indicator khi đang kiểm tra

### 2. Xử lý lỗi
- Retry mechanism cho các lỗi mạng
- Thông báo lỗi thân thiện
- Fallback options

### 3. Persistence
- Lưu trữ đơn hàng qua app restart
- Tự động cleanup dữ liệu cũ
- User-specific storage

## Cách sử dụng

1. Chọn gói thành viên Pro
2. Chọn PayPal làm phương thức thanh toán
3. Nhấn "Đăng ký"
4. Hoàn tất thanh toán trên PayPal
5. Quay lại app
6. App sẽ tự động kiểm tra và thông báo kết quả

## Lưu ý kỹ thuật

- Sử dụng `useFocusEffect` để kiểm tra khi screen được focus
- AsyncStorage để persist data
- Error handling comprehensive
- User experience optimized với delay 1s 