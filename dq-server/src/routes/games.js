const auth = require('../middleware/auth');
const express = require('express');
const gamesController = require('../controllers/games');
const asyncCatch = require('../middleware/asyncCatch');
const { createGameSchema } = require('../validation/input');
const { createGame } = require('../controllers/games');
const router = express.Router();
router.use(express.json());

router.get('/', auth, asyncCatch(async (req, res) => {
	const games =  await gamesController.getGames();
	return res.send(games);
}));

router.post('/', auth, asyncCatch(async (req, res) => {

	let result = createGameSchema.validate(req.body);
	if (result.error) {
		res.status(400).send(result.error.details[0].message);
		return;
	}

	result = await createGame(req.body.players, req.body.themes);
	res.send(result);	
}));

module.exports = router;