import * as Tobii from './log';

export default class Sample {

    /**
     * @param {Tobii.Timestamp} timestamp 
     */
    constructor( timestamp ) {
        this.timestamp = timestamp;

        /** @type {Tobii.GazeEvent} */
        this.event = null;
        /** @type {Tobii.Gaze} */
        this.gaze = null;
        /** @type {Tobii.EyePos} */
        this.eyePos = null;
        /** @type {Tobii.Cam} */
        this.cam = null;
        /** @type {Tobii.Eye} */
        this.eye = null;
    }
}
