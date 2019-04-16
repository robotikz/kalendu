import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { Member } from '../model/member';
import { Game } from '../model/game';
import { GameDataService } from '../data-service/game-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Observable, forkJoin } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { FormControl } from '@angular/forms';

import { NgbModal, NgbDateAdapter, NgbDateNativeAdapter, NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { PusherService } from '../services/pusher.service';
import { Group } from '../model/group';
import { GroupDataService } from '../data-service/group-data.service';
import { I18n, DeDatepickerI18n } from '../help/de-datepickerI-18n';
import { DeDateParserFormatter } from '../help/de-date-parser-formatter';


@Component({
  selector: 'app-members-game',
  templateUrl: './members-game.component.html',
  styleUrls: ['./members-game.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    I18n,
    { provide: NgbDatepickerI18n, useClass: DeDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: DeDateParserFormatter }
  ]
})
export class MembersGameComponent implements OnInit, AfterViewInit {

  loading = true;
  // memberNickInput: FormControl;
  // memberNickSuggestions: string[] = [];
  gid: string;

  game: Game;
  // place: Place;
  // group: Group;
  membersa: Member[] = []; // members yes
  membersi: Member[] = []; // members waiting for yes/no
  membersd: Member[] = []; // members no
  memberse: Member[] = []; // members empty

  memberNew: Member = new Member();
  // tslint:disable-next-line:no-inferrable-types
  memberNickEdit: string = '';
  gameHasCamisole: boolean;
  gameHasBall: boolean;
  memberDlg = 1;

  dlDays: string;
  dlHours: string;
  dlMinutes: string;
  dlSeconds: string;
  iNeed: number;
  private dtDeadline: Date;

  // @ViewChild('dlgzusage') dlgzusage: ElementRef;


  memberNickSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        const nicks = this.game.members.map(m => m.nick);
        return term.length < 2 ? [] : nicks.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
      })
    )

  constructor(
    private gameDataService: GameDataService,
    private groupDataService: GroupDataService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private pushService: PusherService,
    // carouselConfig: NgbCarouselConfig,
  ) {
    // carouselConfig.interval = 0;
    // carouselConfig.showNavigationArrows = true;
    // carouselConfig.showNavigationIndicators = false;
  }

  // setValue() { this.memberNickInput.setValue('new value'); }

  ngOnInit() {
    this.spinner.show();
    // this.memberNickInput = new FormControl('');
    // this.route.data
    this.gid = this.route.snapshot.params['group_id'];
    const oo = forkJoin(
      this.gameDataService.getGameById(this.route.snapshot.params['game_id']),
      this.groupDataService.getGroupByAccessId(this.gid)
    );

    oo.subscribe(
      (data) => {
        console.log('gameDataService.getGameById - ', data);
        this.game = data[0] as Game;
        const gr = data[1] as Group;
        if (!gr) {
          alert('Gruppe ist nicht gefunden, privat oder keine Rechte');
          this.router.navigate(['/gamesg', { group_id: this.gid }]);
          return;
        }
        // this.game.group = data[1] as Group;
        // this.group = this.game.group;
        // this.place = this.game.place;
        this.membersInit();
        this.deadlineInit();
        this.spinner.hide();
        this.loading = false;
      }
    );

  }

  ngAfterViewInit() {

  }

  onMemberNewDlg(dlg: any) {
    this.memberNew = new Member();
    this.memberNew.nick = localStorage.getItem('memberMe');
    this.memberDlg = 1;
    const modalRef = this.modalService.open(dlg, { centered: true });
    // console.log('dlg', this.dlgzusage.nativeElement);
    modalRef.result.then(() => {
      // if (result === 'oknew') {
      this.onMemberNewDlgOk();
      // }
    }, (reason) => { // close, esc
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onMemberNewDlgOk() {
    console.log(this.memberNew);
    if (!this.memberNew.nick) {
      alert('Name darf nicht leer sein!');
      return;
    }
    localStorage.setItem('memberMe', this.memberNew.nick);
    this.memberNew.play = 1;
    let bMemberFound = false;
    // bMemberFound = this.game.members.some(function (m) {
    //   return m.nick === this.memberNew.nick;
    // });
    this.game.members = this.game.members.map((mem) => {
      if (mem.nick === this.memberNew.nick) {
        this.memberNew.id = mem.id;
        mem = this.memberNew;
        bMemberFound = true;
      }
      // mem = (mem.nick === this.memberNew.nick ? this.memberNew : mem);
      return mem;
    });
    if (!bMemberFound) {
      this.memberNew.id = this.gameDataService.uid();
      this.game.members.push(this.memberNew);
      this.gameDataService
        .createMember(this.game, this.memberNew)
        .subscribe();
    } else {
      this.gameDataService
        .updateMember(this.game, this.memberNew)
        .subscribe();
    }
    console.log(this.game.members);
    this.membersInit();
    this.memberNew = new Member();
  }

  onMemberDeclineDlg(dlg: any) {
    this.memberNew = new Member();
    this.memberNew.nick = localStorage.getItem('memberMe');

    this.modalService.open(dlg, { centered: true }).result.then(() => {
      this.onMemberDeclineDlgOk();
    }, (reason) => { // close, esc
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onMemberDeclineDlgOk() {
    console.log(this.memberNew);
    this.memberNew.play = 9;
    let bMemberFound = false;
    this.game.members = this.game.members.map((mem) => {
      if (mem.nick === this.memberNew.nick) {
        this.memberNew.id = mem.id;
        mem = this.memberNew;
        bMemberFound = true;
      }
      // mem = (mem.nick === this.memberNew.nick ? this.memberNew : mem);
      return mem;
    });
    // this.game.members.push(this.memberNew);
    console.log(this.game.members);
    if (!bMemberFound) {
      this.memberNew.id = this.gameDataService.uid();
      this.game.members.push(this.memberNew);
      this.gameDataService
        .createMember(this.game, this.memberNew)
        .subscribe();
    } else {
      this.gameDataService
        .updateMember(this.game, this.memberNew)
        .subscribe();
    }
    this.membersInit();
    this.memberNew = new Member();
  }

  onSelectedMemberDecline(member: Member) {
    member.play = 9;
    console.log(member);
    this.game.members = this.game.members.map((mem) => {
      mem.play = (mem.id === member.id ? 9 : mem.play);
      return mem;
    });
    this.gameDataService
      .updateMember(this.game, member)
      .subscribe(
        () => {
          // this.game = game;
        }
      );
    this.membersInit();
  }

  onSelectedMemberAccept(member: Member) {
    member.play = 1;
    console.log(member);
    this.game.members = this.game.members.map((mem) => {
      mem.play = (mem.id === member.id ? 1 : mem.play);
      return mem;
    });
    this.gameDataService
      .updateMember(this.game, member)
      .subscribe();
    this.membersInit();
  }

  onSelectedMemberEditDlg(member: Member, dlg: any) {
    this.memberDlg = 2;
    this.memberNickEdit = member.nick;
    this.memberNew = new Member(member);
    console.log('memberInput - ', member);
    this.modalService.open(dlg, { centered: true }).result.then((result) => {
      // only OK is here
      console.log(result);
      if (result === 'ok') {
        this.onSelectedMemberEditDlgOk();
      } else if (result === 'decline') {
        this.onMemberDeclineDlgOk()
      }
    }, (reason) => { // close, esc
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onSelectedMemberEditDlgOk() {
    console.log('this.memberNew - ', this.memberNew);
    if (!this.memberNew.nick) {
      alert('Name darf nicht leer sein!');
      return;
    }
    console.log('this.memberNickEdit - ', this.memberNickEdit);
    // Object.assign(this.game.members.find(mem => mem.nick === this.memberNickEdit), this.memberNew);
    this.memberNew.play = 1;
    this.game.members = this.game.members.map((mem) => {
      mem = (mem.id === this.memberNew.id ? this.memberNew : mem);
      return mem;
    });
    console.log(this.game.members);
    this.gameDataService
      .updateMember(this.game, this.memberNew)
      .subscribe();
    this.membersInit();
    localStorage.setItem('memberMe', this.memberNew.nick);
    this.memberNew = new Member();
    this.memberNickEdit = '';
    // $('.dlg-zusage').modal('hide');
  }

  onGameMinMaxDlg(dlg: any) {
    const min = this.game.min;
    const max = this.game.max;
    this.modalService.open(dlg, { centered: true }).result.then(() => {
      // if (result === 'oknew') {
      this.gameDataService
        .updateGame(this.game).subscribe();
      this.membersInit();
      // }
    }, () => { // close, esc
      this.game.min = min;
      this.game.max = max;
    });
  }

  onGameDeadlineDlg(dlg: any) {
    const dd = this.game.dd;
    const ddt = this.game.ddt;
    this.modalService.open(dlg, { centered: true }).result.then(() => {
      // if (result === 'oknew') {
      this.game.dt.setHours(this.game.dtt.hour);
      this.game.dt.setMinutes(this.game.dtt.minute);
      this.game.dt.setSeconds(this.game.dtt.second);
      this.game.dd.setHours(this.game.ddt.hour);
      this.game.dd.setMinutes(this.game.ddt.minute);
      this.game.dd.setSeconds(this.game.ddt.second);
      this.gameDataService
        .updateGame(this.game).subscribe();
      this.deadlineInit();
      // }
    }, () => { // close, esc
      this.game.dd = dd;
      this.game.ddt = ddt;
    });
  }

  onGameDTStartDlg(dlg: any) {
    const dt = this.game.dt;
    const dtt = this.game.dtt;
    this.modalService.open(dlg, { centered: true }).result.then(() => {
      // if (result === 'oknew') {
      this.game.dt.setHours(this.game.dtt.hour);
      this.game.dt.setMinutes(this.game.dtt.minute);
      this.game.dt.setSeconds(this.game.dtt.second);
      this.game.dd.setHours(this.game.ddt.hour);
      this.game.dd.setMinutes(this.game.ddt.minute);
      this.game.dd.setSeconds(this.game.ddt.second);
      this.gameDataService
        .updateGame(this.game).subscribe();
      this.deadlineInit();
      // }
    }, () => { // close, esc
      this.game.dt = dt;
      this.game.dtt = dtt;
    });
  }

  onGameSettsDlg(dlg: any) {
    const min = this.game.min;
    const max = this.game.max;
    const dt = this.game.dt;
    const dtt = this.game.dtt;
    const dd = this.game.dd;
    const ddt = this.game.ddt;
    this.modalService.open(dlg, { centered: true }).result.then(() => {
      // if (result === 'oknew') {
      this.game.dt.setHours(this.game.dtt.hour);
      this.game.dt.setMinutes(this.game.dtt.minute);
      this.game.dt.setSeconds(this.game.dtt.second);
      this.game.dd.setHours(this.game.ddt.hour);
      this.game.dd.setMinutes(this.game.ddt.minute);
      this.game.dd.setSeconds(this.game.ddt.second);
      this.gameDataService
        .updateGame(this.game).subscribe();
      this.deadlineInit();
      this.membersInit();
      // }
    }, () => { // close, esc
      this.game.dt = dt;
      this.game.dtt = dtt;
      this.game.dd = dd;
      this.game.ddt = ddt;
      this.game.min = min;
      this.game.max = max;
    });
  }

  private dhms(t: number) {
    let days: number, hours: number, minutes: number, seconds: number;
    days = Math.floor(t / 86400);
    t -= days * 86400;
    hours = Math.floor(t / 3600) % 24;
    t -= hours * 3600;
    minutes = Math.floor(t / 60) % 60;
    t -= minutes * 60;
    seconds = t % 60;
    this.dlDays = '' + days;
    this.dlHours = '' + hours;
    this.dlMinutes = '' + minutes;
    this.dlSeconds = '' + seconds;
  }

  private membersInit() {
    this.membersa = this.game.members.filter(m => m.play === 1);
    this.membersi = this.game.members.filter(m => m.play === 0);
    this.membersd = this.game.members.filter(m => m.play === 9);
    this.memberse = [];
    if (this.membersa.length < this.game.max) {
      for (let i = 0; i < (this.game.max - this.membersa.length); i++) {
        const m = new Member();
        m.play = 7;
        this.memberse.push(m);
      }
    }

    this.gameHasCamisole = this.membersa.some(function (m) {
      return m.camisole === true;
    });
    this.gameHasBall = this.membersa.some(function (m) {
      return m.ball === true;
    });
  }

  private deadlineInit() {
    this.dtDeadline = new Date(this.game.dt);
    if (!this.game.dd) {
      this.dtDeadline = new Date(this.game.dt);
      this.dtDeadline.setSeconds(this.dtDeadline.getSeconds() - 1);
    } else {
      this.dtDeadline = this.game.dd;
      this.dtDeadline.setHours(this.game.ddt.hour);
      this.dtDeadline.setMinutes(this.game.ddt.minute);
    }
    // this.dtDeadline.setHours(this.game.dt.getHours() - this.game.deadline);
    // this.dtDeadline.setSeconds(this.dtDeadline.getSeconds() - 1);
    const dtNow = new Date();
    if (this.membersa.length < this.game.min && this.dtDeadline < dtNow) {
      this.router.navigate(['/gamesg', { place_id: this.game.place_id, group_id: this.gid }]);
    }
    interval(1000).pipe(
      map(() => {
        return Math.floor((this.dtDeadline.getTime() - new Date().getTime()) / 1000);
      }),
    ).subscribe((dt) => {
      this.dhms(dt);
    });
  }

  onSendNotifications() {
    console.log('sendNotifications1');
    this.pushService.sendNotifications(this.game.group.id, this.game.place.id).subscribe(
      res => {
        console.log('sendNotifications2', res);
        alert('Alle Teilnehmer wurden benachrichtigt');
      },
      err => {
        console.log('sendNotifications Error', err);
        alert(err.message)
      }
    );
  }

}
