import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

// 👇 修改：請確認檔案名稱是否正確 (通常是 ./auth.interceptor)
import { authInterceptor } from './auth-interceptor'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      // 👇 註冊攔截器，這樣所有 API 請求都會自動帶上 Token
      withInterceptors([authInterceptor]) 
    )
  ]
};