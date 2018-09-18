# Digital Degree (degree-bnav2:frontend)

A proof of concept (PoC) of a permissioned blockchain for verifiable digital diplomas base on the [Blockcerts](https://www.blockcerts.org/about.html) open standard. Digital diplomas are a transparent way of verifying professional or educational accomplishments for a global workforce and it’s a first step toward supplying the full record of a learning experience (transcripts, projects,..). Blockcerts is an open-source project initially led by MIT’s media lab and Learning Machine. Blockcerts focus has been on issuing the certificates on Bitcoin and Ethereum. Our goal is to extend the certification process in a permissioned blockchain using the Hyperledger framework and tools. The initial aim is to build a ledger of digital diplomas to be deployed for a university and extend its possibilities to other institutions.

-----
The project is curretly in development using frameworks and tools from Hyperledger, in particular [Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.1/) and [Composer](https://hyperledger.github.io/composer/latest/introduction/introduction)  

In this posting we will be deploying into a [single-organization](https://hyperledger.github.io/composer/latest/tutorials/deploy-to-fabric-single-org) the same business network, start the rest-server and the user interfaces generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.1. 

## Deployment of Hyperledger Fabric onto a single-organization  

First we need to intall the version of node and npm that is compatible with composer and fabric.
`````
nvm install 8.9
`````
Follow *steps one and two* from the [tutorial](https://hyperledger.github.io/composer/latest/tutorials/deploy-to-fabric-single-org): 1-Starting a Hyperledger Fabric network; 2-Exploring the Hyperledger Fabric network.

In *step three* create a folder called `certificates` and follow the instructions:
3-Building a connection profile (copy the example connection profile) and save to the folder `connection.json`.

Follow *step four* to locate the certificate and private key for the Hyperledger Fabric administrator and copying these certificates in the file `certificates`. Note that these certificates change every time we boostrap the fabric network.

Navigate to the folder you just created and follow *step five*, creating a business network card for the Hyperledger Fabric administrator:
`````
composer card create -p connection.json -u PeerAdmin -c Admin@org1.example.com-cert.pem -k 114aab0e76bf0c78308f89efc4b8c9423e31568da0c340ca187a9b17aa9a4457_sk -r PeerAdmin -r ChannelAdmin
`````
Follow *step six* to import the business network card for the Hyperledger Fabric administrator,
`````
composer card import -f PeerAdmin@fabric-network.card
`````
In *step seven* we install the Hyperledger Composer business network onto the Hyperledger Fabric peer nodes. The business network `block-degree` is defined in bna file, `block-degree@0.0.1.bna` and its located in the repository. A forlder with the specific business network model files, scripts and queries that are packaged in the bna file (using `composer archive create`) is located in the [blockdegree repository](https://github.com/ccastroiragorri/blockdegree/tree/master/degree-bnav2). 
`````
composer network install -c PeerAdmin@fabric-network -a block-degree@0.0.1.bna
`````
In *step eight* we start the blockchain business network
`````
composer network start --networkName block-degree --networkVersion 0.0.1 -A admin -S adminpw -c PeerAdmin@fabric-network
`````
In *step nine* we import the business network card for the business network administrator
`````
composer card import -f admin@block-degree.card
`````
In *step ten* we test the connection to the blockchain business network
`````
composer network ping -c admin@block-degree
`````

## Creating a external users participant 

Add a external user participant in the business network  
`````
composer participant add -c admin@block-degree -d '{"$class":"org.degree.ExternalUser","id": "guest"}'
`````

Create a business card for external user (use namespace for participant)
`````
composer identity issue -u guest -a org.degree.ExternalUser#guest -x true -c admin@block-degree -f guest@block-degree.card 
`````

Import the business card created in the previous step
`````
composer card import -f guest@block-degree.card
`````

## Interacting with the business network using the REST server and the Angular application

To allow users to log-in with the google api we need first to install the [passport](http://www.passportjs.org/).
`````
npm install -g passport-google-oauth2
`````
To create the REST API using the guest card run the following command: 
`````
composer-rest-server  -c guest@block-degree -n never -p 3001
`````
use `admin@block-degree` as the card name. User only has access as external user

In a different console we must start a second REST server
`````
export COMPOSER_PROVIDERS='{    "google": {        "provider": "google",        "module": "passport-google-oauth2",        "clientID": "449143484410-cd3p44o8qgbcihfmck8lu4uj6s5t4c0j.apps.googleusercontent.com",        "clientSecret": "YyEbhukLeI1ndcbpJQVpn3c4",        "authPath": "/auth/google",        "callbackURL": "/auth/google/callback",        "scope": "https://www.googleapis.com/auth/plus.login",        "successRedirect": "http://localhost:4200/callback",        "failureRedirect": "/"    }}'
`````
`````
composer-rest-server -c admin@block-degree -n never -a true -m true -w true
`````
use `admin@block-degree` as the card name.

In order to build the user interfaces for this busness network please clone the repository and follow the instructions

`````
git clone https://github.com/Camilo1090/blockdegree-frontend
`````
Now navigate to the folder. Check that npm is installed by running
`````
npm -v
`````
otherwise run. Although npm might already be installed, re-intalling npm is important to update any dependencies.
`````
npm install
`````
Once the installation is complete run,
`````
npm start
`````
and navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files. 

Once the app is loaded log-in with gmail account and create administrator then follow the instructions to create the certificate template, personalize the certificates and verify the certificates. Use the [example](https://github.com/ccastroiragorri/blockdegree/blob/master/degree-bnav2/README.md) designed for the hyperledger playground to test the functionality of the business network using the bna deployed onto fabric and the frontends. 

## Destroy a previous set up
After testing the bna desgined with Composer and deployed onto Fabric it is important to tidy up by stopping fabric. Navigate to the folder where you initially started the Hyperledger Fabric network.

`````
./stopFabric.sh
./teardownFabric.sh
`````
delete the composer cards
`````
composer card delete -c name
`````
and clear the docker cointainers.

`````
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
`````