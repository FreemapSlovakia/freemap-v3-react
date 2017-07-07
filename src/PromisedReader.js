export default function toPromise(reader) {
  return new Promise((resolve, reject) => {
    reader.onload = (result) => {
      resolve(result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
}
