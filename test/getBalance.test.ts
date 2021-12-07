import { momoSalary, waitForReady } from './common';

export default test('Get Balance', async () => {
  await waitForReady(momoSalary);

  const result = await momoSalary.getBalance();
  console.log('balance', result);
});
