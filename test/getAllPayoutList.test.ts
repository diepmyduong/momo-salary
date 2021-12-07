import { momoSalary, waitForReady } from './common';

export default test('Get All Payout List', async () => {
  await waitForReady(momoSalary);
  const fileId = '1735569373842589_1475';
  const detail = await momoSalary.getPayoutFileDetail(fileId);
  console.log('detail', detail);
  const result = await momoSalary.getPayoutList({ fileId });
  console.log('files', result);
});
