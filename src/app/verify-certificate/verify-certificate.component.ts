import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';
import {VerifyCertificateService} from './verify-certificate.service';
import {CertificateTemplateService} from '../CertificateTemplate/CertificateTemplate.service';
import {sha256} from '../shared/sha256'
import {PersonalCertificate} from '../org.degree';
import {AuthService} from '../auth/auth.service'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {CertificateTemplate} from '../org.degree';
import {MatDialog} from '@angular/material';
import { WarningDialogComponent } from './warning-dialog/warning-dialog.component';

declare var require: any;

var pdfmake = require('pdfmake/build/pdfmake.js');
var fonts = require('pdfmake/build/vfs_fonts.js');

pdfmake.vfs = fonts.pdfMake.vfs


@Component({
	selector: 'app-verify-certificate',
	templateUrl: './verify-certificate.component.html',
	styleUrls: ['./verify-certificate.component.css'],
	providers: [VerifyCertificateService, CertificateTemplateService]
})
export class VerifyCertificateComponent implements OnInit {

	myForm: FormGroup;
	errorMessage: string;
	successMessage: string;
	templateId: string;
	certificateTemplate: any

	private personalCertificateHistory: any[] = [];
	private administratorHistory: any[] = [];

	certId = new FormControl(null, Validators.required);
	email: string;

	currentCertId: string = null;
	personalCertificate: any;
	steps = [
		{
			name: 'Certificate Integrity',
			done: false,
			passed: false,
		},
		{
			name: 'Issuer Identity',
			done: false,
			passed: false,
		}
	];

	constructor(private verifyCertificateService: VerifyCertificateService,
				public createCertificateDialog: MatDialog,
				private loadingService: TdLoadingService,
				private certificateTemplateService: CertificateTemplateService,
				private authService: AuthService,
				private router: Router,
				public fb: FormBuilder) {
					this.myForm = fb.group({
					certId: this.certId
				});
	};

	async ngOnInit() {
		const isAuthenticated = await this.authService.isAuthenticated();
		const hasSignedUp = await this.authService.hasSignedUp();
		console.log(isAuthenticated, hasSignedUp);
		if (isAuthenticated && hasSignedUp){
			await this.authService.setCurrentUser();
		}
		if (isAuthenticated && !hasSignedUp) {
			  this.router.navigate(['/signup']);
		} else {
			  this.router.navigate(['/verify-certificate']);
		}
	}

	openWarningDialog(): void {			
		let dialogRef = this.createCertificateDialog.open(WarningDialogComponent, { 
			data: {Id: this.certId}
		});
		dialogRef.afterClosed().subscribe(result => {
			console.log(`Dialog closed: ${result}`);
			this.ngOnInit();
		});
	}

	/**
	 * Event handler for changing the checked state of a checkbox (handles array enumeration values)
	 * @param {String} name - the name of the transaction field to update
	 * @param {any} value - the enumeration value for which to toggle the checked state
	 */
	changeArrayValue(name: string, value: any): void {
		const index = this[name].value.indexOf(value);
		if (index === -1) {
			this[name].value.push(value);
		} else {
			this[name].value.splice(index, 1);
		}
	}

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
	 * only). This is used for checkboxes in the transaction updateDialog.
	 * @param {String} name - the name of the transaction field to check
	 * @param {any} value - the enumeration value to check for
	 * @return {Boolean} whether the specified transaction field contains the provided value
	 */
	hasArrayValue(name: string, value: any): boolean {
		return this[name].value.indexOf(value) !== -1;
	}

	submit(): void {
		this.successMessage = null;
		this.steps[0].passed = false;
		this.steps[0].done = false;
		this.steps[1].passed = false;
		this.steps[1].passed = false;
		if (this.myForm.valid) {
			this.registerLoading();
			this.personalCertificateHistory = [];
			this.verifyCertificateService.getAsset(this.certId.value).subscribe(
				(result) => {
					this.currentCertId = this.certId.value;
					this.personalCertificate = result;
					this.templateId = this.personalCertificate['templateId'];
					this.templateId = this.templateId.substring(this.templateId.indexOf("#") + 1, this.templateId.length);
					this.errorMessage = null;
					this.successMessage = null;
					this.verifyHash(result);
				},
				(error) => {
					if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					} else {
						//this.errorMessage = error;
						this.openWarningDialog();
					}
					this.resolveLoading();
				}, () => {
					
					const transaction = {
						$class: 'org.degree.PersonalCertificateHistory',
						'certId': this.certId.value
					};
					this.verifyCertificateService.requestPersonalCertificateHistory(transaction).subscribe(
						(data) => {
							console.log("Request Personal Certificate");
							console.log(data);
							this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
								async (results) => {
									this.errorMessage = null;
									results = results[0].eventsEmitted[0].results;
									for (let i = 0; i < results.length; i++) {
										let result = results[i].replace(/\\/g, " ");
										result = result.replace(/\"\{/g, "{");
										result = result.replace(/\}\"/g, "}");
										result = JSON.parse(result);
										
										const record = {
											historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
											value: result.value
										};
										this.personalCertificateHistory.push(record);
									}
								  console.log(this.personalCertificateHistory);	
								},
								(error) => {
									if (error === 'Server error') {
										this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
									} else {
										this.errorMessage = error;
									}
									this.resolveLoading();
								}
							);
						},
						(error) => {
							if (error === 'Server error') {
								this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
							} else {
								this.errorMessage = error;
							}
							this.resolveLoading();
						},
						() => {
							this.email =  this.personalCertificate.administrator;
							this.email = this.email.substring(this.email.indexOf('#') + 1, this.email.length);
							const transaction = {
								$class: 'org.degree.AdministratorHistory',
								'email': this.email
							};
							this.verifyCertificateService.requestAdministratorHistory(transaction).subscribe(
								(data) => {
									console.log("Administrator History");
									console.log(data);
									this.verifyCertificateService.getPersonalCertificateHistory(data.transactionId).subscribe(
										async (results) => {
											this.errorMessage = null;
											console.log("Administrator History Result");
											console.log(results);
											results = results[0].eventsEmitted[0].results;
											for (let i = 0; i < results.length; i++) {
												let result = results[i].replace(/\\/g, " ");
												result = result.replace(/\"\{/g, "{");
												result = result.replace(/\}\"/g, "}");
												result = JSON.parse(result);
												const record = {
													historianRecord: await this.verifyCertificateService.getHistorianRecord(result.tx_id),
													value: result.value
												};
												this.administratorHistory.push(record);
											}
											this.verifyIssuer();
											this.resolveLoading();
										},
										(error) => {
											if (error === 'Server error') {
												this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
											} else {
												this.errorMessage = error;
											}
											this.resolveLoading();
										}
									);
								},
								(error) => {
									if (error === 'Server error') {
										this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
									} else {
										this.errorMessage = error;
									}
									this.resolveLoading();
								});
						});						
				});
		} else {
			Object.keys(this.myForm.controls).forEach(field => {
				const control = this.myForm.get(field);
				control.markAsTouched({ onlySelf: true });
			});
		}
	}

	verifyIssuer(): Promise<void> {
		// issuer identity
		return new Promise (resolve => setTimeout(() => {
			this.steps[1].passed = this.personalCertificateHistory[0].historianRecord.transactionTimestamp
				>= this.administratorHistory[0].historianRecord.transactionTimestamp;
			this.steps[1].done = true;
		}, 2000));
	}

	verifyHash(certificate: PersonalCertificate): void {
		// certificate integrity
		const hash = certificate.hash;
		delete certificate.hash;
		setTimeout(() => {
			this.steps[0].passed = hash === sha256(JSON.stringify(certificate));
			this.steps[0].done = true;
		}, 2000);
	}

	registerLoading(key = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key = 'loading'): void {
		this.loadingService.resolve(key);
	}

	toDataURL(url, callback): void {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
		  var reader = new FileReader();
		  reader.onloadend = function() {
			callback(reader.result);
			}
		  reader.readAsDataURL(xhr.response);
		};
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	}

	viewPDF(): void{
		console.log('View PDF');
		this.verifyCertificateService.getCertificateTemplate(this.templateId).subscribe(
			(result) => {
				this.certificateTemplate = result;
				switch (this.certificateTemplate['badge']['id']) {
					// Conducta sin Antecedentes_Inactivo
					case 'Conducta sin Antecedentes_Inactivo':
					{
						let name = this.personalCertificateHistory[0]['value']['recipientProfile ']['name '];
						let legalid = this.personalCertificateHistory[0]['value']['recipientProfile ']['legalId '];
						let program = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['program '];
						let firtsdate = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['firtsDate '];
						let lastdate = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['lastDate '];
						let description = this.certificateTemplate['badge']['description'];
						// for placeholders in this format: $placeholder$, uncomment
						// description = description.replace(/ \$/g, " ${");
						// description = description.replace(/\$ /g,"} ");
						// description = description.replace(/\$\,/g,"},");
						// description = description.replace(/\$\./g,"}.");
						// console.log(description);
										
						let today = new Date();
						let day = today.getDate();
						let month = today.getMonth();
						let year = today.getFullYear();

						var monthNames = [
							"Enero", "Febrero", "Marzo",
							"Abril", "Mayo", "Junio", "Julio",
							"Agosto", "Septiembre", "Octubre",
							"Noviembre", "Diciembre"
						];

						let timestamp = day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						firtsdate = firtsdate.replace(".000Z ","Z");
						let date = new Date(firtsdate);
						console.log('Date:'+ date);
						day = date.getDate();
						month = date.getMonth();
						year = date.getFullYear();
						
						firtsdate = 'el ' + day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						
						lastdate = lastdate.replace(".000Z ","Z");
						date = new Date(lastdate);
						day = date.getDate();
						month = date.getMonth();
						year = date.getFullYear();
						
						lastdate = 'el ' + day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						
						let criteria = this.certificateTemplate['badge']['criteria'];
						// for placeholders in this format: $placeholder$, uncomment
						// criteria = criteria.replace(/ \$/g, " ${");
						// criteria = criteria.replace(/\$ /g,"} ");
						// criteria = criteria.replace(/\$\,/g,"},");
						// criteria = criteria.replace(/\$\./g,"}.");
						// console.log(criteria);
						description=description.replace(/\${name}/,name);
						description = eval('`'+description+'`');
						criteria = eval('`'+criteria+'`');

						this.toDataURL(this.certificateTemplate['badge']['issuer']['image'], (dataURL) => {
							//console.log(dataURL);
							this.toDataURL(this.certificateTemplate['badge']['issuer']['signatureLines']['image'], (dataURL2) => {
								//console.log(dataURL2);
								var docDefinition = {
									content: [
										{
											image: dataURL,
											width: 150,
											alignment: 'right'
										},
										{	
											text: this.certificateTemplate['badge']['issuer']['name'].toUpperCase(),
											style: 'header',
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['menid'],
											fontSize: 8,
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['id'],
											alignment: 'center'
										},
										'\n\n',
										{
											text: this.certificateTemplate['badge']['name'].toUpperCase()+':',
											bold: true,
											alignment: 'center'
										},
										'\n\n\n\n',
										{
											text: description,
											alignment: 'justify'
										},
										'\n',
										{
											text: criteria,
											alignment: 'justify'
										},
										'\n\n\n\n',
										{
											image: dataURL2,
											width: 100,
											height: 40,
											alignment: 'left'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['name'],
											bold: true
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['jobtitle'],
											bold: true
										}
									],
									styles: {
										header: {
											fontSize: 18,
											bold: true,
											alignment: 'justify'
										}
									}
								};
								var win = window.open('', '_blank');
								pdfmake.createPdf(docDefinition).open({}, win);
							});	
						});
					}
					break;
					case 'Tercera Lengua (certifica cumplimiento del requisito)':
					{
						let name = this.personalCertificateHistory[0]['value']['recipientProfile ']['name '];
						let legalid = this.personalCertificateHistory[0]['value']['recipientProfile ']['legalId '];
						let program = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['program '];
						let opcion = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['language ']['option '];
						let idiomareq = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['language ']['languageReq '];
						let description = this.certificateTemplate['badge']['description'];

						if(opcion==true)
						{
							opcion='2';
						}
						else
						{
							opcion='1';
						}
										
						let today = new Date();
						let day = today.getDate();
						let month = today.getMonth();
						let year = today.getFullYear();

						var monthNames = [
							"Enero", "Febrero", "Marzo",
							"Abril", "Mayo", "Junio", "Julio",
							"Agosto", "Septiembre", "Octubre",
							"Noviembre", "Diciembre"
						];

						let timestamp = day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						
						let criteria = this.certificateTemplate['badge']['criteria'];
						
						description=description.replace(/\${name}/,name);
						description = eval('`'+description+'`');
						criteria = eval('`'+criteria+'`');

						this.toDataURL(this.certificateTemplate['badge']['issuer']['image'], (dataURL) => {
							//console.log(dataURL);
							this.toDataURL(this.certificateTemplate['badge']['issuer']['signatureLines']['image'], (dataURL2) => {
								//console.log(dataURL2);
								var docDefinition = {
									content: [
										{
											image: dataURL,
											width: 150,
											alignment: 'right'
										},
										{	
											text: this.certificateTemplate['badge']['issuer']['name'].toUpperCase(),
											style: 'header',
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['menid'],
											fontSize: 8,
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['id'],
											alignment: 'center'
										},
										'\n\n',
										{
											text: this.certificateTemplate['badge']['name'].toUpperCase()+':',
											bold: true,
											alignment: 'center'
										},
										'\n\n\n\n',
										{
											text: description,
											alignment: 'justify'
										},
										'\n',
										{
											text: criteria,
											alignment: 'justify'
										},
										'\n\n\n\n',
										{
											image: dataURL2,
											width: 100,
											height: 40,
											alignment: 'left'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['name'],
											bold: true
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['jobtitle'],
											bold: true
										}
									],
									styles: {
										header: {
											fontSize: 18,
											bold: true,
											alignment: 'justify'
										}
									}
								};
								var win = window.open('', '_blank');
								pdfmake.createPdf(docDefinition).open({}, win);
							});	
						});
					}
					break;
					// Conducta con Antecedentes_Activo
					case 'Conducta con Antecedentes_Activo':
					{
						let name = this.personalCertificateHistory[0]['value']['recipientProfile ']['name '];
						let legalid = this.personalCertificateHistory[0]['value']['recipientProfile ']['legalId '];
						let program = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['program '];
						let sanction = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['sanction '];
						let periods = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['periods '];
						let firstdate = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['firtsDate '];
						let fault = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['fault ']
						let faultdate = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['faultDate ']
						let processid = this.personalCertificateHistory[0]['value']['recipientProfile ']['assertions ']['discipline ']['processId ']
						let description = this.certificateTemplate['badge']['description'];

						let today = new Date();
						let day = today.getDate();
						let month = today.getMonth();
						let year = today.getFullYear();

						var monthNames = [
							"Enero", "Febrero", "Marzo",
							"Abril", "Mayo", "Junio", "Julio",
							"Agosto", "Septiembre", "Octubre",
							"Noviembre", "Diciembre"
						];

						let timestamp = day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();

						firstdate = firstdate.replace(".000Z ","Z");
						let date = new Date(firstdate);
						console.log('Date:'+ date);
						day = date.getDate();
						month = date.getMonth();
						year = date.getFullYear();
						
						firstdate = 'el ' + day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						
						faultdate = faultdate.replace(".000Z ","Z");
						date = new Date(faultdate);
						day = date.getDate();
						month = date.getMonth();
						year = date.getFullYear();
						
						faultdate = 'el ' + day.toString() + ' de ' + monthNames[month] + ' de ' + year.toString();
						
						let criteria = this.certificateTemplate['badge']['criteria'];
						
						description=description.replace(/\${name}/,name);
						description = eval('`'+description+'`');
						criteria = eval('`'+criteria+'`');

						this.toDataURL(this.certificateTemplate['badge']['issuer']['image'], (dataURL) => {
							//console.log(dataURL);
							this.toDataURL(this.certificateTemplate['badge']['issuer']['signatureLines']['image'], (dataURL2) => {
								//console.log(dataURL2);
								var docDefinition = {
									content: [
										{
											image: dataURL,
											width: 150,
											alignment: 'right'
										},
										{	
											text: this.certificateTemplate['badge']['issuer']['name'].toUpperCase(),
											style: 'header',
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['menid'],
											fontSize: 8,
											alignment: 'center'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['id'],
											alignment: 'center'
										},
										'\n\n',
										{
											text: this.certificateTemplate['badge']['name'].toUpperCase()+':',
											bold: true,
											alignment: 'center'
										},
										'\n\n\n\n',
										{
											text: description,
											alignment: 'justify'
										},
										'\n',
										{
											text: criteria,
											alignment: 'justify'
										},
										'\n\n\n\n',
										{
											image: dataURL2,
											width: 100,
											height: 40,
											alignment: 'left'
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['name'],
											bold: true
										},
										{
											text: this.certificateTemplate['badge']['issuer']['signatureLines']['jobtitle'],
											bold: true
										}
									],
									styles: {
										header: {
											fontSize: 18,
											bold: true,
											alignment: 'justify'
										}
									}
								};
								var win = window.open('', '_blank');
								pdfmake.createPdf(docDefinition).open({}, win);
							});	
						});
					}
					break;
				}
				
											
			},
			(error) => {
				if (error === 'Server error') {
					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
				} else {
					this.errorMessage = error;
				}
			});
	}

}
