/**
 * Type identification
 * @param {*[]} types candidates
 * @param {*} src object which the inditidication is apllied to
 * @returns {*}
 */
function estimateType( types, src ) {

    if (types.length === 1) {
        return types[0];
    }
    else {
        const srcKeys = Object.keys( src ).sort();

        const typeIndex = types.findIndex( type => {

            const typeKeys = Object.keys( new type() ).sort();
            if (typeKeys.length !== srcKeys.length) {
                return false;
            }

            return srcKeys.every( (key, i) => typeKeys[i] === key ) ;
        });

        if (typeIndex < 0) {
            throw new Error( `Unknown data type in the array: "${JSON.stringify(src)}"` );
        }

        return types[ typeIndex ];
    }
}

//let indent = 0;
/**
 * Deep copy according to schema
 * @param {*} src data from the file
 * @param {*} dest destination of the data to copy to; initially contains the src type taken from schema
 * @param {*[]} [types] possible types of src, if more that one is expected
 */
export function copy( src, dest, types ) {

    Object.keys( src ).forEach( k => {
//console.log(' '.repeat(indent), k); indent += 2;

        let type = dest[k];

        if (types) {
            type = estimateType( types, src[k] );
        }

        if (type === undefined) {
            throw new Error( `Unknown data type in the record: "${k}" = "${src[k]}" (dest : ${JSON.stringify( dest )})` );
        }

        if (type === Number) {
            dest[k] = type( src[k] );
        }
        else if (type === String || type === Boolean) {
            dest[k] = type( src[k] );
        }
        else if (type === Date) {
            dest[k] = new type( src[k] );
        }
        else if (Array.isArray( type )) {
            if (!Array.isArray( src[k] )) {
                throw new Error( `Array is expected for "${k}"` );
            }

            const types = dest[k];
            dest[k] = [];
            copy( src[k], dest[k], types );
        }
        else if (typeof type === 'function') {
            dest[k] = new type();
            copy( src[k], dest[k] );
        }
        else {      // fixed value
            dest[k] = src[k];
        }
//indent -= 2;
    });
}

/**
 * Flat value-copy according to schema
 * @param {*} src value
 * @param {*} type the src type; for arrays, only one type is allowed
 * @returns {*}
 */
export function copyValue( src, type ) {
    if (type === Number) {
      return type( src );
    }
    else if (type === String || type === Boolean) {
        return type( src );
    }
    else if ((new type()) instanceof Date) {
        return new type( src );
    }
    else if (Array.isArray( type )) {
        if (!Array.isArray( src )) {
            throw new Error( `Array is expected for "${src}"` );
        }

        const valueType = type[0];
        return src.map( s => copyValue( s, valueType ) ); 
    }
    else if (typeof type === 'function') {
        return new type( src );
    }
    else {  // fixed value
        return src;
    }
}

/**
 * Removes unused fields after copying
 * @param {*} obj value
 */
export function clearUnused( obj ) {
  Object.keys( obj ).forEach( k => {
    const type = obj[k];
    if (type === Number) {
      obj[k] = 0;
    }
    else if (type === String) {
      obj[k] = '';
    }
    else if (type === Boolean) {
      obj[k] = false;
    }
    else if (Array.isArray( type ) && type.length > 0 && typeof type[0] === 'function' ) {
      obj[k] = [];
    }
    else if (typeof type === 'function') {
      obj[k] = null;
    }
  });
}