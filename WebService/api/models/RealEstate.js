/**
 * RealEstate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    MlsID:{
      type: "string",
      required:true
    },
    Name:{
      type:"string",
      required:true
    },
    MortgageID:{
      type:"string",
      required:true,
      unique:true
    },
    Value:{
      type:"number"
    }
  },
  datastore: 'REDb'
};

