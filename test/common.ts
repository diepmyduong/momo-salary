import MomoSalary from '../src';

export const momoSalary = new MomoSalary({
  mode: 'test',
  username: 'test-salary',
  password: '12345678',
});

export const momoSalary2 = new MomoSalary({
  mode: 'test',
  username: 'test-salary2',
  password: '12345678',
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
