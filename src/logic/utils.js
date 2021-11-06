function wrapPromise(promise) {
  let status = 1;
  let result;
  let suspender = promise.then(
    response => {
      status = 0;
      result = response;
    },
    error => {
      status = 2;
      result = error;
    },
  );
  return {
    read() {
      if (status === 1) {
        throw suspender;
      } else if (status === 2) {
        throw result;
      } else if (status === 0) {
        return result;
      }
    },
  };
}

function fetchImageSource(avatar) {
  return wrapPromise(
    fetch(
      new Request(avatar, {
        importance: 'low',
        redirect: 'manual',
      }),
    )
      .then(response => response.blob())
      .then(blob => blobToBase64(blob))
      .then(image => image)
      .catch(() => {}),
  );
}

function blobToBase64(blob) {
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result);
    };
  });
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export {wrapPromise, fetchImageSource, blobToBase64, clamp};
