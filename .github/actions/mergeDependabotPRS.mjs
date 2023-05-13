import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';
import { runPromiseFnsInSequence } from './utils/runPromiseFnsInSequence.mjs';
import { isPRRebased } from './utils/isPRRebased.mjs';
import { retryUntilResolved } from './utils/retryUntilResolved.mjs';

const run = async () => {
  const {
    GITHUB_TOKEN,
    ORG_FULL_GITHUB_TOKEN,
  } = process.env;
  const ghActionsOctokit = new Octokit({
    auth: GITHUB_TOKEN,
  });
  const orgOctokit = new Octokit({
    auth: ORG_FULL_GITHUB_TOKEN,
  });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const { data: prsMetadata } = await ghActionsOctokit.rest.pulls.list({ owner, repo });

  const approveAndMergePRPromiseFns = prsMetadata
    .filter(({
      user, head, draft, state,
    }) => user.login === 'dependabot[bot]' && head.ref.startsWith('dependabot/') &&
        draft === false && state === 'open')
    .map(({ number }) => () => approveAndMergePR({
      ghActionsOctokit,
      orgOctokit,
      prNumber: number,
      owner,
      repo,
    }));

  await runPromiseFnsInSequence(approveAndMergePRPromiseFns);
};

const approveAndMergePR = async ({
  ghActionsOctokit,
  orgOctokit,
  prNumber,
  owner,
  repo,
}) => {
  let shouldSkipProcess = false;
  const {
    data: {
      html_url, mergeable, mergeable_state, merged, rebaseable,
    },
  } = await ghActionsOctokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });

  if (merged) {
    return;
  }

  core.info(`PR #${prNumber} is ${JSON.stringify({ mergeable, mergeable_state, rebaseable }, null, 2)}`);

  if (!mergeable && !await isPRRebased({ octokit: ghActionsOctokit, owner, repo, prNumber })) {
    // Request dependabot to rebase PR
    await orgOctokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event: 'COMMENT',
      body: '@dependabot rebase',
    });

    // Retry until PR is rebased (PR is mergeable) or rebase did not succeed after n attempts
    await retryUntilResolved(
      async () => await isPRRebased({ octokit: ghActionsOctokit, owner, repo, prNumber }),
      'Failed to rebase PR',
    )
      .catch((error) => {
        core.error(error);
        shouldSkipProcess = true;
      });
  }

  if (shouldSkipProcess) {
    core.info(`Skipping process for PR #${prNumber} (${html_url})`);

    return;
  }

  // Approve PR as github-actions user
  await ghActionsOctokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    event: 'APPROVE',
  });

  core.info(`PR #${prNumber} approved as github-actions user`);

  // Approve PR as organization user
  await orgOctokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    event: 'APPROVE',
  });

  core.info(`PR #${prNumber} approved as organization user`);

  await ghActionsOctokit.rest.pulls.merge({
    owner,
    repo,
    pull_number: prNumber,
  });

  core.info(`Merged PR #${prNumber} (${html_url})`);
};

run()
  .catch((error) => core.setFailed(error.message));
