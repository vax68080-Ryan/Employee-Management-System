import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 👇 修改：去 localStorage 拿 userLevel
  const userLevel = localStorage.getItem('userLevel'); 

  if (userLevel === '1') {
    return true; 
  }

  alert('權限不足或未登入');
  // 如果已登入但權限不足，通常導回首頁或 403 頁面，不一定是 Login
  router.navigate(['/customers']); 
  return false;
};