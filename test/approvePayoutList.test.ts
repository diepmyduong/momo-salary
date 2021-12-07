import { momoSalary2, waitForReady } from './common';

export default test('Approve Payout List', async () => {
  await waitForReady(momoSalary2);
  const fileId = '1737930365323530_1573';
  const result = await momoSalary2.approvePayoutList(fileId);
  console.log('approve', result);
});
