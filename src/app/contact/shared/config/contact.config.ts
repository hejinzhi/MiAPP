import { EnvConfig } from './../../../shared/config/env.config';

export class ContactConfig {

    static companyID = EnvConfig.companyID;

    // 获取同部门人员信息
    static getSameDeptPersonUrl = EnvConfig.baseUrl + 'Guid/GetDeptUserView';

    // 根据公司获取部门信息
    static getDeptInfoUrl = EnvConfig.baseUrl + 'Guid/GetDeptNameBySite';

    // 根据部门获取员工信息
    static getPersonByDeptUrl = EnvConfig.baseUrl + 'Guid/GetUserViewByDept';

    // 获取下属信息
    static getSubordinateUrl = EnvConfig.baseUrl + 'Guid/GetUnderUserView';

    // 根据工号姓名AD查询信息
    static getPersonByNameUrl = EnvConfig.baseUrl + 'Guid/GetUserLike';

    // 分页查询所有员工信息
    static getAllPersonByPageUrl = EnvConfig.baseUrl + 'Guid/GetAllUserByPage';

    // 根据等级获取公司部门信息
    static getDeptInfoByGradeUrl = EnvConfig.baseUrl + 'Guid/GetDeptInfo';

    // 获取子部门信息
    static getChildDeptInfoUrl = EnvConfig.baseUrl + 'Guid/GetChildDeptInfo';

    // 获取该员工所属的公司别
    static getOrgUrl = EnvConfig.baseUrl + 'Guid/GetUserTopOrg';

    static pageSize = 30;
}
