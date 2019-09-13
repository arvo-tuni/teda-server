import * as Types from './types';

import Storage from '../storage';
import logger from '../logger';

const storage = Storage.create();

export function means( trialId: string, trialType: string, userGroup: string ) {

  const allStatistics = storage
    .getTrialsOfType( trialType, trialId )
    .filter( stats => !userGroup || stats.group === userGroup );

  const count = allStatistics.length;

  if (count === 0) {
    return;
  }

  const first = allStatistics.splice( 0, 1 )[0];

  const result = {
    type: trialType,
    hits: {
      correct: first.hits.correct.map( v => v ),
      wrong: first.hits.wrong.map( v => v ),
    },
    fixations: {
      durationRanges: first.fixations.durationRanges.map( v => v ),
      durationTimes: {
        values: first.fixations.durationTimes.values.map( v => v ),
        itemDuration: first.fixations.durationTimes.itemDuration,
      },
    },
    saccades: {
      directions: {
        forward: first.saccades.directions.forward.map( v => v ),
        backward: first.saccades.directions.backward.map( v => v ),
        other: (first.saccades.directions.other ? first.saccades.directions.other.map( v => v ) : null),
        itemDuration: first.saccades.directions.itemDuration,
      },
      directionsRadar: Object.assign( {}, first.saccades.directionsRadar ),
      amplitudeRanges: {
        forward: first.saccades.amplitudeRanges.forward.map( v => v ),
        backward: first.saccades.amplitudeRanges.backward.map( v => v ),
        itemDuration: first.saccades.amplitudeRanges.itemDuration,
      },
      amplitudeTimes: {
        values: first.saccades.amplitudeTimes.values.map( v => v ),
        itemDuration: first.saccades.amplitudeTimes.itemDuration,
      },
    },
  } as Types.Data;
  
  const r = result as any;

  allStatistics.forEach( stats => {
    r.hits.correct = addArray( 
      r.hits.correct, stats.hits.correct
    );
    r.hits.wrong = addArray( 
      r.hits.wrong, stats.hits.wrong
    );
    r.fixations.durationRanges = addArray(
      r.fixations.durationRanges, stats.fixations.durationRanges
    );
    r.fixations.durationTimes.values = addArray( 
      r.fixations.durationTimes.values, stats.fixations.durationTimes.values
    );
    r.saccades.directions.forward = addArray( 
      r.saccades.directions.forward, stats.saccades.directions.forward 
    );
    r.saccades.directions.backward = addArray( 
      r.saccades.directions.backward, stats.saccades.directions.backward
    );
    r.saccades.directions.other = addArray(
      r.saccades.directions.other, stats.saccades.directions.other
    );
    addObject( r.saccades.directionsRadar, stats.saccades.directionsRadar );
    r.saccades.amplitudeRanges.forward = addArray(
      r.saccades.amplitudeRanges.forward, stats.saccades.amplitudeRanges.forward
    );
    r.saccades.amplitudeRanges.backward = addArray(
      r.saccades.amplitudeRanges.backward, stats.saccades.amplitudeRanges.backward
    );
    r.saccades.amplitudeTimes.values = addArray(
      r.saccades.amplitudeTimes.values, stats.saccades.amplitudeTimes.values
    );
  });

  divideArray( r.hits.correct, count );
  divideArray( r.hits.wrong, count );
  divideArray( r.fixations.durationRanges, count );
  divideArray( r.fixations.durationTimes.values, count );
  divideArray( r.saccades.directions.forward, count );
  divideArray( r.saccades.directions.backward, count );
  divideArray( r.saccades.directions.other, count );
  divideObject( r.saccades.directionsRadar, count );
  divideArray( r.saccades.amplitudeRanges.forward, count );
  divideArray( r.saccades.amplitudeRanges.backward, count );
  divideArray( r.saccades.amplitudeTimes.values, count );

  return result;
}

function addArray( dest: number[] | null, src: number[] | null | undefined ) {
  if (!dest || !src) {
    return null;
  }

  if (dest.length !== src.length ) {
    logger.warn( `statistics are not equivalent: ${dest.length} vs ${src.length}` );
    return null;
  }

  for (let i = 0; i < src.length; i++) {
    dest[i] += src[i];
  }

  return dest;
}

function addObject( dest: Types.Angles, src: Types.Angles ) {
  Object.keys( src ).forEach( key => {
    const i = +key;
    dest[i] += src[i];
  });
}

function divideArray( dest: number[] | null, divider: number ) {
  if (dest) {
    for (let i = 0; i < dest.length; i++) {
      dest[i] /= divider;
    }
  }
}

function divideObject( dest: Types.Angles, divider: number ) {
  Object.keys( dest ).forEach( key => {
    dest[ +key ] /= divider;
  });
}
