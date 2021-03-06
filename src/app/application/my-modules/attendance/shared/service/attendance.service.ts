import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

import { MyHttpService } from '../../../../../core/services/myHttp.service';
import { tify, sify } from 'chinese-conv';

import { MyFormModel } from '../models/my-form.model'

import { AttendanceConfig } from '../config/attendance.config'
import { HolidayType } from '../config/holiday-type'

import { PluginService } from '../../../../../core/services/plugin.service';

@Injectable()
export class AttendanceService {

  public updateFormList = new Subject<boolean>();
  translateTexts: any = {};
  constructor(
    private myHttp: MyHttpService,
    private plugin: PluginService,
    private translate: TranslateService
  ) {
     this.subscribeTranslateText()
  }

  subscribeTranslateText() {
    this.translate.stream(['attendance.month', 'not_found',
      'http_error1', 'http_error2', 'http_error3'
    ]).subscribe((res) => {
      this.translateTexts = res;
    })
  }

  // 根据日期或单号（优先单号）获取请假单
  getForm(formData: any) {
    let dateFM = '';
    let dateTO = '';
    let docNumUrl = '';
    let dateUrl = '';
    let get_fn: any = '';
    switch (Number(formData.type)) {
      case 2:
        docNumUrl = AttendanceConfig.getLeaveFormByNoUrl;
        dateUrl = AttendanceConfig.getLeaveFormByDateUrl;
        get_fn = this.editLeaveData_get;
        break;
      case 4:
        docNumUrl = AttendanceConfig.getLeaveFormByNoUrl;
        dateUrl = AttendanceConfig.getLeaveFormByDateUrl;
        get_fn = this.editLeaveData_get;
        break;
      case 3:
        docNumUrl = AttendanceConfig.getOverTimeFormByNoUrl;
        dateUrl = AttendanceConfig.getOverTimeFormByDateUrl;
        get_fn = this.editOverTime_get;
        break;
      default:
        break;
    }
    if (!(docNumUrl && dateUrl && get_fn)) return Promise.resolve([])
    let type = formData.type;
    if (formData.form_No) {
      return this.myHttp.get(docNumUrl + `TYPE=${type}&DOCNO=${formData.form_No.toUpperCase()}`).then((res) => {
        let formData = res.json();
        let list = [];
        formData = get_fn.call(this, formData, type);
        list.push(formData);
        return Promise.resolve({ content: list, status: true })
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve({ content: [], status: false })
      });
    } else {
      dateFM = formData.startTime || this.getMinStartTime(1);
      dateTO = formData.endTime || '';
      return this.myHttp.get(dateUrl + `type=${type}&dateFM=${dateFM}&dateTO=${dateTO}`).then((res) => {
        let formData = res.json();
        formData = formData.map((item: any) => {
          return get_fn.call(this, item, type)
        })
        return Promise.resolve({ content: formData, status: true })
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve({ content: [], status: false })
      });
    }
  }
  // 获取可销假的请假单
  getCanCallbackLeaveFrom() {
    return this.myHttp.get(AttendanceConfig.getCanCallbackLeaveFromUrl).then((res) => {
      let formData = res.json();
      formData = formData === null ? [] : formData.map((item: any) => {
        console.log(item)
        if (item.OFFDUTY_TYPE == '2') {
          return this.editLeaveData_get(item, '4');
        } else {
          return this.editLeaveData_get(item);
        }
      })
      return Promise.resolve(formData)
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve([])
    });
  }
  // 获得默认最小开始时间
  getMinStartTime(intervalMonth: number) {
    return new Date(Date.parse(new Date().toString()) - 1000 * 60 * 60 * 24 * 30 * intervalMonth).toDateString();
  }
  // 获得限制的时间段范围
  getTimeRange(form: number, to: number) {
    let range = '';
    for (let i = form; i < to + 1; i++) {
      range += i;
      if (i !== to) {
        range += ','
      }
    }
    return range
  }

  // 获得默认上班时间及更新请假时长
  getLeaveDuring(data: MyFormModel) {
    let sendData = this.editLeaveData_send(data);
    return this.myHttp.post(AttendanceConfig.getLeaveDuringUrl, sendData).then((res) => {
      let newData = this.editLeaveData_get(res.json(), data.type);
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err, false);
      return Promise.resolve({ content: errTip, status: false });
    });
  }

  // 获得最近工作日，范围包括今天
  getWorkDay(): Promise<string> {
    return this.myHttp.get(AttendanceConfig.getWorkDayUrl).then((res) => {
      let day = res.json().CDATE;
      day = day.substr(0, day.indexOf('T'));
      return Promise.resolve(day);
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err, false);
      return Promise.resolve('');
    });
  }
  // 请假单申请
  saveLeaveForm(data: MyFormModel) {
    let sendData = this.editLeaveData_send(data);
    return this.myHttp.post(AttendanceConfig.saveLeaveUrl, sendData).then((res) => {
      return Promise.resolve({ content: res.json(), status: true })
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: errTip, status: false })
    });
  }
  // 删除表单
  deleteForm(formData: MyFormModel) {
    switch (formData.type) {
      case '0':
        return Promise.resolve('');
      case '1':
        return Promise.resolve('');
      case '2':
        return this.deleteLeaveForm(formData);
      case '3':
        return this.deleteOverTimeForm(formData);
      case '4':
        return this.deleteLeaveForm(formData);
      case '5':
        return this.deleteCallbackLeaveFrom(formData);
      default:
        return Promise.resolve('');
    }
  }
  // 删除请假单
  deleteLeaveForm(formData: MyFormModel) {
    let sendData = {
      DOCNO: ""
    };
    ({ No: sendData.DOCNO } = formData);
    return this.myHttp.post(AttendanceConfig.deleteLeaveFormUrl, sendData).then((res) => {
      return Promise.resolve('ok')
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
    });
  }
  // 对服务器返回的数据内部格式化并时间转换（适应datepicker组件）
  editLeaveData_get(data: any, type: string = '2') {
    let newData = {
      type: type,
      status: '',
      No: '',
      data: {
        reasonType: '',
        autoSet: false,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        colleague: '',
        reason: '',
        days: '',
        hours: '',
        businessTime: ''
      }
    };
    ({
      STATUS: newData.status,
      DOCNO: newData.No,
      REASON: newData.data.reason,
      AGENT: newData.data.colleague,
      DAYS: newData.data.days,
      HOURS: newData.data.hours
    } = data);
    switch (Number(type)) {
      case 2:
        ({
          ABSENT_CODE: newData.data.reasonType,
          DATE_FM: newData.data.startDate,
          DATE_TO: newData.data.endDate
        } = data);
        newData.data.startDate = newData.data.startDate.substr(0, newData.data.startDate.indexOf('T'));
        newData.data.endDate = newData.data.endDate.substr(0, newData.data.endDate.indexOf('T'));
        break;
      case 4:
        ({
          BEAWAYTYPE: newData.data.reasonType,
          DATE_FM: newData.data.businessTime
        } = data);
        newData.data.businessTime = newData.data.businessTime.substr(0, newData.data.businessTime.indexOf('T'));
        break;
      default:
        break;
    }
    newData.data.startTime = '00:' + this.padLeft(data.TIME_HH_FM) + ':' + this.padLeft(data.TIME_MM_FM);
    newData.data.endTime = '00:' + this.padLeft(data.TIME_HH_TO) + ':' + this.padLeft(data.TIME_MM_TO);
    newData.data.autoSet = data.AGENT_TEMPLATE === 'Y' ? true : false;
    return newData;
  }
  padLeft(data: number) {
    return (+data < 10) ? '0' + data : data;
  }
  // 对发给服务器的数据内部格式化并时间转换（适应datepicker组件）
  editLeaveData_send(data: MyFormModel) {
    let sendData = {
      TYPE: '',
      STATUS: '',
      DOCNO: '',
      DETAIL: {
        ABSENT_CODE: '',
        START_DATE: '',
        END_DATE: '',
        START_TIME: '',
        END_TIME: '',
        AGENT: '',
        REASON: '',
        AGENT_TEMPLATE: '',
        BEAWAYTYPE: ''
      }
    };
    ({ type: sendData.TYPE, status: sendData.STATUS, No: sendData.DOCNO } = data);
    ({
      startTime: sendData.DETAIL.START_TIME,
      endTime: sendData.DETAIL.END_TIME,
      colleague: sendData.DETAIL.AGENT,
      autoSet: sendData.DETAIL.AGENT_TEMPLATE,
      reason: sendData.DETAIL.REASON
    } = data.data);
    switch (Number(data.type)) {
      case 2:
        ({
          reasonType: sendData.DETAIL.ABSENT_CODE,
          startDate: sendData.DETAIL.START_DATE,
          endDate: sendData.DETAIL.END_DATE
        } = data.data);
        break;
      case 4:
        ({
          reasonType: sendData.DETAIL.BEAWAYTYPE,
          businessTime: sendData.DETAIL.START_DATE
        } = data.data);
        sendData.DETAIL.END_DATE = sendData.DETAIL.START_DATE;
        break;
      default:
        break;
    }
    sendData.DETAIL.END_TIME = sendData.DETAIL.END_TIME ? sendData.DETAIL.END_TIME.substr(3) : '';
    sendData.DETAIL.START_TIME = sendData.DETAIL.END_TIME ? sendData.DETAIL.START_TIME.substr(3) : '';
    sendData.DETAIL.AGENT_TEMPLATE = data.data.autoSet ? 'Y' : 'N';
    return sendData;
  }
  formatTime(time: string, send: boolean) {
    let newTime: string = '';
    if (send) {
      newTime = new Date(Date.parse(time) - 60 * 60 * 8 * 1000).toISOString();
    } else {
      newTime = new Date(Date.parse(time) + 60 * 60 * 8 * 1000).toISOString();
    }
    return newTime;
  }

  // 获得请假类型信息
  async getLeaveReasonType(): Promise<{ name: string, type: string }[]> {
    let res: any = await this.myHttp.get(AttendanceConfig.getLeaveReasonTypeUrl).catch((err) => {
      this.errorDeal(err);
      return Promise.resolve([])
    });
    if (res.length === 0) {
      return res;
    }
    res = res.json()
    res = res.map((item: { ABSENT_TYPE_CODE: string, ABSENT: string }) => {
      let format: { name: string, type: string } = { name: '', type: '' };
      ({ ABSENT_TYPE_CODE: format.type, ABSENT: format.name } = item);
      return format;
    })
    localStorage.setItem('leaveType', JSON.stringify(res));
    return res;
  }
  // 获得所有假期信息
  async getLeaveDays(): Promise<{ STADATE: string, detail_used: { type: string, value: string }[], detail_canUse: { type: string, value: string }[] }> {
    let res: any = await this.myHttp.get(AttendanceConfig.getLeaveDaysUrl).catch((err) => {
      this.errorDeal(err);
      return Promise.resolve('')
    });
    if (res.length === 0) {
      return res;
    }
    res = res.json();
    let formateRes: { STADATE: string, detail_used: { type: string, value: string }[], detail_canUse: { type: string, value: string }[] } = {
      STADATE: '',
      detail_used: [],
      detail_canUse: []
    };
    formateRes.STADATE = res.STADATE;
    for (let prop in res) {
      if (['EMPNO', 'STADATE'].indexOf(prop) < 0) {
        let newItem = { type: prop, value: res[prop] };
        if (['A_DAYS', 'R_DAYS', 'R1_DAYS'].indexOf(prop) < 0) {
          formateRes.detail_used.push(newItem);
        } else {
          formateRes.detail_canUse.push(newItem);
        }
      }
    }

    return formateRes;
  }
  // 获得最大请假天数
  getMaxDays(type: string) {
    let url = AttendanceConfig.getMaxDaysUrl.replace('{type}', type);
    return this.myHttp.get(url).then((res: any) => {
      let days = res.json() ? res.json().ABSENT_DAY : ''
      return Promise.resolve({ content: days, status: true })
    }).catch((err) => {
      this.errorDeal(err);
      return Promise.resolve({ content: '', status: false })
    });
  }
  // 获得代理人
  getAgent(name: string): Observable<any> {
    let emp_name = name.toUpperCase();
    emp_name = tify(emp_name).replace(/^\"/g, '').replace(/\"$/g, '')
    return Observable.fromPromise(this.myHttp.get(AttendanceConfig.getAgentUrl + `emp_name=${emp_name}`)).map((r) => {
      return r.json();
    });
  }
  // 获得签核名单
  getSignList(form_No: string) {
    return this.myHttp.get(AttendanceConfig.getSignListUrl + form_No).then((res) => {
      return Promise.resolve({ content: res.json(), status: true })
    }).catch((err) => {
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }
  // 送签
  async sendSign(formData: MyFormModel) {
    let saveRes: any = '';
    if (!formData.No) {
      switch (Number(formData.type)) {
        case 2:
          saveRes = await this.saveLeaveForm(formData);
          break;
        case 3:
          saveRes = await this.saveOverTimeForm(formData);
          break;
        case 4:
          saveRes = await this.saveLeaveForm(formData);
          break;
        case 5:
          saveRes = await this.saveCallbackLeaveFrom(formData);
          break;
        default:
          break;
      }
      if (!saveRes.status) return Promise.resolve(saveRes);
      formData.No = Number(formData.type) === 5 ? saveRes.content.DOCNO1 : saveRes.content.DOCNO;
    }
    let sendData = {
      KIND: '',
      DOCNO: ''
    };
    switch (Number(formData.type)) {
      case 2:
        sendData.KIND = 'OFFDUTY';
        break;
      case 3:
        sendData.KIND = 'OVERTIME';
        break;
      case 4:
        sendData.KIND = 'OFFDUTY';
        break;
      case 5:
        sendData.KIND = 'DELETE_OFFDUTY';
        break;
      default:
        break;
    }
    ({ No: sendData.DOCNO } = formData);
    return this.myHttp.post(AttendanceConfig.sendSignUrl, sendData).then((res) => {
      let result = {
        content: saveRes.content,
        status: true
      }
      return Promise.resolve(result)
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      let result = {
        content: errTip,
        status: false
      }
      return Promise.resolve(result)
    });
  }
  // 取消送签
  callBackSign(formData: MyFormModel) {
    let sendData = {
      KIND: '',
      DOCNO: ''
    };
    switch (Number(formData.type)) {
      case 2:
        sendData.KIND = 'OFFDUTY';
        break;
      case 3:
        sendData.KIND = 'OVERTIME';
        break;
      case 4:
        sendData.KIND = 'OFFDUTY';
        break;
      case 5:
        sendData.KIND = 'DELETE_OFFDUTY';
        break;
      default:
        break;
    }
    ({ No: sendData.DOCNO } = formData);
    return this.myHttp.post(AttendanceConfig.callBackSignUrl, sendData).then((res) => {
      return Promise.resolve('ok')
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
    });
  }

  // 获得班别与加班时长
  getOverTimeDetail(formData: MyFormModel) {
    let send = {
      "IDATE": "",
      "START_TIME": "",
      "END_TIME": "",
    }
    send.IDATE = formData.data.OTtime;
    return this.myHttp.post(AttendanceConfig.getOverTimeDetailUrl, send).then((res) => {
      let newData = res.json();
      newData = this.editOverTime_get(newData);
      return Promise.resolve(newData)
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
    });
  }
  // 加班单申请
  saveOverTimeForm(formData: MyFormModel) {
    let send = this.editOverTime_send(formData);
    return this.myHttp.post(AttendanceConfig.saveOverTimeUrl, send).then((res) => {
      return Promise.resolve({ content: res.json(), status: true })
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: errTip, status: false })
    });
  }
  // 对发送的加班单数据进行加工
  editOverTime_send(formData: MyFormModel) {
    let send = {
      "DOCNO": "",
      "IDATE": "",
      "START_TIME": "",
      "END_TIME": "",
      "NOTES": "",
      "NOTES_DETAIL": ""
    };
    send.DOCNO = formData.No;
    send.IDATE = formData.data.OTtime;
    send.START_TIME = formData.data.startTime.substr(3);
    send.END_TIME = formData.data.endTime.substr(3);
    send.NOTES_DETAIL = formData.data.reason;
    send.NOTES = new HolidayType().jobType.filter((item) => item.type === formData.data.reasonType)[0].name;
    return send;
  }

  // 对获得的加班单数据进行加工
  editOverTime_get(data: any) {
    let newData = {
      type: '3',
      status: '',
      No: '',
      data: {
        reasonType: '',
        OTtime: '',
        startTime: '',
        endTime: '',
        reason: '',
        count: '',
        duty_type: '',
        trueCount: '',
        true_during: ''
      }
    };
    ({
      STATUS: newData.status,
      DOCNO: newData.No,
      NOTES_DETAIL: newData.data.reason,
      IDATE: newData.data.OTtime,
      HOURS: newData.data.count,
      DUTY_KIND: newData.data.duty_type,
      ACT_HOURS: newData.data.trueCount,
      ACT_TIMES: newData.data.true_during
    } = data);
    newData.data.startTime = '00:' + this.padLeft(data.TIME_HH_FM) + ':' + this.padLeft(data.TIME_MM_FM);
    newData.data.endTime = '00:' + this.padLeft(data.TIME_HH_TO) + ':' + this.padLeft(data.TIME_MM_TO);
    let reasonType = new HolidayType().jobType.filter((item) => item.name === data.NOTES);
    newData.data.reasonType = reasonType.length > 0 ? reasonType[0].type : '04';
    return newData;
  }
  // 加班单申请
  deleteOverTimeForm(formData: MyFormModel) {
    let send = { DOCNO: '' };
    send.DOCNO = formData.No;
    return this.myHttp.post(AttendanceConfig.deleteOverTimeFormUrl, send).then((res) => {
      return Promise.resolve('ok')
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
    });
  }

  // 申请销假单
  saveCallbackLeaveFrom(formData: MyFormModel) {
    let send = { OFFDUTY_DOCNO: '', NEREAON: '', DOCNO1: '' };
    send.DOCNO1 = formData.No;
    send.OFFDUTY_DOCNO = formData.data.leave_No;
    send.NEREAON = formData.data.reason
    return this.myHttp.post(AttendanceConfig.saveCallbackLeaveFromUrl, send).then((res) => {
      return Promise.resolve({ content: res.json(), status: true })
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: errTip, status: false })
    });
  }

  // 删除销假单
  deleteCallbackLeaveFrom(formData: MyFormModel) {
    let sendData = {
      DOCNO1: ""
    };
    ({ No: sendData.DOCNO1 } = formData);
    return this.myHttp.post(AttendanceConfig.deleteCallbackLeaveFromUrl, sendData).then((res) => {
      return Promise.resolve('ok')
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
    });
  }
  // 获取销假单
  getCallbackLeaveFrom(leave_No: string = '') {
    return this.myHttp.get(AttendanceConfig.getCallbackLeaveFromUrl + `DOCNO=${leave_No}`).then((res) => {
      let newData = res.json();
      if (newData != null) {
        newData = newData.map((item: {
          DOCNO1: string,
          OFFDUTY_DOCNO: string,
          NEREAON: string,
          STATUS: string
        }) => {
          let data: MyFormModel = {
            type: '5',
            status: '',
            No: '',
            data: {}
          }
          data.status = item.STATUS;
          data.No = item.DOCNO1;
          data.data.leave_No = item.OFFDUTY_DOCNO;
          data.data.reason = item.NEREAON;
          return data;
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }

  // 获取月出勤记录
  getAttendanceMonth(formData: { date: string }) {
    formData.date = formData.date.replace('-', '');
    return this.myHttp.get(AttendanceConfig.getAttendanceMonthUrl + `date=${formData.date}`).then((res) => {
      return Promise.resolve({ content: res.json(), status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: '', status: false })
    });
  }
  // 获取月出勤记录
  getSwipeNote(formData: { startTime: string, endTime: string }) {
    let dateFM = formData.startTime;
    let dateTO = formData.endTime;
    return this.myHttp.get(AttendanceConfig.getSwipeNoteUrl + `dateFM=${dateFM}&dateTO=${dateTO}`).then((res) => {
      return Promise.resolve({ content: res.json(), status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: '', status: false })
    });
  }
  // 获取出勤明细
  getAttendanceDetail(formData: { startTime: string, endTime: string }) {
    let dateFM = formData.startTime;
    let dateTO = formData.endTime;
    return this.myHttp.get(AttendanceConfig.getAttendanceDetailUrl + `dateFM=${dateFM}&dateTO=${dateTO}`).then((res) => {
      return Promise.resolve({ content: res.json(), status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: '', status: false })
    });
  }

  // 获取所有异常
  getOffDutyException() {
    return this.myHttp.get(AttendanceConfig.getOffDutyExceptionUrl).then((res) => {
      let newData = res.json();
      if (newData && newData instanceof Array) {
        newData = newData.map((item) => {
          return this.editException_get(item);
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }

  // 处理异常
  processOffDutyException(formData: MyFormModel) {
    let sendData = this.editException_send(formData);
    return this.myHttp.post(AttendanceConfig.processOffDutyExceptionUrl, sendData).then((res) => {
      return Promise.resolve({ content: 'ok', status: true });
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: errTip, status: false })
    });
  }
  editException_send(data: MyFormModel) {
    let sendData = {
      ID: '',
      TYPE: '',
      ABSENT_CODE: '',
      REASON: '',
      EXCEPTION_CODE: ''
    }
    sendData.ID = data.data.id;
    sendData.TYPE = data.data.absentType;
    sendData.EXCEPTION_CODE = data.data.exception_code;
    sendData.REASON = data.data.reason;
    sendData.ABSENT_CODE = data.data.reasonType;
    return sendData
  }
  editException_get(data: any) {
    let mydata = {
      type: '0',
      status: 'NEW',
      No: '',
      data: {
        absentType: '',
        reasonType: '',
        startTime: '',
        endTime: '',
        reason: '',
        days: '',
        hours: '',
        duty_type: '',
        exception_code: '',
        id: ''
      }
    }
    mydata.No = data.DOCNO;
    mydata.data.absentType = data.TYPE;
    let date = data.IDATE.substr(0, data.IDATE.indexOf('T'));
    mydata.data.startTime = date + ' ' + data.TIME_FM;
    mydata.data.endTime = date + ' ' + data.TIME_TO;
    mydata.data.reason = data.REASON;
    mydata.data.hours = data.HOURS;
    mydata.data.days = data.DAYS;
    mydata.data.duty_type = data.DUTY_KIND;
    mydata.data.exception_code = data.EXCEPTION_CODE;
    mydata.data.id = data.ID;
    return mydata;
  }

  // 获得月或年请假天数
  getOffDutyTotalDays() {
    let date = new Date().getFullYear();
    return this.myHttp.get(AttendanceConfig.getOffDutyTotalDaysUrl + `date=${date}`).then((res) => {
      let newData = res.json();
      if (newData && newData instanceof Array) {
        newData = newData.map((item) => {
          return this.editOffDutyTotalDays_get(item);
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }
  editOffDutyTotalDays_get(data: { YYMM: string, TOT_DAYS: string }) {
    return { name: +data.YYMM.substr(4) + this.translateTexts['attendance.month'], value: data.TOT_DAYS }
  }

  // 获得月或年加班时数
  getOverTimeTotalHours() {
    let date = new Date().getFullYear();
    return this.myHttp.get(AttendanceConfig.getOverTimeTotalHoursUrl + `date=${date}`).then((res) => {
      let newData = res.json();
      if (newData && newData instanceof Array) {
        newData = newData.map((item) => {
          return this.editOverTimeTotalHours_get(item);
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }
  editOverTimeTotalHours_get(data: { YYMM: string, TOT_HOURS: string }) {
    return { name: +data.YYMM.substr(4) + this.translateTexts['attendance.month'], value: data.TOT_HOURS }
  }

  // 获取某月内的请假明细
  getOffDutyMonthHours(month: string) {
    let date = new Date().getFullYear();
    month = Number(month) < 10 ? '0' + month : month;
    return this.myHttp.get(AttendanceConfig.getOffDutyMonthHoursUrl + `date=${date}${month}`).then((res) => {
      let newData = res.json();
      if (newData && newData instanceof Array) {
        newData = newData.map((item) => {
          return this.editOffDutyMonthHours_get(item);
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve({ content: [], status: false })
    });
  }
  editOffDutyMonthHours_get(data: { IDATE: string, TOT_HOURS: string }) {
    return { name: new Date(data.IDATE).getDate() + '', value: Number(data.TOT_HOURS) / 8 }
  }
  // 获取某月内的加班明细
  getOverTimeMonthHours(month: string) {
    let date = new Date().getFullYear();
    month = Number(month) < 10 ? '0' + month : month;
    return this.myHttp.get(AttendanceConfig.getOverTimeMonthHoursUrl + `date=${date}${month}`).then((res) => {
      let newData = res.json();
      if (newData && newData instanceof Array) {
        newData = newData.map((item) => {
          return this.editOverTimeMonthHours_get(item);
        })
      } else {
        newData = [];
      }
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: errTip, status: false })
    });
  }
  editOverTimeMonthHours_get(data: { IDATE: string, TOT_HOURS: string }) {
    return { name: new Date(data.IDATE).getDate() + '', value: Number(data.TOT_HOURS) }
  }

  // 获取用户头像
  getUserPhoto(id: string) {
    return this.myHttp.get(AttendanceConfig.getUserPhotoUrl + `userName=${id.toLowerCase()}`).then((res) => {
      let newData = res.json() ? res.json().AVATAR_URL : '';
      return Promise.resolve({ content: newData, status: true });
    }).catch((err) => {
      console.log(err)
      let errTip = this.errorDeal(err);
      return Promise.resolve({ content: '', status: false })
    });
  }
  errorDeal(err: any, showAlert: boolean = false) {
    let errTip = '';
    switch (err.status) {
      case 404:
        this.plugin.showToast(this.translateTexts['not_found']);
        break;
      case 400:
        // if (showAlert) {
        //   this.plugin.createBasicAlert(this.chineseConv(err.json().ExceptionMessage));
        // } else {
        //   this.plugin.showToast(this.chineseConv(err.json().ExceptionMessage));
        // }
        errTip = this.plugin.chineseConv(err.json().ExceptionMessage);
        break;
      case 0:
        this.plugin.showToast(this.translateTexts['http_error1']);
        break;
      case 500:
        this.plugin.showToast(this.translateTexts['http_error2']);
        break;
      default:
        this.plugin.showToast(this.translateTexts['http_error3'] + err.status);
        break;
    }
    return errTip
  }
}
