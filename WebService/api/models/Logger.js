/**
 * Logger.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    
    timestamp: {
      type: 'string',
      columnType: 'datetime',
      required: true,
    },

    message: {
      type: 'string',
      required: true,
      maxLength: 255,
    },

  },
 datastore: 'loggerDB'
};

