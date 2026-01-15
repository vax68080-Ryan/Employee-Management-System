import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, CustomerRecord, CustomerLevel } from './customer.service';
import { EmployeeService, EmployeeRecord } from '../employee-form/employee.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-edit.html', // 確認這裡的檔名與您的 HTML 檔名一致
  styleUrls: ['./customer-form.css'],
})
export class CustomerEditComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  currentId: string | null = null;
  levels: CustomerLevel[] = [];
  employees: EmployeeRecord[] = [];
  searchKeyword: string = ''; // 1. 用於顯示的文字

constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private router: Router,
  private customerService: CustomerService,
  private employeeService: EmployeeService,
  private errorService: ErrorHandlerService
) {
  this.form = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.maxLength(50)]],
    company: ['', [Validators.required, Validators.maxLength(100)]], // ⭐ 改為必填
    salesEmployee: ['', [Validators.required]],
    level: ['', [Validators.required]], // ⭐ 改為必填
    lastContactDate: ['', [Validators.required]], // ⭐ 改為必填
    address: ['', [Validators.required, Validators.maxLength(200)]], // ⭐ 改為必填
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s-]{1,20}$/)]], // ⭐ 改為必填
    email: ['', [Validators.email]], // 保持選填，僅驗證格式
  });
}

  ngOnInit() {
    this.loadLevels();

    // 2. 先載入員工，完成後再載入客戶資料（確保姓名對應正確）
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.currentId = this.route.snapshot.paramMap.get('id');
        if (this.currentId) {
          this.isEditMode = true;
          this.loadCustomerData(this.currentId);
        }
      },
      error: (err) => this.errorService.handle('無法載入業務員清單', err),
    });
  }

  loadLevels() {
    this.customerService.getLevels().subscribe((data) => (this.levels = data));
  }

  loadCustomerData(id: string) {
    this.customerService.getCustomerById(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
        this.form.get('id')?.disable();

        // 3. ⭐ 將載入的 ID 轉換為 Datalist 顯示格式
        const foundEmp = this.employees.find((e) => e.id === data.salesEmployee);
        if (foundEmp) {
          this.searchKeyword = `${foundEmp.name} (${foundEmp.id})`;
        } else {
          this.searchKeyword = data.salesEmployee;
        }
      },
      error: (err) => this.errorService.handle('無法載入客戶資料', err),
    });
  }

onEmployeeInput(event: any) {
    // 1. 取得原始值，並徹底移除字串前後的空白（包含不可見字元）
    const val = event.target.value.trim();

    // 2. 優化正則表達式：移除結尾限制符 $，並允許括號前有或沒有空格
    // 這裡我們直接尋找括號內的內容
    const match = val.match(/\(([^)]+)\)/);

    if (match && match[1]) {
      const extractedId = match[1].trim(); // 取得 ID (例如: EMP00007)

      // 3. ⭐ 強制同步顯示文字與輸入框實體值為純 ID
      this.searchKeyword = extractedId;
      event.target.value = extractedId;

      // 4. ⭐ 更新表單控制項，確保傳給後端的是正確長度的 ID
      this.form.get('salesEmployee')?.setValue(extractedId);
      this.form.get('salesEmployee')?.setErrors(null);

      console.log('成功提取測試員 ID:', extractedId);
    } else {
      // 如果不是從下拉選單點選，保持現狀
      this.searchKeyword = val;
      this.form.get('salesEmployee')?.setValue(val);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Swal.fire('錯誤', '請檢查紅色必填欄位', 'error');
      return;
    }
    const formData = this.form.getRawValue();

    if (this.isEditMode) {
      this.customerService.updateCustomer(formData.id, formData).subscribe({
        // 更新成功，帶 ID 回列表
        next: () => Swal.fire('成功', '資料已更新', 'success').then(() => this.goBack(formData.id)),
        error: (err) => this.errorService.handle('更新失敗', err),
      });
    } else {
      this.customerService.addCustomer(formData).subscribe({
        // 新增成功，帶後端回傳的新 ID 回列表
        next: (res: any) =>
          Swal.fire('成功', '新增成功', 'success').then(() => this.goBack(res.id || formData.id)),
        error: (err) => this.errorService.handle('新增失敗', err),
      });
    }
  }

  deleteCustomer() {
    if (!this.currentId) return;
    Swal.fire({
      title: '確定刪除?',
      text: '此動作無法復原',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: '刪除',
    }).then((res) => {
      if (res.isConfirmed) {
        this.customerService.deleteCustomer(this.currentId!).subscribe({
          // 刪除後不需要帶 ID，直接回列表
          next: () => Swal.fire('已刪除', '', 'success').then(() => this.goBack()),
          error: (err) => this.errorService.handle('刪除失敗', err),
        });
      }
    });
  }

  // 接收選填的 targetId，如果有就帶在網址參數裡
  goBack(targetId?: string) {
    if (targetId) {
      this.router.navigate(['/customers'], { queryParams: { searchId: targetId } });
    } else {
      this.router.navigate(['/customers']);
    }
  }
}
