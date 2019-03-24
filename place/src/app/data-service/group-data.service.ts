import { Injectable } from '@angular/core';
import { Group } from '../model/group';
import { Observable } from 'rxjs';
import { FbService } from '../services/fb.service';

@Injectable({
  providedIn: 'root'
})
export class GroupDataService {

  // Groupholder for last id so we can simulate
  // automatic incrementing of ids
  // lastId: number = 0;

  // groups: Group[] = [];

  constructor(
    private fb: FbService
  ) {

  }

  uid(): string {
    return this.fb.uid();
  }

  // Simulate GET /groups
  getAllGroupsByPlace(place_id: string): Observable<Group[]> {
    return this.fb.getAllGroupsByPlace(place_id);
  }

  // Simulate GET /places/:id
  getGroupById(group_id: string): Observable<Group> {
    return this.fb.getGroupById(group_id);
  }

}
