# medu-backend
NCCU Cloud Native Project Medu Backend

## API 說明

### 1. 註冊新用戶

**POST** `/api/users/register`

**請求 Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**處理流程：**
- 檢查用戶名是否已被使用。
- 如果用戶名可用，將密碼進行哈希處理後保存新用戶。
- 返回註冊成功訊息。

---

### 2. 用戶登錄

**POST** `/api/users/login`

**請求 Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**處理流程：**
- 驗證用戶名和密碼。
- 如果驗證正確，生成有效期為 1 小時的 JWT token。
- 將 Hash 後的 token 返回給客戶端。

---

### 3. 訪問 User Profile

**GET** `/api/users/profile`

**請求 header:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**處理流程：**
- 驗證 JWT token。
- token 有效可以訪問，並返回 User 。
- token 無效則拒絕請求。

---

### JWT 驗證

在 `Authorization` header 中加入 JWT token，格式：

```
Authorization: Bearer <your_jwt_token>
```

Token 有效期為 1 小時，所以記得及時刷新。

```json
{
    "message": "Is protected token",
    "userId": "671a2b9f9a985765bc93d1db"
}
```

## 錯誤處理
- **400**：請求錯誤（例如，字段缺失或無效）
- **401**：未授權（例如，憑證無效）
- **403**：禁止訪問（例如，令牌無效）
- **500**：伺服器錯誤

