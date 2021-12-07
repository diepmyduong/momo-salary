import { momoSalary, waitForReady } from './common';

export default test('Get Delivery List', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getAllDeliveryList({
    fileId: '24802139121984182_1103',
  });
  console.log('files', result);
});
