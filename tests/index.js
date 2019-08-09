import trialsWebLog from './trials-weblog';
import trialsTobiiLog from './trials-tobiilog';

const tests = [
  { name: 'trials WEB', value: trialsWebLog },
  { name: 'trials TOBII', value: trialsTobiiLog },
];

tests.forEach( test => {
  console.log( `${test.name}${' '.repeat(20 - test.name.length)} - ${test.value ? 'OK' : 'FAILED'}` );
});
