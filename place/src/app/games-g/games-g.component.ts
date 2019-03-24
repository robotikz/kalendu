import { Component, OnInit, ViewChild } from '@angular/core';
import { Place } from '../model/place';
import { Game } from '../model/game';
import { Group } from '../model/group';
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import {
  NgbModal, NgbCarouselConfig, NgbDateAdapter, NgbDateNativeAdapter,
  NgbDatepickerI18n, NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';
import { GameDataService } from '../data-service/game-data.service';
import { DeDatepickerI18n, I18n } from '../help/de-datepickerI-18n';
import { DeDateParserFormatter } from '../help/de-date-parser-formatter';
import { environment } from 'src/environments/environment';
import { SwPush } from '@angular/service-worker';
import { PusherService } from '../services/pusher.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { PlaceDataService } from '../data-service/place-data.service';
import { GroupDataService } from '../data-service/group-data.service';


@Component({
  selector: 'app-games-g',
  templateUrl: './games-g.component.html',
  styleUrls: ['./games-g.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter },
    I18n,
    { provide: NgbDatepickerI18n, useClass: DeDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: DeDateParserFormatter }
  ]
})
export class GamesGComponent implements OnInit {

  loading = true;

  games: Game[] = [];
  place: Place;
  group: Group;
  gameLast: Game;
  gameNew: Game = new Game();

  @ViewChild('dlgremove') private dlgremove: any;

  constructor(
    private gameDataService: GameDataService,
    private placeDataService: PlaceDataService,
    private groupDataServer: GroupDataService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    carouselConfig: NgbCarouselConfig,
    private swPush: SwPush,
    private pushService: PusherService,
    private spinner: NgxSpinnerService,
  ) {
    carouselConfig.interval = 0;
  }

  ngOnInit() {
    this.spinner.show();
    // this.route.data
    forkJoin([
      this.placeDataService.getPlaceByGroupId(this.route.snapshot.queryParams['group_id']),
      this.groupDataServer.getGroupById(this.route.snapshot.queryParams['group_id']),
      this.gameDataService.getAllGamesByGroupId(this.route.snapshot.queryParams['group_id']),
      this.gameDataService.getLastGameByGroupId(this.route.snapshot.queryParams['group_id'])
    ])
      .subscribe(
        (data) => {
          console.log('games-g - ngOnInit - ', data);
          this.place = data[0];
          this.group = data[1];
          this.games = data[2];
          this.gameLast = data[3];
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
    this.modalService.open(dlg, { ariaLabelledBy: 'dlg-title-gamenew' }).result.then((result) => {
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
    this.gameNew.id = this.gameDataService.uid();
    this.gameNew.place_id = this.place.id;
    this.gameNew.group_id = this.group.id;
    console.log(this.gameNew);
    this.gameDataService
      .createGame(this.gameNew)
      .subscribe();
    this.gameNew.place = this.place;
    this.gameNew.group = this.group;
    this.games.push(this.gameNew);
    this.games.sort(function (a, b) { return b.dt > a.dt ? -1 : b.dt < a.dt ? 1 : 0; });
  }


  onPlayGame(game: Game) {
    // game.play = 9;
    this.gameDataService
      .updateGame(game)
      .subscribe(
        () => {

        }
      );
  }

  onGameRemoveDlg(game) {
    this.modalService.open(this.dlgremove, { ariaLabelledBy: 'dlg-title-gameremove' }).result.then((result) => {
      console.log(result);
      if (result === 'dlgremove') {
        this.onRemoveGame(game);
      }
    }, (reason) => { // close, esc
      console.log(reason);
    });
  }

  onRemoveGame(game: Game) {
    this.gameDataService.removeGame(game.id).subscribe();
    this.games = this.games.filter((g) => g.id !== game.id);
  }

  onSubscribeToNotifications() {
    console.log('onSubscribeToNotifications');
    if (this.swPush.isEnabled) {
      console.log('Push-Service ist an');
      this.swPush.requestSubscription({
        serverPublicKey: environment.vapid.publicKey,
      })
        .then(sub => {
          Object.assign(sub, { group_id: this.group.id });
          // Object.assign(sub, { place_id: this.place.id });
          Object.assign(sub, { active: 1 });
          console.log('sub->', sub);
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

  onSendNotifications() {
    console.log('sendNotifications1');
    this.pushService.sendNotifications(this.group.id, this.place.id).subscribe(res => {
      console.log('sendNotifications2', res);
    });
  }

}
