/**
 * Appraiser.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    UserID:{
      type: "number",
      required:true
    },
    Password:{
      type:"string",
      required:true
    },

  },
  datastore:'AppraiserDb'
};

