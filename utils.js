const reporter = require('cucumber-html-reporter');
const parseArgs = require('minimist');
const fse = require('fs-extra');
const _ = require('lodash');

function getargs() {
  if (process.argv.length >= 2) {
    const argsv = parseArgs(process.argv);
    return argsv;
  } else {
    throw new Error('Missing parameter "-f <filename>" OR -i <json>');
  }
}

function getOptions() {
  const args = getargs();
  let resultsFile;
  let options;
  let setOptions = true;

  if (args.f) {
    resultsFile = args.f;
  } else if (args.t) {
    resultsFile = 'sample/sample-results.json';
  } else if (_.isString(args.i)) {
    setOptions = false;
    if (fse.pathExistsSync(`/${args.i}`)) {
      throw new Error(`No file found in path: ${args.i}`);
    }

    options = fse.readJSONSync(args.i);
    if (
      !(options.hasOwnProperty('jsonFile') && options.hasOwnProperty('output'))
    ) {
      throw new Error(
        '-i {options} is missing options.jsonFile and options.output parameters'
      );
    }
  } else {
    throw new Error('Missing "-f <filename>" parameter OR -i <json> parameter');
  }

  if (setOptions) {
    if (fse.pathExistsSync(`/${resultsFile}`)) {
      throw new Error(`No file found in path: ${resultsFile}`);
    }

    options = {
      theme: 'bootstrap',
      jsonFile: resultsFile,
      reportSuiteAsScenarios: false,
      launchReport: false,
      metadata: {
        'App Version': '0.1.0',
        'Test Environment': '<env from user>',
        Browser: '<browser from user>',
        Platform: '<OS from user>'
      }
    };

    if (args.o) {
      options.output = args.o;
    } else {
      let outputFolder = 'output/report';
      fse.ensureDirSync(`${outputFolder}`);
      options.output = `${outputFolder}/cucumber-report.html`;
    }

    if (args.s) {
      (options.screenshotsDirectory = args.s), (options.storeScreenshot = true);
    }
  }
  if (!options.hasOwnProperty('theme')) {
    options.theme = 'bootstrap';
  }
  return options
}

function generateReport(){
   let finalOptions = getOptions()
  return reporter.generate(finalOptions);
}

module.exports = {
  getargs,
  getOptions,
  generateReport
}
