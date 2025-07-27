# Upgrade Membership Features - Mobile App

## Tổng quan

Đã cập nhật ứng dụng mobile để hỗ trợ các tính năng upgrade membership từ backend, bao gồm:

- Preview upgrade cost
- Hiển thị current membership
- Xử lý upgrade payment
- Lịch sử membership
- **Thanh toán cho tất cả gói (trừ Default)**

## Các file đã được cập nhật

### 1. `src/services/payment.service.js`

**Thêm các method mới:**

- `previewUpgrade(payload)` - Tính toán chi phí nâng cấp
- `getCurrentMembership()` - Lấy membership hiện tại
- `getMembershipHistory()` - Lấy lịch sử membership

### 2. `src/hooks/usePayment.js`

**Tính năng mới:**

- Fetch current membership khi component mount
- Preview upgrade cost trước khi thanh toán
- Hiển thị dialog xác nhận upgrade với thông tin chi tiết
- Refresh membership sau khi thanh toán thành công

**State mới:**

- `upgradeInfo` - Thông tin upgrade
- `currentMembership` - Membership hiện tại

**Bug Fixes:**

- Handle trường hợp user chưa có membership active
- Không hiển thị error khi user chưa có membership
- Graceful fallback cho upgrade check

**Payment Logic Updates:**

- **Gói Default**: Không cần thanh toán, chuyển về Home ngay
- **Tất cả gói khác**: Cần thanh toán qua PayPal/Momo
- Auto-activate gói Default khi user chọn

### 3. `src/screens/MembershipPackageScreen.jsx`

**UI/UX cải tiến:**

- Hiển thị card "Gói hiện tại" với thông tin chi tiết
- Badge "Hiện tại" cho gói đang sử dụng
- Disable button cho gói hiện tại
- Visual feedback cho upgrade scenario

**Logic mới:**

- Kiểm tra current membership
- Hiển thị thông tin upgrade khi cần thiết
- Xử lý upgrade flow

**Bug Fixes:**

- Chỉ hiển thị current membership card khi có membership active
- Kiểm tra remainingDays > 0 trước khi hiển thị
- Handle trường hợp user chưa có membership

**Button Logic:**

- **Gói Default**: "Chọn gói miễn phí" → Chuyển về Home
- **Gói khác**: "Chọn gói này" → Mở payment modal

### 4. `src/screens/TransactionsScreen.jsx`

**Tính năng mới:**

- Tab navigation giữa "Giao dịch" và "Thành viên"
- Component `MembershipItem` để hiển thị lịch sử membership
- Status badges với màu sắc tương ứng
- Pull-to-refresh cho cả hai tab

**UI Components:**

- `MembershipItem` - Hiển thị thông tin membership
- Tab navigation với icons
- Empty state cho cả hai tab

### 5. `src/screens/CheckoutScreen.jsx`

**Cải tiến UX:**

- Hiển thị thông tin gói đã mua
- Button "Xem lịch sử" sau khi thanh toán thành công
- Button "Thử lại" khi thanh toán thất bại
- Loading state với thông báo "Vui lòng không đóng ứng dụng"

## Workflow Payment

### 1. User chọn gói Default

- App kiểm tra gói Default (price = 0)
- Hiển thị thông báo "Gói miễn phí"
- Auto-activate membership
- Chuyển về Home

### 2. User chọn gói có phí (PRO, Premium, etc.)

- App kiểm tra current membership
- Nếu khác gói hiện tại → Preview upgrade cost
- Hiển thị dialog xác nhận với thông tin chi tiết

### 3. User xác nhận thanh toán

- Tạo PayPal order với upgrade mode (nếu cần)
- Backend tính toán chi phí nâng cấp
- User thanh toán chi phí chênh lệch

### 4. Sau khi thanh toán thành công

- Backend cập nhật membership
- App refresh current membership
- Hiển thị thông tin gói mới

## API Endpoints được sử dụng

### Payment Service

- `POST /api/payments/paypal/create` - Tạo order (hỗ trợ upgrade)
- `POST /api/payments/paypal/capture` - Capture payment
- `GET /api/transactions/me` - Lịch sử giao dịch

### Membership Service

- `GET /api/user-membership/me` - Membership hiện tại
- `GET /api/user-membership/me/history` - Lịch sử membership
- `POST /api/user-membership/preview-upgrade` - Preview upgrade cost

## Tính năng nổi bật

### 1. Smart Payment Detection

- Tự động phát hiện gói miễn phí vs có phí
- Xử lý khác nhau cho từng loại gói
- Auto-activate cho gói miễn phí

### 2. Enhanced UX

- Visual feedback cho current membership
- Clear payment flow với confirmation
- Improved checkout experience

### 3. Comprehensive History

- Tab-based navigation
- Detailed membership history
- Transaction tracking

### 4. Error Handling

- Graceful fallback khi upgrade check fails
- Clear error messages
- Retry mechanisms

## Bug Fixes

### 1. "Không có membership đang hoạt động" Error

**Vấn đề:** User chưa có membership active nhưng app vẫn cố gắng preview upgrade
**Giải pháp:**

- Handle error gracefully trong `initiatePayPalPayment`
- Kiểm tra error message để phân biệt "no membership" vs "other errors"
- Continue với normal payment khi user chưa có membership

### 2. Current Membership Display

**Vấn đề:** Hiển thị current membership card khi user chưa có membership
**Giải pháp:**

- Kiểm tra `remainingDays > 0` trước khi hiển thị
- Chỉ hiển thị card khi thực sự có membership active

### 3. Upgrade Logic

**Vấn đề:** Logic upgrade không handle trường hợp user mới
**Giải pháp:**

- Kiểm tra current membership trước khi preview upgrade
- Fallback to normal payment flow cho user mới

### 4. Payment Logic

**Vấn đề:** Chỉ gói PRO mới cần thanh toán
**Giải pháp:**

- Tất cả gói (trừ Default) đều cần thanh toán
- Gói Default auto-activate và chuyển về Home

## Testing Scenarios

### 1. Default Package Flow

- User chọn gói Default → Auto-activate
- Hiển thị thông báo "Gói miễn phí"
- Chuyển về Home
- Không cần thanh toán

### 2. Paid Package Flow (New User)

- User chưa có membership → Chọn gói PRO
- Thanh toán full price
- Kích hoạt membership

### 3. Upgrade Flow

- User có membership active → Chọn gói khác
- Preview upgrade cost
- Thanh toán chênh lệch
- Upgrade membership

### 4. Same Package Flow

- User chọn gói đang dùng
- Disable button
- Show "Đang sử dụng"

### 5. History View

- Switch between transactions and memberships
- View detailed information
- Pull to refresh

### 6. Error Handling

- User chưa có membership → Chọn gói có phí
- Không hiển thị error dialog
- Proceed với normal payment

## Package Types

### Default Package

- **Price:** 0 VND (Miễn phí)
- **Features:** Limited (chỉ reminder)
- **Payment:** Không cần
- **Action:** Auto-activate → Home

### Paid Packages (PRO, Premium, etc.)

- **Price:** > 0 VND
- **Features:** Full access
- **Payment:** PayPal/Momo required
- **Action:** Payment modal → Checkout

## Notes

- Backend đã hỗ trợ đầy đủ upgrade logic
- Mobile app được cập nhật để tận dụng các tính năng backend
- UI/UX được thiết kế để user-friendly
- Error handling comprehensive
- Performance optimized với proper state management
- Fixed critical bugs related to membership status checking
- **Payment logic updated để handle tất cả gói thanh toán**
