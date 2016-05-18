// Example model

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var WinnerSchema = new Schema({
    totem:String,
    gain:String,
    time:String
});

WinnerSchema.virtual('date')
  .get(function(){
    return this._id.getTimestamp();
  });

mongoose.model('Winner', WinnerSchema);
