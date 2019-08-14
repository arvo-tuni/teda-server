import express from 'express';
import fs from 'fs';
import cors from 'cors';

import Folder from './folder';
import { Trials } from  './trials';
import WebTrial from  './web/trial';

import logger from './logger';

const PORT = 3000;
const DATA_FOLDER = './data';

const folders = Folder.subfolders( DATA_FOLDER );

/** @type {string} */
let testFolder = null;

/** @type {WebTrial[]} */
let trials = null;

const app = express();

app.use( cors() );

// error checking

app.use( (req, res, next) => {
    logger.verbose( `${req.method.toUpperCase()} ${req.path}${req.params.id ? ':' + req.params.id : ''}` );

    if (req.url.startsWith( '/trials' )) {
        if (!testFolder) { 
            const error = 'test was not selected yet';
            res.status( 403 ).json( { error } );
            logger.warn( error );
            return;
        }
    }
    else if (req.url.startsWith( '/trial/' )) {
        if (!trials) { 
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
            }
        }
    });
});


app.get( '/tests', ( req, res ) => {
    res.status( 200 ).json( folders );
    logger.verbose( 'OK' );
});

app.put( '/test/:id', ( req, res ) => {
    const folder = `${DATA_FOLDER}/${req.params.id}`;
    if (fs.existsSync( folder )) {

        testFolder = folder;

        const error = loadTrials();

        if (error) {
            res.status( 500 ).json({ error });
            logger.error( error );
        }
        else {
            res.status( 200 ).json({ message: 'OK' });
            logger.verbose( 'OK' );
        }
    }
    else {
        const error = `no such folder "${folder}"`;
        res.status( 404 ).json({ error });
        logger.warn( error );
    }
});

app.get( '/trials', ( req, res ) => {
    const result = trials.map( trial => trial.meta );
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


// start

app.listen( PORT, () => {
    logger.info( `app listening on port ${PORT}` );
} );


function provideTrack( id, data, res ) {

    const trial = trials.find( trial => trial._id === id );

    if ( trial ) {
        const obj = data ? trial[ data ] : trial;
        res.status( 200 ).json( obj );
        logger.verbose( 'OK' );
    } 
    else {
        const error = `no such track "${id}"`;
        res.status( 404 ).json({ error });
        logger.warn( error );
    }
}

function provideGazeData( id, data, res ) {

    const trial = trials.find( trial => trial._id === id );

    if ( trial ) {
        const obj = data ? trial.gaze[ data ] : trial.gaze;

        if (Array.isArray(obj)) {
            logger.verbose( `sending ${obj.length} items` );
        }

        res.status( 200 ).json( obj );
        logger.verbose( 'OK' );
    } 
    else {
        const error = `no such track "${id}"`;
        res.status( 404 ).json({ error });
        logger.warn( error );
    }
}

function loadTrials() {

    const webLogs = Folder.listFiles( testFolder, /(.*)\.txt/ );

    if (!webLogs || webLogs.length === 0) {
        return `no weblog files in the folder "${testFolder}"`;
    }
    if (webLogs.length > 1) {
        return `invalid data: several weblogs found in "${testFolder}"`;
    }

    try {
        trials = Trials.readWebTxtLog( `${testFolder}/${webLogs[0]}` );
    }
    catch (ex) {
        return `weblog file is corrupted: ${ex.message || ex}`;
    }

    if (!trials) {
        return `weblog file is corrupted`;
    }

    // WARNING! 2 hours manually added here to compensate difference between Tobii and Web log timestamps.
    // This may change in future
    const HOURS_OFFSET = 2;
    trials.forEach( trial => {
        trial.timestamp.setHours( trial.timestamp.getHours() + HOURS_OFFSET );
        trial.startTime.setHours( trial.startTime.getHours() + HOURS_OFFSET );
        trial.endTime.setHours( trial.endTime.getHours() + HOURS_OFFSET );
        trial.events.forEach( event => event.timestamp.setHours( event.timestamp.getHours() + HOURS_OFFSET ) );
        trial.headData.forEach( hd => hd.timestamp.setHours( hd.timestamp.getHours() + HOURS_OFFSET ) );
    });

    const tobiiLogFiles = Folder.listFiles( testFolder, /(.*)\.tsv/ );

    if (trials.length === tobiiLogFiles.length) {   // one Tobii log file per trial in web log
        for (let i = 0; i < trials.length; i++) {
            trials[i].gaze = Trials.readTobiiLog( `${testFolder}/${tobiiLogFiles[i]}` );
        }
    }
    else if (trials[0].participantCode) {  // participant-based Tobii log file

        const tobiiLogs = tobiiLogFiles.map( tobiiLogFile => Trials.readTobiiLog( `${testFolder}/${tobiiLogFile}` ) );

        trials.forEach( trial => {
            const startTime = trial.events.find( e => e.type === 'start' ).timestamp.getTime(); // + 2*60*60*1000;
            const endTime = trial.events.find( e => e.type === 'end' ).timestamp.getTime(); // + 2*60*60*1000;

            trial.gaze = tobiiLogs.find( tobiiLog => tobiiLog.general.ParticipantName === trial.participantCode )
                .range( startTime, endTime );

            if (!trial.gaze) {
                return `invalid data: no gaze data for participant ${trial.participantCode}`;
            }
        });
    }
    else {
        return `unsupported data structure`;
    }
}

export default app;