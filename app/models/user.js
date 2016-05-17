var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: String,
  prenom: String,
  nom: String,
  telephone: String,
  cp: String,
  newsletter: Boolean
},
{
    timestamps: true
});

UserSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('User', UserSchema);
