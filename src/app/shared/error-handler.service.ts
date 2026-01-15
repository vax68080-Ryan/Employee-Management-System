// src/app/shared/error-handler.service.ts
// (如果沒有 shared 資料夾，直接放在 src/app/error-handler.service.ts 也可以)

import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root', // 👈 關鍵：這代表全系統只有這一個實體，隨處可用
})
export class ErrorHandlerService {
  constructor() {}

  // 這是原本你寫在 Component 裡面的邏輯，搬到這裡來
  public handle(title: string, err: any) {
    console.error(title, err); // 方便工程師除錯

    let errorMessage = '系統發生未知錯誤，請聯繫管理員';

    // 1. 如果後端直接回傳字串
    if (typeof err.error === 'string') {
      errorMessage = err.error;
    }
    // 2. 如果後端回傳 JSON 物件且包含 message 欄位
    else if (err.error && typeof err.error === 'object' && err.error.message) {
      errorMessage = err.error.message;
    }
    // 3. 如果是 Spring Boot 預設錯誤結構
    else if (err.error && typeof err.error === 'object' && err.error.error) {
      errorMessage = `${err.error.error}: ${err.error.message || ''}`;
    }
    // 4. 連線失敗 (後端沒開)
    else if (err.status === 0) {
      errorMessage = '無法連線至伺服器，請檢查網路或聯絡管理員';
    }

    // 顯示 SweetAlert
    Swal.fire({
      title: title,
      text: errorMessage,
      icon: 'error',
      confirmButtonText: '確定',
      confirmButtonColor: '#3085d6',
    });
  }
}
