import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {AuthService} from "../../auth/auth.service";
import {IssueCertificateDialogService} from './issue-certificate-dialog.service';
//require('pdfmake');

@Component({
  selector: 'app-issue-certificate-dialog',
  templateUrl: './issue-certificate-dialog.component.html',
  styleUrls: ['./issue-certificate-dialog.component.css'],
  providers: [IssueCertificateDialogService]
})
export class IssueCertificateDialogComponent implements OnInit {

	issueCertificateForm: FormGroup;
	certID = new FormControl(null, Validators.required);
	administrator = new FormControl(this.authService.currentUser.email, Validators.required);
	
	recipientForm: FormGroup;
	recipientName = new FormControl(null, Validators.required);
	recipientEmail = new FormControl(null, Validators.required);
	recipientPK = new FormControl(null, Validators.required);
	recipientID = new FormControl(null, Validators.required);
	recipientProgram = new FormControl(null, Validators.required);
	firstDate = new FormControl(null);
	lastDate = new FormControl(null);

	option = new FormControl(null);
	langreq = new FormControl(null);
	langlev = new FormControl(null);
	sanction = new FormControl(null);
	periods = new FormControl(null);
	fault = new FormControl(null);
	initdate = new FormControl(null);
	faultdate = new FormControl(null);
	processId = new FormControl(null);


	private Transaction;
	private errorMessage;
	private succesMessage;

	constructor(private serviceIssueCertificateDialog: IssueCertificateDialogService,
							private loadingService: TdLoadingService,
							private authService: AuthService,
							@Inject(FormBuilder) fb: FormBuilder,
							public dialogRef: MatDialogRef<IssueCertificateDialogComponent>,
							@Inject(MAT_DIALOG_DATA) public data) {
		
		this.recipientForm = fb.group({
			name: this.recipientName,
			email: this.recipientEmail,
			publicKey: this.recipientPK,
			recipientID: this.recipientID,
			program: this.recipientProgram,
			firstDate: this.firstDate,
			lastDate: this.lastDate,
			option: this.option,
			langreq: this.langreq,
			langlev: this.langlev,
			sanction: this.sanction,
			periods: this.periods,
			fault: this.fault,
			initdate: this.initdate,
			faultdate: this.faultdate,
			processId: this.processId
		});

		this.issueCertificateForm = fb.group({
			certID: this.certID,
			administrator: this.administrator,
			recipient: this.recipientForm
		});
		this.administrator.disable();
	};

  ngOnInit() { }

	addAsset(): void {
		if (this.issueCertificateForm.valid) {
			let recipientInfo={};
			switch (this.data.certType) {
				case 'ParticipacionPrograma':
				{
					recipientInfo = {
						certId: this.certID.value,
						recipient: {
							email: this.recipientEmail.value,
						},
						recipientProfile: {
							name: this.recipientName.value,
							publicKey: this.recipientPK.value,
							legalId: this.recipientID.value,
							assertions: {
								program: this.recipientProgram.value,
								firtsDate: this.firstDate.value,
								lastDate: this.lastDate.value
							}
						}
					};
				}
				break;
				case 'RequisitoIdioma':
				{
					recipientInfo = {
						certId: this.certID.value,
						recipient: {
							email: this.recipientEmail.value,
						},
						recipientProfile: {
							name: this.recipientName.value,
							publicKey: this.recipientPK.value,
							legalId: this.recipientID.value,
							assertions: {
								program: this.recipientProgram.value,
								language: {
									option: this.option.value,
									languageReq: this.langreq.value,
									englishReq: this.langlev.value
								}
							}
						}
					};
				}
				break;
				case 'SancionDisciplinaria':
				{
					recipientInfo = {
						certId: this.certID.value,
						recipient: {
							email: this.recipientEmail.value,
						},
						recipientProfile: {
							name: this.recipientName.value,
							publicKey: this.recipientPK.value,
							legalId: this.recipientID.value,
							assertions: {
								program: this.recipientProgram.value,
								discipline: {
									sanction: this.sanction.value,
									periods: this.periods.value,
									fault: this.fault.value,
									firtsDate: this.initdate.value,
									faultDate: this.faultdate.value,
									processId: this.processId.value
								  }
							}
						}
					};
				}
				break;
			}
			this.Transaction = {
				$class: "org.degree.PersonalizeCertificate",
				'templateId': this.data.tempId,
				'administrator': this.administrator.value,
				'recipientsInfo': recipientInfo
			};
			this.registerLoading();
			this.serviceIssueCertificateDialog.addTransaction(this.Transaction)
				.subscribe(() => {
					this.errorMessage = null;
					this.resolveLoading();
					this.closeDialog({update: true});
				}, (error) => {
					if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					} else {
						this.errorMessage = error;
					}
					this.resolveLoading();
				});
		} else {
			Object.keys(this.issueCertificateForm.controls).forEach(field => {
				const control = this.issueCertificateForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
			Object.keys(this.recipientForm.controls).forEach(field => {
				const control = this.recipientForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
		}
	}

	closeDialog(data = { update: false }): void {
		this.dialogRef.close(data);
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}

}
