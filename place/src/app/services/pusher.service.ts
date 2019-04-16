import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})


@Injectable()
export class PusherService {

  constructor(private http: HttpClient) {

  }

  addPushSubscriber(sub: any) {
    // const su = sub;
    // (su as PushSub).group_id = sub.group_id;
    // (su as PushSub).active = 2;
    // console.log('http-sub-1 -> ', JSON.stringify(sub));

    // manipulation with object properties
    const su = JSON.parse(JSON.stringify(sub));
    su.group_id = sub.group_id;
    // su.place_id = sub.place_id;
    su.active = 1;
    // const su = Object.assign({}, sub);
    // delete sub.toJSON;
    // delete sub.stringify;
    // console.log('http-sub-3 -> ', JSON.stringify({sub}));
    console.log('http-su-1 -> ', su);
    console.log('http-su-3 -> ', JSON.stringify(su));
    return this.http.post(environment.pushurl + '/subscription', su, httpOptions);
  }

  sendNotifications(gid: string, pid: string) {
    const su = {
      group_id: gid,
      place_id: pid
    };
    console.log('post sendNotifications1 - ' + environment.pushurl + '/sendnotifications', 'su - ', su);
    return this.http.post(environment.pushurl + '/sendnotifications', su, httpOptions);
    // console.log('post sendNotifications2 - ' + environment.pushurl + '/sendnotifications');
  }
}

// interface PushSub extends PushSubscription {
//   group_id?: string;  // you can cast any Given to this and set .props
//   active?: number;
// }
