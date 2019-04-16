import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Game } from '../model/game';
import { interval, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Place } from '../model/place';
import { Member } from '../model/member';
import { Group } from '../model/group';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-list-item',
  templateUrl: './game-list-item.component.html',
  styleUrls: ['./game-list-item.component.css']
})
export class GameListItemComponent implements OnInit {

  @Input() game: Game;

  // @Input() groupTitle: string;
  @Input() group: Group;
  @Input() place: Place;
  @Input() gid: string;

  @Output() remove: EventEmitter<Game> = new EventEmitter();
  @Output() play: EventEmitter<Game> = new EventEmitter();

  membersa: Member[] = [];
  dlDays: string;
  dlHours: string;
  dlMinutes: string;
  dlSeconds: string;
  iNeed: number;
  dtDeadline: Date;
  bDeadline = true;
  bIsLoaded = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    console.log('ngOnInit - game - ', this.game);
    if (!this.game.dd) {
      this.dtDeadline = new Date(this.game.dt);
      // this.dtDeadline.setHours(this.game.dt.getHours() - this.game.deadline);
      this.dtDeadline.setSeconds(this.dtDeadline.getSeconds() - 1);
    } else {
      this.dtDeadline = this.game.dd;
      this.dtDeadline.setHours(this.game.ddt.hour);
      this.dtDeadline.setMinutes(this.game.ddt.minute);
    }
    this.membersInit();
    // console.log(this.game.id + ' ' + this.dtDeadline);
    interval(1000).pipe(
      map(() => {
        // this.dtDeadline.setSeconds(this.dtDeadline.getSeconds()-1);
        // console.log((this.game.dt.getTime() - this.dtDeadline.getTime())/ 1000);
        this.bDeadline = this.dtDeadline < new Date();
        return Math.floor((this.dtDeadline.getTime() - new Date().getTime()) / 1000);
      }),
    ).subscribe((dt) => {
      this.dhms(dt);
    });
    this.iNeed = this.game.min - this.membersa.length;
    // timer(2000).pipe(
    // ).subscribe(() => {
    //   this.bIsLoaded = true;
    //   console.log(this.bIsLoaded);
    // });
    this.bIsLoaded = true;
    // console.log(this.bIsLoaded);
  }

  private membersInit() {
    this.membersa = this.game.members.filter(m => m.play === 1);
    // this.membersi = this.game.members.filter(m => m.play === 0);
    // this.membersd = this.game.members.filter(m => m.play === 9);
    // this.gameHasCamisole = this.membersa.some(function(m) {
    //   return m.camisole === true ;
    // });
    // this.gameHasBall = this.membersa.some(function(m) {
    //   return m.ball === true;
    // });
  }

  onGameRemove() {
    console.log('onGameRemove - game - ', this.game);
    this.remove.emit(this.game);
  }

  onGamePlay(n: number) {
    this.game.play = n;
    console.log('onGamePlay - game - ', this.game);
    this.play.emit(this.game);
  }

  private dhms(t) {
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

  onNavigateGame() {
    this.router.navigate(['/gamem', { group_id: this.route.snapshot.params['group_id'], game_id: this.game.id }]);
  }


}
