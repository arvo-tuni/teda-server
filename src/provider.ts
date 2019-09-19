import Folder from './folder';
import options from './options';
import { Tests } from './respTypes';
import Test from './test';
import { Trials } from './trials';

const folders = Folder.subfolders( options['data-folder'] );

class Provider {

  protected _currentTest: Test | null = null;

  get tests() {
    let currentTestName;

    if (this._currentTest) {
      currentTestName = this._currentTest.folder.split('/').slice(-1)[0];
    }

    return {
      names: folders,
      current: currentTestName,
    } as Tests;
  }

  get currentTest() {
    return this._currentTest;
  }

  setCurrentTest( test: Test ) {
    this._currentTest = test;
  }

  checkUrl( url: string ): string {
    if (url.startsWith( '/test/' ) && url.split('/').length >= 4) {   // i.e. there is an ID and a function in the request
      if (!this._currentTest || this._currentTest.trials.length === 0) {
        return 'trials were not loaded yet';
      }
    }
    else if (url.startsWith( '/trials' )) {
      if (!this._currentTest) {
        return 'test was not selected yet';
      }
    }
    else if (url.startsWith( '/trial/' )) {
      if (!this._currentTest || this._currentTest.trials.length === 0) {
        return 'trials were not loaded yet';
      }
    }

    return '';
  }

  loadTest( folder: string ): Error | Test  {

    const webLogs = Folder.listFiles( folder, /(.*)\.txt/ );

    if (!webLogs || webLogs.length === 0) {
      return new Error( `no weblog files in the folder ${folder}` );
    }
    if (webLogs.length > 1) {
      return new Error( `several weblogs found in ${folder}, invalid data structure` );
    }

    const test = new Test();

    try {
      test.trials = Trials.readWebTxtLog( `${folder}/${webLogs[0]}` ) || [];
    }
    catch (ex) {
      return new Error( `weblog file is corrupted (${ex.message || ex})` );
    }

    if (test.trials.length === 0) {
      return new Error( `weblog file is corrupted` );
    }

    // Hours are manually added here to compensate difference between Tobii and Web log timestamps.
    // This may change in future
    const hourOffset = options['time-correction'];
    test.trials.forEach( trial => {
      trial.timestamp.setHours( trial.timestamp.getHours() + hourOffset );
      trial.startTime.setHours( trial.startTime.getHours() + hourOffset );
      trial.endTime.setHours( trial.endTime.getHours() + hourOffset );
      trial.events.forEach( event => event.timestamp.setHours( event.timestamp.getHours() + hourOffset ) );
      trial.headData.forEach( hd => hd.timestamp.setHours( hd.timestamp.getHours() + hourOffset ) );
    });

    const tobiiLogFiles = Folder.listFiles( folder, /(.*)\.tsv/ );

    if (test.trials.length === tobiiLogFiles.length) {   // one Tobii log file per trial in web log
      for (let i = 0; i < test.trials.length; i++) {
        test.trials[i].gaze = Trials.readTobiiLog( `${folder}/${tobiiLogFiles[i]}` )[0];
      }
    }
    else if (test.trials[0].participantCode) {  // participant-based Tobii log file

      const tobiiLogs = tobiiLogFiles.flatMap( tobiiLogFile => Trials.readTobiiLog( `${folder}/${tobiiLogFile}` ) );

      test.trials.forEach( trial => {
        let trialGaze = tobiiLogs.find( tobiiLog =>
          tobiiLog.general ? tobiiLog.general.ParticipantName === trial.participantCode : false );

        if (!trialGaze) {
          return;
        }

        const startTimeEvent = trial.events.find( e => e.type === 'start' );
        const endTimeEvent = trial.events.find( e => e.type === 'end' );
        if (startTimeEvent && endTimeEvent) {
          const startTime = startTimeEvent.timestamp.getTime();
          const endTime = endTimeEvent.timestamp.getTime();

          trialGaze = trialGaze.range( startTime, endTime );
        }

        trial.gaze = trialGaze;
      });
    }
    else {
      return new Error( `unsupported data structure` );
    }

    const nogazeTrial = test.trials.find( trial => !trial.gaze );
    if (nogazeTrial) {
      return new Error( `no gaze data for participant ${nogazeTrial.participantCode}` );
    }

    test.folder = folder;
    return test;
  }

}

const provider = new Provider();

export default provider;
