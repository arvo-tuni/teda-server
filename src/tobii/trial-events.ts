import * as Tobii from './log';

export class Mouse extends Tobii.Mouse {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Mouse ) {
    super();

    this.timestamp = timestamp;

    Object.keys( source).forEach( key => (this as any)[ key ] = (source as any)[ key ] );
  }
}

export class Keyboard extends Tobii.KeyPress {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Mouse ) {
    super();

    this.timestamp = timestamp;

    Object.keys( source).forEach( key => (this as any)[ key ] = (source as any)[ key ] );
  }
}

export class Studio extends Tobii.Studio {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Mouse ) {
    super();

    this.timestamp = timestamp;

    Object.keys( source).forEach( key => (this as any)[ key ] = (source as any)[ key ] );
  }
}

export class External extends Tobii.External {

  timestamp: Tobii.Timestamp;

  constructor( timestamp: Tobii.Timestamp, source: Tobii.Mouse ) {
    super();

    this.timestamp = timestamp;

    Object.keys( source).forEach( key => (this as any)[ key ] = (source as any)[ key ] );
  }
}

export class EventType {
  log: string;
  cls: Function;

  constructor( log: string, cls: Function ) {
    this.log = log;
    this.cls = cls;
  }
}

export const TYPES = {
  mouse:    new EventType( 'Mouse', Mouse ),
  keyboard: new EventType( 'KeyPress', Keyboard ),
  studio:   new EventType( 'Studio', Studio ),
  external: new EventType( 'External', External ),
};
