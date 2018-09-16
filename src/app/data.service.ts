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

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class DataService<Type> {
	private resolveSuffix = '?resolve=true';
	private actionUrl: string;
	private headers: HttpHeaders;

	constructor(private httpClient: HttpClient) {
		this.actionUrl = '/api/';
		this.headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		});
	}

	public getAll(ns: string): Observable<Type[]> {
		console.log('GetAll ' + ns + ' to ' + this.actionUrl + ns);
		return this.httpClient.get(`${this.actionUrl}${ns}`, {observe: 'response', headers: this.headers})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	public getSingle(ns: string, id: string): Observable<Type> {
		console.log('GetSingle ' + ns);

		return this.httpClient.get(this.actionUrl + ns + '/' + id + this.resolveSuffix, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	public add(ns: string, asset: Type): Observable<Type> {
		console.log('Entered DataService add');
		console.log('Add ' + ns);
		console.log('asset', asset);

		return this.httpClient.post(this.actionUrl + ns, asset, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	public update(ns: string, id: string, itemToUpdate: Type): Observable<Type> {
		console.log('Update ' + ns);
		console.log('what is the id?', id);
		console.log('what is the updated item?', itemToUpdate);
		console.log('what is the updated item?', JSON.stringify(itemToUpdate));
		return this.httpClient.put(`${this.actionUrl}${ns}/${id}`, itemToUpdate, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	public delete(ns: string, id: string): Observable<Type> {
		console.log('Delete ' + ns);

		return this.httpClient.delete(this.actionUrl + ns + '/' + id, {observe: 'response'})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
	}

	public history(ns: string, id: string): Observable<any[]> {
		console.log('Query ', ns);
		const params = (new HttpParams()).append('transactionId', id);

		return this.httpClient.get('http://localhost:3001/api/queries/' + ns, {observe: 'response', headers: this.headers, params: params})
			.pipe(
				map(this.extractData),
				catchError(this.handleError)
			);
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
		console.log(res);
		return res.body;
	}

}
