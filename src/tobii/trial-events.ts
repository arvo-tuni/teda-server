import * as Tobii from './log';
import { copyPlain as copy } from '../utils';

// TODO: create correct signatures of constructors

type EventConstructor = new ( timestamp: Tobii.Timestamp, source: Tobii.Validable ) => any;

export class Mouse extends Tobii.Mouse {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Validable ) {
    super();

    this.timestamp = timestamp;

    copy( source, this );
  }
}

export class Keyboard extends Tobii.KeyPress {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Validable ) {
    super();

    this.timestamp = timestamp;

    copy( source, this );
  }
}

export class Studio extends Tobii.Studio {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Validable ) {
    super();

    this.timestamp = timestamp;

    copy( source, this );
  }
}

export class External extends Tobii.External {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Validable ) {
    super();

    this.timestamp = timestamp;

    copy( source, this );
  }
}

export class EventType {
  log: string;
  cls: EventConstructor;

  constructor( log: string, cls: EventConstructor ) {
    this.log = log;
    this.cls = cls;
  }
}

export const TYPES: {[x: string]: EventType} = {
  mouse:    new EventType( 'Mouse', Mouse ),
  keyboard: new EventType( 'KeyPress', Keyboard ),
  studio:   new EventType( 'Studio', Studio ),
  external: new EventType( 'External', External ),
};

export class Stimuli {

  timestamp: Tobii.Timestamp;
  media: Tobii.Media;
  scene: Tobii.Scene;
  segment: Tobii.Segment;

  constructor(
    timestamp: Tobii.Timestamp,
    media: Tobii.Media,
    scene: Tobii.Scene,
    segment: Tobii.Segment,
  ) {
    this.timestamp = timestamp;
    this.media = media;
    this.scene = scene;
    this.segment = segment;
  }
}
