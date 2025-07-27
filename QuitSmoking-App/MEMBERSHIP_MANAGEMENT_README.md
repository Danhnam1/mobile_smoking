# 🎯 Membership Management Features

## 📋 **Tổng quan**

Tính năng quản lý membership cho phép user:

- **Hủy gói** hiện tại
- **Nâng cấp gói** từ gói cũ lên gói mới
- **Xem thông tin** gói hiện tại
- **Quản lý** trạng thái membership

## 🛠️ **Files đã cập nhật**

### **1. Payment Service (`src/services/payment.service.js`)**

```javascript
// Thêm 2 API endpoints mới
cancelMembership: () => {
  return BaseService.post({
    url: "/user-membership/cancel",
    isAuth: true,
  });
},

upgradeMembership: (payload) => {
  return BaseService.post({
    url: "/user-membership/upgrade",
    payload,
    isAuth: true,
  });
},
```

### **2. Payment Hook (`src/hooks/usePayment.js`)**

```javascript
// Thêm 2 functions mới
const cancelMembership = async () => {
  // Hủy gói hiện tại
  // Cập nhật membership status
  // Hiển thị thông báo thành công
};

const upgradeMembership = async (newPackageId) => {
  // Nâng cấp lên gói mới
  // Cập nhật membership status
  // Hiển thị thông báo thành công
};
```

### **3. Membership Package Screen (`src/screens/MembershipPackageScreen.jsx`)**

- **Hiển thị CurrentMembershipCard** component
- **Logic nâng cấp** cho các gói khác
- **Button hủy gói** cho gói hiện tại

### **4. Current Membership Card (`src/components/CurrentMembershipCard.jsx`)**

- **Hiển thị thông tin** gói hiện tại
- **Button hủy gói** với confirmation
- **Button nâng cấp** với options
- **Tính toán** ngày còn lại

## 🎯 **Tính năng chính**

### **1. Hủy gói**

- ✅ **Confirmation dialog** trước khi hủy
- ✅ **API call** để hủy gói
- ✅ **Cập nhật UI** sau khi hủy
- ✅ **Thông báo thành công**

### **2. Nâng cấp gói**

- ✅ **Preview upgrade cost** (nếu có)
- ✅ **Confirmation dialog** trước khi nâng cấp
- ✅ **API call** để nâng cấp
- ✅ **Cập nhật UI** sau khi nâng cấp
- ✅ **Thông báo thành công**

### **3. Hiển thị thông tin**

- ✅ **Tên gói** hiện tại
- ✅ **Trạng thái** hoạt động
- ✅ **Ngày còn lại** hoặc "Vĩnh viễn"
- ✅ **Options** hủy/nâng cấp

## 🔄 **Workflow**

### **User có gói hiện tại:**

1. **Hiển thị** CurrentMembershipCard
2. **Button "Hủy gói"** → Confirmation → API call
3. **Button "Nâng cấp gói"** → Chọn gói → Confirmation → API call

### **User không có gói:**

1. **Hiển thị** danh sách gói
2. **Button "Chọn gói này"** → Payment modal

## 📱 **UI/UX**

### **CurrentMembershipCard:**

- 🎨 **Design đẹp** với shadow và border radius
- 🏷️ **Icon star** cho gói hiện tại
- 📊 **Thông tin rõ ràng** về trạng thái
- 🔘 **Buttons** với icons và colors phù hợp

### **Confirmation Dialogs:**

- ⚠️ **Warning** cho hủy gói
- 💰 **Info** cho nâng cấp gói
- ✅ **Success** messages sau khi hoàn thành

## 🔧 **API Endpoints**

### **Cancel Membership:**

```
POST /user-membership/cancel
Authorization: Bearer <token>
```

### **Upgrade Membership:**

```
POST /user-membership/upgrade
Authorization: Bearer <token>
Body: { newPackageId: string }
```

## 🧪 **Testing Scenarios**

### **1. Hủy gói:**

- [ ] User có gói Pro → Click "Hủy gói" → Confirm → Success
- [ ] User có gói Premium → Click "Hủy gói" → Cancel → No change
- [ ] User không có gói → Không hiển thị button hủy

### **2. Nâng cấp gói:**

- [ ] Pro → Premium → Confirm → Success
- [ ] Pro → Pro 12 Months → Confirm → Success
- [ ] Premium → Pro → Confirm → Success

### **3. UI Updates:**

- [ ] Sau khi hủy → Membership status = null
- [ ] Sau khi nâng cấp → Membership status = new package
- [ ] Navigation về Home sau khi hoàn thành

## 🚀 **Deployment**

### **Backend Requirements:**

- ✅ API endpoint `/user-membership/cancel`
- ✅ API endpoint `/user-membership/upgrade`
- ✅ Logic tính toán upgrade cost
- ✅ Validation membership status

### **Frontend Requirements:**

- ✅ PaymentService với 2 methods mới
- ✅ usePayment hook với 2 functions mới
- ✅ CurrentMembershipCard component
- ✅ Updated MembershipPackageScreen

## 📝 **Notes**

- **Error handling** đầy đủ cho tất cả API calls
- **Loading states** cho các operations
- **User feedback** rõ ràng với alerts
- **Navigation** tự động về Home sau khi hoàn thành
- **Membership status** được cập nhật real-time
