import * as assert from 'assert';
import { ApiResult, getLatestItems, getInstantView } from '../../api';
import { RHCategory, RHNews, RHInstantView } from '../../models';

suite('API Test Suite', () => {
    test('getLatestItems test', async () => {
        const res: ApiResult<RHNews[]> = await getLatestItems<RHNews>(RHCategory.NEWS);
        assert.equal(res.success, true);
        assert.equal(!res.errorMessage, true);

        const result: RHNews[] = res.result!!;
        assert.equal(result.length, 20);
        assert.equal(result[0].id !== "", true);
        assert.equal(result[0].title !== "", true);
    });

    test('getInstantView test', async () => {
        const ret: ApiResult<RHInstantView> = await getInstantView('7PDQGcB9bxt');
        assert.equal(ret.success, true);

        const data: RHInstantView = ret.result!!;
        assert.equal(data.content.length > 10, true);
    });
});