import { execSync } from 'child_process';
import * as core from '@actions/core';

export const retryUntilResolved = async (asyncCallback, failedOperationMessage) => {
  return new Promise(async (resolve, reject) => {
    const BASE_RETRY_INTERVAL_SECONDS = 2;
    const MAX_ATTEMPTS = 5;

    for (let currentAttempt = 1; currentAttempt <= MAX_ATTEMPTS; currentAttempt++) {
      core.info(`attempt number: ${currentAttempt}`);

      if (await asyncCallback()) {
        resolve();
        return;
      }

      const EXPONENTIAL_RETRY_INTERVAL = Math.pow(BASE_RETRY_INTERVAL_SECONDS, currentAttempt);

      execSync(`sleep ${EXPONENTIAL_RETRY_INTERVAL}`);
    }

    reject(failedOperationMessage);
  });
};
