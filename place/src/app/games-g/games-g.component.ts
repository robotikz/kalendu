import { Component, OnInit, ViewChild } from '@angular/core';
import { Place } from '../model/place';
import { Game } from '../model/game';
import { Group } from '../model/group';
import { ActivatedRoute, Router } from '@angular/router';

import {
  NgbModal, NgbDateAdapter, NgbDateNativeAdapter,
  NgbDatepickerI18n, NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';
import { DeDatepickerI18n, I18n } from '../help/de-datepickerI-18n';
import { DeDateParserFormatter } from '../help/de-date-parser-formatter';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';
import { PusherService } from '../services/pusher.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin, Subject, Observable, merge } from 'rxjs';
import { concatMap, first, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FbService } from '../services/fb.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MailerService } from '../services/mailer.service';
import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { trigger, style, transition, animate } from '@angular/animations';
import { Member } from '../model/member';

@Component({
  selector: 'app-games-g',
  templateUrl: './games-g.component.html',
  styleUrls: ['./games-g.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    I18n,
    { provide: NgbDatepickerI18n, useClass: DeDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: DeDateParserFormatter },
    NgbTooltipConfig
  ],
  animations: [
    trigger('fadeGM', [ 
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('.5s', style({ opacity: 0 }))
      ]),
    ]),
  ],
})
export class GamesGComponent implements OnInit {

  loading = true;
  wait = false;

  games: Game[] = [];
  place: Place;
  group: Group;
  // groupMembersCurr: [] = [];
  groupMemberEdit = false;
  gameLast: Game;
  gameNew: Game = new Game();
  // gameNewRepeat = 1;
  // gameNewRepeatN = 1;
  gid: string;

  ilock = 'lock';
  ilockopen = 'lock-open';

  avatar64: string;
  avatar64u = false;

  frmg: FormGroup;

  tasportFocus$ = new Subject<string>();
  tasportClick$ = new Subject<string>();

  constructor(
    private fbService: FbService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private swPush: SwPush,
    private pushService: PusherService,
    private spinner: NgxSpinnerService,
    public router: Router,
    private mailer: MailerService,
    private formBuilder: FormBuilder,
    config: NgbTooltipConfig
  ) {
    config.tooltipClass = 'kalendu-tooltip';
  }

  ngOnInit() {
    this.spinner.show();
    // this.route.data
    this.gid = this.route.snapshot.params['group_id'];
    const os = this.fbService.getGroupByAccessId(this.gid)
      .pipe(
        concatMap(gr => {
          console.log('getGroupAccess', gr);
          if (!gr) {
            alert('Gruppe ist nicht gefunden, privat oder keine Rechte');
            this.router.navigate(['/places']);
            return;
          }
          const oo = [
            this.fbService.getPlaceByGroupId(gr.id),
            this.fbService.getGroupById(gr.id),
            this.fbService.getAllGamesByGroupId(gr.id),
            this.fbService.getLastGameByGroupId(gr.id)
          ];
          return forkJoin(...oo);
        }),
        first()
      );
    // forkJoin([
    //   this.placeDataService.getPlaceByGroupId(this.route.snapshot.params['group_id']),
    //   this.groupDataServer.getGroupById(this.route.snapshot.params['group_id']),
    //   this.gameDataService.getAllGamesByGroupId(this.route.snapshot.params['group_id']),
    //   this.gameDataService.getLastGameByGroupId(this.route.snapshot.params['group_id'])
    // ])
    os
      .subscribe(
        (data) => {
          console.log('games-g - ngOnInit - ', data);
          this.place = data[0] as Place;
          this.group = data[1] as Group;
          this.games = data[2] as Game[];
          this.gameLast = data[3] as Game;
          if (!this.group) {
            alert('Gruppe ist nicht gefunden oder privat');
            this.router.navigate(['/places']);
            return;
          }
          if (!this.gameLast) {
            this.gameLast = new Game();
            this.gameLast.title = 'Freikick';
            this.gameLast.dt = new Date();
            this.gameLast.dt.setDate(this.gameLast.dt.getDate() + 0);
            // this.gameLast.dd = new Date(this.gameLast.dt);
            // this.gameLast.dd.setDate(this.gameLast.dt.getDate() - 0);
            this.gameLast.dtt = {
              'hour': 19,
              'minute': 0,
              'second': 0
            };
            this.gameLast.ddt = {
              'hour': 19,
              'minute': 0,
              'second': 0
            };
          }
          this.frmg = this.formBuilder.group({
            owner: ['', [Validators.required, Validators.email]],
            membercurr: [''],
            member: [''],
            title: ['', Validators.required],
            sport: [''],
            min: [1, [Validators.required, Validators.min(1)]],
            max: [2, [Validators.required, Validators.min(2)]],
            ball: [false],
            camisole: [false],
            pay: [true],
            status: [5]
          });
          this.spinner.hide();
          this.loading = false;
        }
      );
    this.swPush.notificationClicks.subscribe(payload => {
      console.log(
        'Action: ' + payload.action +
        ' Notification data: ' + payload.notification.data +
        ' Notification data.url: ' + payload.notification.data.url_group +
        ' Notification data.body: ' + payload.notification.body
      );
      if (payload.action === 'open_group') {
        console.log('open url -> ', payload.notification.data.url_group);
        window.open(payload.notification.data.url_group, '_blank');
      }
    });
  }

  onGameNewDlg(dlg: any) {
    // this.gameNew = this.gameLast;
    this.gameNew = new Game();
    Object.assign(this.gameNew, this.gameLast);
    console.log(this.gameNew);
    this.gameNew.title = this.gameNew.title ? this.gameNew.title : 'Freikick';
    this.gameNew.dt = new Date(this.gameLast.dt);
    this.gameNew.dt.setDate(this.gameLast.dt.getDate() + 7);
    if (!this.gameNew.dd) {
      this.gameNew.dd = new Date(this.gameLast.dt);
      this.gameNew.dd.setDate(this.gameLast.dt.getDate() + 5); // - 48 Hours from last start
    } else {
      this.gameNew.dd = new Date(this.gameLast.dd);
      this.gameNew.dd.setDate(this.gameLast.dd.getDate() + 7);
    }
    if (!this.gameNew.dtt) {
      this.gameNew.dtt = {
        'hour': this.gameNew.dt.getHours(),
        'minute': this.gameNew.dt.getMinutes(),
        'second': this.gameNew.dt.getSeconds()
      };
    }
    if (!this.gameNew.ddt) {
      this.gameNew.ddt = {
        'hour': this.gameNew.dd.getHours(),
        'minute': this.gameNew.dd.getMinutes(),
        'second': this.gameNew.dd.getSeconds()
      };
    }
    // remove info from members from last game, empty memebers
    this.gameNew.members.map(m => {
      m.camisole = false;
      m.ball = false;
      m.play = 0;
      return m;
    });
    this.gameNew.id = '' + Math.floor(Math.random()); // FIXME
    this.modalService.open(dlg, { centered: true }).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
      // only OK is here
      console.log(result);
      this.onGameNewDlgOk();
    }, (reason) => { // close, esc
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      console.log(reason);
      // this.memberNew = new Member();
    });
  }

  onGameNewDlgOk() {
    this.gameNew.dt.setHours(this.gameNew.dtt.hour);
    this.gameNew.dt.setMinutes(this.gameNew.dtt.minute);
    this.gameNew.dt.setSeconds(this.gameNew.dtt.second);
    this.gameNew.dd.setHours(this.gameNew.ddt.hour);
    this.gameNew.dd.setMinutes(this.gameNew.ddt.minute);
    this.gameNew.dd.setSeconds(this.gameNew.ddt.second);
    this.gameNew.max = this.group.max;
    this.gameNew.min = this.group.min;
    this.gameNew.id = this.fbService.uid();
    this.gameNew.place_id = this.place.id;
    this.gameNew.group_id = this.group.id;
    this.gameNew.play = 1;
    console.log(this.gameNew);
    this.fbService
      .createGame(this.gameNew)
      .subscribe();
    this.gameNew.place = this.place;
    this.gameNew.group = this.group;
    this.games.push(this.gameNew);
    this.games.sort(function (a, b) { return b.dt > a.dt ? -1 : b.dt < a.dt ? 1 : 0; });
  }


  onPlayGame(game: Game) {
    // game.play = 9;
    this.fbService
      .updateGame(game)
      .subscribe(
        () => {

        }
      );
  }

  @ViewChild('dlggameremove') private dlggameremove: any;
  onGameRemoveDlg(game: Game) {
    this.gameNew = game;
    this.modalService.open(this.dlggameremove, { centered: true }).result.then((result) => {
      console.log(result);
      if (result === 'dlgremove') {
        this.fbService.removeGame(game.id).subscribe();
        this.games = this.games.filter((g) => g.id !== game.id);
        this.gameNew = null;
      }
    }, (reason) => { // close, esc
      console.log(reason);
      this.gameNew = null;
    });
  }

  onSubscribeToNotifications(tt: any) {
    if (!tt.isOpen()) {
      tt.open({ text: 'Klicken Sie noch mal, un die Push-Benachrichtigungen immer bekommen!' });
      return;
    } else {
      tt.close();
    }
    console.log('onSubscribeToNotifications');
    if (this.swPush.isEnabled) {
      console.log('onSubscribeToNotifications - Push-Service ist an');
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapid.publicKey,
      })
        .then(sub => {
          console.log('onSubscribeToNotifications - sub1 - ', sub);
          Object.assign(sub, { group_id: this.group.id });
          // Object.assign(sub, { place_id: this.place.id });
          Object.assign(sub, { active: 1 });
          console.log('onSubscribeToNotifications - sub2 - ', sub);
          this.pushService.addPushSubscriber(sub).subscribe(res => {
            console.log('[App] Add subscriber request answer', res);
          });
        })
        .catch(err => console.error('Could not subscribe to notifications', err));
    } else {
      console.log('Push-Service ist in ihrem Browser ausgeschaltet');
    }
  }

  onUnsubscribeNotifications() {
    console.log('onUnsubscribeNotifications');
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapid.publicKey,
      })
        .then(sub => {
          Object.assign(sub, { group_id: this.group.id });
          Object.assign(sub, { active: 0 });
          this.pushService.addPushSubscriber(sub).subscribe(res => {
            console.log('[App] Add subscriber request answer', res);
          });
        })
        .catch(err => console.error('Could not unsubscribe to notifications', err));
    } else {
      console.log('Push-Service ist in ihrem Browser ausgeschaltet');
    }
  }

  onSendNotifications(tt: any) {
    if (!tt.isOpen()) {
      tt.open({ text: 'Klicken Sie noch mal, un alle Mitglieder über Push-Benachrichtigungen noch mal informieren!' });
      return;
    } else {
      tt.close();
    }
    console.log('sendNotifications1');
    this.pushService.sendNotifications(this.group.id, this.place.id).subscribe(res => {
      console.log('sendNotifications2', res);
    });
  }

  onLockGroup() {
    // game.play = 9;
    this.group.status = this.group.status === 1 ? 5 : 1;
    this.fbService
      .updateGroup(this.group)
      .subscribe(
        () => {

        }
      );
  }

  onGroupRemDlg(dlg: any) {
    this.modalService.open(dlg, { size: 'sm', centered: true }).result.then(() => {
      this.fbService
        .removeGroup(this.group)
        .subscribe(
          () => {
            this.router.navigate(['/groups', { place_id: this.place.id }]);
          }
        );
    }, () => { // close, esc
      // this.wait = false;
    });
  }

  // convenience getter for easy access to form fields
  get fg() { return this.frmg.controls; }

  onGroupEditDlg(dlg: any) {
    console.log('fg - ', this.fg);
    // this.group = new Group();
    this.fg.title.setValue(this.group.title);
    this.fg.sport.setValue(this.group.sport);
    this.fg.owner.setValue(this.group.owner);
    // this.groupMembersCurr = this.group.member;
    // const memberscurr = this.group.member.map(m => ({ value: m, display: m }));
    this.fg.membercurr.setValue(this.group.member);
    this.fg.member.setValue('');
    this.fg.min.setValue(this.group.min);
    this.fg.max.setValue(this.group.max);
    this.fg.ball.setValue(this.group.ball);
    this.fg.camisole.setValue(this.group.camisole);
    this.fg.pay.setValue(this.group.pay);
    this.fg.status.setValue(this.group.status);
    this.modalService.open(dlg, { size: 'lg', centered: true }).result.then(() => {
      // this.onGroupAddDlgOk();
    }, () => { // close, esc
      // this.wait = false;
      // console.log(reason);
      // this.group = null;
    });
  }

  onGroupEditMemberDlg() {
    this.groupMemberEdit = !this.groupMemberEdit;
  }

  onGroupEditDlgOk(dlg: any, bSend: boolean) {
    // stop here if form is invalid
    console.log('this.frmg.value.member - ', this.frmg.value.member);

    if (this.frmg.invalid) {
      return;
    }

    dlg('close modal');

    // this.wait = true;
    this.group.title = this.frmg.value.title;
    this.group.sport = this.frmg.value.sport;
    this.group.min = this.frmg.value.min;
    this.group.max = this.frmg.value.max;
    this.group.owner = this.frmg.value.owner;
    // this.group.member = this.frmg.value.member.split(",").map((i: string) => i.trim());
    const groupMembersCurr = this.frmg.value.membercurr; //.map(e => e.value);
    const groupMembersNew = this.frmg.value.member; //.map(e => e.value); //this.group.member.filter(e => this.groupMembersCurr.includes(e));
    this.group.member = groupMembersCurr.concat(groupMembersNew);
    this.group.ball = this.frmg.value.ball;
    this.group.camisole = this.frmg.value.camisole;
    this.group.pay = this.frmg.value.pay;
    this.group.status = this.frmg.value.status;

    this.fbService
      .updateGroup(this.group)
      .subscribe(() => {
        console.log('onGroupAddDlgOk - mailer.group', environment.mailer.group);

        // if new members are here
        if (groupMembersNew && bSend) {
          const fd = new FormData();
          const body = {
            to: groupMembersNew,
            subject: 'Einladung zu neue Gruppe: ' + this.group.title,
            body: 'Neue Gruppe: ' + this.group.title + '<br>'
              + 'Sie wurden mitzuspielen eingeladen: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.amember + '">' + this.group.title + '</a>' + '<br>'
          };

          console.log('onGroupEditDlgOk - member.body - ', body);
          fd.append('json', JSON.stringify(body));

          this.mailer.sendGroup(fd).subscribe(res => {
            // this.wait = false;
            console.log('[App] Mailer send-group', res);
          },
            (error: any) => {
              console.log('[App] Mailer Error', error);
            }
          );
        }

      });
  }

  onGroupMemberRem(m: string) {
    this.group.member = this.group.member.filter((e) => e !== m);
    this.fbService
      .updateGroup(this.group)
      .subscribe(() => {
        console.log('onGroupMemberRem - this.group.member', this.group.member);
      });
  }

  onImageAdd(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // this.avatar64 = e.target.result;
        console.log('e.target.result', e.target.result);
        const that = this;
        const img = new Image();
        img.src = (e.target as any).result;
        img.onload = function () {
          const elem = document.createElement('canvas'); // Use Angular's Renderer2 method
          const maxSize = 300;
          let ratio = 1;
          if (img.width > maxSize || img.height > maxSize) {
            ratio = Math.min(maxSize / img.width, maxSize / img.height);
          }
          elem.width = img.width * ratio;
          elem.height = img.height * ratio;
          const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width * ratio, img.height * ratio);
          console.log('ctx.canvas.toDataURL', ctx.canvas.toDataURL('image/jpeg', 0.5));
          that.avatar64 = ctx.canvas.toDataURL('image/jpeg', 0.5);
          const byteLength = (that.avatar64).replace(/=/g, '').length * 0.75;
          console.log('ctx.canvas - new size', byteLength);

          that.fbService.uploadData(that.avatar64, 'groups', that.group.id)
            .subscribe((r) => {
              console.log('r', r);
              // Object.assign(firmaData, { logo: r });
              that.group.avatar = r as string;
              that.fbService.updateGroup(that.group).subscribe(data => {
                // sub(data, r);
              });
            });

        };
      };
      console.log('event.target.files[0]', event.target.files[0]);
      reader.readAsDataURL(event.target.files[0]);
      this.avatar64u = true;
    }
  }

  onImageRem() {
    this.avatar64 = '';
    // console.log(this.logourl);
    this.avatar64u = true;
    this.fbService.uploadData(this.avatar64, 'groups', this.group.id)
      .subscribe((r) => {
        console.log('r', r);
        this.group.avatar = '';
        this.fbService.updateGroup(this.group).subscribe(data => {
          // 
        });
      });
  }

  // @ViewChild('dlgzusage') private dlgzusage: any;
  memberNew: Member = new Member();
  game: Game;
  onGameMemberNewDlg(game:Game, dlg: any) {
    this.game = game;
    this.memberNew = new Member();
    this.memberNew.nick = localStorage.getItem('memberMe');
    const modalRef = this.modalService.open(dlg, { centered: true });
    modalRef.result.then(() => {
      // if (result === 'oknew') {
      this.onGameMemberNewDlgOk();
      // }
    }, (reason) => { // close, esc
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onGameMemberNewDlgOk() {
    console.log(this.memberNew);
    if (!this.memberNew.nick) {
      alert('Name darf nicht leer sein!');
      return;
    }
    localStorage.setItem('memberMe', this.memberNew.nick);
    this.memberNew.play = 1;
    let bMemberFound = false;

    this.game.members = this.game.members.map((mem) => {
      if (mem.nick === this.memberNew.nick) {
        this.memberNew.id = mem.id;
        mem = this.memberNew;
        bMemberFound = true;
      }
      return mem;
    });
    // this.game = new Game(this.game);
    if (!bMemberFound) {
      this.memberNew.id = this.fbService.uid();
      this.game.members.push(this.memberNew);
      this.fbService
        .createMember(this.game, this.memberNew)
        .subscribe();
    } else {
      this.fbService
        .updateMember(this.game, this.memberNew)
        .subscribe();
    }
    // this do the trick for array of objects in the child component, with help of Get-Set
    this.games = this.games.map(g => g.id === this.game.id ? new Game(g) : g); 
    console.log(this.game.members);
    // this.membersInit();
    this.game = null;
    this.memberNew = new Member();
  }

  public memberValidators = [this.memberEmailValid];
  public memberErrorMessages = {
    'valid_email': 'Ungültige E-Mail!'
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

  nnn(email: string) {
    if (!email) return '';
    let n = email.split('@')[0];
    return n.split(/[.\-_]/).join(' ');
  }

  nn(email: string) {
    if (!email) return '';
    let n = email.split('@')[0];
    n = n.split(/[.\-_]/).join(' ');
    return n.match(/\b(\w)/g).join('');
  }

  public switchgm = 1;
  switchGM(n: number) {
    this.switchgm = -1;
    setTimeout(()=>{ this.switchgm = n; }, 600)
    
  }

}
