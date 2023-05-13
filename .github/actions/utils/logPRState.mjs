import * as core from '@actions/core';

export const logPRState = ({ mergeable, mergeable_state, rebaseable, prNumber }) => {
  core.info(`PR #${prNumber} is ${JSON.stringify({ mergeable, mergeable_state, rebaseable }, null, 2)}`);
};
