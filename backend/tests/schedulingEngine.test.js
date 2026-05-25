/**
 * Run: node tests/schedulingEngine.test.js
 * No MongoDB required — validates scheduling logic in isolation.
 */
const { computeSchedule } = require('../utils/schedulingEngine');

function task(id, duration, deps = []) {
  return {
    _id: id,
    name: id,
    duration,
    dependencies: deps,
    toObject() {
      return this;
    },
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function run() {
  // Linear chain A(2) -> B(3) -> C(1)
  const chain = [
    task('a', 2, []),
    task('b', 3, ['a']),
    task('c', 1, ['b']),
  ];
  const r1 = computeSchedule(chain);
  assert(r1.ok, 'chain should schedule');
  const byId = Object.fromEntries(r1.tasks.map((t) => [t._id, t]));
  assert(byId.a.startDay === 0 && byId.a.endDay === 2, 'A schedule');
  assert(byId.b.startDay === 2 && byId.b.endDay === 5, 'B schedule');
  assert(byId.c.startDay === 5 && byId.c.endDay === 6, 'C schedule');
  assert(r1.projectEnd === 6, 'project end');

  // Parallel join: A(4), B(2), C(3) deps A,B
  const parallel = [
    task('a', 4, []),
    task('b', 2, []),
    task('c', 3, ['a', 'b']),
  ];
  const r2 = computeSchedule(parallel);
  assert(r2.tasks.find((t) => t._id === 'c').startDay === 4, 'C starts at max(4,2)');

  // Zero duration milestone
  const milestone = [task('m', 0, [])];
  const r3 = computeSchedule(milestone);
  assert(r3.tasks[0].startDay === 0 && r3.tasks[0].endDay === 0, 'zero duration');

  // Cycle detection
  const cycle = [
    task('a', 1, ['c']),
    task('b', 1, ['a']),
    task('c', 1, ['b']),
  ];
  const r4 = computeSchedule(cycle);
  assert(!r4.ok && r4.error.includes('Circular'), 'cycle detected');

  console.log('All scheduling engine tests passed.');
}

run();
