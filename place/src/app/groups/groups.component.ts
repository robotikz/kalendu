import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Group } from '../model/group';
import { Place } from '../model/place';
import { PlaceDataService } from '../data-service/place-data.service';
import { GroupDataService } from '../data-service/group-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MailerService } from '../services/mailer.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  loading = true;
  wait = false;

  groups: Group[] = [];
  place: Place;
  frm: FormGroup;
  frmg: FormGroup;
  group: Group;

  constructor(
    private placeDataService: PlaceDataService,
    private groupDataService: GroupDataService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private mailer: MailerService,
  ) { }

  ngOnInit() {
    this.spinner.show();
    // this.route.data
    console.log('this.route.snapshot.params[place_id] - ', this.route.snapshot.params['place_id']);
    return forkJoin([
      this.placeDataService.getPlaceById(this.route.snapshot.params['place_id']),
      this.groupDataService.getAllGroupsByPlace(this.route.snapshot.params['place_id']),
    ])
      .subscribe(
        (data) => {
          this.place = data[0];
          this.groups = data[1];
          this.spinner.hide();
          this.loading = false;
          this.frm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            body: ['', Validators.required],
          });
          this.frmg = this.formBuilder.group({
            owner: ['', [Validators.required, Validators.email]],
            member: [''],
            title: ['', Validators.required],
            min: [1, [Validators.required, Validators.min(1)]],
            max: [2, [Validators.required, Validators.min(2)]],
            ball: [false],
            camisole: [false],
            status: [5]
          });
        }
      );
  }

  onLockGroup(group: Group) {
    // game.play = 9;
    group.status = group.status === 1 ? 5 : 1;
    this.groupDataService
      .updateGroup(group)
      .subscribe(
        () => {

        }
      );
  }

  // convenience getter for easy access to form fields
  get f() { return this.frm.controls; }

  mailerSendRequestDlg(dlg: any, group: Group) {
    this.group = group;
    this.f.email.setValue('');
    this.f.body.setValue('Hi, mein Name ist: , ich möchte gerne mitspielen');
    this.modalService.open(dlg, { size: 'lg' }).result.then(() => {
      this.mailerSendRequestDlgOk();
    }, () => { // close, esc
      this.wait = false;
      // console.log(reason);
      this.group = null;
    });
  }

  mailerSendRequestDlgOk() {
    // stop here if form is invalid
    if (this.frm.invalid) {
      return;
    }
    this.wait = true;
    console.log('mailerSendRequestDlgOk - mailer.request', environment.mailer.request);
    const fd = new FormData();
    const body = {
      to: this.group.owner,
      email: 'Neuer Mitspieler/-in',
      body: this.f.body.value + ' ' + this.f.email.value,
    };
    console.log('mailerSendRequestDlgOk - body - ', body);
    fd.append('json', JSON.stringify(body));

    this.mailer.sendRequest(fd).subscribe(res => {
      this.wait = false;
      console.log('[App] Mailer send-request answer', res);
      this.group = null;
    },
      error => {
        console.log('[App] Mailer Error', error);
        this.group = null;
      }
    );
  }



  // convenience getter for easy access to form fields
  get fg() { return this.frmg.controls; }

  onGroupAddDlg(dlg: any) {
    console.log('fg - ', this.fg);
    this.fg.title.setValue('');
    this.fg.owner.setValue('');
    this.fg.member.setValue('');
    this.fg.min.setValue(8);
    this.fg.max.setValue(12);
    this.fg.ball.setValue(false);
    this.fg.camisole.setValue(false);
    this.modalService.open(dlg, { size: 'lg' }).result.then(() => {
      // this.onGroupAddDlgOk();
    }, () => { // close, esc
      this.wait = false;
      // console.log(reason);
      this.group = null;
    });
  }

  onGroupAddDlgOk(dlg: any) {
    // stop here if form is invalid
    if (this.frmg.invalid) {
      return;
    }

    dlg('close modal');

    this.wait = true;
    this.group = new Group();
    this.group.aowner = this.groupDataService.uid();
    this.group.amember = this.groupDataService.uid();
    this.group.id = this.groupDataService.uid();
    this.group.place_id = this.place.id;
    this.group.title = this.frmg.value.title;
    this.group.min = this.frmg.value.min;
    this.group.max = this.frmg.value.max;
    this.group.owner = this.frmg.value.owner;
    this.group.member = this.frmg.value.member.split(",").map((i: string) => i.trim());
    this.group.ball = this.frmg.value.ball;
    this.group.camisole = this.frmg.value.camisole;
    this.group.status = this.frmg.value.status;

    this.groupDataService
      .createGroup(this.group)
      .subscribe(() => {
        this.groups.push(this.group);
        console.log('onGroupAddDlgOk - mailer.group', environment.mailer.group);

        let fd = new FormData();
        let body = {
          to: this.group.owner,
          subject: 'Neue Gruppe: ' + this.group.title,
          body: 'Neue Gruppe: ' + this.group.title + '<br>'
            + 'Adminlink: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.aowner + '">Adminlink</a>' + '<br>'
            + 'Mitgliederlink: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.amember + '">Mitgliederlink</a>' + '<br>'
            + 'Wenn die Gruppe öffentlich, dann: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.id + '">für alle</a>' + '<br>'
          ,
        };

        console.log('onGroupAddDlgOk - body - ', body);
        fd.append('json', JSON.stringify(body));

        this.mailer.sendGroup(fd).subscribe(res => {
          this.wait = false;
          console.log('[App] Mailer send-group', res);
          this.group = null;
        },
          error => {
            console.log('[App] Mailer Error', error);
            this.group = null;
          }
        );

        // if members are here
        if (this.group.member) {
          fd = new FormData();
          body = {
            to: this.frmg.value.member,
            subject: 'Einladung zu neue Gruppe: ' + this.group.title,
            body: 'Neue Gruppe: ' + this.group.title + '<br>'
              + 'Sie wurden mitzuspielen eingeladen: ' + '<a href="' + location.hostname + '/gamesg;group_id=' + this.group.amember + '">' + this.group.title + '</a>' + '<br>'
          };

          console.log('onGroupAddDlgOk - member.body - ', body);
          fd.append('json', JSON.stringify(body));

          this.mailer.sendGroup(fd).subscribe(res => {
            this.wait = false;
            console.log('[App] Mailer send-group', res);
            this.group = null;
          },
            error => {
              console.log('[App] Mailer Error', error);
              this.group = null;
            }
          );
        }

      });
  }

}
