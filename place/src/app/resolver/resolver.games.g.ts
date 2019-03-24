import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { GameDataService } from '../data-service/game-data.service';
import { PlaceDataService } from '../data-service/place-data.service';
import { concatMap, map, tap } from 'rxjs/operators';
import { GroupDataService } from '../data-service/group-data.service';

@Injectable()
export class ResolverGamesG implements Resolve<Observable<any>> {

    constructor(
        private gameDataService: GameDataService,
        private placeDataService: PlaceDataService,
        private groupDataServer: GroupDataService
    ) {
    }

    public resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return forkJoin([
            this.placeDataService.getPlaceByGroupId(route.queryParams['group_id']),
            this.groupDataServer.getGroupById(route.queryParams['group_id']),
            this.gameDataService.getAllGamesByGroupId(route.queryParams['group_id']),
            this.gameDataService.getLastGameByGroupId(route.queryParams['group_id'])
        ]);
    }
}
