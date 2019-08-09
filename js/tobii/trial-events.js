import * as Tobii from './log';

export class Mouse extends Tobii.Mouse {

    /**
     * @param {Tobii.Timestamp} timestamp 
     * @param {Tobii.Mouse} source 
     */
    constructor( timestamp, source ) {
        super();

        this.timestamp = timestamp;

        Object.keys( source).forEach( key => this[key] = source[ key ] );
    }
}

export class Keyboard extends Tobii.KeyPress {

    /**
     * @param {Tobii.Timestamp} timestamp 
     * @param {Tobii.Mouse} source 
     */
    constructor( timestamp, source ) {
        super();

        this.timestamp = timestamp;

        Object.keys( source).forEach( key => this[key] = source[ key ] );
    }
}

export class Studio extends Tobii.Studio {

    /**
     * @param {Tobii.Timestamp} timestamp 
     * @param {Tobii.Mouse} source 
     */
    constructor( timestamp, source ) {
        super();

        this.timestamp = timestamp;

        Object.keys( source).forEach( key => this[key] = source[ key ] );
    }
}

export class External extends Tobii.External {

    /**
     * @param {Tobii.Timestamp} timestamp 
     * @param {Tobii.Mouse} source 
     */
    constructor( timestamp, source ) {
        super();

        this.timestamp = timestamp;

        Object.keys( source).forEach( key => this[key] = source[ key ] );
    }
}

export const TYPE = {
    mouse: { log: 'Mouse', cls: Mouse },
    keyboard: { log: 'KeyPress', cls: Keyboard },
    studio: { log: 'Studio', cls: Studio },
    external: { log: 'External', cls: External },
};
