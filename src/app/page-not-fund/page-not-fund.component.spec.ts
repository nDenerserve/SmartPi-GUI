import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNotFundComponent } from './page-not-fund.component';

describe('PageNotFundComponent', () => {
  let component: PageNotFundComponent;
  let fixture: ComponentFixture<PageNotFundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageNotFundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNotFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
