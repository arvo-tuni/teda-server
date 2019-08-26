import { Timestamp } from '../tobii/log';

export interface Data {
  hits: Hits,
  fixations: {
    durationRanges: number[],
    durationTimes: Histogram<number>,
  },
  saccades: {
    directions: Directions,
    directionsRadar: Angles,
    amplitudeRanges: Directions,
    amplitudeTimes: Histogram<number>,
  },
}

export type Histogram<T> = {
  values: T[], 
  itemDuration: number,
};

export interface Directions {
  forward: number[];
  backward: number[];
  other?: number[];
  itemDuration: number;
}

export interface Angles {
  [x: number]: number;
}

export interface Hits {
  correct: number[];
  wrong: number[];
}

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
