import * as WebLog from '../web/log';
import { Timestamp } from '../tobii/log';

export interface Fixation {
  timestamp: Timestamp;
  x: number;
  y: number;
  duration: number;
}

export interface Saccade {
  timestamp: Timestamp;
  amplitude: number;
  absoluteAngle: number;
  relativeAngle: number;
}

export class TimedVeroEvent {
  timestamp: number;
  name: string;
  value: string;

  constructor( timestamp: number, name: string, value: string ) {
    this.timestamp = timestamp;
    this.name = name;
    this.value = value;
  }
}

export class TimedMouseEvent {
  timestamp: number;
  name: string;
  value: number;

  constructor( timestamp: number, name: string, value: number ) {
    this.timestamp = timestamp;
    this.name = name;
    this.value = value;
  }
}

export interface TimedVeroEvents {
  nav: TimedVeroEvent[];
  data: TimedVeroEvent[];
  ui: TimedVeroEvent[];
}


// Filter events

export function vero( allEvents: WebLog.TestEvent[], startTime: Date ): TimedVeroEvents {
  const start = startTime.valueOf();

  const navEvents = allEvents.filter( e => e.type === 'veroNavigation' ) as WebLog.TestEventVeroNav[];
  const dataEvents = allEvents.filter( e => e.type === 'veroNavigationData' ) as WebLog.TestEventVeroNavData[];
  const uiEvents = allEvents.filter( e => e.type === 'uiAdjustment' ) as WebLog.TestEventVeroUI[];

  return {
    nav: navEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.target, '' ) ),
    data: dataEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.variable, e.value ) ),
    ui: uiEvents.map( e => new TimedVeroEvent( e.timestamp.valueOf() - start, e.target, e.enable ) ),
  };
}

export function clicks( allEvents: WebLog.TestEvent[], startTime: Date ): TimedMouseEvent[] {
  const start = startTime.valueOf();

  const clickEvents = allEvents.filter( e => e.type === 'clicked' ) as WebLog.TestEventClicked[];

  return clickEvents.map( e => new TimedMouseEvent( e.timestamp.valueOf() - start, 'click', e.index ) );
}

export function scrolls( allEvents: WebLog.TestEvent[], startTime: Date ): TimedMouseEvent[] {
  const start = startTime.valueOf();

  const scrollEvents = allEvents.filter( e => e.type === 'scroll' ) as WebLog.TestEventScroll[];

  return scrollEvents.map( e => new TimedMouseEvent( e.timestamp.valueOf() - start, 'scroll', e.position ) );
}

