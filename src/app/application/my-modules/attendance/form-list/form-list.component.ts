import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, App, Platform, IonicPage } from 'ionic-angular';

import { PluginService }   from '../../../../core/services/plugin.service';
import { AttendanceService } from '../shared/service/attendance.service';

@IonicPage()
@Component({
  selector: 'sg-form-list',
  templateUrl: 'form-list.component.html',
})
export class FormListComponent {
  showList: boolean = false;

  type: string = '100';
  formData: any = [];
  approved: boolean = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private app: App,
    private platform: Platform,
    private plugin: PluginService,
    private attendanceService: AttendanceService
  ) {

  }
  async ionViewWillEnter() {
    this.showList = false;
    this.approved = this.navParams.data.approved || false;
    this.type = this.navParams.data.type || '100';
    this.formData = this.navParams.data.formData;
    if(!this.formData) {
      await this.getOffDutyException();
    }
    this.showList = true;
  }
  async getOffDutyException() {
    // let loading = this.plugin.createLoading();
    // loading.present();
    let res: any = await this.attendanceService.getOffDutyException();
    // loading.dismiss();
    if(res.status) {
      this.formData = res.content;
    } else {
      this.formData =[];
    }
  }
  exit() {
    this.platform.runBackButtonAction();
  }

  newForm() {
    let component: any = ''
    switch (Number(this.type)) {
      case 2:
        component = 'LeaveFormComponent';
        break;
      case 3:
        component = 'OverTimeFormComponent';
        break;
      case 4:
        component = 'BusinessFormComponent';
        break;
      default:
        break;
    }
    if(!component) return;
    this.navCtrl.push(component);
  }
}
