import * as WebLog from './log';

export class TrialMeta {
  /* tslint:disable-next-line */
  _id: string = '';
  participant: string = '';
  timestamp: Date = new Date();
  type: string = '';
}

export class TrialMetaExt {
  participantCode: string = '';
  type: string = '';

  startTime: Date = new Date();
  endTime: Date = new Date();
  duration: number = 0;

  contentArea: WebLog.ContentArea = new WebLog.ContentArea();
  windowWidth: number = 0;
  windowHeight: number = 0;
  docHeight: number = 0;

  settings: WebLog.Settings = new WebLog.Settings();
  instruction: string = '';

  misses: number = 0;
  marks: number = 0;
  marksWrong: number = 0;
  maxHistPerTenth: number = 0;
  scrolls: number = 0;
  maxScroll: number = 0;
  headTotals: WebLog.HeadTotals = new WebLog.HeadTotals();
}
