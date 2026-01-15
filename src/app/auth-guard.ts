import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 👇 修改：去 localStorage 檢查 Token
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token; // 有 Token 就算登入

  if (isLoggedIn) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};