import Folder from '../js/folder';
import { Trials } from '../js/trials';

const DATA_FOLDER = './data';
const files = Folder.listFiles( DATA_FOLDER, /(.*)\.txt/ );

let trials;

try {
    trials = Trials.readWebTxtLog( `${DATA_FOLDER}/${files[0]}` );
}
catch (ex) {
    console.error( ex );
}

export default trials;
