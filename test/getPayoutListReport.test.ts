import { momoSalary, waitForReady } from './common';

export default test('Get Payout Report', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getPayoutListReport('1735569373842589_1475');
  console.log('report', result);
});
