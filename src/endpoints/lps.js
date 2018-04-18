const router = require('express').Router();
const Parser = require(process.env.LIBRARY_DIR + '/src/parser/Parser');
const Engine = require(process.env.LIBRARY_DIR + '/src/engine/Engine');
const fs = require('fs');

module.exports = router;

const examplePrograms = [
  'mark',
  'fireSimple',
  'fireRecurrent',
  'mapColouring',
  'trash',
  'dining'
];

router.get('/examples', (req, res, next) => {
  res.json({
    result: examplePrograms
  });
});

router.get('/examples/:id', (req, res, next) => {
  let programName = examplePrograms[Number(req.params.id)];
  if (programName === undefined) {
    next(new Error('Invalid parameter id'));
    return;
  }
  let file = process.env.LIBRARY_DIR + '/examples/' + programName + '.lps'; 
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      next(err);
      return;
    }
    res.json({
      result: data
    });
  });
});

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