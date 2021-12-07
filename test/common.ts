import MomoSalary from '../src';

export const momoSalary = new MomoSalary({
  mode: 'test',
  username: process.env.USERNAME || 'test-salary',
  password: process.env.PASSWORD || '12345678',
});

export function waitForReady(momo: MomoSalary) {
  if (momo.isReady) return;
  return new Promise(resolve => {
    momo.on('ready', () => {
      console.log('momo ready');
      resolve(true);
    });
  });
}
