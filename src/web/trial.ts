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
      group: this.participantGroup || 'default',
      timestamp: this.timestamp,
      type: this.resultWord || (this.gaze && this.gaze.general ? this.gaze.general.RecordingName : '' ),
    };
  }

  get metaExt(): TrialMetaExt {

    const result: any = {
        rate: this.clickables.length ? this.marks / this.clickables.length : 0,
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
        let type = (this as any)[k] as string;
        if (type) {
          result['type'] = type;
        }
        else {
          const buildingEvent = this.events.find( e => e.type === 'building');
          if (buildingEvent) {
            type = (buildingEvent as WebLog.TestEventBuild).test;
          }
          else if (this.gaze && this.gaze.general) {
            type = this.gaze.general.RecordingName
          }
          result['type'] = type;
        }
      }
      else {
        result[k] = this[k];
      }
    }

    return result;
  }
}
