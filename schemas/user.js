const Schema = require('mongoose').Schema;
//const mongooseUnique = require('mongoose-unique-validator');

/** 
* Tramform used for toObject and toJSON. Turn _id into
* string id.
*/
function transform(doc, ret) {
  delete ret._id;
  ret.id = doc._id.toString();
  return ret;  
}

const schema = new Schema({
  name: {
    type: String,
    required: [true, "A name is required"],
    trim: true,
    max: [40, 'The maximum name length is 40'],
    unique: true
  }
}, {
  toObject: { transform },
  toJSON: { transform }  
});

schema.set('toObject', {virtuals:true});
//schema.plugin(mongooseUnique);
 
module.exports = schema;
