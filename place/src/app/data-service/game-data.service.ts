import { Injectable } from '@angular/core';
import { Game } from '../model/game';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FbService } from '../services/fb.service';
import { Member } from '../model/member';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {

  // Gameholder for last id so we can simulate
  // automatic incrementing of ids
  lastId = 0;

  games: Game[] = [];

  constructor(private fb: FbService) {

  }

  uid(): string {
    return this.fb.uid();
  }

  // POST /games/:id
  createGame(game: Game): Observable<Game> {
    return this.fb.createGame(game);
  }

  // PUT /games/:id
  updateGame(game: Game): Observable<Game> {
    return this.fb.updateGame(game);
  }

  // DELETE /games/:id
  removeGame(gameId: string): Observable<Game> {
    return this.fb.removeGame(gameId);
  }

  // Simulate GET /games
  // getAllGamesByPlace(place_id: string): Observable<Game[]> {
  //   return this.api.getAllGamesByPlace(place_id)
  //     .pipe(
  //       map(data => {
  //         // let datas = data['games'];
  //         let rdata = [];
  //         data.forEach(da => {
  //           rdata = rdata.concat(da);
  //         });
  //         rdata = rdata.sort(function (a, b) { return b.dt > a.dt ? -1 : b.dt < a.dt ? 1 : 0; });
  //         rdata = rdata.filter(function (a) { return new Date() < a.dt; });
  //         // console.log(finalResult)
  //         return rdata;
  //       }),
  //     );
  // }


  // GET /games
  getAllGamesByGroupId(group_id: string): Observable<Game[]> {
    return this.fb.getAllGamesByGroupId(group_id)
      .pipe(
        map(data => {
          // console.log('getAllGamesByGroupId');
          data = data.sort(function (a, b) { return b.dt > a.dt ? -1 : b.dt < a.dt ? 1 : 0; });
          // console.log(data);
          data = data.filter(function (a) { return new Date() < a.dt; });
          // console.log(data);
          return data;
        }),
      );
  }

  // FIXME: better with HTTP request filter!!!
  getLastGameByGroupId(group_id: string): Observable<Game> {
    return this.fb.getAllGamesByGroupId(group_id)
      .pipe(
        map(data => {
          // const rdata = [];
          if (data.length > 0) {
            data = data.sort(function (a, b) { return b.dt > a.dt ? -1 : b.dt < a.dt ? 1 : 0; });
            data = data.filter(function (a) { return new Date() > a.dt; });
            // rdata.push(data[data.length - 1]);
            return data[data.length - 1];
          }
          // return rdata;
        }),
      );
  }

  // Simulate GET /games/:id
  getGameById(gameId: string): Observable<Game> {
    return this.fb.getGameById(gameId);
  }

  // Add Member to game
  addMember1(game: Game) {
    return this.fb.updateGame(game);
  }

  // Add Member to game
  updateMember(game: Game, member: Member) {
    return this.fb.updateMember(game, member);
  }

  // Add Member to game
  createMember(game: Game, member: Member) {
    return this.fb.createMember(game, member);
  }

}
