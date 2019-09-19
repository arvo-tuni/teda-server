import { NamedTrials } from './storage';
import WebTrial from './web/trial';
import { linearize, Target } from './utils';

type MapFnc = (trial: WebTrial) => any;

export default class Test {
  public folder = '';
  public trials: WebTrial[] = [];

  hasTrial( id: string ) {
    return !!this.trials.find( t => t._id === id );
  }

  trial( id: string ) {
    return this.trials.find( t => t._id === id )!;
  }

  transform( cb: MapFnc ) {
    return this.trials.map( cb );
  }

  trialsAsTable( stats: NamedTrials ) {
    if (this.trials.length === 0) {
      return '';
    }

    const sep = ',';

    let header = '';

    const result = this.trials.map( trial => {

      const trialStats = stats[ trial.meta._id ];

      if (!header) {
        header = [
          'timestamp',
          'test',
          'participant',
        ]
        .concat( linearize( trialStats, sep, Target.KEY ) )
        .join( sep );
      }

      return [
        trial.meta.timestamp.toString(),
        trial.meta.type,
        trial.meta.participant,
        linearize( trialStats, sep, Target.VALUE ),
      ].join( sep );
    });

    result.unshift( header );

    return result.join( '\r\n' );
  }
}
