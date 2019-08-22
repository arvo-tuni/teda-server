import * as Tobii from './log';
import Sample from './sample';

export class Base {
  /**
   * @param {Tobii.Timestamp} timestamp
   * @param {string} name
   * @param {number} index
   * @param {number} duration
   * @param {Base} previous previous event
   */
  constructor( timestamp, name, index, duration, previous) {
    this.timestamp = timestamp;
    this.name = name;
    this.index = index;
    this.duration = duration;
    //this.previous = previous || null;     // cannot exist due to cyclic loop when formatting to JSON

    /** @type {Sample[]} */
    this.samples = [];
  }
}

export class Fixation extends Base {
  /**
   * @param {Tobii.Timestamp} timestamp
   * @param {Tobii.GazeEvent} evt
   * @param {Base} [previous] previous event
   */
  constructor( timestamp, evt,  previous ) {
    super( timestamp, Tobii.GAZE_EVENT.fixation, evt.FixationIndex, evt.GazeEventDuration, previous );

    this.x = evt.FixationPointXMCSpx;
    this.y = evt.FixationPointYMCSpx;
    this.saccadicAmplitude = evt.SaccadicAmplitude;
    this.absoluteSaccadicDirection = evt.AbsoluteSaccadicDirection;
    this.relativeSaccadicDirection = evt.RelativeSaccadicDirection || 0;
  }
}

export class Saccade extends Base {
  /**
   * @param {Tobii.Timestamp} timestamp
   * @param {Tobii.GazeEvent} evt
   * @param {Base} [previous] previous event
   */
  constructor( timestamp, evt, previous ) {
    super( timestamp, Tobii.GAZE_EVENT.saccade, evt.SaccadeIndex, evt.GazeEventDuration, previous );
  }
}

export class Unclassified extends Base {
  /**
   * @param {Tobii.Timestamp} timestamp
   * @param {Tobii.GazeEvent} evt
   * @param {Base} [previous] previous event
   */
  constructor( timestamp, evt, previous ) {
    super( timestamp, Tobii.GAZE_EVENT.unclassified, -1, evt.GazeEventDuration, previous );
  }
}


