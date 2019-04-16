// const url_ap = 'http://localhost:8080';
const url_ap = 'https://kalendu.de';

exports.notificationPayload = {
    notification: {
        title: 'Melde dich an maza faka',
        body: 'Bis du dabei oder was? \ndann melde dich an!',
        icon: url_ap + '/assets/icons/icon-192x192.png',
        badge: url_ap + '/assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url_group: url_ap + '/gamesg;group_id=%s&place_id=%s',
        },
        actions: [{
                action: 'open_group',
                title: 'anmelden',
                icon: url_ap + '/assets/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'mir egal',
                icon: url_ap + '/assets/icons/icon-72x72.png'
            },
        ]
    }
}

exports.VAPID_PUBLIC = 'BJcgsnnv4yYC_UeZ1cYhvFndCHa2s0fJYU-lnO_HKpki3g0RwGHZo3mTO0FkUuJPO2FtsLnPwdbiRyZpN7WRN9c';

exports.VAPID_PRIVATE = 'KNAWy9q9qx-6EZOD9_FSs0gJvKs5mqmEoXsX3QDgCG0';

exports.email = 'mailto:quizpiggy@gmail.com';