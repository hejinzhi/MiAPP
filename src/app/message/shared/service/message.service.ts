import { EnvConfig } from './../../../shared/config/env.config';
import { Injectable, EventEmitter } from '@angular/core';
import { Events } from 'ionic-angular';
import { Observable, Subscription, Subject } from 'rxjs/Rx';
import { JMessageService } from '../../../core/services/jmessage.service';
import { DatabaseService } from './database.service';
import { Message } from '../classes/Message';
import { MessageConfig } from '../config/message.config';
import { MyHttpService } from '../../../core/services/myHttp.service';

@Injectable()
export class MessageService {
  constructor(
    private jmessage: JMessageService,
    public events: Events,
    public databaseService: DatabaseService,
    private myHttp: MyHttpService
  ) { }


  userInfo: any; // 当前登录用户的信息
  allUserInfo: any;
  // history: Message[];  // 历史消息


  getMessagesByUsername(owner: string, fromUsername: string, toUsername: string) {
    return this.databaseService.getMessagesByUsername(owner, fromUsername, toUsername);
  }


  public async getMessageHistory(loginUsername: string, type?: string, child_type?: string) {
    let history: any[] = await this.databaseService.getMessageList(loginUsername, type, child_type);
    for (let i = 0; i < history.length; i++) {
      // 1.先在本机存储找是否有这个人的头像
      let fromUserAvatarObj = await this.databaseService.getAvatarByUsername(history[i].fromUserName);

      // 2.如果找到了,新增昵称和头像属性
      if (fromUserAvatarObj.rows.length > 0) {
        history[i].fromUserNickName = fromUserAvatarObj.rows.item(0).NICK_NAME;
        history[i].fromUserAvatarSrc = fromUserAvatarObj.rows.item(0).AVATAR;
        history[i].timedesc = this.getDateDiff(history[i].time);
      }
      // 3.如果找不到，则请求服务器,并写入本地
      else {
        let res = await this.getUserAvatar(history[i].fromUserName);
        let fromUserServeObj = res.json();
        if (fromUserServeObj) {
          history[i].fromUserNickName = fromUserServeObj.NICK_NAME;
          // history[i].fromUserAvatarSrc = fromUserServeObj.AVATAR_URL;
          history[i].fromUserAvatarSrc = EnvConfig.baseUrl + fromUserServeObj.AVATAR_URL;
          history[i].timedesc = this.getDateDiff(history[i].time);
          await this.databaseService.insertAvatarTable(history[i].fromUserName, history[i].fromUserNickName, fromUserServeObj.AVATAR_URL);

        } else {
          console.log('err,服务器找不到该员工的信息');
        }
      }
    }
    return history;
  }

  getNickName(username: string, contacts: any[]): string {
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].username === username) {
        return contacts[i].nickname;
      }
    }
  }

  getAvatar(username: string, contacts: any[]) {

    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].username === username) {
        return contacts[i].avatar;
      }
    }
  }

  getUserInfo() {
    return new Promise((resolve, reject) => {
      resolve(this.userInfo);
    });
  }



  getDateDiff(dateTimeStamp: number) {
    let Y, M, D, W, H, I, S;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var d = new Date(Math.floor(dateTimeStamp / 1000) * 1000);
    var Week = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    Y = d.getFullYear();
    M = this.fillZero(d.getMonth() + 1);
    D = this.fillZero(d.getDate());
    W = Week[d.getDay()];
    H = this.fillZero(d.getHours());
    I = this.fillZero(d.getMinutes());
    S = this.fillZero(d.getSeconds());

    if (new Date(dateTimeStamp).toDateString() === new Date().toDateString()) {
      //今天
      if (H <= 12) {
        H = '上午' + H;
      } else if (H > 12 && H < 24) {
        H -= 12;
        H = '下午' + this.fillZero(H);
      } else if (H == 24) {
        H = '00';
      }
      var localTime = H + ':' + I;
    } else if (new Date(dateTimeStamp + day).toDateString() === new Date().toDateString()) {
      //昨天
      if (H <= 12) {
        H = '昨天上午' + H;
      } else if (H > 12 && H < 24) {
        H -= 12;
        H = '昨天下午' + this.fillZero(H);
      } else if (H == 24) {
        H = '00';
      }
      var localTime = H + ':' + I;
    } else if (new Date(dateTimeStamp) < new Date()) {
      var localTime = Y + '-' + M + '-' + D;
    }
    return localTime;
  }


  fillZero(v: any) {
    if (v < 10) {
      v = '0' + v;
    }
    return v;
  }

  async setUnreadToZeroByUserName(owner: string, username: string, child_type?: string) {
    await this.databaseService.setUnreadToZeroByUserName(owner, username, child_type);
  }

  getUserAvatar(username: string) {
    return this.myHttp.get(MessageConfig.getAvatarUrl + `?userName=${username}`);
  }
}
