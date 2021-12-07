import { momoSalary, waitForReady } from './common';

export default test('Recheck Delivery List', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.recheckDeliveryList('1730442600556989_1085');
  console.log('recheck', result);
});
