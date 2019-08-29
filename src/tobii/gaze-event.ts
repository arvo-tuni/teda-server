import * as Tobii from './log';

export class Sample {

  timestamp: Tobii.Timestamp;
  gaze: Tobii.Gaze;
  event: Tobii.GazeEvent;
  eyePos: Tobii.EyePos;
  eye: Tobii.Eye;
  cam: Tobii.Cam;

  constructor(
    timestamp: Tobii.Timestamp,
    gaze: Tobii.Gaze,
    event: Tobii.GazeEvent,
    eyePos: Tobii.EyePos,
    eye: Tobii.Eye,
    cam: Tobii.Cam,
  ) {
    this.timestamp = timestamp;
    this.gaze = gaze;
    this.event = event;
    this.eyePos = eyePos;
    this.eye = eye;
    this.cam = cam;
  }
}

export class Base {

  timestamp: Tobii.Timestamp;
  name: string;
  index: number;
  duration: number;
  samples: Sample[] = [];

  constructor( timestamp: Tobii.Timestamp, name: string, index: number, duration: number ) {
    this.timestamp = timestamp;
    this.name = name;
    this.index = index;
    this.duration = duration;
  }
}

export class Fixation extends Base {

  x: number;
  y: number;
  saccadicAmplitude: number;
  absoluteSaccadicDirection: number;
  relativeSaccadicDirection: number;

  constructor( timestamp: Tobii.Timestamp, evt: Tobii.GazeEvent ) {
    super( timestamp, Tobii.GAZE_EVENT.fixation, evt.FixationIndex, evt.GazeEventDuration );

    this.x = evt.FixationPointXMCSpx;
    this.y = evt.FixationPointYMCSpx;
    this.saccadicAmplitude = evt.SaccadicAmplitude;
    this.absoluteSaccadicDirection = evt.AbsoluteSaccadicDirection;
    this.relativeSaccadicDirection = evt.RelativeSaccadicDirection || 0;
  }
}

export class Saccade extends Base {

  constructor( timestamp: Tobii.Timestamp, evt: Tobii.GazeEvent ) {
    super( timestamp, Tobii.GAZE_EVENT.saccade, evt.SaccadeIndex, evt.GazeEventDuration );
  }
}

export class Unclassified extends Base {

  constructor( timestamp: Tobii.Timestamp, evt: Tobii.GazeEvent ) {
    super( timestamp, Tobii.GAZE_EVENT.unclassified, -1, evt.GazeEventDuration );
  }
}
