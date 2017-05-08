import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MyHttpService } from '../../../../../core/services/myHttp.service';

import { MyFormModel } from '../models/my-form.model'

import { AttendanceConfig } from '../config/attendance.config'
import { HolidayType } from '../config/holiday-type'

import { PluginService }   from '../../../../../core/services/plugin.service';

@Injectable()
export class AttendanceService {

  constructor(
    private myHttp: MyHttpService,
    private plugin: PluginService
  ) { }
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
      case 3:
        docNumUrl = AttendanceConfig.getOverTimeFormByNoUrl;
        dateUrl = AttendanceConfig.getOverTimeFormByDateUrl;
        get_fn = this.editOverTime_get;
        break;
      default:
        break;
    }
    if (!(docNumUrl && dateUrl && get_fn)) return Promise.resolve([])
    if (formData.form_No) {
      return this.myHttp.get(docNumUrl + `DOCNO=${formData.form_No.toUpperCase()}`).then((res) => {
        let formData = res.json();
        let list = [];
        formData = get_fn.call(this, formData);
        list.push(formData);
        return Promise.resolve(list)
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve([])
      });
    } else {
      dateFM = formData.startTime || this.getMinStartTime(6);
      dateTO = formData.endTime || '';
      return this.myHttp.get(dateUrl + `dateFM=${dateFM}&dateTO=${dateTO}`).then((res) => {
        let formData = res.json();
        formData = formData.map((item: any) => {
          return get_fn.call(this, item)
        })
        return Promise.resolve(formData)
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve([])
      });
    }
  }
  // 获得默认最小开始时间
  getMinStartTime(intervalMonth: number) {
    return new Date(Date.parse(new Date().toString()) - 1000 * 60 * 60 * 24 * 30 * intervalMonth).toDateString();
  }
  // 获得限制的时间段范围
  getTimeRange(form:number,to:number) {
    let range = '';
    for(let i = form;i<to+1;i++) {
      range += i;
      if(i !== to) {
        range +=','
      }
    }
    return range
  }
  // 请假单申请
  saveLeaveForm(data: MyFormModel) {
    let sendData = this.editLeaveData_send(data);
    return this.myHttp.post(AttendanceConfig.saveLeaveUrl, sendData).then((res) => {
      return Promise.resolve(res.json())
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
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
        return Promise.resolve('');
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
  editLeaveData_get(data: any) {
    let newData = {
      type: '2',
      status: '',
      No: '',
      data: {
        reasonType: '',
        autoSet: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        colleague: '',
        reason: '',
        days: '',
        hours: '',
      }
    };
    ({
      STATUS: newData.status,
      DOCNO: newData.No,
      ABSENT_CODE: newData.data.reasonType,
      REASON: newData.data.reason,
      AGENT: newData.data.colleague,
      DATE_FM: newData.data.startDate,
      DATE_TO: newData.data.endDate,
      AGENT_TEMPLATE: newData.data.autoSet,
      DAYS: newData.data.days,
      HOURS: newData.data.hours
    } = data);
    newData.data.startTime = '00:' + this.padLeft(data.TIME_HH_FM) + ':' + this.padLeft(data.TIME_MM_FM);
    newData.data.endTime = '00:' + this.padLeft(data.TIME_HH_TO) + ':' + this.padLeft(data.TIME_MM_TO);
    newData.data.startDate = newData.data.startDate.substr(0, newData.data.startDate.indexOf('T'));
    newData.data.endDate = newData.data.endDate.substr(0, newData.data.endDate.indexOf('T'));
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
        AGENT_TEMPLATE:'',
        BEAWAYTYPE: ''
      }
    };
    ({ type: sendData.TYPE, status: sendData.STATUS, No: sendData.DOCNO } = data);
    ({
      reasonType: sendData.DETAIL.ABSENT_CODE,
      startDate: sendData.DETAIL.START_DATE,
      endDate: sendData.DETAIL.END_DATE,
      startTime: sendData.DETAIL.START_TIME,
      endTime: sendData.DETAIL.END_TIME,
      colleague: sendData.DETAIL.AGENT,
      reason: sendData.DETAIL.REASON
    } = data.data);
    sendData.DETAIL.END_TIME = sendData.DETAIL.END_TIME.substr(3);
    sendData.DETAIL.START_TIME = sendData.DETAIL.START_TIME.substr(3);
    sendData.DETAIL.AGENT_TEMPLATE = data.data.autoSet?'Y':'N';
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
    res = res.json()
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
  // 获得代理人
  getAgent(name: string): Observable<any> {
    let emp_name = name.toUpperCase();
    return Observable.fromPromise(this.myHttp.get(AttendanceConfig.getAgentUrl + `emp_name=${emp_name}`)).map((r) => {
      return r.json();
    });
  }
  // 获得签核名单
  getSignList(form_No: string) {
    return this.myHttp.get(AttendanceConfig.getSignListUrl + form_No).then((res) => {
      return Promise.resolve(res.json())
    }).catch((err) => {
      this.errorDeal(err);
      return Promise.resolve([])
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
        default:
          break;
      }
      if (!saveRes) return Promise.resolve({
        content: saveRes,
        status: false
      });
      formData.No = saveRes.DOCNO;
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
      default:
        break;
    }
    ({ No: sendData.DOCNO } = formData);
    return this.myHttp.post(AttendanceConfig.sendSignUrl, sendData).then((res) => {
      let result = {
        content: saveRes,
        status: true
      }
      return Promise.resolve(result)
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      let result = {
        content: saveRes,
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

  // 加班单申请
  saveOverTimeForm(formData: MyFormModel) {
    let send = this.editOverTime_send(formData);
    return this.myHttp.post(AttendanceConfig.saveOverTimeUrl, send).then((res) => {
      return Promise.resolve(res.json())
    }).catch((err) => {
      console.log(err)
      this.errorDeal(err);
      return Promise.resolve('')
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

  // 对发送的加班单数据进行加工
  editOverTime_get(data:any) {
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
        count: ''
      }
    };
    ({
      STATUS: newData.status,
      DOCNO: newData.No,
      NOTES_DETAIL: newData.data.reason,
      IDATE: newData.data.OTtime,
      HOURS: newData.data.count
    } = data);
    newData.data.startTime = '00:' + this.padLeft(data.TIME_HH_FM) + ':' + this.padLeft(data.TIME_MM_FM);
    newData.data.endTime = '00:' + this.padLeft(data.TIME_HH_TO) + ':' + this.padLeft(data.TIME_MM_TO);
    let reasonType = new HolidayType().jobType.filter((item) => item.name === data.NOTES);
    newData.data.reasonType = reasonType.length>0 ?reasonType[0].type: '04';
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

  errorDeal(err: any) {
    switch (err.status) {
      case 404:
        this.plugin.showToast(err.statusText);
        break;
      case 400:
        this.plugin.createBasicAlert(err.json().ExceptionMessage);
        break;
      case 0:
        this.plugin.showToast('连接服务器失败');
        break;
      default:
        this.plugin.showToast('出现未定义连接错误' + err.status);
        break;
    }
  }
}
