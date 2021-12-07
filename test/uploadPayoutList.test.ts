import { momoSalary, waitForReady } from './common';

export default test('Upload Payout List', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.uploadPayoutList(
    'assets/payout-list.xlsx',
    'Đợt chi lương test'
  );
  console.log('upload', result);
  const status = await momoSalary.getPayoutFileStatus(result.fileId);
  console.log('status', status);
});
