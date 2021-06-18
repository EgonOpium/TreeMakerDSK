import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeMakingComponent } from './tree-making.component';

describe('TreeMakingComponent', () => {
  let component: TreeMakingComponent;
  let fixture: ComponentFixture<TreeMakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeMakingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeMakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
