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
import {TdLoadingService} from '@covalent/core';
import {MatDialog} from '@angular/material';
import * as csv from 'papaparse';
import {AuthService} from "../auth/auth.service";
import {Router} from '@angular/router';
import {IssueCertificateDialogComponent} from './issue-certificate-dialog/issue-certificate-dialog.component';

@Component({
	selector: 'app-select-type',
	templateUrl: './SelectType.component.html',
	styleUrls: ['./SelectType.component.css'],
})
export class SelectTypeComponent implements OnInit {

	myForm: FormGroup;
	templateId = new FormControl(null, Validators.required);
	administrator = new FormControl(null, Validators.required);
	certificateType = new FormControl(null, Validators.required);
	
	file: File;

	private Transaction;
	private errorMessage;
	private successMessage;

	constructor(private loadingService: TdLoadingService,
							private authService: AuthService,
							private router: Router,
							public createCertificateDialog: MatDialog,
							public updateCertificateDialog: MatDialog,
							public deleteCertificateAssetDialog: MatDialog,
							fb: FormBuilder) {
		this.myForm = fb.group({
			templateId: this.templateId,
			administrator: this.administrator,
			certificateType: this.certificateType,
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

	openIssueCertificateDialog(): void {
		if (this.myForm.valid) {
			switch (this.certificateType.value) {
				case 'ParticipacionPrograma':
				{
					const dialogRef = this.createCertificateDialog.open(IssueCertificateDialogComponent);
					dialogRef.afterClosed().subscribe(result => {
						if (result && result.update) {
							//this.loadAll();
						}
					}, error => {
						console.error(error);
					});
				}
				break;

				case 'RequisitoIdioma':
				{
					
				}
				break;

				case 'SancionDisciplinaria':
				{
					
				}
				break;
			}
			
		}else
		{
			Object.keys(this.myForm.controls).forEach(field => {
				const control = this.myForm.get(field);
				control.markAsTouched({ onlySelf: true });
			});
		}
	}

	registerLoading(key: string = 'loading'): void {
		this.loadingService.register(key);
	}

	resolveLoading(key: string = 'loading'): void {
		this.loadingService.resolve(key);
	}
}

