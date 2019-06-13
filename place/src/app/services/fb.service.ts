import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, of, forkJoin, from, zip } from 'rxjs';
import { Place } from '../model/place';
import { Injectable } from '@angular/core';
import { map, mergeMap, first, concatMap } from 'rxjs/operators';
import { Group } from '../model/group';
import { Game } from '../model/game';
import { Member } from '../model/member';
import * as firebase from 'firebase';



@Injectable({
  providedIn: 'root'
})
export class FbService {

  constructor(
    private afs: AngularFirestore,
    private afsr: AngularFireStorage
  ) {
  }

  public uid(): string {
    return this.afs.createId();
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  private toJCreate(data: any) {
    const timestamp = this.timestamp;
    return {
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp,
    };
  }

  private toJUpdate(data: any) {
    const timestamp = this.timestamp;
    return {
      ...data,
      updatedAt: timestamp,
    };
  }


  // API: GET /places/:id
  public getPlaceById(placeId: string): Observable<Place> {
    return this.afs.doc<Place>('places/' + placeId).snapshotChanges().pipe(
      map(doc => {
        // console.log(doc);
        const data = doc.payload.data();
        const id = doc.payload.id;
        const r = { id, ...data };
        const place = new Place(r);
        // console.log(`places/${id}/sports`);
        console.log(r);
        return place;
      }),
      first()
    );
  }

  public getAllPlaces(): Observable<any> {
    return this.afs.collection<any>('places').snapshotChanges().pipe(
      map(docs => {
        const res = docs.map(doc => {
          console.log(doc);
          const data = doc.payload.doc.data(); // as Place;
          const id = doc.payload.doc.id;
          const r = { id, ...data };
          // console.log(`places/${id}/sports`);
          // console.log(r);
          // const place = new Place(r);
          // console.log(place);
          return r;
          // const places = res as Place[];
          // return places.map((place) => new Place(place));
          // return place;
        });
        return res;
        // return concatMap(...res);
      }),
      // concatMap(places => {
      //   // console.log(result);
      //   // return of([new Place()]);
      //   // return result;
      //   const placeObservables = places.map(place => {
      //     return this.afs
      //       .collection<any>(`places/${place.id}/sports`)
      //       .valueChanges().pipe(
      //         map(sports => {
      //           // console.log(sports);
      //           // place.sports = sports;
      //           // return place;
      //           // const rr = { ...place, sports: sports };
      //           place.sports = sports;
      //           // console.log(rr);
      //           return place;
      //           // return Object.assign(r, {sports});
      //         }),
      //         first()
      //       );
      //   });
      //   if (placeObservables.length === 0) {
      //     return of([]); // The workaround is to check the length of the list and to not use this operator when it is empty.
      //   }
      //   return forkJoin(...placeObservables);
      // }),
      first()
    );
  }

  // API: GET /groups/:id/places/:id
  public getPlaceByGroupId(groupId: string): Observable<Place> {
    console.log('getPlaceByGroupId - groupId - ', groupId);
    return this.afs.doc<Group>('groups/' + groupId).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data();
        const placeId = data.place_id;
        return placeId;
      }),
      mergeMap(placeId => {
        return this.afs.doc<Place>('places/' + placeId).snapshotChanges().pipe(
          map(doc => {
            // console.log(doc);
            const data = doc.payload.data();
            const id = doc.payload.id;
            const r = { id, ...data };
            const place = new Place(r);
            // console.log(`places/${id}/sports`);
            console.log(r);
            return place;
          })
        );
      }),
      first()
    );
  }


  // ######################################################################
  // ######################################################################
  // API: GET /groups
  public getAllGroupsByPlace(placeId: string): Observable<Group[]> {
    return this.afs.collection<Group>('groups', ref =>
      ref.where('place_id', '==', placeId)).snapshotChanges().pipe(
        map(docs => docs.map(doc => {
          // console.log(doc);
          const data = doc.payload.doc.data() as Group;
          const id = doc.payload.doc.id;
          const r = { id, ...data };
          const group = new Group(r);
          // console.log(r);
          return group;
        })),
        concatMap(groups => {
          const groupObservables = groups.map(group => {
            return this.afs.
              collection<Game>('games', ref =>
                ref.where('group_id', '==', group.id).where('dt', '>', new Date()).orderBy('dt', 'asc').limit(1)).valueChanges().pipe(
                  map(docs => {
                    console.log('getAllGroupsByPlace - groupObservables - docs.length', docs.length);
                    if (docs.length) {
                      const game = new Game(docs.pop());
                      group.gamenext = game;
                    } else {
                      const game = new Game();
                      game.dt = new Date(2222, 0, 1); // fake for sorting to the bottom
                      group.gamenext = game;
                    }
                    return group;
                  }),
                  first()
                );
          });
          if (groupObservables.length === 0) {
            return of([]); // The workaround is to check the length of the list and to not use this operator when it is empty.
          }
          return forkJoin(...groupObservables);
        }),
        map(groups => groups.sort((g1: any, g2: any) => g1.gamenext.dt.getTime() - g2.gamenext.dt.getTime())), //sort desc
        first()
      );
  }

  // API: GET /groups/:id
  public getGroupById(groupId: string): Observable<Group> {
    return this.afs.doc<Group>('groups/' + groupId).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        const r = { id, ...data };
        return new Group(r);
      }),
      first()
    );
  }

  // API: GET /groups/:id
  public getGroupByAccessId(groupId: string): Observable<Group> {
    return this.afs.collection<Group>('groups', ref =>
      ref.where('aowner', '==', groupId).limit(1)).valueChanges().pipe(
        map(docs => {
          if (docs.length) {
            return new Group(docs.pop());
          } else {
            return null;
          }
        }),
        concatMap(group => {
          console.log('getGroupByAccessId - aowner - ', group);
          if (group) {
            return of(group);
          } else {
            return this.afs.collection<Group>('groups', ref =>
              ref.where('amember', '==', groupId).limit(1)).valueChanges().pipe(
                map(docs => {
                  if (docs.length) {
                    return new Group(docs.pop());
                  } else {
                    return null;
                  }
                }),
                first()
              );
          }
        }),
        concatMap(group => {
          console.log('getGroupByAccessId - amember - ', group);
          if (group) {
            return of(group);
          } else {
            return this.afs.doc<Group>('groups/' + groupId).valueChanges().pipe(
              map(doc => {
                console.log('getGroupByAccessId - id - doc - ', doc);
                if (!doc) { return null; }
                if (doc.status === 1) {
                  return new Group(doc);
                } else {
                  return null;
                }
              }),
              first()
            );
          }
        }),
        first()
      );
  }

  // API: PUT /group/:id
  public updateGroup(group: Group) {
    return from(
      this.afs.collection('groups').doc(group.id).update(this.toJUpdate(group.toJSON()))
        .then(() => {
          return group.id;
        })
    );
  }

  // API: PUT /group/:id
  public createGroup(group: Group) {
    return from(
      this.afs.collection('groups').doc(group.id).set(this.toJCreate(group.toJSON()))
        .then(() => {
          return group.id;
        })
    );
  }

  // API: 
  public removeGroup(group: Group) {
    // remove group
    const o1 = from(
      this.afs.collection('groups').doc(group.id).delete()
        .then(() => {
          return 'group-' + group.id;
          // throw new Error('Error: set document-2');
        }).catch((e) => {
          console.error('Error removing document: ', e);
          throw new Error('Error: remove document');
        })
    );
    // remove games
    const o2 = this.afs.collection('games', ref => ref.where('group_id', '==', group.id))
      .snapshotChanges()
      .pipe(
        map(docs => docs.map(doc => {
          const uid = doc.payload.doc.id;
          return uid;
        })),
        concatMap(uids => {
          console.log('remGroup - concatMap-games', uids);
          const oRemove = uids.map(uid => {
            return this.afs.collection('games').doc(uid).delete()
              .then(() => {
                return 'game-' + uid;
                // throw new Error('Error: set document-2');
              }).catch((e) => {
                console.error('Error removing document: ', e);
                throw new Error('Error: remove document');
              });
          });
          console.log('remGroup - oRemove', oRemove);
          if (oRemove.length === 0) {
            return of([]); // The workaround is to check the length of the list and to not use this operator when it is empty.
          }
          return zip(...oRemove);
        }),
        // first()
      );
    return zip(o1, o2);
  }


  // ######################################################################
  // ######################################################################

  // API: GET /games/:group_id
  public getAllGamesByGroupId(groupId: string): Observable<Game[]> {
    console.log('getAllGamesByGroupId - groupId - ', groupId);
    return this.afs.collection<Game>('games', ref =>
      ref.where('group_id', '==', groupId).where('dt', '>', new Date()).orderBy('dt', 'asc')).snapshotChanges().pipe(
        map(docs => docs.map(doc => {
          console.log('getAllGamesByGroupId');
          console.log(doc.payload.doc.data());
          const data = doc.payload.doc.data() as Game;
          // console.log(doc.payload.doc.data());
          const id = doc.payload.doc.id;
          const r = { id, ...data };
          const game = new Game(r);

          console.log(game);
          return game;
        })),
        concatMap(games => {
          console.log('getAllGamesByGroupId - games - ', games);
          const gameObservables = games.map(game => {
            return this.afs
              .collection<any>(`games/${game.id}/members`)
              .valueChanges().pipe(
                map(members => {
                  members = members.map(e => new Member(e));
                  const rr = { ...game, members: members as Member[] };
                  return new Game(rr);
                }),
                first()
              );
          });
          if (gameObservables.length === 0) {
            return of([]); // The workaround is to check the length of the list and to not use this operator when it is empty.
          }
          return forkJoin(...gameObservables);
        }),
        concatMap(games => {
          console.log('getAllGamesByGroupId - games - ', games);
          const gameObservables = games.map(game => {
            return this.afs
            .doc<any>(`groups/${game.group_id}`)
            .valueChanges().pipe(
              map(group => {
                return new Game({ ...game, group: new Group(group) }); //{ ...game, group: group as Group };
              }),
              first()
            );
          });
          if (gameObservables.length === 0) {
            return of([]); // The workaround is to check the length of the list and to not use this operator when it is empty.
          }
          return forkJoin(...gameObservables);
        }),
        first()
      );
  }


  // API: GET /games/:group_id
  public getLastGameByGroupId(groupId: string): Observable<Game> {
    // console.log('getLastGameByGroupId - groupId - ', groupId);
    return this.afs.collection<Game>('games', ref =>
      ref.where('group_id', '==', groupId).orderBy('dt', 'desc').limit(1)).valueChanges().pipe(
        map(docs => {
          const games = docs.map(doc => {
            console.log('getLastGameByGroupId - ', doc);
            const game = new Game(doc);
            return game;
          });
          return games.pop();
        }),
        first()
      );
  }

  // API: GET /games/:group_id
  public getNextGameByGroupId(groupId: string): Observable<Game> {
    // console.log('getLastGameByGroupId - groupId - ', groupId);
    return this.afs.collection<Game>('games', ref =>
      ref.where('group_id', '==', groupId).where('dt', '>', new Date()).orderBy('dt', 'asc').limit(1)).valueChanges().pipe(
        map(docs => {
          const games = docs.map(doc => {
            console.log('getLastGameByGroupId - ', doc);
            const game = new Game(doc);
            return game;
          });
          return games.pop();
        }),
        first()
      );
  }

  // API: GET /games/:id
  public getGameById(gameId: string): Observable<Game> {
    // return this.db.doc<Game>('places/' + gameId).collection<Member>('members').snapshotChanges().pipe(
    return this.afs.doc<Game>('games/' + gameId).snapshotChanges().pipe(
      map(doc => {
        // map(docs => docs.map(doc => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        const r = { id, ...data };
        // const game = new Game(r);
        return r;
      }),
      concatMap(game => {
        return this.afs
          .collection<any>(`games/${game.id}/members`)
          .valueChanges().pipe(
            map(members => {
              const rr = { ...game, members: members };
              return rr;
            }),
            first()
          );
      }),
      concatMap(game => {
        return this.afs
          .doc<any>(`places/${game.place_id}`)
          .valueChanges().pipe(
            map(place => {
              return { ...game, place: place as Place };
            }),
            first()
          );
      }),
      concatMap(game => {
        return this.afs
          .doc<any>(`groups/${game.group_id}`)
          .valueChanges().pipe(
            map(group => {
              return { ...game, group: group as Group };
            }),
            first()
          );
      }),
      concatMap(game => of(new Game(game))),
      first()
    );
  }

  // API: PUT /games/:id/
  public createGame(game: Game) {
    return from(
      this.afs.collection<Game>('games').doc(game.id).set(this.toJCreate(game.toJSON()))
        .then(() => {
          return game.id;
        })
    );
  }

  // API: PUT /game/:id
  public updateGame(game: Game) {
    return from(
      this.afs.collection<Game>('games').doc(game.id).update(this.toJUpdate(game.toJSON()))
        .then(() => {
          return game.id;
        })
    );
  }

  // API: PUT /game/:id
  public removeGame(gameId: string) {
    return from(
      this.afs.collection<Game>('games').doc(gameId).delete()
        .then(() => {
          return gameId;
        })
    );
  }

  // API: PUT /games/:id/members/:id
  public updateMember(game: Game, member: Member) {
    return from(
      this.afs.collection<Game>('games').doc(game.id).collection('members')
        .doc(member.id).update(this.toJUpdate(member.toJSON()))
        .then(() => {
          return game.id;
        })
    );
  }

  // API: PUT /games/:id/members/:id
  public createMember(game: Game, member: Member) {
    return from(
      this.afs.collection<Game>('games').doc(game.id).collection('members')
        .doc(member.id).set(this.toJCreate(member.toJSON()))
        .then(() => {
          return game.id;
        })
    );
  }

  uploadData(b: string, typ: string, uid_name: string) {
    console.log('file-b', b);
    console.log('file-ref', typ + '/' + uid_name);
    const ref = this.afsr.storage.ref(typ + '/' + uid_name);
    if (b !== '') {
      // console.log('b1 - ', b);
      const newMetadata = {
        cacheControl: 'public,max-age=86400',
      };
      const o1 = from(ref.putString(b, 'data_url', newMetadata)
        .then((r1) => {
          console.log('uploadData - putString - ', r1);
          return ref.getDownloadURL()
            .then((r2) => {
              console.log('uploadData - getDownloadURL - ', r2);
              return r2;
            })
            .catch((e) => {
              console.log('uploadData - getDownloadURL - error', e);
              return '';
            });
        })
        .catch((e) => {
          console.log('uploadData - putString - error', e);
          return '';
        })
      );
      return o1;
    } else {
      // console.log('b2 - ', b);
      return from(
        ref.delete()
          .then(() => {
            console.log('uploadData - delete - ', typ + '/' + uid_name);
            return '';
          })
          .catch((e) => {
            console.log('uploadData - delete - error', e);
            return '';
          })
      );
    }
  }

}
