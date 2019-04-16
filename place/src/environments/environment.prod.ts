export const environment = {
  production: true,
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
  // pushurl: 'https://kalendu-pusher.herokuapp.com',
  pushurl: 'https://kalendu.de/api',
  vapid: {
    'publicKey': 'BJcgsnnv4yYC_UeZ1cYhvFndCHa2s0fJYU-lnO_HKpki3g0RwGHZo3mTO0FkUuJPO2FtsLnPwdbiRyZpN7WRN9c',
    'privateKey': 'KNAWy9q9qx-6EZOD9_FSs0gJvKs5mqmEoXsX3QDgCG0'
  },
  mailer: {
    url: 'https://kalendu.de/api/mailer',
    request: {
      subject: '',
      body: '',
      withfile: false
    },
    group: {
      subject: '',
      body: '',
      withfile: false
    },
  },
};
