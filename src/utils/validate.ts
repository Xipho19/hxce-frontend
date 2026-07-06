/**
 * 验证是否为空或者空字符串
 */
export function isBlank(s: string) {
    return s == null || s.length == 0;
}

/**
 * 验证邮箱
 */
export function isEmail(s: string) {
    return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s);
}

/**
 * 验证手机号码
 */
export function isPhoneNumber(s: string) {
    return /^1[34578]\d{9}$/.test(s);

}

/**
 * 验证URL地址
 */
export function isURL(s: string) {
    return /^http[s]?:\/\/.*/.test(s);
}

/**
 * 验证用户名
 */
export function isUsername(s: string) {
    return /^[a-zA-Z0-9]{5,50}$/.test(s);
}

/**
 * 验证密码
 */
export function isPassword(s: string) {
    return /^[a-zA-Z0-9]{6,20}$/.test(s);
}

/**
 * 验证手机验证码
 */
export function isSmsCaptcha(s: string) {
    return /^\d{6}$/.test(s);
}

/**
 * 验证日期
 */
export function isDate(s: string) {
    return /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29))$/.test(s);
}

/**
 * 验证小时
 */
export function isHour(s: string) {
    if (/^(0|[1-9]\d*)$/.test(s)) {
        let hour = Number(s)
        return hour >= 0 && hour <= 23
    }
    return false

}

/**
 * 验证小时与分钟
 */
export function isHourAndMinute(s: string) {
    return /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/.test(s)
}

/**
 * 验证城市名称
 */
export function isCity(s: string) {
    return /^[\u4e00-\u9fa5]{2,10}$/.test(s)
}

/**
 * 验证金额
 */
export function isAmount(s: string) {
    return /^(0|[1-9]\d{0,9})(\.\d{2})?$/.test(s)
}

/**
 * 验证天数
 */
export function isDays(s: string) {
    return /^([1-9]\d*)$/.test(s)

}
