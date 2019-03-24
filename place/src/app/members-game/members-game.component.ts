import { Component, OnInit, AfterViewInit } from '@angular/core';

import { Member } from '../model/member';
import { Game } from '../model/game';
import { GameDataService } from '../data-service/game-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Observable } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { FormControl } from '@angular/forms';

import { NgbModal, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
// import $ from 'jquery';
// declare var $: any;


@Component({
  selector: 'app-members-game',
  templateUrl: './members-game.component.html',
  styleUrls: ['./members-game.component.css'],
})
export class MembersGameComponent implements OnInit, AfterViewInit {

  loading = true;
  // memberNickInput: FormControl;
  // memberNickSuggestions: string[] = [];

  game: Game;
  // place: Place;
  // group: Group;
  membersa: Member[] = [];
  membersi: Member[] = [];
  membersd: Member[] = [];

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
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    carouselConfig: NgbCarouselConfig,
    private spinner: NgxSpinnerService,
  ) {
    carouselConfig.interval = 0;
  }

  // setValue() { this.memberNickInput.setValue('new value'); }

  ngOnInit() {
    this.spinner.show();
    // this.memberNickInput = new FormControl('');
    // this.route.data
    this.gameDataService.getGameById(this.route.snapshot.paramMap.get('id'))
      .subscribe(
        (data) => {
          // this.place = place;
          // console.log(this.game);
          // console.log(this.group);
          // console.log(this.place);
          console.log(data);
          this.game = data;
          // this.group = this.game.group;
          // this.place = this.game.place;
          this.membersInit();
          this.dtDeadline = new Date(this.game.dt);
          // this.dtDeadline.setHours(this.game.dt.getHours() - this.game.deadline);
          this.dtDeadline.setSeconds(this.dtDeadline.getSeconds() - 1);
          const dtNow = new Date();
          if (this.membersa.length < this.game.min && this.dtDeadline < dtNow) {
            this.router.navigate(['/gamesg'], { queryParams: { place_id: this.game.place_id, group_id: this.game.group_id } });
          }
          interval(1000).pipe(
            map(() => {
              return Math.floor((this.dtDeadline.getTime() - new Date().getTime()) / 1000);
            }),
          ).subscribe((dt) => {
            this.dhms(dt);
          });
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
    // $('.dlg-zusage').carousel(0);
    // $('.dlg-zusage-new-ok').show();
    // $('.dlg-zusage-edit-ok').hide();
    // $('.dlg-zusage').modal('show');

    this.modalService.open(dlg, { ariaLabelledBy: 'dlg-title-zusage' }).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
      // only OK is here
      console.log(result);
      if (result === 'oknew') {
        this.onMemberNewDlgOk();
      }
    }, (reason) => { // close, esc
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onMemberNewDlgOk() {
    console.log(this.memberNew);
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

  onMemberDeclineDlg(dlg) {
    this.memberNew = new Member();
    this.memberNew.nick = localStorage.getItem('memberMe');

    this.modalService.open(dlg, { ariaLabelledBy: 'dlg-title-absage' }).result.then((result) => {
      // only OK is here
      console.log(result);
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
      .subscribe(
        (game) => {
          this.game = game;
        }
      );
    this.membersInit();
  }

  onSelectedMemberEditDlg(memberInput: Member, dlg) {
    this.memberDlg = 2;
    this.memberNickEdit = memberInput.nick;
    this.memberNew = memberInput;
    // $('.dlg-zusage').carousel(0);
    // $('.dlg-zusage-edit-ok').show();
    // $('.dlg-zusage-new-ok').hide();
    // $('.dlg-zusage').modal('show');
    this.modalService.open(dlg, { ariaLabelledBy: 'dlg-title-zusage' }).result.then((result) => {
      // only OK is here
      console.log(result);
      if (result === 'okedit') {
        this.onSelectedMemberEditDlgOk();
      }
    }, (reason) => { // close, esc
      console.log(reason);
      this.memberNew = new Member();
    });
  }

  onSelectedMemberEditDlgOk() {
    console.log(this.memberNew);
    console.log(this.memberNickEdit);
    // Object.assign(this.game.members.find(mem => mem.nick === this.memberNickEdit), this.memberNew);
    this.game.members = this.game.members.map((mem) => {
      mem = (mem.nick === this.memberNickEdit ? this.memberNew : mem);
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

  private dhms(t) {
    let days, hours, minutes, seconds;
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
    this.gameHasCamisole = this.membersa.some(function (m) {
      return m.camisole === true;
    });
    this.gameHasBall = this.membersa.some(function (m) {
      return m.ball === true;
    });
  }

}
