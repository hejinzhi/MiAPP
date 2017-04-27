import { EnvConfig } from '../../../../../shared/config/env.config';

export class AttendanceConfig {

    // 获得签核名单
    static getSignListUrl = EnvConfig.baseUrl + 'Att/GetApproveList?docNum=';

    // 保存表单
    static saveLeaveUrl = EnvConfig.baseUrl + 'OffDuty/AddOffDuty';

    // 根据日期获取请假单
    static getLeaveFormUrl = EnvConfig.baseUrl + 'OffDuty/GetOffDutyByDate?';

}
