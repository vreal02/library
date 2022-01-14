const { DateTime } = require('luxon');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema ({

    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}

});

AuthorSchema
.virtual('name')
.get(function(){

return this.family_name + ', ' + this.first_name;

});

AuthorSchema
.virtual('lifespan')
.get(function(){

    var lifetime_string = '';
    if (this.date_of_birth){

        lifetime_string += DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }

    

    if (this.date_of_death){
        lifetime_string += ' - ';
        lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);
    }

    if (lifetime_string == ''){
        lifetime_string = 'Fecha no disponible'
    }
    
    return lifetime_string;

});

AuthorSchema
.virtual('url')
.get(function(){

    return '/catalog/author/' + this._id;

});

module.exports = mongoose.model('Author', AuthorSchema);