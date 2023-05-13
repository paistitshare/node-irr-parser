import { logPRState } from './logPRState.mjs';

export const isPRRebased = async ({ octokit, owner, repo, prNumber }) => {
  const { data: { mergeable, mergeable_state, rebaseable } } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  logPRState({ mergeable, mergeable_state, rebaseable, prNumber });

  const NON_REBASED_STATES = ['dirty', 'unstable', 'unknown'];

  return !NON_REBASED_STATES.includes(mergeable_state) && rebaseable === true;
};
