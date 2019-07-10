/**
 * RealEstate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    MlsID:{
      type: "number",
      required:true
    },
    Name:{
      type:"string",
      required:true
    },
    MortgageID:{
      type:"number",
      required:true
    }
  },
  datastore: 'REDb'
};

