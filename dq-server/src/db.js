const mongoose = require('mongoose').set('debug', true);
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	role: { type: String, default: 'user' },
});

userSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		_.pick(this, ['_id', 'username', 'role']),
		config.get('jwtPrivateKey')
	);
	return token;
};

userSchema.methods.filterForResponse = function() {
	const response = _.pick(this, ['_id', 'username']);
	return response;
};

const playerSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: String,
	lastName: String,
	password: String,
	playedQuestions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Question',
		},
	],
	stats: Number,
});

playerSchema.methods.generateAuthToken = function() {
	const token = jwt.sign(
		_.pick(this, ['_id', 'email']),
		config.get('jwtPrivateKey')
	);
	return token;
};

playerSchema.methods.filterForResponse = function() {
	const response = _.pick(this, [
		'_id',
		'email',
		'firstName',
		'lastName',
		'playedQuestions',
	]);
	return response;
};

const questionSchema = new mongoose.Schema({
	text: String,
	theme: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Theme',
	},
	answer1: String,
	answer2: String,
	answer3: String,
	answer4: String,
	image: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image',
	},
});

const companySchema = new mongoose.Schema({
	name: String,
	subname: String,
});

const themeSchema = new mongoose.Schema({
	name: String,
	description: String,
	isDefault: Boolean,
	isPublic: Boolean,
	company: companySchema,
});

const questionResultSchema = new mongoose.Schema({
	question: {
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Question',
	},
	answers: [{
		player: {
			type: mongoose.Schema.Types.ObjectId,
			ref : 'Player',
		},
		hadAnswered: Boolean,
		correct: Boolean,
		points: Number,
		stolenPoints: Number,
	}],
	jokers: [{
		player: {
			type: mongoose.Schema.Types.ObjectId,
			ref : 'Player',
		},
		value: String,
		target: {
			type: mongoose.Schema.Types.ObjectId,
			ref : 'Player',
		},
	}]
});

const gameResultSchema = new mongoose.Schema({
	firstRound: [questionResultSchema],
	secondRound: [questionResultSchema],
	thirdRound: [questionResultSchema],
	finalResults: [{
		player: {
			type: mongoose.Schema.Types.ObjectId,
			ref : 'Player',
		},
		points: Number,
	}]
});

const gameSchema = new mongoose.Schema({
	themes : [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Theme',
	}],
	players: [{
		type: mongoose.Schema.Types.ObjectId,
		ref : 'Player',
	}],
	name: String,
	dateCreated: { type: Date, default: Date.now },
	datePlayed: { type: Date, default: null },
	results: gameResultSchema,
});

const User = mongoose.model('User', userSchema);
const Player = mongoose.model('Player', playerSchema);
const Question = mongoose.model('Question', questionSchema);
const Theme = mongoose.model('Theme', themeSchema);
const Game = mongoose.model('Game', gameSchema);

module.exports = { User, Player, Question, Theme, Game };
