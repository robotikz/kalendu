import { Component, OnInit } from '@angular/core';
import { Game } from '../model/game';
import { ActivatedRoute } from '@angular/router';
import { Place } from '../model/place';
import { PlaceDataService } from '../data-service/place-data.service';
import { forkJoin } from 'rxjs';
import { GameDataService } from '../data-service/game-data.service';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  games: Game[] = [];
  place: Place;

  constructor(
    private route: ActivatedRoute,
    private placeDataService: PlaceDataService,
    private gameDataService: GameDataService,
  ) { }

  ngOnInit() {
    // this.route.data
    const os = forkJoin(
      this.placeDataService.getPlaceById(this.route.queryParams['place_id']),
      // this.gameDataService.getAllGamesByPlace(this.route.queryParams['place_id'])
    );

    os.subscribe(
      (data) => {
        this.place = data[0];
        // this.games = data[1];
      }
    );
  }

}
