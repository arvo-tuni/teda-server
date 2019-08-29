import * as WebLog from '../web/log';
import WebTrial from '../web/trial';
import { Timestamp } from '../tobii/log';
import logger from '../logger';

import * as Types from './types';
import * as Params from './params';
import * as Transform from './transform';
import * as Reference from './reference';

export function calculate( trial: WebTrial ) {
  if (!trial.gaze) {
    return null;
  }

  const fixations = Transform.fixations(
    trial.gaze.fixations,
    trial.events,
  );

  const saccades = Transform.saccades( trial.gaze.fixations );

  return {
    type: trial.metaExt.type,
    hits: hitsTimed( trial.hitsPerTenth ),
    fixations: {
      durationRanges: fixDurationsRange( fixations ),
      durationTimes: fixDurationsTime( fixations ),
    },
    saccades: {
      directions: saccadeDirections( saccades ),
      directionsRadar: saccadeDirectionRadar( saccades ),
      amplitudeRanges: saccadeAmplitudeRange( saccades ),
      amplitudeTimes: saccadeAmplitudeTime( saccades ),
    },
  } as Types.Data;
}

export function reference( trial: WebTrial ) {

  const ref = {
    means: undefined,
    medians: undefined,
    upperQuantile: undefined,
    lowerQuantile: undefined,
  } as Types.Reference;

  try {
    ref.means = Reference.means( trial._id, trial.metaExt.type );
  }
  catch (err) {
    logger.error( err );
  }

  return ref;
}

function hitsTimed( data: WebLog.WrongAndCorrect[] & number[] ) {
  if (data.length > 0 && data[0].wrong === undefined ) {
    return {
      correct: (data as number[]),
      wrong: []
    } as Types.Hits;
  }
  else {
    return {
      correct: data.map( item => item.correct ),
      wrong: data.map( item => item.wrong ),
    } as Types.Hits;
  }
}

function fixDurationsRange( fixations: Types.Fixation[] ) {

  const data = Params.FIXATION_DURATION_RANGES.map( () => 0 );

  fixations.forEach( fix => {
    const rangeIndex = Params.FIXATION_DURATION_RANGES.findIndex( maxDuration => fix.duration < maxDuration );
    data[ rangeIndex ] += 1;
  });

  return data;
}

function fixDurationsTime( fixations: Types.Fixation[] ) {
  return makeTempRange<number, Types.Fixation>(
    Params.TIME_RANGE_INTERVAL,
    fixations,
    (rangeFixations: Types.Fixation[]) => {
      return Math.round( averageDuration( rangeFixations ) );
    },
  );
}

interface DirectionData {
  forward: number;
  backward: number;
  other: number;
}

function saccadeDirections( saccades: Types.Saccade[] ) {

  const { values, itemDuration } = makeTempRange<DirectionData, Types.Saccade>(
    Params.TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Types.Saccade[]) => {

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
      } as DirectionData );
    },
  );

  return {
    forward: values.map( item => item.forward ),
    backward: values.map( item => item.backward ),
    other: values.map( item => item.other ),
    itemDuration,
  } as Types.Directions;
}

interface AngleData {
  angle: number,
  value: number,
}

function saccadeDirectionRadar( saccades: Types.Saccade[] ) {

  const data: AngleData[] = [];
  
  for (let i = 0; i < Params.ANGLE_RANGE_COUNT; i++) {
    data.push({
      angle: i * 45,
      value: 0,
    });
  }

  const rangeItemAngle = 360 / Params.ANGLE_RANGE_COUNT;

  saccades.forEach( sacc => {
    let rangeIndex = Math.floor( (sacc.absoluteAngle + rangeItemAngle / 2) / rangeItemAngle );
    if (rangeIndex >= Params.ANGLE_RANGE_COUNT) {
      rangeIndex = 0;
    }
    data[ rangeIndex ].value++;
  });

  const result = {} as Types.Angles;
  data.forEach( item => result[ item.angle ] = item.value );

  return result;
}

function saccadeAmplitudeRange( saccades: Types.Saccade[] ) {
  const forward = Params.SACCADE_AMPLITUDE_RANGES.map( () => 0 );
  const backward = Params.SACCADE_AMPLITUDE_RANGES.map( () => 0 );

  saccades.forEach( sacc => {
    const rangeIndex = Params.SACCADE_AMPLITUDE_RANGES.findIndex( maxAmplitude => sacc.amplitude < maxAmplitude );
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
  } as Types.Directions;
}

function saccadeAmplitudeTime( saccades: Types.Saccade[] ) {
  return makeTempRange<number, Types.Saccade>(
    Params.TIME_RANGE_INTERVAL,
    saccades,
    (rangeSaccades: Types.Saccade[]) => {
      return averageAmplitude( rangeSaccades );
    },
  );
}

type Callback<T, U> = (items: U[]) => T;

function getTimeParams<T extends {timestamp: Timestamp}>(
  optimalItemDuration: number,
  timestamped: T[]) {

  const end = timestamped.slice( -1 )[0].timestamp.EyeTrackerTimestamp;
  const start = timestamped[0].timestamp.EyeTrackerTimestamp;
  const duration = end - start;
  const itemCount = Math.round( duration / (optimalItemDuration * 1000000) );
  const itemDuration = (end - start) / itemCount + 1;

  return {
    start,
    itemDuration,
  };
}

function makeTempRange<T, U extends {timestamp: Timestamp}>(
  optimalItemDuration: number,  // seconds
  timestamped: U[],
  cb: Callback<T, U> ): Types.Histogram<T> {

  const { start, itemDuration } = getTimeParams( optimalItemDuration, timestamped );

  const values: T[] = [];

  let maxTimestamp = start + itemDuration;
  let items: U[] = [];

  timestamped.forEach( item => {
    if (item.timestamp.EyeTrackerTimestamp > maxTimestamp) {
      maxTimestamp += itemDuration;
      values.push( cb( items ) );
      items = [];
    }

    items.push( item );
  });

  values.push( cb( items ) );

  return {
    values,
    itemDuration: itemDuration / 1000000, // sec
  };
}

function averageDuration( data: Types.Fixation[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, fixation) => acc += fixation.duration, 0 ) / data.length;
  }
}

function averageAmplitude( data: Types.Saccade[] ): number {
  if (data.length === 0) {
    return 0;
  }
  else {
    return data.reduce( (acc, saccade) => acc += saccade.amplitude, 0 ) / data.length;
  }
}
