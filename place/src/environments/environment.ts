// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // URL of development API
  apiUrlLocal: 'http://localhost:443',
  firebase: {
    apiKey: 'AIzaSyC0KGCE0YP8bIindAP-73B7Z_L1LWEtQTQ',
    authDomain: 'sport4u-df275.firebaseapp.com',
    databaseURL: 'https://sport4u-df275.firebaseio.com',
    projectId: 'sport4u-df275',
    storageBucket: 'sport4u-df275.appspot.com',
    messagingSenderId: '455037071171'
  },
  pushurl: 'http://localhost:443',
  vapid: {
    'publicKey': 'BJcgsnnv4yYC_UeZ1cYhvFndCHa2s0fJYU-lnO_HKpki3g0RwGHZo3mTO0FkUuJPO2FtsLnPwdbiRyZpN7WRN9c',
    'privateKey': 'KNAWy9q9qx-6EZOD9_FSs0gJvKs5mqmEoXsX3QDgCG0'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
