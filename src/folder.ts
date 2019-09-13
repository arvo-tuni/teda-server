import fs from 'fs';

export default class Folder {

  static subfolders( folder: string ): string[] {
    const names = fs.readdirSync( folder );
    const subfolders = names.filter( name => fs.statSync( `${folder}/${name}` ).isDirectory() );
    if (subfolders.length) {
      return subfolders;
    }

    return [];
  }

  static listFiles( folder: string, re?: RegExp ): string[] {
    const filenames = fs.readdirSync( folder );
    if (re) {
      return filenames.filter( filename => re.test( filename ) );
    }
    else {
      return filenames;
    }
  }
}
