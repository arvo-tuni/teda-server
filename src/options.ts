import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

const optionsDefs = [{
    name: 'help',
    alias: 'h',
    type: Boolean,
    defaultValue: false,
    description: 'generates this information',
  }, {
    name: 'verbose',
    alias: 'v',
    type: Boolean,
    defaultValue: false,
    description: 'generates verbose output whenever possible',
  }, {
    name: 'port',
    alias: 'p',
    type: Number,
    defaultValue: 3000,
    typeLabel: '{underline number}',
    description: 'port.',
  }, {
    name: 'data-folder',
    alias: 'd',
    type: String,
    defaultValue: './data',
    typeLabel: '{underline string}',
    description: 'root data folder',
  }, {
    name: 'time-correction',
    alias: 't',
    type: Number,
    defaultValue: 2,
    typeLabel: '{underline hours}',
    description: 'time difference between Tobii and Python log files',
  },
];

const options = commandLineArgs( optionsDefs );

const usageDefs = [{
    header: 'ARVO data server',
    content: 'Reads data collected in ARVO tests, parses it, and opens a port to serve with the data.',
  }, {
    header: 'Data structure',
    content: ['The data should structured as follows:',
        ' - each Python log file must be placed into a separate folder,',
        ' - Tobii Studio data should be exported into the same folder, one TSV file per each participant or a single file with all participants',
        ' - by default, the app reads data from the folders located in "./data" folder, but this can be changed via options.',
    ],
  }, {
    header: 'Options',
    optionList: optionsDefs,
  }, {
    header: 'Examples',
    content: [{
        desc: '1. Simple start with default options.',
        example: '$ npm run start',
      }, {
        desc: '2. Data is located not in "./data".',
        example: '$ npm run start -- -d c:/arvo-data',
      }, {
        desc: '3. There is no more 2 hours time difference between Tobii and Python logs.',
        example: '$ npm run start -- -t 0',
      },
    ],
  },
];

const usage = commandLineUsage( usageDefs );

console.info( usage );

export default options;
