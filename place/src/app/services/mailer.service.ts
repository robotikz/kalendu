import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// const httpOptions = {
//   headers: new HttpHeaders({
//     // 'Content-Type': 'multipart/form-data',
//     // 'Accept': 'application/json',
//     // 'Content-Type': 'application/json',
//   })
// };

@Injectable({
  providedIn: 'root'
})
export class MailerService {

  constructor(private http: HttpClient) {
  }

  sendRequest(body: any) {
    console.log('sendReq - http-body-1 -> ', body);
    console.log('url: ', environment.mailer.url);
    return this.http.post(environment.mailer.url, body);
  }

  sendGroup(body: any) {
    console.log('sendGroup - http-body-1 -> ', body);
    console.log('url: ', environment.mailer.url);
    return this.http.post(environment.mailer.url, body);
  }

  // sendPdf(body: any) {
  //   console.log('sendPdf - http-body-1 -> ', body);
  //   console.log('url: ', environment.mailer.pdf.url);
  //   return this.http.post(environment.mailer.pdf.url, body);
  // }
}
