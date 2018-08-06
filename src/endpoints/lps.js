const router = require('express').Router();
const LPS = require(process.env.LIBRARY_DIR + '/src/LPS');
const Program = require(process.env.LIBRARY_DIR + '/src/parser/Program');
const Engine = require(process.env.LIBRARY_DIR + '/src/engine/Engine');

const path = require('path');
const fs = require('fs');

module.exports = router;

const examplePrograms = [
  'mark',
  'fireSimple',
  'fireRecurrent',
  'mapColouring',
  'trash',
  'dining',
  'bank',
  'prisoners',
  'partition',
  'quickSort',
  'bubbleSort',
  'mark-hiccup',
  'guard',
  'turing',
  'towers-simple',
  'towers'
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
  let file = path.join(__dirname, process.env.LIBRARY_DIR + '/examples/' + programName + '.lps'); 
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
  if (source === undefined) {
    source = '';
  }
  const startTime = process.hrtime();
  Program.fromString(source)
    .then((program) => {
      let engine = new Engine(program);
      
      let result = [];
      let hasResponded = false;
      
      engine.setContinuousExecution(true);
      
      engine.on('postCycle', () => {
        result.push({
          time: engine.getCurrentTime(),
          fluents: engine.getActiveFluents(),
          actions: engine.getLastStepActions(),
          observations: engine.getLastStepObservations()
        });
      });
      
      engine.on('error', (err) => {
        if (hasResponded) {
          return;
        }
        hasResponded = true;
        res
          .status(500)
          .json({
            status: 'error',
            msg: '' + err
          });
      });
      
      engine.on('done', () => {
        const diff = process.hrtime(startTime);
        res.json({
          result: result,
          time: diff[0] + 's ' + (diff[1]/1000000) + 'ms'
        });
      });
      
      engine.on('ready', () => {
        engine.run();
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({
          status: 'error',
          msg: '' + err
        });
    });
});