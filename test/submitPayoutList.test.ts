import { momoSalary, waitForReady } from './common';

export default test('Submit Payout List', async () => {
  await waitForReady(momoSalary);
  const fileId = '1737930365323530_1573';
  const result = await momoSalary.approvePayoutList(fileId);
  console.log('submited', result);
});
