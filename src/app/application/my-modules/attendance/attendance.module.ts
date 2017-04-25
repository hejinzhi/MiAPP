import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { IonicModule } from 'ionic-angular';
import { AttendanceComponent } from './attendance.component';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import { OverTimeFormComponent } from './over-time-form/over-time-form.component';
import { HoildayDetailComponent } from './hoilday-detail/holiday-detail.component';
import { CallbackLeaveFormComponent } from './callback-leave-form/callback-leave-form.component';
import { BusinessFormComponent } from './business-form/business-form.component';
import { FormListComponent } from './form-list/form-list.component';
import { UndoneFormComponent } from './undone-form/undone-form.component';
import { SearchComponent } from './search/search.component';
import { SearchFormComponent } from './search-form/search-form.component';
import { FormMenuComponent } from './form-menu/form-menu.component';
import { LeaveSubComponent } from './leave-sub/leave-sub.component';
import { LeaveMessageMenuComponent } from './leave-message-menu/leave-message-menu.component';
import { ListFilterComponent } from './list-filter/list-filter.component';
import { DetailBetweenFormComponent } from './detail-between-form/detail-between-form.component';
import { SwipeNoteComponent } from './swipe-note/swipe-note.component';
import { AttendanceDetailComponent } from './attendance-detail/attendance-detail.component';
import { DetailOnFormComponent } from './detail-on-form/detail-on-form.component';
import { AttendanceMonthComponent } from './attendance-month/attendance-month.component';
import { StatisticsComponent } from './statistics/statistics.component';


import { ReasonTypePipe } from './shared/pipe/reason-type.pipe';
import { OtherTypePipe } from './shared/pipe/other-type.pipe';
import { FormTypePipe } from './shared/pipe/form-type.pipe';


@NgModule({
  imports:      [ CommonModule, IonicModule ],
  declarations: [
    AttendanceComponent,
    LeaveFormComponent,
    FormMenuComponent,
    OverTimeFormComponent,
    CallbackLeaveFormComponent,
    BusinessFormComponent,
    FormListComponent,
    UndoneFormComponent,
    SearchComponent,
    SearchFormComponent,
    HoildayDetailComponent,
    LeaveSubComponent,
    LeaveMessageMenuComponent,
    ListFilterComponent,
    DetailBetweenFormComponent,
    SwipeNoteComponent,
    AttendanceDetailComponent,
    DetailOnFormComponent,
    AttendanceMonthComponent,
    StatisticsComponent,
    ReasonTypePipe,
    FormTypePipe,
    OtherTypePipe
  ],
  entryComponents:[
    AttendanceComponent,
    LeaveFormComponent,
    FormMenuComponent,
    OverTimeFormComponent,
    CallbackLeaveFormComponent,
    BusinessFormComponent,
    FormListComponent,
    UndoneFormComponent,
    SearchComponent,
    SearchFormComponent,
    DetailBetweenFormComponent,
    HoildayDetailComponent,
    SwipeNoteComponent,
    LeaveSubComponent,
    LeaveMessageMenuComponent,
    AttendanceDetailComponent,
    DetailOnFormComponent,
    AttendanceMonthComponent,
    StatisticsComponent
  ],
  providers:    [ ]
})
export class AttendanceModule {}