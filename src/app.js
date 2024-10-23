const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/UserRoutes");

const app = express();
// 讀 json 格式
app.use(express.json());

// connect to mongodb

mongoose
  .connect("mongodb://localhost:27017/authDemo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // 使用 createIndex()，避免 ensureIndex() 的警告
  })
  // 設定連線成功與失敗的 response
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// 設置路由，當路徑以 '/auth' 開頭時，交由 authRoutes 來處理
app.use("/auth", authRoutes);

// 啟動伺服器
app.listen(3000, () => {
  // 伺服器成功啟動後，顯示提示訊息
  console.log("Server running on http://localhost:3000");
});
