import express from 'express';
import fs from 'fs';
import cors from 'cors';

import options from './options';
import { Storage } from './storage';
import provider from './provider';
import Test from './test';

import * as Statistics from './statistics/statistics';
import { ReferencedData as StatData } from './statistics/types';

import logger from './logger';

const storage = Storage.create();
storage.on( 'statistics', name => {

  const folder = `${options['data-folder']}/${name}`;
  const result = provider.loadTest( folder );

  if (result instanceof Test) {
    result.trials.forEach( trial => {
      const statistics = Statistics.calculate( trial );
      if (statistics) {
        storage.append( name, trial._id, statistics );
      }
    });
  }
  else {
    logger.error( result.message );
  }
});

storage.update();

const app = express();

app.use( cors() );

// error checking

app.use( (req, res, next) => {
  logger.verbose( `${req.method.toUpperCase()} ${req.path}${req.params.id ? ':' + req.params.id : ''}` );

  const error = provider.checkUrl( req.url );
  if (error) {
    res.status( 403 ).json({ error });
    logger.warn( error );
    return;
  }

  next();
});

app.use( (req, res, next) => {
  const id = req.params.id;
  if (req.url.startsWith( '/trial/' ) && id) {
    if (!provider.currentTest!.hasTrial( id )) {
      const error = `trial with id=${id} does not exist`;
      res.status( 404 ).json({ error });
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
        '/tests': 'all tests + the test currently loaded',
        '/tests/update': 'updates statistics when a new data folder was added',
        '/test/:id/stats': 'downloads the trial statistics as a table',
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
        '/trial/:id/stats/:from-:to': 'the trial statistics limited in time (ms, relative to the start time)',
      },
    },
  });
});

// tests routes

app.get( '/tests', ( req, res ) => {

  const tests = provider.tests;
  res.status( 200 ).json( tests );

  logger.verbose( 'OK' + (tests.current ? ` [${tests.current}]` : '') );
});

app.get( '/tests/update', ( req, res ) => {
  try {
    const report = storage.update();
    res.status( 200 ).json( report );
    logger.verbose( 'OK' );
  }
  catch (err) {
    res.status( 500 ).json({ error: err.message });
    logger.error( err.message );
  }
});

app.put( '/test/:id', ( req, res ) => {
  const folder = `${options['data-folder']}/${req.params.id}`;

  if (fs.existsSync( folder )) {
    const result = provider.loadTest( folder );

    if (result instanceof Error) {
      res.status( 500 ).json({ error: result.message });
      logger.error( result );
    }
    else {
      provider.setCurrentTest( result );
      res.status( 200 ).json({ message: 'OK' });
      logger.verbose( 'OK' );
    }
  }
  else {
    const error = `folder ${folder} does not exist`;
    res.status( 404 ).json({ error });
    logger.warn( error );
  }
});

app.get( '/test/:id/stats', ( req, res ) => {
  const stats = storage.test( req.params.id );
  const table = provider.currentTest!.trialsAsTable( stats );
  res.status( 200 ).json( table );
  logger.verbose( 'OK' );
});

// trial routes

app.get( '/trials', ( req, res ) => {
  const result = provider.currentTest!.transform( trial => trial.meta );
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
app.get( '/trial/:id/stats/:from-:to', ( req, res ) => {
  provideStats( req.params.id, res, +req.params.from, +req.params.to );
});


// exit point

if (!options.help) {
  app.listen( options.port, () => {
    logger.info( `app listening on port ${options.port}` );
  });
}

// request methods

function provideTrack( id: string, data: string, res: express.Response ) {

  const trial = provider.currentTest!.trial( id );

  const obj = data ? (trial as any)[ data ] : trial;
  res.status( 200 ).json( obj );
  logger.verbose( 'OK' );
}

function provideGazeData( id: string, data: string, res: express.Response ) {

  const trial = provider.currentTest!.trial( id );

  const obj = data && trial.gaze ? (trial.gaze as any)[ data ] : trial.gaze;

  if (Array.isArray( obj )) {
    logger.verbose( `sending ${obj.length} items` );
  }

  res.status( 200 ).json( obj );
  logger.verbose( 'OK' );
}

function provideStats( id: string, res: express.Response, from?: number, to?: number ) {

  const trial = provider.currentTest!.trial( id );

  const obj = {
    data: Statistics.calculate( trial, from, to ),
    reference: Statistics.reference( trial ),
  } as StatData;

  res.status( 200 ).json( obj );
  logger.verbose( 'OK' );
}

export default app;
