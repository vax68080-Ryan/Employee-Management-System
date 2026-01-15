# 企業級員工管理系統 (Employee Management System)

這是一個基於 **Angular 16+** 與 **Spring Boot 3** 開發的前後端分離管理系統。本專案不僅實作了完整的 CRUD 功能，更針對企業應用中的**權限控管 (RBAC)** 與**瀏覽器狀態同步**議題提供了深入的解決方案。

## 🚀 技術棧 (Technology Stack)

* **前端 (Frontend):** Angular 16 (Standalone Components), TypeScript, RxJS, SweetAlert2
* **後端 (Backend):** Java 17, Spring Boot 3, Spring Data JPA
* **資料庫 (Database):** MySQL / MariaDB
* **安全性 (Security):** JWT (JSON Web Token), Angular Guards & Interceptors

## ✨ 核心功能與亮點

### 1. 完善的權限控管體系 (RBAC)
* 實作 **Admin (管理員)** 與 **User (一般員工)** 雙層權限模型。
* **路由守衛 (Auth Guard):** 確保未授權使用者無法存取敏感頁面。
* **操作級權限檢查:** 在「編輯」與「刪除」功能中實作即時權限驗證，確保只有等級 1 的管理員可執行異動。

### 2. 前後端狀態同步優化 (State Management)
* **技術挑戰:** 解決了在多分頁操作下，`sessionStorage` 與 `localStorage` 讀取邏輯不一致導致的權限判斷落差。
* **解決方案:** 統一儲存機制至 `localStorage`，並在 Angular 元件生命週期與事件觸發階段實作即時狀態檢查，確保 UI 能準確反應使用者權限狀態。

### 3. 高效的資料互動與介面
* **資料過濾:** 支援動態關鍵字搜尋、分頁顯示與欄位排序。
* **UI 回饋:** 整合 **SweetAlert2**，提供友善的刪除確認視窗及「權限不足」錯誤提示。
* **報表匯出:** 實作 Excel 匯出功能，方便行政人員進行離線資料處理。



## 🛠️ 如何在本機執行

### 後端啟動
後端原始碼：[點我觀看](https://github.com/vax68080-Ryan/Employee-Management-Backend.git)
1. 確保已安裝 JDK 17 與 MySQL。
2. 設定 `application.properties` 中的資料庫連線資訊。
3. 執行 `./mvnw spring-boot:run`。

### 前端啟動
前端原始碼：[點我觀看](https://github.com/vax68080-Ryan/Employee-Management-System.git)
1. 進入前端目錄。
2. 執行 `npm install` 安裝依賴 (備份時已排除 node_modules)。
3. 執行 `ng serve` 並訪問 `http://localhost:4200`。

---

## 👨‍💻 開發心得 (Problem Solving)
在此專案開發中，我遇到最大的困難是前端權限驗證偶發性的失效問題。透過 Console 偵錯發現是因為登入與讀取時存取的 Web Storage 空間不一致。我最終採取了統一的狀態存取方案並優化了檢查點的觸發時機，成功提升了系統的穩定性。這讓我對 Angular 的攔截器與守衛機制有了更深刻的理解。