import { momoSalary, waitForReady } from './common';

export default test('Get Delivery Report', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getDeliveryListReport({
    fileId: '1730442600556989_1085',
  });
  console.log('report', result);
});
