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

import { AngularTestPage } from './app.po';
import { ExpectedConditions, browser, element, by } from 'protractor';
import {} from 'jasmine';


describe('Starting tests for bforos-frontend', function() {
  let page: AngularTestPage;

  beforeEach(() => {
    page = new AngularTestPage();
  });

  it('website title should be bforos-frontend', () => {
    page.navigateTo('/');
    return browser.getTitle().then((result)=>{
      expect(result).toBe('bforos-frontend');
    })
  });

  it('network-name should be bforos-bnav1@0.0.1',() => {
    element(by.css('.network-name')).getWebElement()
    .then((webElement) => {
      return webElement.getText();
    })
    .then((txt) => {
      expect(txt).toBe('bforos-bnav1@0.0.1.bna');
    });
  });

  it('navbar-brand should be bforos-frontend',() => {
    element(by.css('.navbar-brand')).getWebElement()
    .then((webElement) => {
      return webElement.getText();
    })
    .then((txt) => {
      expect(txt).toBe('bforos-frontend');
    });
  });

  
    it('ResearchOJ component should be loadable',() => {
      page.navigateTo('/ResearchOJ');
      browser.findElement(by.id('assetName'))
      .then((assetName) => {
        return assetName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('ResearchOJ');
      });
    });

    it('ResearchOJ table should have 8 columns',() => {
      page.navigateTo('/ResearchOJ');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(8); // Addition of 1 for 'Action' column
      });
    });
  

  
    it('Researcher component should be loadable',() => {
      page.navigateTo('/Researcher');
      browser.findElement(by.id('participantName'))
      .then((participantName) => {
        return participantName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Researcher');
      });
    });

    it('Researcher table should have 5 columns',() => {
      page.navigateTo('/Researcher');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(5); // Addition of 1 for 'Action' column
      });
    });
  
    it('Institution component should be loadable',() => {
      page.navigateTo('/Institution');
      browser.findElement(by.id('participantName'))
      .then((participantName) => {
        return participantName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Institution');
      });
    });

    it('Institution table should have 4 columns',() => {
      page.navigateTo('/Institution');
      element.all(by.css('.thead-cols th')).then(function(arr) {
        expect(arr.length).toEqual(4); // Addition of 1 for 'Action' column
      });
    });
  

  
    it('Claim component should be loadable',() => {
      page.navigateTo('/Claim');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Claim');
      });
    });
  
    it('Collect component should be loadable',() => {
      page.navigateTo('/Collect');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Collect');
      });
    });
  
    it('Enrich component should be loadable',() => {
      page.navigateTo('/Enrich');
      browser.findElement(by.id('transactionName'))
      .then((transactionName) => {
        return transactionName.getText();
      })
      .then((txt) => {
        expect(txt).toBe('Enrich');
      });
    });
  

});