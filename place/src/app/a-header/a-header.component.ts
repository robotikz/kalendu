import { Component, OnInit, Input } from '@angular/core';
import { Group } from '../model/group';

@Component({
  selector: 'app-a-header',
  templateUrl: './a-header.component.html',
  styleUrls: ['./a-header.component.css']
})
export class AHeaderComponent implements OnInit {

  @Input() group: Group;
  @Input() gid: String;

  constructor() { }

  ngOnInit() {
  }

}
