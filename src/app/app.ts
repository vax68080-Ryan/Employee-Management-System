import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  userName: string = '';
  userLevel: number = 2;
  showNavbar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showNavbar = !event.urlAfterRedirects.toLowerCase().includes('/login');
        this.refreshUserInfo();
      });
  }

  ngOnInit() {
    this.refreshUserInfo();
  }

  // 👇 修改：改成從 localStorage 讀取
  refreshUserInfo() {
    const savedName = localStorage.getItem('userName');
    const savedLevel = localStorage.getItem('userLevel');

    this.userName = savedName || '';
    this.userLevel = savedLevel ? Number(savedLevel) : 2;
  }

  logout() {
    console.log('嘗試執行登出動作...');

    Swal.fire({
      title: '確定要登出嗎？',
      text: '登出後將無法存取系統資料',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '是的，登出',
      cancelButtonText: '取消',
    }).then((result) => {
      if (result.isConfirmed) {
        // 👇 修改：清除 localStorage 才是真的登出
        localStorage.clear();
        // 保險起見，Session 也清一下
        sessionStorage.clear();

        this.router.navigate(['/login']);
      }
    });
  }
}
