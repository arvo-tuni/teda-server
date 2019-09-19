export class Validable {
  /**
   * Removes schema types with the corresponding default values
   */
  validate() {
    for (let k in this) {
      if ( typeof this[k] === 'function' ) {
        this[k] = undefined;
      }
    }
  }

  /**
   * @returns True if all properties were left unassigned (i.e., preserved the schema)
   */
  get isEmpty() {
    for (let k in this) {
      if (this[k] !== undefined) {
        return false;
      }
    }

    return true;
  }
}

export class Size extends Validable {
  /**
   * @param {string} str in shape "w x h"
   */
  constructor( str ) {
    super();

    this.width = Number;
    this.height = Number;

    if (str) {
      const arr = str.split( 'x' );
      if (arr.length === 2) {
        this.width = Number( arr[0] );
        this.height = Number( arr[1] );
      }
    }
  }
}

export class TobiiDateTime extends Date {
  /**
   * @param {string} [value] either date as '12/31/2019', or time as '23.59.59.999'
   */
  constructor( value ) {

    super();

    if (!value) {
      return;
    }

    let arr = value.split( '/' );
    if (arr.length === 3) {
      return new Date( `${arr[2]}-${arr[1]}-${arr[0]} 00:00:00.000Z` );
    }

    arr = value.split( '.' );
    if (arr.length === 4) {
      return new Date( `1.1.1970 ${arr[0]}:${arr[1]}:${arr[2]}.${arr[3]}Z` );
    }

    throw new Error( 'Invalid argument for TobiiDateTime' );
  }

  /**
   * @param {Date} date1
   * @param {Date} date2
   * @returns {Date}
   */
  static sum( date1, date2 ) {
    return new Date( date1.valueOf() + date2.valueOf() );
  }
}

export class MarkerIDs extends Array {
  /**
   * @param {string} value
   */
  constructor( value ) {
    super();

    return value.split( ',' ).map( Number );
  }
}

export const EYE_VALIDITY = {
  valid: 0,
  good: 1,
  uncertain: 2,
  bad: 3,
  invalid: 4,
};

export const GAZE_EVENT = {
  unclassified: 'Unclassified',
  fixation: 'Fixation',
  saccade: 'Saccade',
};

export class General extends Validable {
  constructor() {
    super();

    /** @type {Date} */
    this.ExportDate = TobiiDateTime;
    /** @type {String} */
    this.StudioVersionRec = String;
    /** @type {String} */
    this.StudioProjectName = String;
    /** @type {String} */
    this.StudioTestName = String;
    /** @type {String} */
    this.ParticipantName = String;
    /** @type {String} */
    this.GroupValue = String;
    /** @type {String} */
    this.RecordingName = String;
    /** @type {Date} */
    this.RecordingDate = TobiiDateTime;
    /** @type {Number} */
    this.RecordingDuration = Number; // ms
    /** @type {Size}   */
    this.RecordingResolution = Size;
    /** @type {String} */
    this.PresentationSequence = String;
    /** @type {String} */
    this.FixationFilter = String;
  }
}

export class Media extends Validable {
  constructor() {
    super();

    /** @type {String} */
    this.MediaName = String;
    /** @type {Number} */
    this.MediaPosXADCSpx = Number;
    /** @type {Number} */
    this.MediaPosYADCSpx = Number;
    /** @type {Number} */
    this.MediaWidth = Number;
    /** @type {Number} */
    this.MediaHeight = Number;
  }
}

export class Segment extends Validable {
  constructor() {
    super();

    /** @type {String} */
    this.SegmentName = String;
    /** @type {Number} */
    this.SegmentStart = Number;
    /** @type {Number} */
    this.SegmentEnd = Number;
    /** @type {Number} */
    this.SegmentDuration = Number;
  }
}

export class Scene extends Validable {
  constructor() {
    super();

    /** @type {String} */
    this.SceneName = String;
    /** @type {Number} */
    this.SceneSegmentStart = Number;
    /** @type {Number} */
    this.SceneSegmentEnd = Number;
    /** @type {Number} */
    this.SceneSegmentDuration = Number;
  }
}

export class Timestamp extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.RecordingTimestamp = Number;
    /** @type {Date} */
    this.LocalTimeStamp = TobiiDateTime;
    /** @type {Number} */
    this.EyeTrackerTimestamp = Number;
  }
}

export class Mouse extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.MouseEventIndex = Number;
    /** @type {String} */
    this.MouseEvent = String;
    /** @type {Number} */
    this.MouseEventXADCSpx = Number;
    /** @type {Number} */
    this.MouseEventYADCSpx = Number;
    /** @type {Number} */
    this.MouseEventXMCSpx = Number;
    /** @type {Number} */
    this.MouseEventYMCSpx = Number;
  }
}

export class KeyPress extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.KeyPressEventIndex = Number;
    /** @type {String} */
    this.KeyPressEvent = String;
  }
}

export class Studio extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.StudioEventIndex = Number;
    /** @type {String} */
    this.StudioEvent = String;
    /** @type {String} */
    this.StudioEventData = String;
  }
}

export class External extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.ExternalEventIndex = Number;
    /** @type {String} */
    this.ExternalEvent = String;
    /** @type {String} */
    this.ExternalEventValue = String;
    /** @type {Number} */
    this.EventMarkerValue = Number;
  }
}

export class GazeEvent extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.FixationIndex = Number;
    /** @type {Number} */
    this.SaccadeIndex = Number;
    /** @type {String} */
    this.GazeEventType = String;
    /** @type {Number} */
    this.GazeEventDuration = Number;
    /** @type {Number} */
    this.FixationPointXMCSpx = Number;
    /** @type {Number} */
    this.FixationPointYMCSpx = Number;
    /** @type {Number} */
    this.SaccadicAmplitude = Number;
    /** @type {Number} */
    this.AbsoluteSaccadicDirection = Number;
    /** @type {Number} */
    this.RelativeSaccadicDirection = Number;
  }
}

export class Gaze extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.GazePointIndex = Number;
    /** @type {Number} */
    this.GazePointLeftXADCSpx = Number;
    /** @type {Number} */
    this.GazePointLeftYADCSpx = Number;
    /** @type {Number} */
    this.GazePointRightXADCSpx = Number;
    /** @type {Number} */
    this.GazePointRightYADCSpx = Number;
    /** @type {Number} */
    this.GazePointXADCSpx = Number;
    /** @type {Number} */
    this.GazePointYADCSpx = Number;
    /** @type {Number} */
    this.GazePointXMCSpx = Number;
    /** @type {Number} */
    this.GazePointYMCSpx = Number;
    /** @type {Number} */
    this.GazePointLeftXADCSmm = Number;
    /** @type {Number} */
    this.GazePointLeftYADCSmm = Number;
    /** @type {Number} */
    this.GazePointRightXADCSmm = Number;
    /** @type {Number} */
    this.GazePointRightYADCSmm = Number;
    /** @type {Number} */
    this.StrictAverageGazePointXADCSmm = Number;
    /** @type {Number} */
    this.StrictAverageGazePointYADCSmm = Number;
  }
}

export class EyePos extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.EyePosLeftXADCSmm = Number;
    /** @type {Number} */
    this.EyePosLeftYADCSmm = Number;
    /** @type {Number} */
    this.EyePosLeftZADCSmm = Number;
    /** @type {Number} */
    this.EyePosRightXADCSmm = Number;
    /** @type {Number} */
    this.EyePosRightYADCSmm = Number;
    /** @type {Number} */
    this.EyePosRightZADCSmm = Number;
  }
}

export class Cam extends Validable { // obsolete with TobiiStudio 2.3+
  constructor() {
    super();

    /** @type {Number} */
    this.CamLeftX = Number;
    /** @type {Number} */
    this.CamLeftY = Number;
    /** @type {Number} */
    this.CamRightX = Number;
    /** @type {Number} */
    this.CamRightY = Number;
  }
}

export class Eye extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.DistanceLeft = Number;
    /** @type {Number} */
    this.DistanceRight = Number;
    /** @type {Number} */
    this.PupilLeft = Number;
    /** @type {Number} */
    this.PupilRight = Number;
    /** @type {Number} */
    this.ValidityLeft = Number;
    /** @type {Number} */
    this.ValidityRight = Number;
  }
}

export class IRMarker extends Validable {
  constructor() {
    super();

    /** @type {Number} */
    this.IRMarkerCount = Number;
    /** @type {Number[]} */
    this.IRMarkerID = MarkerIDs;
    /** @type {Number} */
    this.PupilGlassesRight = Number; // %
  }
}

