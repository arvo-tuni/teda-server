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

export interface UserEvent {
  x: number;
  y: number;
  name?: string;
  value?: string | number;
}

export interface UserEvents {
  navigation?: UserEvent[],
  data?: UserEvent[],
  ui?: UserEvent[],
  clicks?: UserEvent[],
  scrolls?: UserEvent[],
};

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
