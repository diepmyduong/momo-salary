import { momoSalary, waitForReady } from './common';

export default test('Cancel Payout List', async () => {
  await waitForReady(momoSalary);
  const fileId = '1737040427841902_1506';
  const result = await momoSalary.cancelPayoutList(fileId);
  console.log('canceled', result);
});
