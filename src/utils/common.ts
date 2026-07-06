/**
 * 如果字符串为空的情况返回null，否则返回原字符串
 * @param s
 */
export function coverBlankToNull(s: string) {
    if (s == "" || s == null) {
        return null;
    }
    return s;
}

/**
 * 如果字符串为空的情况返回0，否则返回原字符串
 * @param s
 */
export function coverBlankToZero(s: string) {
    if (s == "" || s == null) {
        return 0;
    }
    return s;
}

/**
 * 如果数组为null的情况返回空数组，否则返回原数组
 * @param array
 */
export function coverNullToEmptyArray(array: any[]) {
    if (array == null) {
        return [];
    }
    return array;
}

export function coverUndefinedToEmpty(s: any) {
    if (typeof s === "undefined") {
        // myValue 是 undefined
        return "";
    }
    return s;
}