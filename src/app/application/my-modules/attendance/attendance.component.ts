import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular'
import { NavController, NavParams,App} from 'ionic-angular';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { OverTimeFormComponent } from './over-time-form/over-time-form.component';
import { BusinessFormComponent } from './business-form/business-form.component';
import { FormListComponent } from './form-list/form-list.component';
import { LeaveSubComponent } from './leave-sub/leave-sub.component';
import { LeaveMessageMenuComponent } from './leave-message-menu/leave-message-menu.component';
import { StatisticsComponent } from './statistics/statistics.component';

@Component({
  selector:'sg-attendance',
  templateUrl: 'attendance.component.html'
})
export class AttendanceComponent {

  @ViewChild('attendance') attendance: Tabs;

  tab1Root = FormListComponent;
  tab2Root = OverTimeFormComponent;
  tab3Root = LeaveSubComponent;
  tab4Root = LeaveMessageMenuComponent;
  tab5Root = StatisticsComponent;

  constructor(public navCtrl: NavController, public navParams: NavParams, private app :App) {}

  ionViewDidLoad() {
    // this.app.getRootNav().setRoot(SearcheComponent)
  }

  maintain_leave():void{
    this.navCtrl.push(LeaveFormComponent);
  }

  maintain_OT():void{
    this.navCtrl.push(OverTimeFormComponent);
  }

  cancel_leave():void{
    this.navCtrl.push(FormListComponent,{
      type:'2',
      status:'APPROVED'
    });
  }

  maintain_business():void{
    this.navCtrl.push(BusinessFormComponent);
  }

  maintain_undone(num:number):void{
    this.navCtrl.push(FormListComponent,{
      type:num
    });
  }
}