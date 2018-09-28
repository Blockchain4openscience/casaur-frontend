/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Directive, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {AddRosterService} from './AddRoster.service';
import {TdLoadingService} from '@covalent/core';
import * as csv from 'papaparse';
import {AuthService} from "../auth/auth.service";
import {Router} from '@angular/router';

@Component({
	selector: 'app-add-roster',
	templateUrl: './AddRoster.component.html',
	styleUrls: ['./AddRoster.component.css'],
	providers: [AddRosterService]
})
export class AddRosterComponent implements OnInit {

	myForm: FormGroup;
	templateId = new FormControl(null, Validators.required);
	administrator = new FormControl(null, Validators.required);
	certificateType = new FormControl(null, Validators.required);
	rosterFile = new FormControl(null, [Validators.required, this.fileTypeValidator()]);

	file: File;

	private Transaction;
	private errorMessage;
	private successMessage;

	constructor(private serviceAddRoster: AddRosterService,
							private loadingService: TdLoadingService,
							private authService: AuthService,
							private router: Router,
							fb: FormBuilder) {
		this.myForm = fb.group({
			templateId: this.templateId,
			administrator: this.administrator,
			certificateType: this.certificateType,
			rosterFile: this.rosterFile
		});
		this.administrator.disable();
	};

	async ngOnInit() {
		const isAuthenticated = await this.authService.isAuthenticated();
		const hasSignedUp = await this.authService.hasSignedUp();
		console.log(isAuthenticated, hasSignedUp);
		if (isAuthenticated && hasSignedUp){
			await this.authService.setCurrentUser();
			this.administrator.setValue(this.authService.currentUser.email);
		} else if (isAuthenticated && !hasSignedUp) {
				this.router.navigate(['/signup']);
		} else {
				this.router.navigate(['/verify-certificate']);
		}
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

	async submit(): Promise<any> {
		let successfulParse = true;
		this.errorMessage = null;
		this.successMessage = null;
		if (this.myForm.valid) {
			this.registerLoading();
			this.Transaction = {
				$class: 'org.degree.AddRoster',
				'templateId': this.templateId.value,
				'administrator': this.authService.currentUser.email,
				'recipientsInfo': await this.parseRosterFile(this.rosterFile.value)
					.catch((error) => {
						this.errorMessage = error;
						successfulParse = false;
					})
			};

			console.log(this.Transaction.recipientsInfo);

			if (successfulParse)
			{
				this.serviceAddRoster.addTransaction(this.Transaction)
					.subscribe(() => {
						this.errorMessage = null;
						this.myForm.reset();
						this.rosterFile.markAsUntouched();
						this.rosterFile.markAsPristine();
						this.successMessage = `Successfully issued ${this.Transaction.recipientsInfo.length} certificate(s)`;
						this.resolveLoading();
					}, (error) => {
						if (error === 'Server error') {
							this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
						} else {
							this.errorMessage = error;
						}
						this.resolveLoading();
					});
			} else {
				this.resolveLoading();
			}
		} else {
			Object.keys(this.myForm.controls).forEach(field => {
				const control = this.myForm.get(field);
				control.markAsTouched({ onlySelf: true });
				// console.log(field, control.errors);
			});
		}
	}

	parseRosterFile(file: File): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			csv.parse(file, {
				complete: (results, f) => {
					const data = results.data;
					const recipientsInfo = [];
					switch (this.certificateType.value) {
						case 'ParticipacionPrograma':
						{
							for (let i = 0; i < data.length; i++) {
								if (data[i].length === 8) {
									const recpientInfo = {
										certId: data[i][0],
										recipient: {
											email: data[i][1],
										},
										recipientProfile: {
											name: data[i][2],
											publicKey: data[i][3],
											legalId: data[i][4],
											assertions: {
												program: data[i][5],
												firtsDate: data[i][6],
												lastDate: data[i][7]
											}
										}
									};
									recipientsInfo.push(recpientInfo);
								} else {
									reject(new Error('Malformed CSV file.'));
								}
							}
						}
						break;

						case 'RequisitoIdioma':
						{
							for (let i = 0; i < data.length; i++) {
								if (data[i].length === 9) {
									const recpientInfo = {
										certId: data[i][0],
										recipient: {
											email: data[i][1],
										},
										recipientProfile: {
											name: data[i][2],
											publicKey: data[i][3],
											legalId: data[i][4],
											assertions: {
												program: data[i][5],
												language: {
													option: data[i][6],
													languageReq: data[i][7],
													englishReq: data[i][8]
												}
											}
										}
									};
									recipientsInfo.push(recpientInfo);
								} else {
									reject(new Error('Malformed CSV file.'));
								}
							}
						}
						break;

						case 'SancionDisciplinaria':
						{
							for (let i = 0; i < data.length; i++) {
								if (data[i].length === 12) {
									const recpientInfo = {
										certId: data[i][0],
										recipient: {
											email: data[i][1],
										},
										recipientProfile: {
											name: data[i][2],
											publicKey: data[i][3],
											legalId: data[i][4],
											assertions: {
												program: data[i][5],
												discipline: {
													sanction: data[i][6],
													periods: data[i][7],
													fault: data[i][8],
													firtsDate: data[i][9],
													faultDate: data[i][10],
													processId: data[i][11]
												}
											}
										}
									};
									recipientsInfo.push(recpientInfo);
								} else {
									reject(new Error('Malformed CSV file.'));
								}
							}
						}
						break;
					}
					resolve(recipientsInfo);
				},
				error: (error, f) => {
					reject(error);
				},
				skipEmptyLines: true
			});
		});
	}

	fileTypeValidator(): ValidatorFn {
		return (control: AbstractControl): {[key: string]: any} | null => {
			if (control.value instanceof File) {
				console.log(control.value.type);
				if (control.value.type !== 'text/csv') {
					return { 'forbiddenType': { value: control.value } };
				}
			}
			return null;
		};
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}
}

