import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Group } from '../model/group';
import { Place } from '../model/place';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-list-item',
  templateUrl: './group-list-item.component.html',
  styleUrls: ['./group-list-item.component.css']
})
export class GroupListItemComponent implements OnInit {

  @Input() group: Group;
  @Input() place: Place;

  @Output() lock: EventEmitter<Group> = new EventEmitter();
  @Output() dlgRequest: EventEmitter<Group> = new EventEmitter();

  ilock = 'lock';
  ilockopen = 'lock-open';

  constructor(
    public router: Router,
  ) {

  }

  ngOnInit() {
  }


  onLock(group: Group) {
    console.log(group);
    this.lock.emit(group);
  }

  onNavigatePublic(group: Group) {
    if (group.status === 1) {
      this.router.navigate(['/gamesg', { group_id: group.id }]);
    } else if (group.status === 5) {
      alert('Die Gruppe ist privat');
    }
  }

  onNavigateAdmin(group: Group) {
    alert('Admin-Link for test only');
    this.router.navigate(['/gamesg', { group_id: group.aowner }]);
  }

  onNavigateMember(group: Group) {
    alert('Member-Link for test only');
    this.router.navigate(['/gamesg', { group_id: group.amember }]);
  }

  onMailerSendRequestDlg(group: Group) {
    console.log(group);
    this.dlgRequest.emit(group);
  }
}
