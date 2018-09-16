import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AdministratorService} from '../../Administrator/Administrator.service';
import {Administrator} from '../../org.degree';
import {TdLoadingService} from '@covalent/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-signup',
  templateUrl: './auth-signup.component.html',
  styleUrls: ['./auth-signup.component.css'],
	providers: [AdministratorService]
})
export class AuthSignupComponent implements OnInit {

	myForm: FormGroup;
	email = new FormControl(null, [Validators.required, Validators.email]);
	private successMessage;
	private errorMessage;

	constructor(private authService: AuthService,
							private loadingService: TdLoadingService,
							private router: Router,
							fb: FormBuilder) {
		this.myForm = fb.group({
			email: this.email
		});
	};

  ngOnInit() {
  }

	addParticipant(): void {
  	this.errorMessage = null;
  	if (this.myForm.valid) {
  		this.registerLoading();
			this.authService.signUp(this.email.value)
				.then(async () => {
					this.errorMessage = null;
					this.myForm.reset();
					this.resolveLoading();
					await this.authService.setCurrentUser();
					this.router.navigate(['/certificate-templates']);
				})
				.catch((error) => {
					console.log(error);
					if(error.status == 404){
						this.errorMessage = 'User not registred in bussiness network';
					}
					else if (error === 'Server error') {
						this.errorMessage = 'Could not connect to REST server. Please check your configuration details';
					} else {
						this.errorMessage = error;
					}
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
