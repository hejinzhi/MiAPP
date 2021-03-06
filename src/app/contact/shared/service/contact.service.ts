import { Injectable } from '@angular/core';

import { MyHttpService } from '../../../core/services/myHttp.service';
// import { ContactConfig } from '../../config/contact.config';
import { ContactConfig } from '../../shared/config/contact.config';


@Injectable()
export class ContactService {
    username: string;

    constructor(private myHttp: MyHttpService) {
        this.username = JSON.parse(localStorage.getItem('currentUser')).username;
    }

    public getOrg() {
        // return new Promise((resolve, reject) => {
        //     resolve(ORG);
        // })
        let user = JSON.parse(localStorage.getItem('currentUser'));

        return this.myHttp.get(ContactConfig.getOrgUrl + `?user_name=${user.username}`)
    }


    public getSameDeptPerson() {
        return this.myHttp.get(ContactConfig.getSameDeptPersonUrl);
    }

    public getDeptInfo(site: string) {
        return this.myHttp.get(ContactConfig.getDeptInfoUrl + `?site=${site}`);
    }

    public getPersonByDept(site: string, deptno: string) {
        return this.myHttp.get(ContactConfig.getPersonByDeptUrl + `?site=${site}&deptno=${deptno}`);
    }

    public getSubordinate() {
        return this.myHttp.get(ContactConfig.getSubordinateUrl);
    }

    public setLocalStorage(type: string, value: any) {
        localStorage.setItem(this.username + '_' + 'contact_' + type, JSON.stringify(value));
    }

    public getLocalStorage(type: string) {
        return JSON.parse(localStorage.getItem(this.username + '_' + 'contact_' + type));
    }
    public removeLocalStorage(type: string) {
        return localStorage.removeItem(this.username + '_' + 'contact_' + type);
    }


    public getPersonByName(filter: string, site: string) {
        return this.myHttp.get(ContactConfig.getPersonByNameUrl + `?emp_name=${filter}&site=${site}`);
    }

    public getAllPersonByPage(site: string, pageIndex: number, pageSize: number) {
        return this.myHttp.get(ContactConfig.getAllPersonByPageUrl + `?site=${site}&pageIndex=${pageIndex}&pageSize=${pageSize}`);
    }

    // 根据等级获取公司部门信息
    public getDeptInfoByGrade(site: string, grade: number) {
        return this.myHttp.get(ContactConfig.getDeptInfoByGradeUrl + `?site=${site}&grade=${grade}`)
    }

    // 获取子部门信息
    public getChildDeptInfo(site: string, deptno: string) {
        return this.myHttp.get(ContactConfig.getChildDeptInfoUrl + `?site=${site}&deptno=${deptno}`)
    }

    public writeViewHistory(personData: any) {
        let historyData: any[] = this.getLocalStorage('viewHistory') ? this.getLocalStorage('viewHistory') : [];
        let length = historyData.length;
        if (length <= 9) {
            historyData.forEach((value, index) => {
                if (value.USER_NAME === personData.USER_NAME) {
                    historyData.splice(index, 1);
                }
            });
            historyData.splice(0, 0, personData);
            this.setLocalStorage('viewHistory', historyData);
        }
        else {

            historyData.forEach((value, index) => {
                if (value.USER_NAME === personData.USER_NAME) {
                    historyData.splice(index, 1);
                }
            });
            historyData.splice(0, 0, personData);
            if (historyData.length > 10) {
                historyData.pop();
            }
            this.setLocalStorage('viewHistory', historyData);
        }
    }
}


const ORG = [
    {
        DEPTNO: 'MIC',
        DEPTNAME: '神達電腦'
    },
    {
        DEPTNO: 'MSL',
        DEPTNAME: '順達電腦'
    },
    {
        DEPTNO: 'MKL',
        DEPTNAME: '昆達電腦'
    }
];