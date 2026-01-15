import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { EmployeeService, EmployeeRecord, Department } from './employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
// 👇 1. 引入 ErrorHandlerService
import { ErrorHandlerService } from '../shared/error-handler.service'; // 請確認路徑

@Component({
  selector: 'app-employee-form',
  standalone: true,
  templateUrl: './employee-form.html',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styleUrls: ['./employee-form.css'],
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup;
  pagedRecords: EmployeeRecord[] = [];
  departments: Department[] = [];
  // ... 其他變數
  pageSize = 3;
  currentPage = 1;
  totalPages = 1;
  totalElements = 0;
  sortColumn = 'id';
  sortDirection = 'asc';
  editingId: string | null = null;
  isSearchMode = false;
  userLevel: number = 2;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    // 👇 2. 注入 ErrorHandlerService
    private errorService: ErrorHandlerService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      password: [''],
      level: [2, [Validators.required]],
      hireDate: ['', [Validators.required]],
      department: ['', [Validators.required]],
      address: ['', [Validators.maxLength(200)]],
      phone: ['', [Validators.pattern(/^[+]?[\d\s-]{1,20}$/)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
    });
  }

  ngOnInit() {
    const storedLevel = localStorage.getItem('userLevel');
    this.userLevel = storedLevel ? parseInt(storedLevel) : 2;
    this.load();
    this.loadDepartments();
    // ... route params 邏輯不變
    this.route.queryParams.subscribe((params) => {
      const targetId = params['id'];
      if (targetId) {
        this.form.patchValue({ id: targetId });
        setTimeout(() => {
          this.currentPage = 1;
          this.search();
          this.cdr.detectChanges();
        }, 100);
      }
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data) => (this.departments = data),
      // 👇 改用 errorService
      error: (err) => this.errorService.handle('部門資料載入失敗', err),
    });
  }

  load() {
    const criteria = this.form.getRawValue();
    (criteria as any)._refresh = new Date().getTime();
    this.employeeService
      .getEmployees(
        this.currentPage - 1,
        this.pageSize,
        this.sortColumn,
        this.sortDirection,
        criteria
      )
      .subscribe({
        next: (res) => {
          this.pagedRecords = res.content || [];
          this.totalElements = res.totalElements;
          this.totalPages = res.totalPages;
          const hasCriteria = Object.values(criteria).some((val) => !!val);
          this.isSearchMode = hasCriteria && !this.editingId;
          this.cdr.detectChanges();
        },
        // 👇 改用 errorService (取代原本的 alert 和 403 檢查)
        error: (err) => this.errorService.handle('資料載入失敗', err),
      });
  }

  submit() {
    // 👇 關鍵：不使用 this.userLevel，直接從瀏覽器倉庫拿最新的資料！
    const currentLevel = Number(localStorage.getItem('userLevel'));

    // (選用) 再次確認
    console.log(`[即時檢查] LocalStorage: ${currentLevel}, 記憶體: ${this.userLevel}`);

    if (currentLevel !== 1) {
      this.showToast('權限不足：只有最高管理員可編輯資料', 'error');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showToast('表單資料有誤，請檢查紅色欄位', 'error');
      return;
    }
    const formData = this.form.getRawValue();

    if (this.editingId) {
      this.employeeService.updateEmployee(formData.id, formData).subscribe({
        next: () => {
          this.showToast('更新成功！', 'success');
          this.editingId = null;
          this.form.get('id')?.enable();
          this.showAll();
        },
        // 👇 改用 errorService
        error: (err) => this.errorService.handle('更新失敗', err),
      });
    } else {
      if (!formData.password) {
        this.showToast('新增員工必須設定初始密碼', 'error');
        return;
      }
      this.employeeService.addEmployee(formData).subscribe({
        next: () => {
          this.showToast('新增成功！', 'success');
          this.showAll();
        },
        // 👇 改用 errorService
        error: (err) => this.errorService.handle('新增失敗', err),
      });
    }
  }

  startEdit(r: any) {
    // 👇 關鍵：不使用 this.userLevel，直接從瀏覽器倉庫拿最新的資料！
    const currentLevel = Number(localStorage.getItem('userLevel'));

    // (選用) 再次確認
    console.log(`[即時檢查] LocalStorage: ${currentLevel}, 記憶體: ${this.userLevel}`);

    if (currentLevel !== 1) {
      this.showToast('權限不足', 'error');
      return;
    }
    this.editingId = r.id;
    this.form.patchValue(r);
    this.form.get('id')?.disable();
    this.form.get('password')?.setValue('');
    this.pagedRecords = [r];
    this.totalPages = 1;
  }

  deleteById(id: string) {
    // 👇 關鍵：不使用 this.userLevel，直接從瀏覽器倉庫拿最新的資料！
    const currentLevel = Number(localStorage.getItem('userLevel'));

    // (選用) 再次確認
    console.log(`[即時檢查] LocalStorage: ${currentLevel}, 記憶體: ${this.userLevel}`);

    if (currentLevel !== 1) {
      this.showToast('權限不足：無法刪除資料', 'error');
      return;
    }
    Swal.fire({
      title: '確定要刪除嗎？',
      text: `您即將刪除 ID: ${id}，此動作無法復原！`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: '是的，刪除它！',
      cancelButtonText: '取消',
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            Swal.fire('已刪除!', '該筆資料已成功移除。', 'success');
            this.load();
          },
          // 👇 改用 errorService
          error: (err) => this.errorService.handle('刪除失敗', err),
        });
      }
    });
  }

  // ... (其餘輔助方法保持不變) ...
  search() {
    const criteria = this.form.getRawValue();
    const hasCriteria = Object.values(criteria).some((val) => !!val);
    if (!hasCriteria) {
      this.showToast('請輸入查詢條件！', 'error');
      this.showAll();
      return;
    }
    this.currentPage = 1;
    this.load();
  }
  showAll() {
    this.form.reset({ level: 2 });
    this.form.get('id')?.enable();
    this.editingId = null;
    this.currentPage = 1;
    this.isSearchMode = false;
    this.load();
  }
  onSort(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.load();
  }
  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.load();
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.load();
    }
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.load();
    }
  }
  exportData() {
    const criteria = this.form.getRawValue();
    this.employeeService.exportToExcel(criteria).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `員工資料表_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showToast('匯出成功！', 'success');
      },
      // 👇 改用 errorService
      error: (err) => this.errorService.handle('匯出失敗', err),
    });
  }
  goToStats() {
    this.router.navigate(['/stats']);
  }
  cancelEdit() {
    this.editingId = null;
    this.form.reset({ level: 2 });
    this.form.get('id')?.enable();
    this.load();
  }
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toastMessage = null), 3000);
  }
}
