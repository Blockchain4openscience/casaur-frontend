import { Component, OnInit } from '@angular/core';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {

  constructor(public authService: AuthService,
							public router: Router) { }

  async ngOnInit() {
  	const isAuthenticated = await this.authService.isAuthenticated();
  	const hasSignedUp = await this.authService.hasSignedUp();
  	console.log(isAuthenticated, hasSignedUp);
  	if (isAuthenticated && hasSignedUp) {
			await this.authService.setCurrentUser();
			this.router.navigate(['/']);
		} else if (isAuthenticated && !hasSignedUp) {
			this.router.navigate(['/signup']);
		} else {
			this.router.navigate(['/']);
		}
  }

}
