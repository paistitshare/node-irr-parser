export const runPromiseFnsInSequence = (promiseFns) => {
  return promiseFns.reduce((previousPromiseFn, nextPromiseFn) => {
    return previousPromiseFn.then(nextPromiseFn);
  }, Promise.resolve());
};
