import { Octokit } from 'octokit';
import core from '@actions/core';
// import { GitHub, context } from '@actions/github';

const sleep = (timeMs) => {
  return new Promise((resolve) => {
    return setTimeout(() => {
      resolve();
    }, timeMs);
  });
};

const run = async () => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const { data: prsMetadata } = await octokit.rest.pulls.list({ owner, repo });

  prsMetadata
    .filter(({ user, head }) => user.login === 'dependabot[bot]' && head.ref.startsWith('dependabot/'))
    .forEach(async ({ html_url, number }) => {
      await octokit.rest.repos.createDispatchEvent({
        owner,
        repo,
        event_type: 'trigger-dependabot-pr-merge',
        client_payload: {
          workflow_dispatcher: process.env.GITHUB_ACTOR,
          dispatcher_token: process.env.GITHUB_TOKEN,
          pat: process.env.TEST_NPM_TOKEN,
          pr_url: html_url,
          pr_number: number
        }
      });

      // const { createOAuthAppAuth } = require('@octokit/auth-oauth-app');
      // const perUserOctokit = new Octokit({
      //   authStrategy: createOAuthAppAuth,
      //   auth: userAuthenticationFromWebFlow.token,
      // });
      // await octokit.rest.pulls.createReview({
      //   owner,
      //   repo,
      //   pull_number: number,
      //   event: 'APPROVE',
      // });
      // OR
      // curl --request GET \
      //   --url "https://api.github.com/octocat" \
      //   --header "Authorization: Bearer YOUR-TOKEN" \
      //   --header "X-GitHub-Api-Version: 2022-11-28"
      // wait until other PRs are rebased
      await sleep(5000);
    });
};

void run().catch(error => core.setFailed(error.message));
