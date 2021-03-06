import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, IonicPage } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';

import { ValidateService }   from '../../../../core/services/validate.service';
import { PluginService }   from '../../../../core/services/plugin.service';
import { AttendanceService } from '../shared/service/attendance.service';

import { HolidayType } from '../shared/config/holiday-type';

import { MyValidatorModel } from '../../../../shared/models/my-validator.model';
import { MyFormModel } from '../shared/models/my-form.model';

import { AttendanceConfig } from '../shared/config/attendance.config';

@IonicPage()
@Component({
  selector: 'sg-leave-form',
  templateUrl: 'leave-form.component.html'
})
export class LeaveFormComponent {

  private searchTerms = new Subject<string>();
  leaveMes: {
    reasonType: string,
    autoSet: boolean,
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string,
    colleague: string,
    reason: string,
  }
  formData: MyFormModel = {
    type: '2',
    status: '',
    No: '',
    data: {}
  }
  startHourRange: string = '';
  endHourRange: string = '';
  errTip:string ='';
  selectMaxYear = AttendanceConfig.SelectedMaxYear;
  haveSaved: boolean = false;
  todo: FormGroup;
  isSelectcolleague: boolean = false;   // todo 判断是否正确选择代理人
  tempcolleague: string = ''; // 临时作保存的中间代理人
  colleague: any;// 搜索得到的候选代理人
  timeError: string = '';
  dayLeave: string = '';
  hourLeave: string = '';
  myValidators: {};
  MyValidatorControl: MyValidatorModel;
  holidayType: any;
  translateTexts: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private validateService: ValidateService,
    private plugin: PluginService,
    private attendanceService: AttendanceService,
    public popoverCtrl: PopoverController,
    private translate: TranslateService
  ) {  }

  async ionViewDidLoad() {
    this.startHourRange = this.attendanceService.getTimeRange(0, 37);
    this.endHourRange = this.attendanceService.getTimeRange(0, 41);
    this.leaveMes = {
      reasonType: '',
      autoSet: false,
      startDate: '',
      startTime: '',
      endTime: '',//"2017-01-01T01:00:00Z",
      endDate: '',
      colleague: '',
      reason: ''
    }
    if (this.navParams.data.detailMes) {
      this.formData = this.navParams.data.detailMes;
      let detail = this.navParams.data.detailMes.data;
      for (let prop in this.leaveMes) {
        this.leaveMes[prop] = detail[prop]
      }
      this.dayLeave = this.navParams.data.detailMes.data.days || '';
      this.hourLeave = this.navParams.data.detailMes.data.hours || '';
      this.isSelectcolleague = true;
      this.tempcolleague = this.leaveMes.colleague;
      this.haveSaved = true;
    }
    this.subscribeTranslateText();
    this.todo = this.initWork(this.leaveMes);
    this.MyValidatorControl = this.initValidator(this.leaveMes);
    this.myValidators = this.MyValidatorControl.validators;
    this.holidayType = localStorage.getItem('leaveType') ? JSON.parse(localStorage.getItem('leaveType')) : new HolidayType().type;
    this.colleague = this.searchTerms
      .debounceTime(300)        // wait for 300ms pause in events
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => {
        if (term.trim().length > 0) {
          return this.attendanceService.getAgent(term);
        } else {
          return Observable.of<any>([])
        }
      })
      .catch(error => {
        // TODO: real error handling
        console.log(error)
        return Observable.of<any>([]);
      });
    if (!this.haveSaved && !this.todo.controls['startDate'].value && !this.todo.controls['endDate'].value) {
      this.leaveMes.startDate = this.leaveMes.endDate = await this.getWorkDay();
      this.todo = this.initWork(this.leaveMes);
      this.askForDuring();
    }
    this.addSubcribe();
  }

  subscribeTranslateText() {
    this.translate.get(['attendance.sign_success', 'attendance.save_success',
    'attendance.leave_reasonType_required_err', 'attendance.colleague_required_err', 'attendance.time_err',
     'attendance.reason_required_err','attendance.reason_minlength_err',
  ]).subscribe((res) => {
        this.translateTexts = res;
      })
  }

  addSubcribe() {
    for (let prop in this.myValidators) {
      this.todo.controls[prop].valueChanges.subscribe((value: any) => this.check(value, prop));
    };
    this.todo.controls['reasonType'].valueChanges.subscribe((value:string) => {
      let endDate = this.todo.controls.endDate;
      let startDate = this.todo.controls.startDate;
      this.attendanceService.getMaxDays(value).then((res) => {
        if(res.status && res.content) {
          endDate.setValue(this.formatDate(startDate.value,1000*60*60*24*(Number(res.content)-1)));
        } else {
          this.timeCheck();
        }
      })
    })
    let timeCheck = ['startDate', 'endDate', 'startTime', 'endTime'];
    for (let i = 0; i < timeCheck.length; i++) {
      let check = timeCheck[i];
      this.todo.controls[check].valueChanges.subscribe((value: any) => {
        this.timeCheck();
      })
    }
  }
  timeCheck() {
    let values = this.todo.controls;
    if (values.startDate.value && values.endDate.value && values.startTime.value && values.endTime.value) {
      let startTime = values.startDate.value + ' ' + values.startTime.value;
      let endTime = values.endDate.value + ' ' + values.endTime.value;
      this.timeError = (Date.parse(endTime) - Date.parse(startTime) <= 0) ? this.translateTexts['attendance.time_err'] : '';
    }
    if (!this.timeError) {
      this.askForDuring();
    } else {
      this.hourLeave = '';
      this.dayLeave = '';
    }
  }
  formatDate(date:string,add:number) {
    if(!Date.parse(date)) return this.todo.controls.startDate.value;
    let newDate = new Date(Date.parse(date)+add);
    let month = (newDate.getMonth()+1)>9?(newDate.getMonth()+1):'0'+(newDate.getMonth()+1);
    let day = newDate.getDate()>9?newDate.getDate():'0'+newDate.getDate();
    return newDate.getFullYear() + '-' + month + '-' +day;
  }
  initValidator(bind: any) {
    let newValidator = new MyValidatorModel([
      { name: 'reasonType', valiItems: [{ valiName: 'Required', errMessage: this.translateTexts['attendance.leave_reasonType_required_err'], valiValue: true }] },
      { name: 'colleague', valiItems: [{ valiName: 'Required', errMessage: this.translateTexts['attendance.colleague_required_err'], valiValue: true }] },
      { name: 'startDate', valiItems: [] },
      { name: 'endDate', valiItems: [] },
      { name: 'startDate', valiItems: [] },
      { name: 'endTime', valiItems: [] },
      { name: 'autoSet', valiItems: [] },
      {
        name: 'reason', valiItems: [
          { valiName: 'Required', errMessage: this.translateTexts['attendance.reason_required_err'], valiValue: true },
          { valiName: 'Minlength', errMessage: this.translateTexts['attendance.reason_minlength_err'], valiValue: 2 }
        ]
      }
    ], bind)
    return newValidator;
  }
  //初始化原始數據
  initWork(work: any): FormGroup {
    return this.formBuilder.group({
      reasonType: [work.reasonType, Validators.required],
      autoSet: [work.autoSet],
      startTime: [work.startTime, Validators.required],
      endTime: [work.endTime, Validators.required],
      startDate: [work.startDate, Validators.required],
      endDate: [work.endDate, Validators.required],
      colleague: [work.colleague, Validators.required],
      reason: [work.reason, Validators.required],
    });
  }
  // keyup觸發的方法
  search(item: any) {
    // todo 判断是否正确选择代理人
    if (this.tempcolleague) {
      this.isSelectcolleague = item.value != this.tempcolleague ? false : true;
    }
    this.searchTerms.next(item.value);
  }
  // 选取上级
  getcolleague(name: string) {
    this.isSelectcolleague = true;
    this.tempcolleague = name;
    this.searchTerms.next('')
    this.todo.controls['colleague'].setValue(name);
  }
  // 获得最近工作日，范围包括今天
  async getWorkDay() {
    let day: string = await this.attendanceService.getWorkDay();
    return day
  }
  //單獨輸入塊驗證
  check(value: any, name: string): Promise<any> {
    this.myValidators[name].value = value;
    if (!this.myValidators[name].dataset) return;
    let compare = this.myValidators[name].compare ? this.myValidators[this.myValidators[name].compare] : ''
    return this.validateService.check(this.myValidators[name], this.myValidators).then((prams) => {
      this.myValidators[name].error = prams.mes;
      this.myValidators[name].pass = !prams.mes;
      return Promise.resolve(this.myValidators);
    });
  }
  updateDuring(data: MyFormModel) {
    this.dayLeave = data.data.days || '';
    this.hourLeave = data.data.hours || '';
    Object.assign(this.leaveMes, this.todo.value);
    this.leaveMes.startTime = data.data.startTime;
    this.leaveMes.endTime = data.data.endTime;
    this.todo = this.initWork(this.leaveMes);
    this.addSubcribe();
  }
  async askForDuring() {
    let values = this.todo.controls
    if (values.startDate.value && values.endDate.value) {
      let tempData:MyFormModel = {
        type: this.formData.type,
        status: this.formData.status,
        No: this.formData.No,
        data: {
          reasonType: values.reasonType.value,
          autoSet: false,
          startDate: values.startDate.value,
          startTime: values.startTime.value,
          endTime: values.endTime.value,
          endDate: values.endDate.value,
          colleague: '',
          reason: ''
        }
      }
      let res: any = await this.attendanceService.getLeaveDuring(tempData);
      if (!res.status) {
        this.errTip = res.content;
      } else {
        this.errTip = '';
        this.updateDuring(res.content);
      };
    }
  }
  async presentPopover(myEvent: any) {
    let popover = this.popoverCtrl.create('FormMenuComponent',{
      this:this,
    });
    popover.present({
      ev: myEvent
    });
  }
  async leaveForm() {
    this.formData.data = this.todo.value
    let loading = this.plugin.createLoading();
    loading.present()
    let res: any = await this.attendanceService.sendSign(this.formData);
    loading.dismiss()
    if (res.status) {
      this.plugin.showToast(this.translateTexts['attendance.sign_success']);
      // this.navCtrl.popToRoot();
      let content = res.content;
      this.formData.status = 'WAITING';
      if (content) {
        this.errTip = ''
        this.hourLeave = content.HOURS;
        this.dayLeave = content.DAYS;
        this.formData.No = content.DOCNO
        this.haveSaved = true;
      }
    } else {
      this.errTip = res.content;
    }

    return false;
  }
  async saveForm() {
    this.formData.data = this.todo.value
    let loading = this.plugin.createLoading();
    loading.present()
    let res: any = await this.attendanceService.saveLeaveForm(this.formData);
    loading.dismiss()
    if (!res.status) {
      this.errTip = res.content;
    } else {
      this.errTip = '';
      let data = res.content
      this.dayLeave = data.DAYS;
      this.hourLeave = data.HOURS;
      this.formData.No = data.DOCNO
      this.formData.status = data.STATUS;
      this.haveSaved = true;
      this.plugin.showToast(this.translateTexts['attendance.save_success']);
    };

  }
}
