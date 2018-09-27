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

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CertificateTemplateService} from './CertificateTemplate.service';
import {MatDialog} from '@angular/material';
import {TdLoadingService} from '@covalent/core';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';
import {CreateCertificateTemplateDialogComponent} from './create-certificate-template-dialog/create-certificate-template-dialog.component';

@Component({
	selector: 'app-certificate-template',
	templateUrl: './CertificateTemplate.component.html',
	styleUrls: ['./CertificateTemplate.component.css'],
	providers: [CertificateTemplateService]
})
export class CertificateTemplateComponent implements OnInit {
	displayedColumns = ['templateId', 'administrator', 'badge', 'actions'];


	private allAssets;
	private currentId;
	private errorMessage;

	constructor(private serviceCertificateTemplate: CertificateTemplateService,
				private loadingService: TdLoadingService,
				public createAssetDialog: MatDialog,
				public updateAssetDialog: MatDialog,
				public deleteAssetDialog: MatDialog,
				private authService: AuthService,
				private router: Router) {
	};

	async ngOnInit() {
		const isAuthenticated = await this.authService.isAuthenticated();
		const hasSignedUp = await this.authService.hasSignedUp();
		console.log(isAuthenticated, hasSignedUp);
		if (isAuthenticated && hasSignedUp){
			await this.authService.setCurrentUser();
		}
		else if (isAuthenticated && !hasSignedUp) {
			  this.router.navigate(['/signup']);
		} else {
			  this.router.navigate(['/verify-certificate']);
		}
		this.loadAll();
	}

	loadAll(): void {
		const tempList = [];
		this.serviceCertificateTemplate.getAll()
			.subscribe((result) => {
				this.errorMessage = null;
				result.forEach(asset => {
					tempList.push(asset);
				});
				this.allAssets = tempList;
			}, (error) => {
				if (error === 'Server error') {
					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
				}	else if (error === '404 - Not Found') {
					this.errorMessage = '404 - Could not find API route. Please check your available APIs.'
				}	else {
					this.errorMessage = error;
				}
			});
	}

	/**
	 * Event handler for changing the checked state of a checkbox (handles array enumeration values)
	 * @param {String} name - the name of the asset field to update
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
	 * only). This is used for checkboxes in the asset updateDialog.
	 * @param {String} name - the name of the asset field to check
	 * @param {any} value - the enumeration value to check for
	 * @return {Boolean} whether the specified asset field contains the provided value
	 */
	hasArrayValue(name: string, value: any): boolean {
		return this[name].value.indexOf(value) !== -1;
	}

	// updateAsset(form: any): void {
	// 	this.asset = {
	// 		$class: 'org.degree.CertificateTemplate',
	// 		'administrator': this.administrator.value,
	// 		// 'typeC': this.typeC.value,
	// 		'badge': this.badgeForm.value,
	// 		// 'context': this.context.value,
	// 		// 'revoked': this.revoked.value
	// 	};
	//
	// 	this.serviceCertificateTemplate.updateAsset(form.get('templateId').value, this.asset)
	// 		.subscribe(
	// 			() => {
	// 				this.errorMessage = null;
	// 			},
	// 			(error) => {
	// 				if (error === 'Server error') {
	// 					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
	// 				}	else if (error === '404 - Not Found') {
	// 					this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
	// 				} else {
	// 					this.errorMessage = error;
	// 				}
	// 			});
	// }
	//
	// deleteAsset(): void {
	// 	this.serviceCertificateTemplate.deleteAsset(this.currentId)
	// 		.subscribe(
	// 			() => {
	// 				this.errorMessage = null;
	// 			},
	// 			(error) => {
	// 				if (error === 'Server error') {
	// 					this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
	// 				}	else if (error === '404 - Not Found') {
	// 					this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
	// 				}	else {
	// 					this.errorMessage = error;
	// 				}
	// 			});
	// }
	//
	// setId(id: any): void {
	// 	this.currentId = id;
	// }
	//
	// getForm(id: any): void {
	//
	// 	this.serviceCertificateTemplate.getAsset(id)
	// 		.subscribe(
	// 			(result) => {
	// 			this.errorMessage = null;
	// 			const formObject = {
	// 				'templateId': null,
	// 				'administrator': null,
	// 				// 'typeC': null,
	// 				'badge': null,
	// 				// 'context': null,
	// 				// 'revoked': null
	// 			};
	//
	// 			if (result.templateId) {
	// 				formObject.templateId = result.templateId;
	// 			} else {
	// 				formObject.templateId = null;
	// 			}
	//
	// 			if (result.administrator) {
	// 				formObject.administrator = result.administrator;
	// 			} else {
	// 				formObject.administrator = null;
	// 			}
	//
	// 			// if (result.typeC) {
	// 			// 	formObject.typeC = result.typeC;
	// 			// } else {
	// 			// 	formObject.typeC = null;
	// 			// }
	//
	// 			if (result.badge) {
	// 				formObject.badge = result.badge;
	// 			} else {
	// 				formObject.badge = null;
	// 			}
	//
	// 			// if (result.context) {
	// 			// 	formObject.context = result.context;
	// 			// } else {
	// 			// 	formObject.context = null;
	// 			// }
	// 			//
	// 			// if (result.revoked) {
	// 			// 	formObject.revoked = result.revoked;
	// 			// } else {
	// 			// 	formObject.revoked = null;
	// 			// }
	//
	// 			this.certificateTemplateForm.setValue(formObject);
	//
	// 		},
	// 			(error) => {
	// 			if (error === 'Server error') {
	// 				this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
	// 			}	else if (error === '404 - Not Found') {
	// 				this.errorMessage = '404 - Could not find API route. Please check your available APIs.';
	// 			}	else {
	// 				this.errorMessage = error;
	// 			}
	// 		});
	// }

	openCreateAssetDialog(): void {
		const dialogRef = this.createAssetDialog.open(CreateCertificateTemplateDialogComponent);

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.update) {
				this.loadAll();
			}
		}, error => {
			console.error(error);
		});
	}

	// openUpdateAssetDialog(id: any): void {
	// 	const dialogRef = this.updateAssetDialog.open(UpdateResearchOJDialogComponent, {
	// 		data: { id: id }
	// 	});
	//
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result && result.update) {
	// 			this.loadAll();
	// 		}
	// 	}, error => {
	// 		console.error(error);
	// 	});
	// }
	//
	// openDeleteAssetDialog(id: any): void {
	// 	const dialogRef = this.deleteAssetDialog.open(DeleteResearchOJDialogComponent, {
	// 		data: { id: id }
	// 	});
	//
	// 	dialogRef.afterClosed().subscribe(result => {
	// 		if (result && result.update) {
	// 			this.loadAll();
	// 		}
	// 	}, error => {
	// 		console.error(error);
	// 	});
	// }

	parseHyperledgerID(value: String): String {
		if (value) {
			value = value.split('#')[1];
		}
		return value;
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}
}
