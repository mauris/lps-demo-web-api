const router = require('express').Router();
const Parser = require(process.env.LIBRARY_DIR + '/src/parser/Parser');
const Engine = require(process.env.LIBRARY_DIR + '/src/engine/Engine');

module.exports = router;

router.post('/execute', (req, res, next) => {
  let source = req.body.source;
  let parser = new Parser(source);
  let programTree = parser.build();
  let engine = new Engine(programTree);
  let result = engine.run();
  res.json({
    result: result
  });
});