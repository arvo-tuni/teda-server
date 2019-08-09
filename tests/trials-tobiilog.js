import { Trials } from '../js/trials';

let trials;

try {
    trials = Trials.readTobiiLog( './data/tobii-rec1.tsv');
}
catch (ex) {
    console.error( ex );
}

export default trials;
