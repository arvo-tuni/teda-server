import * as Tobii from './log';
import * as TrialEvents from './trial-events';
import * as GazeEvent from './gaze-event';
import Sample from './sample';
import Stimuli from './stimuli';
import { copyValue } from '../utils';

/**
 * Copy value (if it exists) from raw data from Tobii log to the corresponding object property
 */
function map( values: string[], dest: Tobii.Validable, keys: string[] ) {

  Object.keys( dest ).forEach( key => {
    const index = keys.indexOf( key );
    if (index >= 0) {
      const valueStr = values[ index ];
      if (valueStr !== undefined && valueStr !== '') {
        (dest as any)[ key ] = copyValue( valueStr, (dest as any)[ key ]);
      }
    }
  });
}

enum AdditionResult {
  Invalid = -1,
  AnotherParticipant = 0,
  OK = 1,
}

class Events {
  mouse: TrialEvents.Mouse[] = [];
  keyboard: TrialEvents.Keyboard[] = [];
  studio: TrialEvents.Studio[] = [];
  external: TrialEvents.External[] = [];
}

interface Timestamped {
  timestamp: Tobii.Timestamp;
}

export default class Trial {

  _headers: string[];
  _gazeEvents: GazeEvent.Base[] = [];
  general: Tobii.General | null = null;
  samples: Sample[] = [];
  events: Events = new Events();
  stimuli: Stimuli[] = [];
  
  constructor( headers: string[] ) {
    this._headers = headers.map( header => header.replace( /[\s()]/g, '') );
  }

  get gazeEvents(): GazeEvent.Base[] {

    if (!this._gazeEvents.length) {
      let gazeEvent: GazeEvent.Base | null = null;

      this.samples.forEach( sample => {

        let mustCreateNew = false;

        if (!gazeEvent) {
          mustCreateNew = true;
        }
        else {
          if (sample.event.GazeEventType !== gazeEvent.name) {
            mustCreateNew = true;
          }
          else if (sample.event.GazeEventDuration !== gazeEvent.duration) {
            mustCreateNew = true;
          }
        }

        if (mustCreateNew) {
          if (sample.event.GazeEventType === Tobii.GAZE_EVENT.fixation) {
            gazeEvent = new GazeEvent.Fixation( sample.timestamp, sample.event );
          }
          else if (sample.event.GazeEventType === Tobii.GAZE_EVENT.saccade) {
            gazeEvent = new GazeEvent.Saccade( sample.timestamp, sample.event );
          }
          else if (sample.event.GazeEventType === Tobii.GAZE_EVENT.unclassified) {
            gazeEvent = new GazeEvent.Unclassified( sample.timestamp, sample.event );
          }
          else {
            throw new Error( 'Internal error: GazeEventType is uknown' );
          }

          gazeEvent.samples.push( sample );

          this._gazeEvents.push( gazeEvent );
        }
        else if (!!gazeEvent) {
          gazeEvent.samples.push( sample );
        }
      });
    }

    return this._gazeEvents;
  }

  get fixations() {
    return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.fixation ) as GazeEvent.Fixation[];
  }

  get saccades() {
    return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.saccade ) as GazeEvent.Saccade[];
  }

  get gazeAways() {
    return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.unclassified ) as GazeEvent.Unclassified[];
  }

  add( values: string[] ): AdditionResult {
    const general = this._create( 'General', values ) as Tobii.General;
    if (!general) {
      return AdditionResult.Invalid;
    }

    if (!this.general) {
      this.general = general;
    }
    else if (this.general.ParticipantName !== general.ParticipantName) {
      return AdditionResult.AnotherParticipant;
    }
    else {
      const timestamp = this._create( 'Timestamp', values ) as Tobii.Timestamp;
      if (!timestamp) {
        return AdditionResult.Invalid;
      }

      values = values.map( v => v.replace(',', '.') );

      // timestamp correction
      const recDate = this.general.RecordingDate;
      timestamp.LocalTimeStamp.setFullYear( recDate.getFullYear(), recDate.getMonth(), recDate.getDate() );

      if (timestamp.EyeTrackerTimestamp) {

        const sample = new Sample( timestamp );

        sample.gaze = this._create( 'Gaze', values ) as Tobii.Gaze;
        sample.event = this._create( 'GazeEvent', values ) as Tobii.GazeEvent;
        sample.eyePos = this._create( 'EyePos', values ) as Tobii.EyePos;
        sample.eye = this._create( 'Eye', values ) as Tobii.Eye;
        sample.cam = this._create( 'Cam', values ) as Tobii.Cam;

        this.samples.push( sample );
      }
      else {
        const eventType = Object.keys( TrialEvents.TYPES ).find( type => {
          const eventType = (TrialEvents.TYPES as any)[ type ] as TrialEvents.EventType;
          const evt = this._create( eventType.log, values );
          if (evt) {
            (this.events as any)[ type ].push( new (TrialEvents.TYPES as any)[ type ].cls( timestamp, evt ) );
            return type;
          }
        });

        if (eventType && eventType === 'studio' && this.events.studio.slice(-1)[0].StudioEvent === 'ScreenRecStarted' ) {
          const stimuli = new Stimuli( timestamp );
          stimuli.media = this._create( 'Media', values ) as Tobii.Media;
          stimuli.scene = this._create( 'Scene', values ) as Tobii.Scene;
          stimuli.segment = this._create( 'Segment', values ) as Tobii.Segment;

          this.stimuli.push( stimuli );
        }
      }
    }

    return 1;
  }

  /**
   * Makes a copy of the trial with same headers
   */
  fromExisting() {
    return new Trial( this._headers );
  }

  /**
   * Makes a copy of the trial with all events limited to this range
   */
  range( start: number, end: number ) {
    const result = new Trial( this._headers );

    const filter = (e: Timestamped) => {
      const ts = e.timestamp.LocalTimeStamp.getTime();
      return start < ts && ts < end;
    };

    result.general = this.general;

    result.stimuli = this.stimuli.filter( filter );
    result.samples = this.samples.filter( filter );

    Object.keys( this.events ).forEach( key => {
      (result.events as any)[ key ] = (this.events as any)[ key ].filter( filter );
    });

    result._gazeEvents = this._gazeEvents.filter( filter );

    return result;
  }

  _create( type: string, values: string[] ) {

    const result = new (Tobii as any)[type]() as Tobii.Validable;

    map( values, result, this._headers );

    result.validate();

    return result.isEmpty ? null : result;
  }
}
