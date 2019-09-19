import fs from 'fs';

import Folder from './folder';
import WebTrial from './web/trial';
import TobiiTrial from './tobii/trial';

import logger from './logger';

type Callback<T> = (arg: string) => T | null;

export class Trials {

  static readWebTxtLog( filename: string ): WebTrial[] {

    logger.verbose( `reading Web log "${filename}"` );

    let lastTimestamp: Date;

    return Trials.read<WebTrial>( filename, row => {
      if (row[0] === '{') {
        const jsonRecord = JSON.parse( row );
        return new WebTrial( lastTimestamp, jsonRecord );
      }
      else {
        const [ key, value ] = row.split( ': ' );
        if (key === 'timestamp') {
          lastTimestamp = new Date( value );
        }
        else if (row) {
          logger.warn( `unsupported line "${row}"` );
        }
        return null;
      }
    });
  }

  static readTobiiLog( filename: string ) {

    const trials: TobiiTrial[] = [];

    logger.verbose( `reading Tobii log "${filename}"` );

    let trial: TobiiTrial | null = null;
    Trials.read<TobiiTrial>( filename, row => {

      if (!trial) {    // the first log line contains a header
        trial = new TobiiTrial( row.split( '\t' ) );
        trials.push( trial );
      }
      else {
        const values = row.split( '\t' );
        if (trial.add( values ) === 0) {  // another participant
          trial = trial.fromExisting();
          trials.push( trial );
          trial.add( values );
        }
      }

      return null;
    });

    return trials;
  }

  private static read<T>( filename: string, cb: Callback<T> ): T[] {

    const result: T[] = [];
    let buffer;

    try {
      buffer = fs.readFileSync( filename, 'utf8' );
    }
    catch {
      buffer = null;
    }

    if (!buffer) {
      logger.error( `cannot read ${filename}` );
      return result;
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

  public webTrials: WebTrial[] = [];
  public tobiiTrials: TobiiTrial[] = [];

  constructor( source: string ) {

    let filenames = [ source ];

    const sourceStats = fs.statSync( source );
    if (sourceStats.isDirectory()) {

      filenames = Folder.listFiles( source );
    }

    filenames.forEach( filename => {
      const ext = filename.split('.').reduce( (r, v) => v, filename );

      try {
        if (ext === 'txt') {
          const webTrials = Trials.readWebTxtLog( filename );
          this.webTrials = this.webTrials.concat( webTrials );
        }
        if (ext === 'tsv') {
          const tobiiTrial = Trials.readTobiiLog( filename );
          if (tobiiTrial) {
            this.tobiiTrials.push( ...tobiiTrial );
          }
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

}
