import fs from 'fs';

const DATA_FOLDER = './data';

export default class Folder {

    /**
     * @param {string} [folder]
     * @returns {string[]}
     */
    static subfolders( folder = DATA_FOLDER ) {
        const names = fs.readdirSync( folder );
        const subfolders = names.filter( name => fs.statSync( `${folder}/${name}` ).isDirectory() );
        if (subfolders.length) {
            return subfolders;
        }
        
        return [];
    }
    
    /**
     * @param {string} folder 
     * @param {RegExp} [re]
     * @returns {string[]}
     */
    static listFiles( folder, re ) {
        const filenames = fs.readdirSync( folder );
        if (re)
            return filenames.filter( filename => re.test( filename ) );
        else 
            return filenames;
    }
}
