import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class Login {
  loginData = {
    id: '',
    password: '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    this.http.post<any>('http://localhost:8080/api/auth/login', this.loginData).subscribe({
      next: (res) => {
        // 👇👇👇 加入這行來抓兇手 👇👇👇
        console.log('【登入除錯】後端回傳的完整資料:', res);

        // 👇 【關鍵修改】改成 localStorage，這樣其他頁面才讀得到權限！
        localStorage.setItem('token', res.token);
        localStorage.setItem('userLevel', res.level.toString());
        localStorage.setItem('userName', res.name);

        // (選用) 如果您希望 Session 也留一份備份，可以保留下面這三行，不留也沒關係
        // sessionStorage.setItem('token', res.token);
        // sessionStorage.setItem('userLevel', res.level.toString());
        // sessionStorage.setItem('userName', res.name);

        // 使用 window.location.href 強制刷新跳轉
        // 這樣可以確保導覽列 (Navbar) 重新讀取使用者名稱
        window.location.href = '/customers';
      },
      error: (err) => {
        // 顯示錯誤訊息 (如果是 401 會顯示帳號或密碼錯誤)
        const msg = typeof err.error === 'string' ? err.error : '登入失敗，請檢查伺服器';
        alert(msg);
      },
    });
  }
}
