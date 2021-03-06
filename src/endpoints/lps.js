const router = require('express').Router();
const LPS = require('lps');
const path = require('path');
const fs = require('fs');

const examplesPath = '../../../lps/examples/';

module.exports = router;

const examplePrograms = [
  'mark',
  'mark-hiccup',
  'fireSimple',
  'fireRecurrent',
  'mapColouring',
  'trash',
  'dining',
  'bank',
  'dinner',
  'shopping',
  'prisoners',
  'partition',
  'quickSort',
  'bubbleSort',
  'guard',
  'turing',
  'towers-simple',
  'towers'
];

// eslint-disable-next-line no-unused-vars
router.get('/examples', (req, res, next) => {
  res.json({
    result: examplePrograms
  });
});

// eslint-disable-next-line no-unused-vars
router.get('/examples/:id', (req, res, next) => {
  let programName = examplePrograms[Number(req.params.id)];
  if (programName === undefined) {
    next(new Error('Invalid parameter id'));
    return;
  }
  let file = path.join(__dirname, examplesPath + programName + '.lps');
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

// eslint-disable-next-line no-unused-vars
router.post('/execute', (req, res, next) => {
  let source = req.body.source;
  if (source === undefined) {
    source = '';
  }
  const startTime = process.hrtime();
  LPS.loadString(source)
    .then((engine) => {
      let profiler = engine.getProfiler();
      let result = [];
      let hasResponded = false;

      engine.setContinuousExecution(true);

      engine.on('postCycle', () => {
        result.push({
          time: engine.getCurrentTime(),
          fluents: engine.getActiveFluents(),
          actions: engine.getLastCycleActions(),
          observations: engine.getLastCycleObservations(),
          duration: profiler.get('lastCycleExecutionTime')
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

        // this section processes the timeline and ensures
        // no overlapping when displaying fluents
        let maxCycles = result.length;
        for (let i = 0; i < maxCycles; i += 1) {
          result[i].fluents = result[i].fluents
            .map((f) => {
              return {
                term: f,
                length: 1
              };
            });
          result[i].overlappingFluents = 0;
        }

        for (let i = 0; i < maxCycles; i += 1) {
          let newFluents = [];
          let lastSeenCycle = i;
          let numInCycle = {};

          for (let j = i + 1; j < maxCycles; j += 1) {
            numInCycle[j] = 0;
          }
          result[i].fluents
            .forEach((fArg) => {
              let f = fArg;
              for (let j = i + 1; j < maxCycles; j += 1) {
                let hasSameFluent = false;
                result[j].fluents = result[j].fluents
                  .filter((otherF) => {
                    if (otherF.term === f.term) {
                      numInCycle[j] += 1;
                      f.length += 1;
                      hasSameFluent = true;
                      return false;
                    }
                    return true;
                  });
                if (!hasSameFluent) {
                  break;
                }
                if (j > lastSeenCycle) {
                  lastSeenCycle = j;
                }
              }
              for (let j = i + 1; j <= lastSeenCycle; j += 1) {
                result[j].overlappingFluents
                  = result[i].overlappingFluents
                    + numInCycle[j];
              }
              newFluents.push(f);
            });
          newFluents.sort((a, b) => {
            if (a.length === b.length) {
              return 0;
            }
            return a.length > b.length ? -1 : 1;
          });
          result[i].fluents = newFluents;
        }

        res.json({
          result: result,
          time: diff[0] + 's ' + (diff[1] / 1000000) + 'ms'
        });
      });

      engine.run();
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
