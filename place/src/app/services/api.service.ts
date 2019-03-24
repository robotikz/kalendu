import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// import { Http, Response } from '@angular/http';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Place } from '../model/place';
import { Observable, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap, concatMap } from 'rxjs/operators';
import { Group } from '../model/group';
import { Game } from '../model/game';
import { Member } from '../model/member';
// import { SessionService } from './session.service';


const API_URL = environment.apiUrlLocal;

@Injectable()
export class ApiService {

  constructor(
    private http: HttpClient,
    // private session: SessionService
  ) {
  }

  public signIn(username: string, password: string) {
    return this.http
      .post(API_URL + '/sign-in', {
        username,
        password
      }).pipe(
        // map(response => response.json()),
        catchError(this.handleError)
      );
  }

  private getRequestOptions() {
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + this.session.accessToken
    });
    return { headers };
  }

  // API: GET /places
  public getAllPlaces(): Observable<Place[]> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/places', options)
      .pipe(
        map(res => {
          const places = res as Place[]; // .json();
          return places.map((place) => new Place(place));
        }),
        catchError(this.handleError)
      );
  }

  // API: POST /places
  public createPlace(place: Place): Observable<Place> {
    const options = this.getRequestOptions();
    return this.http
      .post(API_URL + '/places', place, options)
      .pipe(
        map(res => {
          return new Place(res);
        }),
        catchError(this.handleError)
      );
  }


  // API: GET /places/:id
  public getPlaceById(placeId: number): Observable<Place> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/places/' + placeId, options)
      .pipe(
        map(res => {
          return new Place(res);
        }),
        catchError(this.handleError)
      );
  }

  // API: PUT /places/:id
  public updatePlace(place: Place): Observable<Place> {
    const options = this.getRequestOptions();
    return this.http
      .put(API_URL + '/places/' + place.id, place, options)
      .pipe(
        map(res => {
          return new Place(res);
        }),
        catchError(this.handleError)
      );
  }


  // DELETE /places/:id
  public deletePlaceById(placeId: number): Observable<null> {
    const options = this.getRequestOptions();
    return this.http
      .delete(API_URL + '/places/' + placeId, options)
      .pipe(
        map(() => null),
        catchError(this.handleError)
      );
  }

  // ######################################################################
  // ######################################################################
  // API: GET /groups
  public getAllGroupsByPlace(placeId: number): Observable<Group[]> {
    const options = this.getRequestOptions();
    // console.log(API_URL + '/groups?place_id='+placeId);
    return this.http
      .get(API_URL + '/groups?place_id=' + placeId, options)
      .pipe(
        // filter(res => res["place_id"] === placeId),
        map(res => {
          const groups = res as Group[]; // .json();
          // console.log(groups.map((group) => new Group(group)));
          return groups.map((group) => new Group(group));
        }),
        catchError(this.handleError)
      );
  }

  // API: GET /groups/:id
  public getGroupById(groupId: number): Observable<Group> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/groups/' + groupId, options)
      .pipe(
        map(res => {
          return new Group(res);
        }),
        catchError(this.handleError)
      );
  }


  // ######################################################################
  // ######################################################################
  // API: POST /game
  public createGame(game: Game): Observable<Game> {
    const options = this.getRequestOptions();
    return this.http
      .post(API_URL + '/games', game, options)
      .pipe(
        map(res => {
          return new Game(res);
        }),
        catchError(this.handleError)
      );
  }

  // DELETE /games/:id
  public removeGame(gameId: string): Observable<null> {
    const options = this.getRequestOptions();
    return this.http
      .delete(API_URL + '/games/' + gameId, options)
      .pipe(
        map(() => null),
        catchError(this.handleError)
      );
  }

  // API: GET /games
  public getAllGamesByPlace(placeId: string): Observable<Game[]> {
    const options = this.getRequestOptions();
    // console.log(API_URL + '/groups?place_id='+placeId);
    return this.http
      .get(API_URL + '/groups?place_id=' + placeId, options)
      .pipe(
        // filter(res => res["place_id"] === placeId),
        map(res => {
          const groups = res as Group[]; // .json();
          // console.log(groups.map((group) => new Group(group)));
          return groups.map((group) => new Group(group));
        }),
        concatMap(groups => {
          // map every group into an array of observable requests
          const groupObservables = groups.map(group => this.getAllGamesByGroup(group));
          return forkJoin(...groupObservables);
        }),
        catchError(this.handleError)
      );
  }


  public getAllGamesByGroup(group: Group): Observable<Game[]> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/games?group_id=' + group.id, options)
      .pipe(
        map(res => {
          let games = res as Game[]; // .json();
          games = games.map((game) => new Game(game));
          // games = games.map((game) => {
          //   this.getPlaceById(placeId).subscribe(place => game.place=place);
          //   return game;
          // });

          return games.map((game) => {
            game.group = group;
            // this.getGroupById(game.group_id).subscribe(group => game.group=group);
            return game;
          });
        }),
        tap(() => {
          // console.log(games);
        }),
        catchError(this.handleError)
      );
  }


  public getAllGamesByGroupId(groupId: number): Observable<Game[]> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/games?group_id=' + groupId, options)
      .pipe(
        map(res => {
          const games = res as Game[]; // .json();
          return games.map((game) => new Game(game));
        }),
        tap(games => {
          console.log(games);
        }),
        catchError(this.handleError)
      );
  }

  // API: GET /games/:id
  public getGameById(gameId: string): Observable<Game> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/games/' + gameId, options)
      .pipe(
        map(res => {
          const game = new Game(res);
          game.members = game.members.map((member) => new Member(member));
          return game;
        }),
        catchError(this.handleError)
      );
  }


  // API: PUT /game/:id
  public updateGame(game: Game): Observable<Game> {
    const options = this.getRequestOptions();
    return this.http
      .put(API_URL + '/games/' + game.id, game, options)
      .pipe(
        map(res => {
          return new Game(res);
        }),
        catchError(this.handleError)
      );
  }

  public getAllGamesByPlace99(placeId: number): Observable<Game[]> {
    const options = this.getRequestOptions();
    return this.http
      .get(API_URL + '/games?place_id=' + placeId, options)
      .pipe(
        map(res => {
          const games = res as Game[]; // json();
          return games.map((game) => new Game(game));
          // games = games.map((game) => {
          //   this.getPlaceById(placeId).subscribe(place => game.place=place);
          //   return game;
          // });

          // games = games.map((game) => {
          //   // game.group=group;
          //   // this.getGroupById(game.group_id).subscribe(group => game.group=group);
          //   return game;
          // });
          // return games.map((game) => {
          //   game.dt = new Date(game.dt);
          //   if (game.dd) { game.dd = new Date(game.dt); }
          //   return game;
          // });
        }),
        // flatMap(games => {
        //   // map every user into an array of observable requests
        //   // let gamesObservables: Observable<Game>[] = [];
        //   let gamesObservables = games.map(game => this.getGroupById(game.group_id));
        //   return forkJoin(...gamesObservables);
        // }),
        tap(games => {
          console.log(games);
        }),
        catchError(this.handleError)
      );
  }


  private handleError(error: HttpErrorResponse | any) {
    console.error('ApiService::handleError', error);
    return throwError(error);
  }

}
