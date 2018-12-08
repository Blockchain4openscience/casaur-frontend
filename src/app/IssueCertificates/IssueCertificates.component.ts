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
import { Router } from '@angular/router';
import {AuthService} from "../auth/auth.service";
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {TdLoadingService} from '@covalent/core';

@Component({
	selector: 'app-issue-certificates',
	templateUrl: './IssueCertificates.component.html',
	styleUrls: ['./IssueCertificates.component.css'],
})

export class IssueCertificatesComponent implements OnInit {

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
				fb: FormBuilder) {
		this.myForm = fb.group({
			templateId: this.templateId,
			administrator: this.administrator,
			certificateType: this.certificateType
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
			this.router.navigate(['/verify-type']);
		}
	}

	route(path : string) : void {

		if(path=='addR')
		{
			this.router.navigate(['/add-roster']);
		}
		else if(path=='issueC')
		{
			this.router.navigate(['/select-type']);
		}
	}
}

