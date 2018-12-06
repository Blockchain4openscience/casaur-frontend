import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueCertificateDialogComponent } from './issue-certificate-dialog.component';

describe('IssueCertificateDialogComponent', () => {
  let component: IssueCertificateDialogComponent;
  let fixture: ComponentFixture<IssueCertificateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueCertificateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueCertificateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
