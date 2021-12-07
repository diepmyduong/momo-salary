import { momoSalary, waitForReady } from './common';

export default test('Get All Payout Files', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getAllPayoutFiles({
    fromDate: '07-12-2021',
    toDate: '07-12-2021',
  });
  console.log('files', result);
});
