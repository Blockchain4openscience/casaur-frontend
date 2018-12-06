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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routing.module';
import {DataService} from './data.service';
import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {HttpClientModule} from '@angular/common/http';
import {AngularMaterialModule} from './angular-material/angular-material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MglTimelineModule} from 'angular-mgl-timeline';
import {VerifyCertificateComponent} from './verify-certificate/verify-certificate.component';
import {CertificateTemplateComponent} from './CertificateTemplate/CertificateTemplate.component';
import { CreateCertificateTemplateDialogComponent } from './CertificateTemplate/create-certificate-template-dialog/create-certificate-template-dialog.component';
import { IssueCertificateDialogComponent } from './SelectType/issue-certificate-dialog/issue-certificate-dialog.component';
import {AddRosterComponent} from './AddRoster/AddRoster.component';
import {IssueCertificatesComponent} from './IssueCertificates/IssueCertificates.component';
import {SelectTypeComponent} from './SelectType/SelectType.component'
import { AuthCallbackComponent } from './auth/auth-callback/auth-callback.component';
import { AuthSignupComponent } from './auth/auth-signup/auth-signup.component';
import { CookieService } from 'ngx-cookie-service';

// import { TransactionComponent } from './Transaction/Transaction.component'

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		CertificateTemplateComponent,
		VerifyCertificateComponent,
		AddRosterComponent,
		IssueCertificatesComponent,
		SelectTypeComponent,
		CreateCertificateTemplateDialogComponent,
		IssueCertificateDialogComponent,
		AuthCallbackComponent,
		AuthSignupComponent
	],
	entryComponents: [
		CreateCertificateTemplateDialogComponent,
		IssueCertificateDialogComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		AppRoutingModule,
		AngularMaterialModule,
		MglTimelineModule
	],
	providers: [
		DataService,
		CookieService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
}
