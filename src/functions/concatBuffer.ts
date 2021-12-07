import FormData from 'form-data';
import concat from 'concat-stream';

export default async function concatBuffer(data: FormData) {
  return new Promise(resolve => {
    data.pipe(
      concat({ encoding: 'buffer' }, async data => {
        resolve(data);
      })
    );
  });
}
