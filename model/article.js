const mongoose      =   require("mongoose");
const autoIncrement =   require("mongoose-auto-increment");

autoIncrement.initialize(mongoose.connection);
const articleSchema =   mongoose.Schema({
    articleNum:{
        type: Number,
        unique:true,
        index:true,
    },
    userId:{
        type: String,
        maxlength: 20,
    },
    title:  {
        type: String
    }, // String is shorthand for {type: String}
    content:{
        type: String,
        maxlength: 5000,
    },
    date: { 
        type: Date, 
        default: Date.now
    },
    heart: {
        type: Number,
        default: 0
    },
    brokenheart: {
        type: Number,
        default: 0
    },
    hidden: Boolean,

});

articleSchema.plugin(autoIncrement.plugin,{
	model : 'articleModel',
	field : 'articleNum',
	startAt : 1, //시작 
	increment : 1 // 증가
});

const Article      =   mongoose.model("Article", articleSchema);

module.exports     =   {Article};