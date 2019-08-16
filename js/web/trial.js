import crypto from 'crypto';

import * as WebLog from './log';

import { copy, clearUnused } from '../utils';

export default class Trial extends WebLog.Schema {

  /**
   * @param {Date} timestamp 
   * @param {any} json
   */
  constructor( timestamp, json ) {

    super();
    
    const hash = crypto.createHash( 'sha256' );
    hash.update( timestamp.toString() );

    this._id = hash.digest( 'hex' ).substr( 0, 8 );
    this.timestamp = timestamp;

    this.gaze = null; // to be assigned externally

    copy( json, this );
    clearUnused( this );
  }

  get meta() {
    return {
      _id: this._id,
      participant: this.participantCode,
      timestamp: this.timestamp,
      type: this.resultWord,
    };
  }

  get metaExt() {

    const result = {
        rate: this.marks / this.clickables.length
    };

    for (let k in this) {

      if (k === 'hitsPerTenth' || 
          k === 'clickables' ||
          k === 'marked' ||
          k === 'markedWrong' ||
          k === 'lastMarked' ||
          k === 'events' ||
          k === 'gaze' ||
          k === 'headData' ) {
        continue;
      }

      if (k === 'resultWord') {
        result['type'] = this[k];
      }
      else {
        result[k] = this[k];
      }
    }

    return result;
  }
}
