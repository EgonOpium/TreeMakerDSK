import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeMakingDialogComponent } from './tree-making-dialog.component';

describe('TreeMakingDialogComponent', () => {
  let component: TreeMakingDialogComponent;
  let fixture: ComponentFixture<TreeMakingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeMakingDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeMakingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
