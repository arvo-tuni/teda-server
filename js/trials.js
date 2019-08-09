import fs from 'fs';

import Folder from './folder';
import WebTrial from './web/trial';
import TobiiTrial from './tobii/trial';

import logger from './logger';

export class Trials {

    /**
     * @param {string} source filename or folder
     */
    constructor( source ) {

        /** @type {WebTrial[]} */
        this.webTrials = [];

        /** @type {TobiiTrial[]} */
        this.tobiiTrials = [];

        let filenames = [ source ];

        const sourceStats = fs.statSync( source );
        if (sourceStats.isDirectory()) {

            filenames = Folder.listFiles( source );
        }

        filenames.forEach( filename => {
            const ext = filename.split('.').reduce( (r, v) => v, filename );

            try {
                if (ext === 'txt') {
                    this.webTrials = this.webTrials.concat( Trials.readWebTxtLog( filename ) );
                }
                if (ext === 'tsv') {
                    this.tobiiTrials.push( Trials.readTobiiLog( filename ) );
                }
                else {
                    throw new Error( 'handling other files is not implemented yet' );
                }
            }
            catch (ex) {
                console.error( ex );
            }
        });
    }

    /**
     * @param {string} filename 
     * @returns {WebTrial[]}
     */
    static readWebTxtLog( filename ) {

        logger.verbose( `reading Web log "${filename}"` );
    
        let lastTimestamp;

        return Trials._read( filename, row => {
            if (row[0] === '{') {
                const jsonRecord = JSON.parse( row );
                return new WebTrial( lastTimestamp, jsonRecord );
            }
            else {
                const [ key, value ] = row.split( ': ' );
                if (key === 'timestamp') {
                    lastTimestamp = new Date( value );
                    logger.verbose( `timestamp "${lastTimestamp}"` );
                }
                else if (row) {
                    logger.warn( `unsupported line "${row}"` );
                }
                return null;
            }
        });
    }

    /**
     * @param {string} filename
     * @returns {TobiiTrial}
     */
    static readTobiiLog( filename ) {

        /** @type {TobiiTrial} */
        let trial = null;

        logger.verbose( `reading Tobii log "${filename}"` );

        Trials._read( filename, row => {

            if (!trial) {    // the first log line contains a header
                trial = new TobiiTrial( row.split( '\t' ) );
            }
            else {
                trial.add( row.split( '\t' ) );
            }
        });

        return trial;
    }

    /**
     * @param {string} filename - full path to the file
     * @param {function(string): any | null} cb - callback, fires with each line
     * @returns {*[]}
     */
    static _read( filename, cb ) {

        const result = [];
        let buffer;

        try {
            buffer = fs.readFileSync( filename, 'utf8' );
        }
        finally {
            if (!buffer) {
                logger.error( `cannot read ${filename}` );
                return result;
            }
        }

        const data = buffer.toString();
        const rows = data.split( '\r\n' );

        rows.forEach( row => {
            const parsed = cb( row );

            if (parsed) {
                result.push( parsed );
            }
        });

        return result;
    }
    
}
