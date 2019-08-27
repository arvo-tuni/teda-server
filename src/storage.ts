import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import EventEmitter from 'events';

import options from './options';
import Folder from './folder';
import { Data as Statistics } from './statistics/types';

const db = new JsonDB( new Config( 'arvo', true, false, '/' ) );

db.load();

interface NamedTests {
  [x: string]: NamedTrials;
}

interface NamedTrials {
  [x: string]: Statistics;
}

/// Emits
///   statistics( name )
export default class Storage extends EventEmitter {
  
  private statistics: NamedTests = {};
  private rootFolder = options['data-folder'];

  constructor() {
    super();

    this.statistics = db.getData( '/' ) as NamedTests;
  }

  append( test: string, trial: string, statistics: Statistics ) {
    db.push( `/${test}/${trial}`, statistics );
  }

  update() {
    const folders = Folder.subfolders( this.rootFolder );
    this.statistics = this.removeDeleted( this.statistics, folders );
    this.statistics = this.appendMissing( this.statistics, folders );
  }

  private removeDeleted( all: NamedTests, toLeave: string[] ) {

    const toRemove = Object.keys( all ).filter( name => !toLeave.includes( name ) )
  
    toRemove.forEach( name => delete all[ name ] );
  
    return all;
  }
  
  private appendMissing( current: NamedTests, all: string[] ) {
  
    const missing = all.filter( name => !current[ name ] );
  
    missing.forEach( name => {
      this.emit( 'statistics', name );
    });

    db.save();
  
    return current;
  }
}
