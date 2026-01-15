import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CustomerService, CustomerRecord, CustomerLevel } from './customer.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import Swal from 'sweetalert2';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 👈 加入 ChangeDetectorRef
import { EmployeeService, EmployeeRecord } from '../employee-form/employee.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './customer-list.html', // 請確認檔名是否正確
  styleUrls: ['./customer-form.css'],
})
export class CustomerListComponent implements OnInit {
  searchForm!: FormGroup;
  pagedRecords: CustomerRecord[] = [];
  levels: CustomerLevel[] = [];

  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalElements = 0;
  sortColumn = 'id';
  sortDirection = 'asc';

  selectedIds = new Set<string>();
  isSelectAllPages = false;

  employees: EmployeeRecord[] = [];
  searchKeyword: string = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private employeeService: EmployeeService, // 3. 注入 EmployeeService
    private errorService: ErrorHandlerService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // 👈 新增這一行
  ) {
    // 初始化表單，所有欄位預設為空字串
    this.searchForm = this.fb.group({
      id: [''],
      name: [''],
      company: [''],
      salesEmployee: [''],
      level: [''],
      lastContactDate: [''],
      phone: [''],
      email: [''],
    });
  }

  ngOnInit() {
    this.loadLevels();
    this.loadEmployees(); // 4. 初始化時載入員工

    this.route.queryParams.subscribe((params) => {
      const searchId = params['searchId'];

      if (searchId) {
        console.log('偵測到自動查詢 ID:', searchId);
        this.searchKeyword = ''; // 自動查詢時清空顯示關鍵字
        // 1. 設定表單值
        this.searchForm.setValue({
          id: searchId,
          name: '',
          company: '',
          salesEmployee: '',
          level: '',
          lastContactDate: '',
          phone: '',
          email: '',
        });

        // 2. ⭐ 關鍵修正：加上 setTimeout ⭐
        // 延遲 50~100 毫秒，確保表單值已經完全寫入模型 (Model) 後，才執行查詢
        setTimeout(() => {
          console.log('延遲後執行自動查詢...');
          this.search();
        }, 100);
      } else {
        // 沒有 ID 參數，正常載入全部
        this.loadData();
      }
    });
  }

  // 5. 載入員工清單
  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => (this.employees = data),
      error: (err) => this.errorService.handle('無法載入業務員清單', err),
    });
  }

  // 處理業務員輸入與選取邏輯
  onEmployeeInput(event: any) {
    const val = event.target.value;
    this.searchKeyword = val; // 更新畫面顯示的文字

    // 在員工清單中尋找完全符合 "姓名 (ID)" 格式或直接符合 ID 的對象
    const selectedEmp = this.employees.find(
      (emp) => val === `${emp.name} (${emp.id})` || val === emp.id
    );

    if (selectedEmp) {
      // ⭐ 關鍵：選中後，將顯示文字格式化為 "姓名 (ID)"
      this.searchKeyword = `${selectedEmp.name} (${selectedEmp.id})`;
      // ⭐ 將真正的 ID 存入表單隱藏欄位中
      this.searchForm.get('salesEmployee')?.setValue(selectedEmp.id);
    } else {
      // 如果是手動輸入且未匹配，則視情況保留原始輸入或清空
      this.searchForm.get('salesEmployee')?.setValue(val);
    }
  }

  // 7. 重置時清空關鍵字
  showAll() {
    this.searchForm.reset();
    this.searchKeyword = ''; // 👈 清空顯示文字
    this.router.navigate([], { queryParams: {} });
    this.search();
  }

  loadLevels() {
    this.customerService.getLevels().subscribe({
      next: (data) => (this.levels = data),
      error: (err) => console.warn('無法載入等級', err),
    });
  }

  loadData() {
    // 1. 取得原始表單資料
    const rawCriteria = this.searchForm.getRawValue();

    // 2. ⭐ 關鍵修正：過濾掉空字串與 null 的欄位 ⭐
    const criteria: any = {};
    for (const key in rawCriteria) {
      const value = rawCriteria[key];
      // 只有當值 "存在" 且 "不是空字串" 時才加入查詢條件
      if (value !== null && value !== undefined && value !== '') {
        criteria[key] = value;
      }
    }

    // 3. 加入時間戳記 (保持你原本的邏輯)
    criteria._refresh = new Date().getTime();

    console.log('執行查詢，修正後的條件 (已移除空字串):', criteria);

    // 4. 發送請求
    this.customerService
      .getCustomers(
        this.currentPage - 1,
        this.pageSize,
        this.sortColumn,
        this.sortDirection,
        criteria
      )
      .subscribe({
        next: (res) => {
          console.log('API 回傳資料:', res); // 👈 建議加這行確認真的有收到

          this.pagedRecords = res.content || [];
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;

          if (!this.isSelectAllPages) {
            this.selectedIds.clear();
          }

          this.cdr.markForCheck();
        },
        error: (err) => this.errorService.handle('資料載入失敗', err),
      });
  }

  // ... (以下方法保持不變，直接沿用) ...

  navigateToAdd() {
    this.router.navigate(['/customers/add']);
  }
  navigateToEdit(id: string) {
    this.router.navigate(['/customers/edit', id]);
  }

  deleteById(id: string) {
    Swal.fire({
      title: '確定刪除?',
      text: `將刪除客戶 ${id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: '刪除',
    }).then((res) => {
      if (res.isConfirmed) {
        this.customerService.deleteCustomer(id).subscribe({
          next: () => {
            Swal.fire('已刪除', '', 'success');
            this.loadData();
          },
          error: (err) => this.errorService.handle('刪除失敗', err),
        });
      }
    });
  }

  deleteSelected() {
    Swal.fire({
      title: '確定批次刪除?',
      text: `此操作將永久刪除這 ${this.selectedIds.size} 筆資料！`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: '是的，刪除',
    }).then((result) => {
      if (result.isConfirmed) {
        // 如果是全選模式，傳送空陣列 (後端會知道要刪全部)，否則傳送 ID
        const idsToDelete = this.isSelectAllPages ? [] : Array.from(this.selectedIds);

        this.customerService.deleteBatch(idsToDelete).subscribe({
          next: () => {
            Swal.fire('已刪除！', '資料已成功移除。', 'success');
            this.selectedIds.clear();
            this.isSelectAllPages = false;
            this.loadData();
          },
          error: (err) => this.errorService.handle('批次刪除失敗', err),
        });
      }
    });
  }

  changeLevelSelected(newLevel: string) {
    if (!newLevel) {
      Swal.fire('提示', '請先選擇目標等級', 'info');
      return;
    }
    const criteria = this.isSelectAllPages ? this.searchForm.getRawValue() : null;
    const idsArray = this.isSelectAllPages ? [] : Array.from(this.selectedIds);
    this.customerService
      .updateLevelBatch(idsArray, newLevel, this.isSelectAllPages, criteria)
      .subscribe({
        next: () => {
          Swal.fire('成功', '等級更新成功', 'success');
          this.selectedIds.clear();
          this.isSelectAllPages = false;
          this.loadData();
        },
        error: (err) => this.errorService.handle('批次修改失敗', err),
      });
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.pagedRecords.forEach((r) => this.selectedIds.add(r.id));
    } else {
      this.selectedIds.clear();
      this.isSelectAllPages = false;
    }
  }

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
      this.isSelectAllPages = false;
    } else {
      this.selectedIds.add(id);
    }
  }

  selectAllTotal() {
    this.isSelectAllPages = true;
    // 視覺上也把當前頁面勾起來
    this.pagedRecords.forEach((r) => this.selectedIds.add(r.id));
  }

  exportData() {
    // 1. 先準備原本的搜尋條件 (作為預設值)
    let criteria: any = {};
    const rawCriteria = this.searchForm.getRawValue();

    // 過濾空值 (保留你原本的邏輯)
    for (const key in rawCriteria) {
      const value = rawCriteria[key];
      if (value !== null && value !== undefined && value !== '') {
        criteria[key] = value;
      }
    }

    // 2. ⭐ 新增判斷邏輯：處理勾選匯出 ⭐
    // 如果使用者有勾選 (selectedIds > 0)，且並非「全選所有頁面」
    if (this.selectedIds.size > 0 && !this.isSelectAllPages) {
      // 取得勾選的 ID 陣列
      const ids = Array.from(this.selectedIds);

      // 覆寫 criteria，只傳送 ids 給後端
      // (注意：你的後端 DTO 必須要能接收 'ids' 這個欄位)
      criteria = { ids: ids };

      console.log('匯出模式：僅匯出勾選的資料', criteria);
    } else {
      // 否則維持原樣 (匯出符合當前搜尋條件的所有資料)
      console.log('匯出模式：匯出搜尋結果', criteria);
    }

    Swal.fire({ title: '匯出中...', didOpen: () => Swal.showLoading() });

    // 3. 發送請求
    this.customerService.exportToExcel(criteria).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Customer_Report_${Date.now()}.xlsx`;
        a.click();
        Swal.close();
      },
      error: (err) => this.errorService.handle('匯出失敗', err),
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }
  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadData();
  }
  onSort(col: string) {
    if (this.sortColumn === col) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
    this.loadData();
  }

  search() {
    this.currentPage = 1;
    this.loadData();
  }
}
