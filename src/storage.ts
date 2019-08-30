import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import EventEmitter from 'events';

import options from './options';
import Folder from './folder';
import { UpdateInfo } from './respTypes';
import { Data as Statistics } from './statistics/types';

import logger from './logger';

const db = new JsonDB( new Config( 'arvo', true, true, '/' ) );
db.load();

interface NamedTests {
  [x: string]: NamedTrials;
}

interface NamedTrials {
  [x: string]: Statistics;
}

let singleton: Storage | null = null;

/// Emits
///   statistics( name )
export default class Storage extends EventEmitter {
  
  private rootFolder = options['data-folder'];

  protected constructor() {
    super();
  }

  static create() {
    if (!singleton) {
      singleton = new Storage();
    }

    return singleton;
  }

  append( test: string, trial: string, statistics: Statistics ) {
    db.push( `/${test}/${trial}`, statistics );
  }

  update() {
    const folders = Folder.subfolders( this.rootFolder );

    const statistics = db.getData( '/' ) as NamedTests;

    const removed = this.removeDeleted( statistics, folders );
    const appended = this.appendMissing( statistics, folders );

    db.save();

    return {
      removed,
      appended,
    } as UpdateInfo;
  }

  getTrialsOfType( type: string, exeptionTrialId: string ) {
    const statistics = db.getData( '/' ) as NamedTests;
    return Object.keys( statistics ).flatMap( testName => {
      const test = statistics[ testName ];
      return Object.keys( test )
        .filter( trialId => {
          const trial = test[ trialId ] as Statistics;
          return trial.type === type && trialId !== exeptionTrialId;
        })
        .map( trialId => test[ trialId ] as Statistics );
    });
  }

  private removeDeleted( all: NamedTests, toLeave: string[] ) {

    const toRemove = Object.keys( all ).filter( name => !toLeave.includes( name ) )
  
    toRemove.forEach( name => delete all[ name ] );
  
    return toRemove.length;
  }
  
  private appendMissing( current: NamedTests, all: string[] ) {
  
    const missing = all.filter( name => !current[ name ] );
  
    missing.forEach( name => {
      logger.verbose( `Storage: appending statistics for "${name}" ...` );
      this.emit( 'statistics', name );
     });
  
    return missing.length;
  }
}
