import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// 1. 定義介面，加入等級與密碼欄位
export type EmployeeRecord = {
  id: string; // 帳號 (員工 ID)
  name: string;
  departmentId?: number; // 改用 ID 與後端關聯
  department?: string; // 顯示用的部門名稱
  hireDate: string;
  address: string;
  phone: string;
  email: string;
  level: number; // 💡 新增：權限等級 (1 為最高等)
  password?: string; // 💡 新增：密碼 (選填，通常只在新增/修改時使用)
};

export type Department = {
  id: number;
  name: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
};

export type DepartmentStats = {
  department: string;
  count: number;
};

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  // 💡 建議統一使用小寫 API 路徑
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // 1. 取得所有部門
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  // 2. 搜尋與分頁 (將路徑改為小寫 /employees)
  getEmployees(
    page: number,
    size: number,
    sortField: string,
    sortDir: string,
    criteria: any
  ): Observable<PageResponse<EmployeeRecord>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortField', sortField)
      .set('sortDir', sortDir)
      .set('t', new Date().getTime().toString());

    Object.keys(criteria).forEach((key) => {
      const value = criteria[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<PageResponse<EmployeeRecord>>(`${this.baseUrl}/employees`, { params });
  }

  // 3. 新增員工 (包含密碼與等級)
  addEmployee(employee: EmployeeRecord): Observable<EmployeeRecord> {
    return this.http.post<EmployeeRecord>(`${this.baseUrl}/employees`, employee);
  }

  // 4. 更新員工資料
  updateEmployee(id: string, employee: EmployeeRecord): Observable<EmployeeRecord> {
    return this.http.put<EmployeeRecord>(
      `${this.baseUrl}/employees/${encodeURIComponent(id)}`,
      employee
    );
  }

  // 5. 刪除員工
  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/employees/${encodeURIComponent(id)}`);
  }

  // 6. 匯出 Excel
  exportToExcel(criteria: any): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(criteria).forEach((key) => {
      const value = criteria[key];
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get(`${this.baseUrl}/employees/export`, {
      params: params,
      responseType: 'blob',
    });
  }

  // 7. 取得部門人數統計
  getStats(): Observable<DepartmentStats[]> {
    return this.http.get<DepartmentStats[]>(`${this.baseUrl}/employees/stats`);
  }

  // 👇 新增這個方法：取得所有員工清單
  getAllEmployees(): Observable<EmployeeRecord[]> {
    return this.http.get<EmployeeRecord[]>(`${this.baseUrl}/employees/all`);
  }
}
