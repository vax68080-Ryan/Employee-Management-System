import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // 👈 1. 引入你的設定檔
import { AppComponent } from './app/app';

// 👇 2. 注意第二個參數，一定要傳入 appConfig
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
