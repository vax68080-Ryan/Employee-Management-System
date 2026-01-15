import { Routes } from '@angular/router';
import { EmployeeFormComponent } from './employee-form/employee-form';
import { DepartmentStatsComponent } from './department-stats/department-stats';
import { Login } from './login/login';
import { authGuard } from './auth-guard';
import { adminGuard } from './guards/admin.guard'; // 記得確認路徑
import { CustomerListComponent } from './customer/customer-list';
import { CustomerEditComponent } from './customer/customer-edit';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'stats', component: DepartmentStatsComponent },
  
  // 👇👇👇 修正這裡：將 'Employee' 改為 'employees' 👇👇👇
  {
    path: 'employees', 
    component: EmployeeFormComponent,
    canActivate: [adminGuard], // 這裡有第二道關卡，等下如果還進不去我們再檢查這裡
  },
  // 👆👆👆 修正結束 👆👆👆

  {
    path: 'customers',
    component: CustomerListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'customers/add',
    component: CustomerEditComponent,
    canActivate: [authGuard],
  },
  {
    path: 'customers/edit/:id',
    component: CustomerEditComponent,
    canActivate: [authGuard],
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];