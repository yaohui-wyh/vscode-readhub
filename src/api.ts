import { RHCategory, RHTreeItem, RHInstantView } from './models';
import { Constants } from './utils';
import fetch, { Headers } from 'node-fetch';

export async function getLatestItems<T>(category: RHCategory, pageSize: number = 20): Promise<ApiResult<T[]>> {
    const cursor = category === RHCategory.JOB ? (new Date()).getTime().toString() : "@null";
    const ret = await getReadhubResponse<T>(category, cursor, pageSize);
    if (ret.success) {
        return new ApiResult<T[]>(true, undefined, "", ret.result);
    } else {
        return new ApiResult(false, ret.errorcode, ret.errorMessage);
    }
}

export async function fetchPrevItems<T>(category: RHCategory, lastItem?: RHTreeItem, pageSize: number = 20): Promise<ApiResult<T[]>> {
    let cursor;
    if (!lastItem) {
        cursor = "@null";
    } else if (category === RHCategory.TOPIC) {
        cursor = lastItem.order.toString();
    } else {
        cursor = lastItem.publishDate && new Date(lastItem.publishDate).getTime().toString() || "@null";
    }
    const ret = await getReadhubResponse<T>(category, cursor, pageSize);
    if (ret.success) {
        return new ApiResult<T[]>(true, undefined, "", ret.result);
    } else {
        return new ApiResult(false, ret.errorcode, ret.errorMessage);
    }
}

export async function getInstantView(topicId: string): Promise<ApiResult<RHInstantView>> {
    const url = `${Constants.apiHost}/topic/instantview?topicId=${topicId}`;
    const res = await fetch(url, {
        method: 'get',
        timeout: 15 * 1000,
        headers: new Headers({ "Content-Type": "application/json; charset=UTF-8" })
    });
    if (res.ok) {
        try {
            const result = await res.json();
            return new ApiResult<RHInstantView>(true, undefined, "", result);
        } catch (ex) {
            return new ApiResult(false, ErrMessage.JSON_PARSE_ERROR);
        }
    } else {
        return new ApiResult(false, ErrMessage.API_NETWORK_ERROR);
    }
}

async function getReadhubResponse<T>(category: RHCategory, cursor: string = "@null", pageSize: number = 20): Promise<ApiResult<T[]>> {
    const url = `${Constants.apiHost}/${category.apiPath}?lastCursor=${cursor}&pageSize=${pageSize}`;
    const res = await fetch(url, {
        method: 'get',
        timeout: 15 * 1000,
        headers: new Headers({ "Content-Type": "application/json; charset=UTF-8" })
    });
    if (res.ok) {
        try {
            const result = await res.json();
            return new ApiResult<T[]>(true, undefined, "", result.data);
        } catch (ex) {
            return new ApiResult(false, ErrMessage.JSON_PARSE_ERROR);
        }
    } else {
        return new ApiResult(false, ErrMessage.API_NETWORK_ERROR);
    }
}

export class ApiResult<T> {
    constructor(
        public success: boolean = false,
        public errorcode?: ErrMessage,
        public errorMessage?: string,
        public result?: T
    ) { }
}

class ErrMessage {
    public static API_NETWORK_ERROR = new ErrMessage('');
    public static INSTANT_VIEW_ERROR = new ErrMessage('');
    public static JSON_PARSE_ERROR = new ErrMessage('');

    constructor(
        message: string
    ) { }
}