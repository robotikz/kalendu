import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../model/group';
import { Place } from '../model/place';
// import { PlaceDataService } from '../data-service/place-data.service';
// import { GroupDataService } from '../data-service/group-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Observable, merge, Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MailerService } from '../services/mailer.service';
import { FbService } from '../services/fb.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
  animations: [
    trigger('fadeGM', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('.5s', style({ opacity: 0 }))
      ]),
    ]),
  ],
})
export class GroupsComponent implements OnInit {

  loading = true;
  wait = false;

  groups: Group[] = [];
  place: Place;
  frm: FormGroup;
  frmg: FormGroup;
  group: Group;
  tasportFocus$ = new Subject<string>();
  tasportClick$ = new Subject<string>();

  constructor(
    private fbService: FbService,
    private route: ActivatedRoute,
    public router: Router,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private mailer: MailerService,
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.show();
    }, 100);
    // this.route.data
    console.log('this.route.snapshot.params[place_id] - ', this.route.snapshot.params['place_id']);
    return forkJoin([
      this.fbService.getPlaceById(this.route.snapshot.params['place_id']),
      this.fbService.getAllGroupsByPlace(this.route.snapshot.params['place_id']),
    ])
      .subscribe(
        (data) => {
          console.log('GroupsComponent - ngOnInit - ', data);
          this.place = data[0];
          this.groups = data[1];
          this.spinner.hide();
          this.loading = false;
          this.frm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            body: ['', Validators.required],
          });
          this.frmg = this.formBuilder.group({
            owner: ['', [Validators.required, Validators.email]],
            member: [''],
            title: ['', Validators.required],
            sport: [''],
            min: [1, [Validators.required, Validators.min(1)]],
            max: [2, [Validators.required, Validators.min(2)]],
            ball: [false],
            camisole: [false],
            pay: [true],
            status: [true]
          });
        }
      );
  }

  onLockGroup(group: Group) {
    // game.play = 9;
    group.status = group.status === 1 ? 5 : 1;
    this.fbService
      .updateGroup(group)
      .subscribe(
        () => {

        }
      );
  }

  // convenience getter for easy access to form fields
  get f() { return this.frm.controls; }

  mailerSendRequestDlg(dlg: any, group: Group) {
    this.group = group;
    this.f.email.setValue('');
    this.f.body.setValue('Hi, mein Name ist: , ich möchte gerne mitspielen');
    this.modalService.open(dlg, { size: 'lg' }).result.then(() => {
      this.mailerSendRequestDlgOk();
    }, () => { // close, esc
      this.wait = false;
      // console.log(reason);
      this.group = null;
    });
  }

  mailerSendRequestDlgOk() {
    // stop here if form is invalid
    if (this.frm.invalid) {
      return;
    }
    this.wait = true;
    console.log('mailerSendRequestDlgOk - mailer.request', environment.mailer.request);
    const fd = new FormData();
    const body = {
      to: this.group.owner,
      tmp: 'mail-anfrage-private-gruppe',
      locals: {
        app_link: location.hostname,
        group_req_email: this.frm.value.email,
        group_title: this.group.title,
        group_link_o: location.hostname + '/gamesg;group_id=' + this.group.aowner,
        group_link_m: location.hostname + '/gamesg;group_id=' + this.group.amember,
      },
      // email: 'Neuer Mitspieler/-in'
      // body: this.f.body.value + ' ' + this.f.email.value,
    };
    console.log('mailerSendRequestDlgOk - body - ', body);
    fd.append('json', JSON.stringify(body));

    this.mailer.sendRequest(fd).subscribe(res => {
      this.wait = false;
      console.log('[App] Mailer send-request answer', res);
      this.group = null;
    },
      error => {
        console.log('[App] Mailer Error', error);
        this.group = null;
      }
    );
  }



  // convenience getter for easy access to form fields
  get fg() { return this.frmg.controls; }

  onGroupAddDlg(dlg: any) {
    console.log('fg - ', this.fg);
    this.group = new Group();
    this.fg.title.setValue('');
    this.fg.sport.setValue('');
    this.fg.owner.setValue('');
    this.fg.member.setValue('');
    this.fg.min.setValue(8);
    this.fg.max.setValue(12);
    this.fg.ball.setValue(false);
    this.fg.camisole.setValue(false);
    this.fg.pay.setValue(true);
    this.fg.status.setValue(true);
    this.modalService.open(dlg, { size: 'lg' }).result.then(() => {
      // this.onGroupAddDlgOk();
    }, () => { // close, esc
      this.wait = false;
      // console.log(reason);
      this.group = null;
    });
  }

  onGroupAddDlgOk(dlg: any) {
    // stop here if form is invalid
    console.log('this.frmg.value.member - ', this.frmg.value.member);

    if (this.frmg.invalid) {
      return;
    }

    dlg('close modal');

    this.wait = true;
    this.group.aowner = this.fbService.uid();
    this.group.amember = this.fbService.uid();
    this.group.id = this.fbService.uid();
    this.group.place_id = this.place.id;
    this.group.title = this.frmg.value.title;
    this.group.sport = this.frmg.value.sport;
    this.group.min = this.frmg.value.min;
    this.group.max = this.frmg.value.max;
    this.group.owner = this.frmg.value.owner;
    // this.group.member = this.frmg.value.member.split(",").map((i: string) => i.trim());
    this.group.member = this.frmg.value.member; //.map(e => e.value)
    this.group.ball = this.frmg.value.ball;
    this.group.camisole = this.frmg.value.camisole;
    this.group.pay = this.frmg.value.pay;
    this.group.status = this.frmg.value.status ? 5 : 1;

    this.fbService
      .createGroup(this.group)
      .subscribe(() => {
        this.groups.push(this.group);
        console.log('onGroupAddDlgOk - mailer.group', environment.mailer.group);

        let fd = new FormData();
        let body = {
          to: this.group.owner,
          tmp: 'mail-neue-spielgruppe',
          locals: {
            app_link: location.hostname,
            group_title: this.group.title,
            group_link_o: location.hostname + '/gamesg;group_id=' + this.group.aowner,
            group_link_m: location.hostname + '/gamesg;group_id=' + this.group.amember,
          },
          // subject: 'Kalendu: Alle Infos zu deiner neuen Spielgruppe: ' + this.group.title,
          // body: 'Neue Gruppe: ' + this.group.title + '<br>'
          //   + 'Adminlink: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.aowner + '">Adminlink</a>' + '<br>'
          //   + 'Mitgliederlink: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.amember + '">Mitgliederlink</a>' + '<br>'
          //   + 'Wenn die Gruppe öffentlich, dann: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.id + '">für alle</a>' + '<br>'
          // ,
        };

        console.log('onGroupAddDlgOk - admin body - ', body);
        fd.append('json', JSON.stringify(body));

        this.mailer.sendGroup(fd).subscribe(res => {
          this.wait = false;
          console.log('[App] Mailer send-group - admin - res - ', res);
          // if members are here
          if (this.group.member) {
            fd = new FormData();
            body = {
              to: this.frmg.value.member,
              tmp: 'mail-einladung-neue-gruppe',
              locals: {
                app_link: location.hostname,
                group_title: this.group.title,
                group_link_o: '',
                group_link_m: location.hostname + '/gamesg;group_id=' + this.group.amember,
              },
              // subject: 'Kalendu: Du wurdest zu einer neuen Spielgruppe eingeladen: ' + this.group.title,
              // body: 'Neue Gruppe: ' + this.group.title + '<br>'
              //   + 'Sie wurden mitzuspielen eingeladen: ' 
              //   + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.amember + '">' 
              //   + this.group.title + '</a>' + '<br>'
            };

            console.log('onGroupAddDlgOk - member.body - ', body);
            fd.append('json', JSON.stringify(body));

            this.mailer.sendGroup(fd).subscribe(res => {
              this.wait = false;
              console.log('[App] Mailer send-group - member - res - ', res);
              this.router.navigate(['/gamesg', { group_id: this.group.aowner }]);
              this.group = null;
            },
              error => {
                console.log('[App] Mailer Error member', error);
                this.group = null;
              }
            );
          } else {
            this.router.navigate(['/gamesg', { group_id: this.group.aowner }]);
          }
          // this.group = null;
        },
          error => {
            console.log('[App] Mailer Error admin', error);
            this.group = null;
          }
        );

      });
  }

  public memberValidators = [this.memberEmailValid];
  public memberErrorMessages = {
    'valid_email': 'Ungültige E-Mail-Adresse!'
  };
  private memberEmailValid(control: FormControl) {
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return { "valid_email": true };
    }
    return null;
  }

  tasportEvents($event, typeaheadInstance) {
    if (typeaheadInstance.isPopupOpen()) {
      // console.log('typeaheadInstance', typeaheadInstance);
      this.tasportClick$.next($event.target.value);
    }
  }
  tasportsearch = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const inputFocus$ = this.tasportFocus$;
    return merge(debouncedText$, inputFocus$).pipe(
      map(term => (term === '' ? this.place.sports
        : this.place.sports.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).map(v => v)).slice(0, 10))
    );
  }

  ballcb() {
    this.fg.ball.setValue(!this.frmg.value.ball);
  }

  camisolecb() {
    this.fg.camisole.setValue(!this.frmg.value.camisole);
  }

  statuscb() {
    // this.fg.status.setValue(this.frmg.value.status === 1 ? 5 : 1);
    this.fg.status.setValue(!this.frmg.value.status)
  }

  paycb() {
    this.fg.pay.setValue(!this.frmg.value.pay);
  }

  onNavigatePublic(group: Group) {
    if (group.status === 1) {
      this.router.navigate(['/gamesg', { group_id: group.id }]);
    } else if (group.status === 5) {
      alert('Die Gruppe ist privat');
    }
  }

  onNavigateAdmin(group: Group) {
    alert('Admin-Link for test only');
    this.router.navigate(['/gamesg', { group_id: group.aowner }]);
  }

  onNavigateMember(group: Group) {
    alert('Member-Link for test only, in der Zukunft für privat wird unmöglich');
    this.router.navigate(['/gamesg', { group_id: group.amember }]);
  }

}
