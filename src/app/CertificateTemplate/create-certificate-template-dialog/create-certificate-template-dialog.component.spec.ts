import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCertificateTemplateDialogComponent } from './create-certificate-template-dialog.component';

describe('CreateCertificateTemplateDialogComponent', () => {
  let component: CreateCertificateTemplateDialogComponent;
  let fixture: ComponentFixture<CreateCertificateTemplateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCertificateTemplateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCertificateTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
