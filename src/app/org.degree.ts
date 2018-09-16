import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
import {Certificate} from './composer.blockcerts';
// export namespace org.degree{
   export class Administrator extends Participant {
      email: string;
      firstName: string;
      lastName: string;
      publicKey: string;
   }
   export class CertificateTemplate extends Certificate {
      templateId: string;
      administrator: Administrator;
   }
   export class PersonalCertificate extends Asset {
      certId: string;
      templateId: CertificateTemplate;
      administrator: Administrator;
      recipient: Recipient;
      recipientProfile: RecipientProfile;
      hash: string;
   }
   export class AddRoster extends Transaction {
      templateId: CertificateTemplate;
      administrator: Administrator;
      recipientsInfo: RecipientInfo[];
   }
   export class PersonalCertificateHistory extends Transaction {
      certId: string;
   }
   export class PersonalCertificateHistoryResults extends Event {
      results: string[];
   }
   export class AdministratorHistory extends Transaction {
      email: string;
   }
   export class AdministratorHistoryResults extends Event {
      results: string[];
   }
   export class RecipientInfo {
      certId: string;
      recipient: Recipient;
      recipientProfile: RecipientProfile;
   }
   export class Recipient {
      hashed: boolean;
      email: string;
   }
   export class RecipientProfile {
      typen: string;
      name: string;
      publicKey: string;
      legalId: string;
      assertions: Assertions;
   }
   export class Assertions {
      program: string;
      firtsDate: Date;
      lastDate: Date;
      language: Language;
      discipline: Discipline;
   }
   export class Language {
      typen: string;
      option: boolean;
      languageReq: Languages;
      englishReq: English;
   }
   export class Discipline {
      typen: string;
      sanction: string;
      periods: number;
      fault: string;
      firtsDate: Date;
      faultDate: Date;
      processId: string;
   }
   export enum Languages {
      aleman,
      italiano,
      frances,
      portugues,
   }
   export enum English {
      B1,
      B2,
   }
// }
