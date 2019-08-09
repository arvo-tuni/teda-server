import * as Tobii from './log';
import * as TrialEvents from './trial-events';
import * as GazeEvent from './gaze-event';
import Sample from './sample';
import Stimuli from './stimuli';
import { copyValue } from '../utils';

// WARNING! 
// This is not a good practice to extend build-in classes, 
// but Array certainly lacks some useful methods/properties

Object.defineProperty(
    Array.prototype, 'last', {
        value: function() { return this.length > 0 ? this[ this.length - 1 ] : undefined; },
    }
);

/**
 * Copy value (if it exists) from raw data from Tobii log to the corresponding object property
 * @param {string[]} values 
 * @param {Tobii.Validable} dest 
 * @param {string[]} keys 
 */
function map( values, dest, keys ) {

    Object.keys( dest ).forEach( key => {
        const index = keys.indexOf( key );
        if (index >= 0) {
            const valueStr = values[ index ];
            if (valueStr !== undefined && valueStr !== '') {
                dest[ key ] = copyValue( valueStr, dest[ key ]);
            }
        }
    });
}

export default class Trial {

    /**
     * @param {string[]} headers 
     */
    constructor( headers ) {

        this._headers = headers.map( header => header.replace( /[\s()]/g, '') );

        /** @type {(GazeEvent.Fixation | GazeEvent.Saccade | GazeEvent.Unclassified)[]} */
        this._gazeEvents = [];

        /** @type {Tobii.General} */
        this.general = null;

        /** @type {Sample[]} */
        this.samples = [];

        this.events = {
            /** @type {TrialEvents.Mouse[]} */
            mouse: [],
            /** @type {TrialEvents.Keyboard[]} */
            keyboard: [],
            /** @type {TrialEvents.Studio[]} */
            studio: [],
            /** @type {TrialEvents.External[]} */
            external: [],
        };

        /** @type {Stimuli[]} */
        this.stimuli = [];
    }

    /**
     * @param {string[]} values
     */
    add( values ) {

        /*
        if (!values || values.length < 2) {
            return;
        }*/
        
        if (!this.general) {
            this.general = /** @type {Tobii.General} */(this._create( 'General', values ));
        }
        else {
            /** @type {Tobii.Timestamp} */
            const timestamp = /** @type {Tobii.Timestamp} */(this._create( 'Timestamp', values ));
            
            if (!timestamp) {
                return;
            }

            // timestamp correction
            const recDate = this.general.RecordingDate;
            timestamp.LocalTimeStamp.setFullYear( recDate.getFullYear(), recDate.getMonth(), recDate.getDate() );

            if (timestamp.EyeTrackerTimestamp) {

               const sample = new Sample( timestamp );

               sample.gaze    = /** @type {Tobii.Gaze}      */(this._create( 'Gaze', values ));
               sample.event   = /** @type {Tobii.GazeEvent} */(this._create( 'GazeEvent', values ));
               sample.eyePos  = /** @type {Tobii.EyePos}    */(this._create( 'EyePos', values ));
               sample.eye     = /** @type {Tobii.Eye}       */(this._create( 'Eye', values ));
               sample.cam     = /** @type {Tobii.Cam}       */(this._create( 'Cam', values ));

               this.samples.push( sample );
            }
            else {
                const eventType = Object.keys( TrialEvents.TYPE ).find( type => {
                    const evt = this._create( TrialEvents.TYPE[ type ].log, values );
                    if (evt) {
                        this.events[ type ].push( new TrialEvents.TYPE[ type ].cls( timestamp, evt ) );
                        return type;
                    }
                });

                if (eventType && eventType === 'studio' && this.events.studio.last().StudioEvent === 'ScreenRecStarted' ) {
                    const stimuli = new Stimuli( timestamp );
                    stimuli.media   = /** @type {Tobii.Media}   */(this._create( 'Media', values ));
                    stimuli.scene   = /** @type {Tobii.Scene}   */(this._create( 'Scene', values ));
                    stimuli.segment = /** @type {Tobii.Segment} */(this._create( 'Segment', values ));

                    this.stimuli.push( stimuli );
                }
            }
        }
    }

    /** @type {(GazeEvent.Fixation | GazeEvent.Saccade | GazeEvent.Unclassified)[]} */
    get gazeEvents() {

        if (!this._gazeEvents.length) {
            /** @type {GazeEvent.Fixation | GazeEvent.Saccade | GazeEvent.Unclassified} */
            let gazeEvent = null;

            this.samples.forEach( sample => {

                let mustCreateNew = false;

                if (!gazeEvent) {
                    mustCreateNew = true;
                }
                else {
                    if (sample.event.GazeEventType !== gazeEvent.name) {
                        mustCreateNew = true;
                    }
                    else if (sample.event.GazeEventDuration !== gazeEvent.duration) {
                        mustCreateNew = true;
                    }
                }

                if (mustCreateNew) {
                    if (sample.event.GazeEventType === Tobii.GAZE_EVENT.fixation) {
                        gazeEvent = new GazeEvent.Fixation( sample.timestamp, sample.event, gazeEvent );
                    }
                    else if (sample.event.GazeEventType === Tobii.GAZE_EVENT.saccade) {
                        gazeEvent = new GazeEvent.Saccade( sample.timestamp, sample.event, gazeEvent );
                    }
                    else if (sample.event.GazeEventType === Tobii.GAZE_EVENT.unclassified) {
                        gazeEvent = new GazeEvent.Unclassified( sample.timestamp, sample.event, gazeEvent );
                    }

                    gazeEvent.samples.push( sample );

                    this._gazeEvents.push( gazeEvent );
                }
                else {
                    gazeEvent.samples.push( sample );
                }
            });
        }

        return this._gazeEvents;
    }

    /** @type {GazeEvent.Fixation[]} */
    get fixations() {
        return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.fixation );
    }

    /** @type {GazeEvent.Saccade[]} */
    get saccades() {
        return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.saccade );
    }

    /** @type {GazeEvent.Unclassified[]} */
    get gazeAways() {
        return this.gazeEvents.filter( evt => evt.name === Tobii.GAZE_EVENT.unclassified );
    }

    /**
     * Makes a copy of the trial with all events limited to this range
     * @param {number} start time
     * @param {number} end time
     * @return {Trial} 
     */
    range( start, end ) {
        const result = new Trial( this._headers );

        const filter = /** @param {{timestamp: Tobii.Timestamp}} e */e => {
            const ts = e.timestamp.LocalTimeStamp.getTime();
            return start < ts && ts < end;
        };

        result.general = this.general;

        result.stimuli = this.stimuli.filter( filter );
        result.samples = this.samples.filter( filter );

        Object.keys( this.events ).forEach( key => {
            result.events[ key ] = this.events[ key ].filter( filter );
        });

        result._gazeEvents = this._gazeEvents.filter( filter );

        return result;
    }

    /**
     * @param {string} type 
     * @param {string[]} values 
     * @returns {Tobii.Validable}
     */
    _create( type, values ) {

        /** @type {Tobii.Validable} */
        const result = new Tobii[type]();

        map( values, result, this._headers );

        result.validate();

        return result.isEmpty ? null : result;
    }
}
