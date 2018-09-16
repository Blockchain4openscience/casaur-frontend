import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs/index';
import {AdministratorHistory, PersonalCertificate, PersonalCertificateHistory} from '../org.degree';
import {DataService} from '../data.service';
import {HistorianRecord} from "../org.hyperledger.composer.system";
import {take, catchError, map} from "rxjs/operators";

@Injectable({
	providedIn: 'root'
})
export class VerifyCertificateService {

	private NAMESPACE: string = 'PersonalCertificate';
	private headers;
	private resolveSuffix = '?resolve=true';

	  constructor(private dataService2: DataService<PersonalCertificateHistory>,
				  private administratorHistoryService: DataService<AdministratorHistory>,
				  private httpClient: HttpClient){
						this.headers = new HttpHeaders({
							'Content-Type': 'application/json',
							'Accept': 'application/json'
						});
					}
			
	public getAsset(certId: any): Observable<any> {
		return this.httpClient.get('http://localhost:3001/api/PersonalCertificate/' + certId);
	}

	requestPersonalCertificateHistory(itemToAdd: any): Observable<PersonalCertificateHistory> {
		return this.httpClient.post('http://localhost:3001/api/PersonalCertificateHistory', itemToAdd, {observe: 'response'})
		.pipe(
			map(this.extractData),
			catchError(this.handleError)
		);;
	}

	getPersonalCertificateHistory(certId: string): Observable<any[]> {
		return this.dataService2.history('selectHistorianRecordsByTrxId', certId);
	}

	requestAdministratorHistory(itemtoAdd: any): Observable<AdministratorHistory> {
		return this.httpClient.post('http://localhost:3001/api/AdministratorHistory', itemtoAdd, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	getAdministratorHistory(email: string): Observable<any[]> {
		return this.administratorHistoryService.history('selectHistorianRecordsByTrxId', email);
	}

	getHistorianRecord(transactionId: string): Promise<HistorianRecord> {
		return this.httpClient.get('http://localhost:3001/api/system/historian/' + transactionId + this.resolveSuffix, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			)
			.pipe(
				take(1)
			)
			.toPromise();
	}

	private handleError(error: any): Observable<string> {
		// In a real world app, we might use a remote logging infrastructure
		// We'd also dig deeper into the error to get a better message
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.error(errMsg); // log to console instead
		return throwError(errMsg);
	}

	private extractData(res: any): any {
		//console.log(res);
		return res.body;
	}

}
