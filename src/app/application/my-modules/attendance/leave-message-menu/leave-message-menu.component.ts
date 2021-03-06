import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';

import { FormType } from '../shared/config/form-type';

import { AttendanceService } from '../shared/service/attendance.service';
import { PluginService }   from '../../../../core/services/plugin.service';

@IonicPage()
@Component({
  selector:'sg-leave-message-menu',
  templateUrl: 'leave-message-menu.component.html'
})
export class LeaveMessageMenuComponent {
  formType = new FormType();
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private attendanceService: AttendanceService,
    private plugin: PluginService
   ) {}

  ionViewDidLoad() {
  }

  swipe_note() {
    this.navCtrl.push('DetailBetweenFormComponent',{
      type:this.formType.swipe_note.type
    });
  }

  attendance_month() {
    this.navCtrl.push('DetailOnFormComponent',{
      type:this.formType.attendance_month.type
    });
  }

  attendance_detail() {
    this.navCtrl.push('DetailBetweenFormComponent',{
      type:this.formType.attendance_detail.type
    });
  }

  async to_detail() {
    let loading = this.plugin.createLoading();
    loading.present();
    let res = await this.attendanceService.getLeaveDays();
    loading.dismiss();
    if(!res) return;
    this.navCtrl.push('HoildayDetailComponent',{
      leaveDays:res
    });
  }
}
