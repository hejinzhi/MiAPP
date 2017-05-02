import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MyHttpService } from '../../../../../core/services/myHttp.service';
import { MyFormModel } from '../models/my-form.model'
import { AttendanceConfig } from '../config/attendance.config'

import { PluginService }   from '../../../../../core/services/plugin.service';

@Injectable()
export class AttendanceService {

  constructor(
    private myHttp: MyHttpService,
    private plugin: PluginService
  ) { }
  // 根据日期或单号（优先单号）获取请假单
  getLeaveForm(formData: any) {
    let dateFM = '';
    let dateTO = '';
    let docNum = 'HTL021704000047';
    console.log(formData)
    if (formData.form_No) {
      return this.myHttp.get(AttendanceConfig.getLeaveFormByNoUrl + `DOCNO=${formData.form_No}`).then((res) => {
        console.log(res.json)
        let formData = res.json();
        let list = [];
        formData = this.editLeaveData_get(formData);
        list.push(formData);
        return Promise.resolve(list)
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve([])
      });
    } else {
      return this.myHttp.get(AttendanceConfig.getLeaveFormByDateUrl + `dateFM=${dateFM}&dateTO=${dateTO}`).then((res) => {
        let formData = res.json();
        formData = formData.map((item: any) => {
          return this.editLeaveData_get(item)
        })
        return Promise.resolve(formData)
      }).catch((err) => {
        console.log(err)
        this.errorDeal(err);
        return Promise.resolve([])
      });
    }
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
  editLeaveData_get(data: any) {
    let newData = {
      type: '2',
      status: '',
      No: '',
      data: {
        reasonType: '',
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
      DAYS: newData.data.days,
      HOURS: newData.data.hours
    } = data);
    // 转格式，也由于后台返回时间为延后八小时的时间，要减八小时
    newData.data.startTime = new Date(Date.parse(data.DATE_FM) + data.TIME_HH_FM * 60 * 60 * 1000 + data.TIME_MM_FM * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString();
    newData.data.endTime = new Date(Date.parse(data.DATE_TO) + data.TIME_HH_TO * 60 * 60 * 1000 + data.TIME_MM_TO * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString();
    return newData;
  }
  editLeaveData_send(data: MyFormModel) {
    let sendData = {
      TYPE: '',
      STATUS: '',
      DOCNO: '',
      DETAIL: {
        ABSENT_CODE: '',
        START_TIME: '',
        END_TIME: '',
        AGENT: '',
        REASON: ''
      }
    };
    ({ type: sendData.TYPE, status: sendData.STATUS, No: sendData.DOCNO } = data);
    ({
      reasonType: sendData.DETAIL.ABSENT_CODE,
      startTime: sendData.DETAIL.START_TIME,
      endTime: sendData.DETAIL.END_TIME,
      colleague: sendData.DETAIL.AGENT,
      reason: sendData.DETAIL.REASON
    } = data.data);
    sendData.DOCNO = '';
    sendData.DETAIL.END_TIME = this.formatTime(sendData.DETAIL.END_TIME, true);
    sendData.DETAIL.START_TIME = this.formatTime(sendData.DETAIL.START_TIME, true);
    console.log(new Date(sendData.DETAIL.END_TIME).toLocaleString())
    console.log(new Date(sendData.DETAIL.START_TIME).toLocaleString())
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
  async getLeaveReasonType():Promise<{name:string,type:string}[]>{
    let res:any = await this.myHttp.get(AttendanceConfig.getLeaveReasonTypeUrl).catch((err) =>{
      this.errorDeal(err);
      return Promise.resolve([])
    });
    if(res.length === 0) {
      return res;
    }
    res= res.json()
    res = res.map((item:{ABSENT_TYPE_CODE:string, ABSENT:string}) => {
      let format:{name:string,type:string}= {name:'',type:''};
      ({ABSENT_TYPE_CODE:format.type, ABSENT:format.name} = item);
      return format;
    })
    localStorage.setItem('leaveType',JSON.stringify(res));
    return res;
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
    let saveRes:any;
    if(!formData.No){
      saveRes = await this.saveLeaveForm(formData);
    }
    if(!saveRes) return Promise.resolve('');
    let sendData = {
      KIND: "OFFDUTY",
      DOCNO: ""
    };
    ({No:sendData.DOCNO}=formData);
    console.log(sendData)
    return this.myHttp.post(AttendanceConfig.sendSignUrl, sendData).then((res) => {
      console.log(res)
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
        this.plugin.showToast(err._body);
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
