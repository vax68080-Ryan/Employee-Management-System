import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentStats } from './department-stats';

describe('DepartmentStats', () => {
  let component: DepartmentStats;
  let fixture: ComponentFixture<DepartmentStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentStats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
