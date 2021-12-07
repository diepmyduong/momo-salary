import { momoSalary, waitForReady } from './common';

export default test('Submit Payout List', async () => {
  await waitForReady(momoSalary);
  const fileId = '1737544581780120_1541';
  const result = await momoSalary.submitPayoutList(fileId);
  console.log('submited', result);
});
