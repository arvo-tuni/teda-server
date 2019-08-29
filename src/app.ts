import express from 'express';
import fs, { Stats } from 'fs';
import cors from 'cors';

import options from './options';
import Storage from './storage';
import Folder from './folder';
import { Trials } from './trials';
import WebTrial from './web/trial';

import * as Statistics from './statistics/statistics';
import { ReferencedData as StatData } from './statistics/types';

import logger from './logger';

class Test {
  folder = '';
  public trials: WebTrial[] = [];
}

let currentTest: Test | null = null;

const folders = Folder.subfolders( options['data-folder'] );

const storage = Storage.create();
storage.on( 'statistics', name => {

  const folder = `${options['data-folder']}/${name}`;
  const result = loadTrials( folder );
  const error = result as Error;

  if (!error || !error.message) {
    const test = result as Test;
    test.trials.forEach( trial => {
      const statistics = Statistics.calculate( trial );
      if (statistics) {
        storage.append( name, trial._id, statistics );
      }
    });
 }
  else {
    logger.error( error.message );
  }
});

storage.update();

const app = express();

app.use( cors() );

// error checking

app.use( (req, res, next) => {
  logger.verbose( `${req.method.toUpperCase()} ${req.path}${req.params.id ? ':' + req.params.id : ''}` );

  if (req.url.startsWith( '/trials' )) {
    if (!currentTest) {
      const error = 'test was not selected yet';
      res.status( 403 ).json( { error } );
      logger.warn( error );
      return;
    }
  }
  else if (req.url.startsWith( '/trial/' )) {
    if (!currentTest || currentTest.trials.length === 0) {
      const error = 'trials were not loaded yet';
      res.status( 403 ).json( { error } );
      logger.warn( error );
      return;
    }
  }

  next();
});

// routes

app.get( '/', ( req, res ) => {
  res.status( 200 ).json({
    description: 'REST services:',
    services: {
      PUT: {
        '/test/:id': 'selects a test to start the service',
      },
      GET: {
        '/tests': 'all tests',
        '/trials': 'meta data including IDs of all trials in the selected test',
        '/trial/:id': 'full trial data (WARNING! it may take tens of Mb to load)',
        '/trial/:id/meta': 'the trial extended meta data',
        '/trial/:id/hits': 'the trial selections per decimale',
        '/trial/:id/targets': 'the trial targets',
        '/trial/:id/marks': 'the trial marked targets',
        '/trial/:id/errors': 'the trial erroneously marked targets',
        '/trial/:id/events': 'the trial mouse click and scrolls',
        '/trial/:id/head': 'the trial head data (WARNING! it may take tens of Mb to load)',
        '/trial/:id/gaze': 'the trial Tobii recording meta data (WARNING! it may take tens of Mb to load)',
        '/trial/:id/gaze/stimuli': 'the trial gaze stimuli',
        '/trial/:id/gaze/events': 'the trial mouse and keyboards events',
        '/trial/:id/gaze/samples': 'the trial gaze samples',
        '/trial/:id/gaze/fixations': 'the trial fixations',
        '/trial/:id/gaze/saccades': 'the trial saccades',
        '/trial/:id/gaze/gazeAways': 'the trial gazeAways',
        '/trial/:id/stats': 'the trial statistics',
        '/stats/update': 'updates statistics when a new data folder was added',
      }
    }
  });
});


app.get( '/tests', ( req, res ) => {
  res.status( 200 ).json( folders );
  logger.verbose( 'OK' );
});

app.put( '/test/:id', ( req, res ) => {
  const folder = `${options['data-folder']}/${req.params.id}`;
  if (fs.existsSync( folder )) {

    const result = loadTrials( folder );
    const error = result as Error;

    if (error && error.message) {
      res.status( 500 ).json( { error });
      logger.error( error );
    }
    else {
      currentTest = result as Test;
      res.status( 200 ).json( { message: 'OK' });
      logger.verbose( 'OK' );
    }
  }
  else {
    const error = `no such folder "${folder}"`;
    res.status( 404 ).json( { error });
    logger.warn( error );
  }
});

app.get( '/trials', ( req, res ) => {
  if (!currentTest) {
    return;
  }

  const result = currentTest.trials.map( trial => trial.meta );
  res.status( 200 ).json( result );
  logger.verbose( 'OK' );
});

app.get( '/trial/:id', ( req, res ) => {
  provideTrack( req.params.id, '', res );
});

app.get( '/trial/:id/meta', ( req, res ) => {
  provideTrack( req.params.id, 'metaExt', res );
});

app.get( '/trial/:id/hits', ( req, res ) => {
  provideTrack( req.params.id, 'hitsPerTenth', res );
});

app.get( '/trial/:id/targets', ( req, res ) => {
  provideTrack( req.params.id, 'clickables', res );
});

app.get( '/trial/:id/marks', ( req, res ) => {
  provideTrack( req.params.id, 'marked', res );
});

app.get( '/trial/:id/errors', ( req, res ) => {
  provideTrack( req.params.id, 'markedWrong', res );
});

app.get( '/trial/:id/events', ( req, res ) => {
  provideTrack( req.params.id, 'events', res );
});

app.get( '/trial/:id/head', ( req, res ) => {
  provideTrack( req.params.id, 'headData', res );
});

app.get( '/trial/:id/gaze', ( req, res ) => {
  provideGazeData( req.params.id, 'general', res );
});

app.get( '/trial/:id/gaze/stimuli', ( req, res ) => {
  provideGazeData( req.params.id, 'stimuli', res );
});

app.get( '/trial/:id/gaze/events', ( req, res ) => {
  provideGazeData( req.params.id, 'events', res );
});

app.get( '/trial/:id/gaze/samples', ( req, res ) => {
  provideGazeData( req.params.id, 'samples', res );
});

app.get( '/trial/:id/gaze/fixations', ( req, res ) => {
  provideGazeData( req.params.id, 'fixations', res );
});

app.get( '/trial/:id/gaze/saccades', ( req, res ) => {
  provideGazeData( req.params.id, 'saccades', res );
});

app.get( '/trial/:id/gaze/gazeAways', ( req, res ) => {
  provideGazeData( req.params.id, 'gazeAways', res );
});

app.get( '/trial/:id/stats', ( req, res ) => {
  provideStats( req.params.id, res );
});

app.get( '/stats/update', ( req, res ) => {
  const report = storage.update();
  res.status( 200 ).json( { message: report });
  logger.verbose( 'OK' );
});


// start
if (!options.help) {
  app.listen( options.port, () => {
    logger.info( `app listening on port ${options.port}` );
  });
}


function provideTrack( id: string, data: string, res: express.Response ) {

  if (!currentTest) {
    return;
  }

  const trial = currentTest.trials.find( trial => trial._id === id );

  if ( trial ) {
    const obj = data ? (trial as any)[ data ] : trial;
    res.status( 200 ).json( obj );
    logger.verbose( 'OK' );
  }
  else {
    const error = `no such trial "${id}"`;
    res.status( 404 ).json( { error });
    logger.warn( error );
  }
}

function provideGazeData( id: string, data: string, res: express.Response ) {

  if (!currentTest) {
    return;
  }

  const trial = currentTest.trials.find( trial => trial._id === id );

  if (trial) {
    const obj = data && trial.gaze ? (trial.gaze as any)[ data ] : trial.gaze;

    if (Array.isArray(obj)) {
      logger.verbose( `sending ${obj.length} items` );
    }

    res.status( 200 ).json( obj );
    logger.verbose( 'OK' );
  }
  else {
    const error = `no such trial "${id}"`;
    res.status( 404 ).json( { error });
    logger.warn( error );
  }
}

function provideStats( id: string, res: express.Response) {

  if (!currentTest) {
    return;
  }

  const trial = currentTest.trials.find( trial => trial._id === id );

  if ( trial ) {
    const obj = {
      data: Statistics.calculate( trial ),
      reference: Statistics.reference( trial ),
    } as StatData;
    res.status( 200 ).json( obj );
    logger.verbose( 'OK' );
  }
  else {
    const error = `no such trial "${id}"`;
    res.status( 404 ).json( { error });
    logger.warn( error );
  }
}

function loadTrials( folder: string ): Error | Test  {

  const webLogs = Folder.listFiles( folder, /(.*)\.txt/ );

  if (!webLogs || webLogs.length === 0) {
    return new Error( `no weblog files in the folder "${folder}"` );
  }
  if (webLogs.length > 1) {
    return new Error( `invalid data: several weblogs found in "${folder}"` );
  }

  const test = new Test();

  try {
    test.trials = Trials.readWebTxtLog( `${folder}/${webLogs[0]}` ) || [];
  }
  catch (ex) {
    return new Error( `weblog file is corrupted: ${ex.message || ex}` );
  }

  if (test.trials.length === 0) {
    return new Error( `weblog file is corrupted` );
  }

  // Hours manually added here to compensate difference between Tobii and Web log timestamps.
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
        const startTime = startTimeEvent.timestamp.getTime(); // + 2*60*60*1000;
        const endTime = endTimeEvent.timestamp.getTime(); // + 2*60*60*1000;

        trialGaze = trialGaze.range( startTime, endTime );
      }

      trial.gaze = trialGaze;
    });
  }
  else {
    return new Error( `unsupported data structure` );
  }

  const nogazeTrial = test.trials.find( trial => !trial.gaze);
  if (nogazeTrial) {
    return new Error( `invalid data: no gaze data for participant ${nogazeTrial.participantCode}` );
  }

  return test;
}

export default app;
