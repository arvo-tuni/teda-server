import * as WebLog from '../web/log';
import * as Types from './types';
import * as GazeEvent from '../tobii/gaze-event';

export function fixations( data: GazeEvent.Fixation[], allEvents: WebLog.TestEvent[] ) {

  const scrollEvents = allEvents.filter( e => e.type === 'scroll' ) as WebLog.TestEventScroll[];

  let scrollPosition = 0;
  let nextScroll: WebLog.TestEventScroll | null = scrollEvents.length > 0 ? scrollEvents[0] : null;
  let scrollIndex = 1;

  return data.map( fixation => {

    while (nextScroll && nextScroll.timestamp < fixation.timestamp.LocalTimeStamp) {
      scrollPosition = nextScroll.position;
      nextScroll = scrollIndex < scrollEvents.length ? scrollEvents[ scrollIndex++ ] : null;
    }

    if (typeof fixation.timestamp.LocalTimeStamp === 'string') {
      fixation.timestamp.LocalTimeStamp = new Date( fixation.timestamp.LocalTimeStamp );
    }

    return {
      timestamp: fixation.timestamp,
      x: fixation.x,
      y: fixation.y + scrollPosition,
      duration: fixation.duration,
    } as Types.Fixation;
  });
}

export function saccades( data: GazeEvent.Fixation[] )  {
  return data.map( fixation => {
    if (typeof fixation.timestamp.LocalTimeStamp === 'string') {
      fixation.timestamp.LocalTimeStamp = new Date( fixation.timestamp.LocalTimeStamp );
    }

    return {
      timestamp: fixation.timestamp,
      amplitude: fixation.saccadicAmplitude,
      absoluteAngle: fixation.absoluteSaccadicDirection,
      relativeAngle: fixation.relativeSaccadicDirection,
    } as Types.Saccade;
  });
}

