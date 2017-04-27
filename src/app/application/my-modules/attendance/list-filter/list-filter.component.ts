import { Component, Input, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UndoneFormComponent } from '../undone-form/undone-form.component';
import { LeaveFormComponent } from '../leave-form/leave-form.component';
import { BusinessFormComponent } from '../business-form/business-form.component';
import { CallbackLeaveFormComponent } from '../callback-leave-form/callback-leave-form.component';
import { OverTimeFormComponent } from '../over-time-form/over-time-form.component';
import { TabsComponent } from '../../../../tabs/tabs.component'

import { MyFormModel } from '../shared/models/my-form.model';

@Component({
  selector: 'sg-list-filter',
  templateUrl: 'list-filter.component.html',
})
export class ListFilterComponent implements OnInit {

  @Input() myset: any;

  type: string;
  items: MyFormModel[];
  showApproved: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams) { }

  ngOnInit() {
    this.type = this.myset.type;
    this.items = this.myset.formData || [];
    this.showApproved = this.myset.showApproved;
    if(this.items.length > 0) return;
    this.initializeItems();
  }

  initializeItems() {
    switch (this.type) {
      case '2':
        this.items = [
          {
            type: '2',
            status: 'APPROVED',
            No: 'HTL021703007171',
            data: {
              reasonType: 'P',
              startTime: '2017-01-01T01:00:00Z',
              endTime: '2017-01-05T01:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '小米',
              reason: '有急事'
            }
          },
          {
            type: '2',
            status: 'New',
            No: 'HTL021703008115',
            data: {
              reasonType: 'P',
              startTime: '2017-01-01T01:00:00Z',
              endTime: '2017-01-05T01:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '小米',
              reason: '有急事'
            }
          },
          {
            type: '2',
            status: 'WAITING',
            No: 'HTL021703017178',
            data: {
              reasonType: 'P',
              startTime: '2017-01-01T01:00:00Z',
              endTime: '2017-01-05T01:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '小米',
              reason: '有急事'
            }
          }
        ];
        if (this.showApproved) {
          this.items = this.items.filter((item: any) => {
            return item.status.toUpperCase() === 'APPROVED';
          })
        }
        break;
      case '3':
        this.items = [
          {
            type: '3',
            status: 'APPROVED',
            No: 'HTL021704006124',
            data: {
              reasonType: '01',
              OTtime: '2017-04-01',
              startTime: '11:00',
              endTime: '22:00',
              reason: '有急事'
            }
          },
          {
            type: '3',
            status: 'New',
            No: 'HTL021703007572',
            data: {
              reasonType: '02',
              OTtime: '2017-04-06',
              startTime: '11:00',
              endTime: '12:00',
              reason: '有急事'
            }
          }
        ]
        break;
      case '4':
        this.items = [
          {
            type: '4',
            status: 'New',
            No: 'HTL021703007572',
            data: {
              reasonType: '20',
              autoSet: false,
              colleague: 'xiaomi',
              businessTime: '2017-03-01',
              startTime: '01:00',
              endTime: '02:00',
              reason: '有急事'
            }
          },
          {
            type: '4',
            status: 'WAITING',
            No: 'HTL021703007572',
            data: {
              reasonType: '20',
              autoSet: false,
              colleague: 'xiaomi',
              businessTime: '2017-03-01',
              startTime: '01:00',
              endTime: '02:00',
              reason: '有急事'
            }
          },
          {
            type: '4',
            status: 'APPROVED',
            No: 'HTL021703004572',
            data: {
              reasonType: '30',
              autoSet: false,
              colleague: 'xiaomi',
              businessTime: '2017-01-01',
              startTime: '18:30',
              endTime: '21:00',
              reason: '有急事'
            }
          }
        ]
        break;
      case '5':
        this.items = [
          {
            type: '5',
            status: 'APPROVED',
            No: 'HTL021703004172',
            data: {
              leave_No: 'HTL021703002172',
              reason: '提早康复'
            }
          },
          {
            type: '5',
            status: 'New',
            No: 'HTL021704001172',
            data: {
              leave_No: 'HTL021703002152',
              reason: '车票买早了'
            }
          },
          {
            type: '5',
            status: 'WAITING',
            No: 'HTL021704001572',
            data: {
              leave_No: 'HTL021703002152',
              reason: '车票买早了'
            }
          }
        ]
        break;
      default:
        this.items = [
          {
            type: '0',
            status: 'New',
            No: 'HTL021703007172',
            data: {
              reasonType: '',
              startTime: '2017-01-01T10:00:00Z',
              endTime: '2017-01-01T11:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '',
              reason: ''
            }
          },
          {
            type: '1',
            status: 'New',
            No: 'HTL021703008116',
            data: {
              reasonType: '',
              startTime: '2017-01-01T01:00:00Z',
              endTime: '2017-01-05T01:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '',
              reason: ''
            }
          },
          {
            type: '0',
            status: 'New',
            No: 'HTL021703017188',
            data: {
              reasonType: '',
              startTime: '2017-01-01T09:00:00Z',
              endTime: '2017-01-01T11:00:00Z',//"2017-01-01T01:00:00Z",
              colleague: '',
              reason: ''
            }
          }
        ];
        break;

    }
    this.items.sort((a: MyFormModel, b: MyFormModel) => {
      let first = this.getStatusPoint(a.status);
      let second = this.getStatusPoint(b.status);
      return second - first;
    })
    if(Number(this.type) === 100){
      this.items.sort((a: MyFormModel, b: MyFormModel) => {
        if(b.type === a.type) {
          return Date.parse(a.data.startTime)-Date.parse(b.data.startTime)
        }
        return Number(b.type) - Number(a.type);
      })
    }

  }
  getStatusPoint(status: string):number {
    let res = 0
    switch (status.toUpperCase()) {
      case 'NEW':
        res = 3
        break;
      case 'WAITING':
        res = 2;
        break;
      case 'APPROVED':
        res = 1;
        break;
      default:
        break;
    }
    return res;
  }
  getItems(ev: any) {
    this.initializeItems();
    let val = ev.target.value;
    if (val && val.trim() != '') {
      this.items = this.items.filter((item: any) => {
        return (item.No.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  toDetail(detailMes: any) {
    let targetForm: any = '';
    switch (this.type) {
      case '2':
        targetForm = LeaveFormComponent;
        break;
      case '3':
        targetForm = OverTimeFormComponent;
        break;
      case '4':
        targetForm = BusinessFormComponent;
        break;
      case '5':
        targetForm = CallbackLeaveFormComponent;
        break;
      default:
        targetForm = UndoneFormComponent;
        break;
    }
    this.navCtrl.push(targetForm, {
      detailMes: detailMes
    })
  }
}
