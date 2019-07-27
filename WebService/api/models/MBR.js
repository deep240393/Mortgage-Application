/**
 * MBR.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    mortgage_ID:{
      type: "string",
      required:true
    },
    name:{
      type: "string",
      required:true
    },
    email:{
      type:"string",
      required:true
    },
    password:{
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
    employee_ID:{
      type:"string",
    },
    employer_name:{
      type:"string",
      required:true
    },
    MlsID:{
      type:"string",
    },
    mortgage_value:{
      type:"string",
    },
    employment_duration:{
      type:"string",
    },
    employee_salary:{
      type:"string",
    },
    insured_value:{
      type:"string",
    },
    deductible_value:{
      type:"string",
    },
    EMP_confirmation:{
      type:"string",
    },
    INSinc_confirmation:{
      type:"string",
    },
    status:{
      type:"string",
    },
  },
  datastore: 'MbrDb'
};

