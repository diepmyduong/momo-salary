import { momoSalary2, waitForReady } from './common';

export default test('Approve Payout List', async () => {
  await waitForReady(momoSalary2);
  const fileId = '1791192386081531_1606';
  const result = await momoSalary2.approvePayoutList(fileId);
  console.log('approve', result);
});
