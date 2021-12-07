import { momoSalary, waitForReady } from './common';

export default test('Get All Delivery Files', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getAllDeliveryFiles();
  console.log('files', result);
});
