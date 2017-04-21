import { Injectable } from '@angular/core';
import { MyHttpService } from '../../../../../core/services/myHttp.service';
import { MyFormModel } from '../models/my-form.model'

@Injectable()
export class AttendanceService {
  constructor(private myHttp: MyHttpService) {  }

  //获得每个列表选择框内的内容
  getSelectType(type:string){
    return this.myHttp.post('',{type:type}).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //提交表单
  submit(formData:MyFormModel) {
    return this.myHttp.post('',formData).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //保存表单
  save(formData:MyFormModel) {
    return this.myHttp.post('',formData).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //删除表单
  cancel(formData:MyFormModel) {
    return this.myHttp.post('',formData).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //撤销已审批的请假单
  callback(formData:MyFormModel) {
    return this.myHttp.post('',formData).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //取消送签
  callbackSubmit(formData:MyFormModel) {
    return this.myHttp.post('',formData).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  //获得对应类型的表单列
  getForm(type:string) {
    return this.myHttp.post('',{type:type}).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  // 搜索代理人
  search(ref:string) {
    let send = {};
    send = /[0-9a-zA-Z]/.test(ref)? {number:ref}:{name:ref};
    return this.myHttp.post('',send).then((res) => {
      return Promise.resolve(res.json())
    });
  }

  // 获得个人信息（可用假期、已用假期、已加班天数）
  getDetail() {
    return this.myHttp.get('').then((res) => {
      return Promise.resolve(res.json())
    });
  }

  // 获得请假时间统计
  getWorkTimeCount() {
    return this.myHttp.get('').then((res) => {
      return Promise.resolve(res.json())
    });
  }

  // 获得加班时间统计
  getOverTimeCount() {
    return this.myHttp.get('').then((res) => {
      return Promise.resolve(res.json())
    });
  }
}
