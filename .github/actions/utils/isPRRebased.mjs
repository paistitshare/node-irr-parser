import * as core from '@actions/core';

export const isPRRebased = async ({ octokit, owner, repo, prNumber }) => {
  const { data: { mergeable, mergeable_state, rebaseable } } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  core.info(`PR #${prNumber} is ${JSON.stringify({ mergeable, mergeable_state, rebaseable }, null, 2)}`);

  return mergeable_state === 'clean' && rebaseable === true;
};
