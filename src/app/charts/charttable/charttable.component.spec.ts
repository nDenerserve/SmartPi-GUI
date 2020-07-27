import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharttableComponent } from './charttable.component';

describe('CharttableComponent', () => {
  let component: CharttableComponent;
  let fixture: ComponentFixture<CharttableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharttableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharttableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
