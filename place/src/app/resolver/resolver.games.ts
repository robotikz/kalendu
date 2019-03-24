import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { GameDataService } from '../data-service/game-data.service';
import { PlaceDataService } from '../data-service/place-data.service';

@Injectable()
export class ResolverGames implements Resolve<Observable<any>> {

    constructor(
        private gameDataService: GameDataService,
        private placeDataService: PlaceDataService
    ) {
    }

    public resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return forkJoin([
            this.placeDataService.getPlaceById(route.queryParams['place_id']),
            // this.gameDataService.getAllGamesByPlace(route.queryParams['place_id'])
        ]);
    }
}
