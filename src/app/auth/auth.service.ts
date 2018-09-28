import { Injectable } from '@angular/core';
import {Administrator} from '../org.degree';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AdministratorService} from '../Administrator/Administrator.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	currentUser: Administrator;
	token = 'UNKNOWN';

	constructor(private httpClient: HttpClient,
				private administratorService: AdministratorService,
				private cookieService: CookieService
			) {
		this.currentUser = null;
	}

	signUp(email:string): Promise<any> {		
		return this.httpClient.head('http://localhost:3001/api/Administrator/' +  email).toPromise()
			.then((results) => {
				const identity = {
					participant: 'org.degree.Administrator#' + email,
					userID: email,
					options: {}
				};

				return this.httpClient.post('http://localhost:3001/api/system/identities/issue', identity, {responseType: 'blob'}).toPromise();
			})
			.then((cardData) => {
				console.log('CARD-DATA', cardData);
				const file = new File([cardData], 'myCard.card', {type: 'application/octet-stream', lastModified: Date.now()});

				const formData = new FormData();
				formData.append('card', file);

				const headers = new HttpHeaders();
				headers.set('Content-Type', 'multipart/form-data');
				return this.httpClient.post('http://localhost:3000/api/wallet/import', formData, {
					withCredentials: true,
					headers
				}).toPromise();
			})
			.catch(error => {
				console.log(error);
				return error.status;	
		});
	}

	isAuthenticated(): Promise<boolean> {
		return this.httpClient.get('http://localhost:3000/api/system/ping', {withCredentials: true, observe: 'response'})
			.toPromise()
			.then(response => {
				return response.status === 200;
			})
			.catch(error => {
				console.log(error);
				return error.status !== 401;
			});
	}

	hasSignedUp(): Promise<boolean> {
		return this.httpClient.get('http://localhost:3000/api/wallet', {withCredentials: true})
			.toPromise()
			.then(results => {
				console.log(results);
				return results['length'] > 0;
			})
			.catch(error => {
				console.log(error);
				return false;
			});
	}

	async setCurrentUser(): Promise<void> {
		this.currentUser = await this.httpClient.get('http://localhost:3000/api/system/ping', {withCredentials: true}).toPromise()
			.then((data) => {
				console.log(data);
				const id = data['participant'].split('#')[1];
				return this.administratorService.getParticipant(id).toPromise();
			});
	}
}
