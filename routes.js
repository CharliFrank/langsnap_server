const express = require('express');

const router = express.Router();
const dbHelpers = require('./db_schema/db_helpers_fxns');
const apiHelpers = require('./api_helpers/api_helpers');
const Card = require('./db_schema/card/card_schema');
const Deck = require('./db_schema/deck/deck_schema');
const User = require('./db_schema/user/user_schema');
const DeckCard = require('./db_schema/deck_card/deck_card_schema');

router.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  return res.sendStatus(200);
});

router.get('/', (req, res) => res.status(200).send('hello'));

router.post('/v2/*', (req, res) => {
  console.log(req.body);
  return res.sendStatus(200);
});

router.get('/v1/users/everything', (req, res) => {
  return dbHelpers.userGetItAll(res);
});

router.post('/v1/cloudinaryurltogoogle', (req, res) => {
  const url = req.body.url;
  console.log(url);
  apiHelpers.sendUrlToGoogleVisionForName(url, res);
});

router.get('/v1/oxford/sentence/word/*', (req, res) => {
  const queryWord = req.params[0];
  return apiHelpers.getSamplePhraseEnglishFromWordOxford(queryWord, res);
});

router.get('/v1/wordnik/sentence/word/*', (req, res) => {
  const queryWord = req.params[0];
  return apiHelpers.getSamplePhraseFromWordWordnik(queryWord, res);
});

router.post('/v1/googletranslate/sentence', (req, res) => {
  const q = req.body.q;
  const source = req.body.source;
  const target = req.body.target;
  return apiHelpers.getGoogleTranslateOfSentence(q, source, target, res);
});

// testing only delete when done
router.get('/v1/users/all', async (req, res) => {
  const user = await User.findAll({});
  return res.status(200).send(user);
});

router.get('/v1/users/auth/*/*', (req, res) => {
  const socialLoginSource = req.params[0];
  const username = decodeURI(req.params[1]);
  if (socialLoginSource === 'facebook') {
    return dbHelpers.findUserIfExistsBySocialId(socialLoginSource, username, res);
  }
  return res.sendStatus(400);
});

router.post('/v1/users/findorcreate', async (req, res) => {
  const facebookUsername = decodeURI(req.body.facebookUsername);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const token = req.body.token;
  const nativeLang = req.body.nativeLang;
  const learnLang = req.body.learnLang;
  const email = req.body.email;
  return dbHelpers.findAndUpdateOrCreateUser(
    facebookUsername,
    firstName,
    lastName,
    token,
    nativeLang,
    learnLang,
    email,
    res);
});

router.get('/v1/decks/all', (req, res) => dbHelpers.getAllDecks(res)); // getting cards array, why? seeded data?

router.get('/v1/decks/deckid/*', (req, res) => {  // good!
  const id = +req.params[0];
  return dbHelpers.getDeckByDeckId(id, res);
});

router.get('/v1/decks/userid/*', (req, res) => {  // good!
  const id = +req.params[0];
  return dbHelpers.getDeckByUserId(id, res);
});

router.get('/v1/cards/all', (req, res) => dbHelpers.getAllCards(res));  // good

router.get('/v1/cards/deckid/*', (req, res) => {  // need to test with proper data again
  const id = +req.params[0];
  return dbHelpers.getAllCardsFromDeckByDeckId(id, res);
});

router.post('/v1/decks/new', (req, res) => {  // good!
  const name = req.body.name;
  const user_id = req.body.user_id;
  const stars = req.body.stars;
  return dbHelpers.userCreateNewDeck(name, user_id, stars, res);
});

router.post('/v1/cards/addcard', (req, res) => { // working! leave it def for now!!!
  const user_id = req.body.user_id;
  const imgUrl = req.body.imgUrl;
  const wordMap = req.body.wordMap;
  const deck_id = req.body.deck_id;
  return dbHelpers.userAddCreatedCardToDeck(user_id, imgUrl, wordMap, deck_id, res);
});

router.post('/v1/decks/adddecks', (req, res) => {  // I think this one works!
  const user_id = req.body.id;
  const decks = JSON.parse(req.body.decks);
  return dbHelpers.addMultipleDecksAndUserSpecificsToJoinTable(user_id, decks, res);
});

router.post('/v1/decks/addcards', (req, res) => {  // need to test a bit more!
  const deckId = req.body.deckId;
  const cardIdsArr = JSON.parse(req.body.cardIds);
  return dbHelpers.createCardsForDeckByCardIds(deckId, cardIdsArr, res);
});

router.delete('/v1/decks/*', (req, res) => {  // good!
  const id = +req.params[0];
  return dbHelpers.deleteDeckById(id, res);
});

router.delete('/v1/cards/*', (req, res) => {  // good!
  const id = req.params[0];
  return dbHelpers.deleteCardById(id, res);
});

module.exports = router;
