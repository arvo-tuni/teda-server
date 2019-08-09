import * as Tobii from './log';

export default class Stimuli {

    /**
     * @param {Tobii.Timestamp} timestamp 
     */
    constructor( timestamp ) {
        this.timestamp = timestamp;

        /** @type {Tobii.Media} */
        this.media = null;
        /** @type {Tobii.Scene} */
        this.scene = null;
        /** @type {Tobii.Segment} */
        this.segment = null;
    }
}
