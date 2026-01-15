import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 為了做「返回」按鈕
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { EmployeeService } from '../employee-form/employee.service';

@Component({
  selector: 'app-department-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  // 樣式直接寫在這裡，或寫在 css 檔皆可
  templateUrl: './department-stats.html',
  styles: [
    `
      .chart-container {
        width: 95%; /* 👈 改成 95%，讓它佔據更多螢幕寬度 */
        max-width: 1400px; /* 👈 最大寬度放寬到 1400px (原本 800px) */
        height: 600px; /* 👈 直接指定高度，讓圖表變高 */
        margin: 30px auto;
        display: block;
      }
      .back-btn {
        margin: 20px;
        padding: 10px 20px; /* 按鈕也稍微變大一點 */
        font-size: 16px; /* 按鈕字體變大 */
        cursor: pointer;
      }
    `,
  ],
})
export class DepartmentStatsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // 圖表設定 (從原檔案搬過來)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // 👈 重要：設為 false，圖表才會聽 CSS 的 height 設定 (不然會被寬度綁死)
    scales: {
      x: {
        ticks: {
          font: {
            size: 18, // 👈 X軸 (部門名稱) 字體大小
            weight: 'bold', // 也可以加粗
          },
        },
      },
      y: {
        min: 0,
        ticks: {
          stepSize: 1,
          font: {
            size: 16, // 👈 Y軸 (數字) 字體大小
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 20, // 👈 上方圖例 (Legend) 字體大小
          },
        },
      },
      // 如果你想讓滑鼠移上去的提示框 (Tooltip) 字也變大
      tooltip: {
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 18,
        },
      },
    },
  };

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: '部門人數', backgroundColor: '#42A5F5' }],
  };

  constructor(private EmployeeService: EmployeeService, private router: Router) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.EmployeeService.getStats().subscribe({
      next: (stats) => {
        console.log('後端回傳統計資料:', stats);

        if (!stats || stats.length === 0) {
          console.warn('沒有資料！');
          return;
        }

        // 1. 處理資料 (順便處理 department 為 null 的狀況)
        const labels = stats.map((s) => s.department || '未分配');
        const data = stats.map((s) => s.count);

        // ❌ 原本寫法 (不要這樣寫，會斷開連結)：
        // this.barChartData = { labels: labels, datasets: [...] };

        // ✅ 正確寫法 (修改現有物件的屬性)：
        if (this.barChartData.datasets.length > 0) {
          this.barChartData.labels = labels;
          this.barChartData.datasets[0].data = data;
        }

        // 3. 告訴圖表更新
        this.chart?.update();
      },
      error: (err) => console.error('載入統計失敗', err),
    });
  }

  goBack() {
    this.router.navigate(['/Employee']);// 假設首頁路徑是 '/'，請依實際情況調整
  }
}
