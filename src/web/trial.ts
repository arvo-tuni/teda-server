import crypto from 'crypto';

import * as WebLog from './log';
import TobiiTrial from '../tobii/trial';
import { TrialMeta, TrialMetaExt } from './meta';

import { copy, clearUnused } from '../utils';

export default class Trial extends WebLog.Schema {

  public _id: string;
  public timestamp: Date;
  public gaze: TobiiTrial | null = null;    // to be assigned externally

  /**
   * @param {Date} timestamp 
   * @param {any} json
   */
  constructor( timestamp: Date, json: any ) {

    super();
    
    const hash = crypto.createHash( 'sha256' );
    hash.update( timestamp.toString() );

    this._id = hash.digest( 'hex' ).substr( 0, 8 );
    this.timestamp = timestamp;

    copy( json, this );
    clearUnused( this );
  }

  get meta(): TrialMeta {
    return {
      _id: this._id,
      participant: this.participantCode || (this.gaze && this.gaze.general ? this.gaze.general.ParticipantName : '' ),
      timestamp: this.timestamp,
      type: this.resultWord || (this.gaze && this.gaze.general ? this.gaze.general.RecordingName : '' ),
    };
  }

  get metaExt(): TrialMetaExt {

    const result: any = {
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
        result['type'] = this[k] || (this.gaze && this.gaze.general ? this.gaze.general.RecordingName : '' );
      }
      else {
        result[k] = this[k];
      }
    }

    return result;
  }
}
