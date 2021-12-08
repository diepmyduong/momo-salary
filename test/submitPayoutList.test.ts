import { momoSalary, waitForReady } from './common';

export default test('Submit Payout List', async () => {
  await waitForReady(momoSalary);
  const fileId = '1791192386081531_1606';
  const result = await momoSalary.submitPayoutList(fileId);
  console.log('submited', result);
});
