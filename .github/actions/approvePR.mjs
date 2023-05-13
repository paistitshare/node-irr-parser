import { Octokit } from 'octokit';

(async () => {
  const octokit = new Octokit({
    auth: process.env.GH_TOKEN
  });
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: process.env.PR_NUMBER,
    event: 'APPROVE',
  });
})();
