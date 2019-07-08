/**
 * MBR.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name:{
      type: "string",
      required:true
    },
    email:{
      type:"string",
      required:true
    },
    phone:{
      type:"string",
      required:true
    },
    mailing_address:{
      type:"string",
      required:true
    },
    employer_name:{
      type:"string",
      required:true
    },
    password:{
      type:"string",
      required:true
    },
    employment_duration:{
      type:"string",
    },
    employee_salary:{
      type:"string",
    },
    status:{
      type:"string",
    }
  },
  datastore: 'MbrDb'
};

