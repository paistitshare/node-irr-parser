#!/usr/bin/env node

const program =  require('commander');
const realEstateProcessor = require('./src/app/RealEstateProcessor');

program
  .version('1.0.0')
  .description('Irr.by real estate parser. Try at your own risk');

program
  .command('fetch <postsNumber>')
  .alias('f')
  .description('Well, it usually fetches irr.by posts and store them in MongoDB by Geospatial Index')
  .action((postsNumber) => {
      realEstateProcessor.process(postsNumber);
  });

program
  .parse(process.argv);
