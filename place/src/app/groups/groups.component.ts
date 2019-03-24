import { Component, OnInit } from '@angular/core';

import { map, tap } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { Group } from '../model/group';
import { Place } from '../model/place';
import { PlaceDataService } from '../data-service/place-data.service';
import { GroupDataService } from '../data-service/group-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  loading = true;

  groups: Group[] = [];
  place: Place;

  constructor(
    private placeDataService: PlaceDataService,
    private groupDataService: GroupDataService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.spinner.show();
    // this.route.data
    return forkJoin([
      this.placeDataService.getPlaceById(this.route.snapshot.queryParams['place_id']),
      this.groupDataService.getAllGroupsByPlace(this.route.snapshot.queryParams['place_id']),
    ])
      .subscribe(
        (data) => {
          this.place = data[0];
          this.groups = data[1];
          this.spinner.hide();
          this.loading = false;
        }
      );
  }

}
