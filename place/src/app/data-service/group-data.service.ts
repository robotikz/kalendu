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

  // Simulate GET /places/:id
  getGroupByAccessId(group_id: string): Observable<Group> {
    return this.fb.getGroupByAccessId(group_id);
  }

  // PUT /games/:id
  updateGroup(group: Group): Observable<any> {
    return this.fb.updateGroup(group);
  }

  // PUT /games/:id
  createGroup(group: Group): Observable<any> {
    return this.fb.createGroup(group);
  }

  removeGroup(group: Group): Observable<any> {
    return this.fb.removeGroup(group);
  }


}
