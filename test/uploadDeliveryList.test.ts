import { momoSalary, waitForReady } from './common';

export default test('Upload Delivery List', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.uploadDeliveryList(
    'assets/delivery-list.xlsx',
    'danh-sach-test.xlsx'
  );
  console.log('upload', result);
  const status = await momoSalary.getDeliveryFileStatus(result.fileId);
  console.log('status', status);
});
