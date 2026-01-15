import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// 定義客戶資料介面
export interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  level: string;
  salesEmployee: string;
  salesEmployeeName: string;
  lastContactDate: string;
  phone: string;
  address: string;
  email: string;
}

// 定義等級介面 (下拉選單用)
export interface CustomerLevel {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  // 取得分頁資料
  getCustomers(
    page: number,
    size: number,
    sortCol: string,
    sortDir: string,
    criteria: any
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sortCol},${sortDir}`);

    Object.keys(criteria).forEach((key) => {
      if (criteria[key]) {
        params = params.set(key, criteria[key]);
      }
    });

    return this.http.get<any>(this.apiUrl, { params });
  }

  // 👇👇👇【新增這個方法】取得單筆客戶資料 (編輯頁面用) 👇👇👇
  getCustomerById(id: string): Observable<CustomerRecord> {
    return this.http.get<CustomerRecord>(`${this.apiUrl}/${id}`);
  }
  // 👆👆👆 務必補上這段 👆👆👆

  getLevels(): Observable<CustomerLevel[]> {
    // 模擬 API 回傳
    return new Observable((observer) => {
      observer.next([{ name: 'VIP' }, { name: '一般' }, { name: '潛在客戶' }, { name: '黑名單' }]);
      observer.complete();
    });
  }

  addCustomer(data: CustomerRecord): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCustomer(id: string, data: CustomerRecord): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  exportToExcel(criteria: any) {
    // 如果 criteria 裡面有 ids 陣列 (例如 ['C001', 'C002'])，Angular 的 HttpParams 會自動處理
    // 但為了配合後端 Map<String, String> 接收，建議手動轉成逗號分隔字串

    let params = new HttpParams();
    for (const key in criteria) {
      if (criteria.hasOwnProperty(key)) {
        const value = criteria[key];

        if (Array.isArray(value)) {
          // ⭐ 將陣列轉成 "id1,id2,id3" 字串
          params = params.set(key, value.join(','));
        } else {
          params = params.set(key, value);
        }
      }
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params: params, // ⭐ 必須放在 params 裡
      responseType: 'blob',
    });
  }

  deleteBatch(ids: string[]): Observable<any> {
    return this.http.request('delete', `${this.apiUrl}/batch`, { body: ids });
  }

  updateLevelBatch(
    ids: string[],
    level: string,
    selectAll: boolean = false,
    criteria: any = null
  ): Observable<any> {
    const payload = {
      ids: ids,
      level: level,
      selectAllPages: selectAll,
      criteria: criteria,
    };
    return this.http.patch(`${this.apiUrl}/batch-level`, payload);
  }
}
