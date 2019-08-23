import * as WebLog from '../web/log';
import * as Transform from './transform';
import { Timestamp } from '../tobii/log';

const FIXATION_DURATION_RANGES = [ 150, 300, 500, 750, 1000, 1500, Number.MAX_VALUE ];
const SACCADE_AMPLITUDE_RANGES = [ 1, 2, 3.5, 7, Number.MAX_VALUE ];
const ANGLE_RANGE_COUNT = 8;
const TIME_RANGE_INTERVAL = 20;    // sec

export interface All {
  hitsTimed: HitsData,
  veroTimed: UserEventData,
}

export interface HitsData {
  correct: number[];
  wrong: number[];
}

export interface UserEvent {
  x: number;
  y: number;
  name?: string;
  value?: string | number;
}

export interface UserEventData {
  nav?: UserEvent[],
  data?: UserEvent[],
  ui?: UserEvent[],
  clicks?: UserEvent[],
  scrolls?: UserEvent[],
};

export interface SaccadeDirections {
  forward: number;
  backward: number;
  other: number;
}

export interface SaccadeDirectionsData {
  forward: number[];
  backward: number[];
  other: number[];
}

export interface SaccadeRadarData {
  label: string;
  value: number;
}

export function hitsTimed( data: WebLog.WrongAndCorrect[] & number[] ) {
  if (data.length > 0 && data[0].wrong === undefined ) {
    return {
      correct: (data as number[]),
      wrong: []
    } as HitsData;
  }
  else {
    return {
      correct: data.map( item => item.correct ),
      wrong: data.map( item => item.wrong ),
    } as HitsData;
  }
}

export function veroTimed(
  events: Transform.TimedVeroEvents,
  clicks: Transform.TimedMouseEvent[],
  scrolls: Transform.TimedMouseEvent[],
) {

  const data: UserEventData = {};

  Object.keys( events ).forEach( (datatype, index) => {
    const ev = (events as any)[ datatype ] as Transform.TimedVeroEvent[];

    (data as any)[ datatype] = ev.map( item => { return {
        x: item.timestamp / 1000,
        y: index + 1,
        name: item.name,
        value: item.value,
      } as UserEvent; 
    });
  });

  if (clicks.length > 0) {
    data.clicks = clicks.map( item => { return {
        x: item.timestamp / 1000,
        y: 0,
        value: item.value,
      } as UserEvent; 
    });
  }

  if (scrolls.length > 0) {
    data.scrolls = scrolls.map( item => { return {
        x: item.timestamp / 1000,
        y: 4,
        value: item.value,
      } as UserEvent; 
    });
  }

  return data;
}

export function mouse(
  clicks: Transform.TimedMouseEvent[],
  scrolls: Transform.TimedMouseEvent[],
) {

  const data: UserEventData = {};

  if (clicks.length > 0) {
    data.clicks = clicks.map( item => { return {
        x: item.timestamp / 1000,
        y: 1,
        value: item.value,
      } as UserEvent; 
    });
  }

  if (scrolls.length > 0) {
    data.scrolls = scrolls.map( item => { return {
        x: item.timestamp / 1000,
        y: 2,
        value: item.value,
      } as UserEvent; 
    });
  }

  return data;
}

export function fixDurationsRange( fixations: Transform.Fixation[] ) {

  const data = FIXATION_DURATION_RANGES.map( () => 0 );

  fixations.forEach( fix => {
    const rangeIndex = FIXATION_DURATION_RANGES.findIndex( maxDuration => fix.duration < maxDuration );
    data[ rangeIndex ] += 1;
  });

  return data;
}

export function fixDurationsTime( fixations: Transform.Fixation[] ) {
  return makeTempRange<number, Transform.Fixation>(
    TIME_RANGE_INTERVAL,
    fixations,
    (rangeFixations: Transform.Fixation[]) => {
      return Math.round( averageDuration( rangeFixations ) );
    },
  );
}

export function saccadeDirections( saccades: Transform.Saccade[] ) {

  const { data, rangeDuration } = makeTempRange<SaccadeDirections, Transform.Saccade>(
    TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Transform.Saccade[]) => {

      return rangeSaccades.reduce( (acc, sacc) => {
        if (315 < sacc.absoluteAngle || sacc.absoluteAngle < 45) {
          acc.forward++;
        }
        else if (135 < sacc.absoluteAngle && sacc.absoluteAngle < 225) {
          acc.backward++;
        }
        else {
          acc.other++;
        }
        return acc;
      }, {
        forward: 0,
        backward: 0,
        other: 0,
      } as SaccadeDirections );
    },
  );

  return {
    forward: data.map( item => item.forward ),
    backward: data.map( item => item.backward ),
    other: data.map( item => item.other ),
  } as SaccadeDirectionsData;
}

export function saccadeDirectionRadar( saccades: Transform.Saccade[] ) {

  const data: SaccadeRadarData[] = [];
  
  for (let i = 0; i < ANGLE_RANGE_COUNT; i++) {
    data.push({
      label: `${i * 45}\u00b0`,
      value: 0,
    });
  }

  const rangeItemAngle = 360 / ANGLE_RANGE_COUNT;

  saccades.forEach( sacc => {
    let rangeIndex = Math.floor( (sacc.absoluteAngle + rangeItemAngle / 2) / rangeItemAngle );
    if (rangeIndex >= ANGLE_RANGE_COUNT) {
      rangeIndex = 0;
    }
    data[ rangeIndex ].value++;
  });

  // make the order of data so that 0 appears on the right, and degree inceases CCW
  data.reverse();
  data.unshift( ...data.splice( ANGLE_RANGE_COUNT - 3, 3 ) );

  return data;
}

export function saccadeAmplitudeRange( saccades: Transform.Saccade[] ) {
  const forward = SACCADE_AMPLITUDE_RANGES.map( () => 0 );
  const backward = SACCADE_AMPLITUDE_RANGES.map( () => 0 );

  saccades.forEach( sacc => {
    const rangeIndex = SACCADE_AMPLITUDE_RANGES.findIndex( maxAmplitude => sacc.amplitude < maxAmplitude );
    if (315 < sacc.absoluteAngle || sacc.absoluteAngle < 45) {
      forward[ rangeIndex ] += 1;
    }
    else if (135 < sacc.absoluteAngle && sacc.absoluteAngle < 225) {
      backward[ rangeIndex ] += 1;
    }
  });

  return {
    forward,
    backward,
  };
}

export function saccadeAmplitudeTime( saccades: Transform.Saccade[] ) {
  const { data, rangeDuration } = makeTempRange<number, Transform.Saccade>(
    TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Transform.Saccade[]) => {
      return averageAmplitude( rangeSaccades );
    },
  );
}



type Callback<T, U> = (items: U[]) => T;
type Range<T> = {
  data: T[], 
  rangeDuration: number,
};

function makeTempRange<T, U extends {timestamp: Timestamp}>(
  rangeDuration: number,  // seconds
  timestamped: U[],
  cb: Callback<T, U> ): Range<T> {

  const end = timestamped.slice( -1 )[0].timestamp.EyeTrackerTimestamp;
  const start = timestamped[0].timestamp.EyeTrackerTimestamp;
  const duration = end - start;
  const rangeCount = Math.round( duration / (rangeDuration * 1000000) );
  const rangeItemDuration = (end - start) / rangeCount + 1;

  const data: T[] = [];

  let rangeMaxTimestamp = start + rangeItemDuration;
  let rangeItems: U[] = [];

  timestamped.forEach( item => {
    if (item.timestamp.EyeTrackerTimestamp > rangeMaxTimestamp) {
      rangeMaxTimestamp += rangeItemDuration;
      data.push( cb( rangeItems ) );
      rangeItems = [];
    }

    rangeItems.push( item );
  });

  data.push( cb( rangeItems ) );

  return {
    data,
    rangeDuration: rangeItemDuration / 1000000 };
}

function averageDuration( data: Transform.Fixation[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, fixation) => acc += fixation.duration, 0 ) / data.length;
  }
}

function averageAmplitude( data: Transform.Saccade[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, saccade) => acc += saccade.amplitude, 0 ) / data.length;
  }
}
