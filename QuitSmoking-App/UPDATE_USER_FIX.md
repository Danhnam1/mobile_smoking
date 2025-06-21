# Update User API Fix

## Problem
Lỗi "Failed to update user" khi cập nhật thông tin user profile.

## Root Cause Analysis
1. **Endpoint Issue**: Có thể endpoint `/users/profile` không đúng hoặc không tồn tại
2. **HTTP Method Issue**: Có thể server không hỗ trợ PATCH method
3. **Error Handling**: Không có đủ thông tin debug để xác định nguyên nhân chính xác

## Solutions Implemented

### 1. Enhanced Error Handling
- Thêm detailed logging để debug
- Parse error response từ server
- Log response status và headers

### 2. Multiple Endpoint Support
- Thử endpoint `/users/me` trước (phổ biến cho user profile)
- Fallback về endpoint `/users/profile` nếu endpoint mới không hoạt động
- Thử cả PUT và PATCH methods

### 3. Improved Logging
- Log data được gửi đi
- Log token status
- Log response details
- Log success/failure

## Code Changes

### `src/api/user.js`
```javascript
export const updateUser = async (userData, token) => {
  try {
    console.log('Updating user with data:', userData);
    console.log('Using token:', token ? 'present' : 'missing');
    
    // Try the new endpoint first
    let response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    // If the new endpoint fails, try the original endpoint
    if (!response.ok && response.status === 404) {
      console.log('New endpoint failed, trying original endpoint...');
      response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
    }
    
    // Enhanced error handling
    if (!response.ok) {
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Update user error details:', errorData);
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Update user success:', result);
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
```

### `src/contexts/AuthContext.js`
- Thêm detailed logging trong `updateUserProfile`
- Log data được gửi đi và response
- Better error propagation

## Testing Steps
1. Chạy app và thử cập nhật user profile
2. Kiểm tra console logs để xem:
   - Endpoint nào được sử dụng
   - Response status
   - Error details (nếu có)
3. Xác nhận update thành công

## Expected Behavior
- App sẽ thử endpoint `/users/me` trước
- Nếu 404, sẽ fallback về `/users/profile`
- Detailed logs sẽ giúp debug nếu vẫn có lỗi
- User sẽ nhận được error message cụ thể thay vì generic message

## Next Steps
1. Test với backend để xác định endpoint đúng
2. Update config nếu cần
3. Remove fallback logic nếu endpoint đúng đã được xác định 