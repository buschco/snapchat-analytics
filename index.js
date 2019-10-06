const moment = require('moment');
const chalk = require('chalk');
const boxen = require('boxen');
const data = require('./json/snap_history.json');
/* eslint-disable no-console */
const fill = l => new Array(l < 1 ? 1 : l + 2).fill(' ').join('');
const logObj = (a, t) => {
  const longest = Object.keys(a).reduce(
    (max, key) => Math.max(`${key}: ${chalk.magenta(a[key])}`.length, max),
    0
  );
  const body = Object.keys(a).reduce((s, key) => {
    const row = `${key}: ${chalk.magenta(a[key])}\n`;
    return `${s}${key}:${fill(longest - row.length)}${chalk.magenta(a[key])}\n`;
  }, `${chalk.yellow(t)}\n`);
  console.log(boxen(`${body.trim()} `, { align: 'center' }));
};
/* eslint-enable no-console */

const received = [...data['Received Snap History']];
const sent = [...data['Sent Snap History']];

const sentSorted = sent.sort(
  (a, b) => new Date(a.Created).getTime() > new Date(b.Created).getTime()
);

const receivedSorted = received.sort(
  (a, b) => new Date(a.Created).getTime() > new Date(b.Created).getTime()
);
const firstSent = new Date(sentSorted[0].Created);
const firstReceived = new Date(receivedSorted[0].Created);
const recentSent = new Date(sentSorted[sentSorted.length - 1].Created);
const recentReceived = new Date(
  receivedSorted[receivedSorted.length - 1].Created
);

const sentTimeSpan = moment(recentSent).diff(moment(firstSent), 'days');
const receivedTimeSpan = moment(recentReceived).diff(
  moment(firstReceived),
  'days'
);

const usersMap = sent.reduce((acc, cur) => {
  if (acc[cur.To] == null) {
    acc[cur.To] = { name: cur.To, sent: 0, received: 0 };
  }
  acc[cur.To].sent += 1;
  return acc;
}, {});

received.forEach(cur => {
  if (usersMap[cur.From] == null) {
    usersMap[cur.From] = { name: cur.From, sent: 0, received: 0 };
  }
  usersMap[cur.From].received += 1;
});

const users = Object.keys(usersMap)
  .map(key => ({
    ...usersMap[key],
    totalTraffic: usersMap[key].sent + usersMap[key].received,
  }))
  .sort((a, b) => b.totalTraffic - a.totalTraffic);

logObj(users[0], 'Top 1');
logObj(users[1], 'Top 2');
logObj(users[2], 'Top 3');

logObj(
  {
    'snaps sent': sent.length,
    'snaps received': received.length,
    'sent data timespan': sentTimeSpan,
    'received data timespan': receivedTimeSpan,
    'sent per day': sent.length / sentTimeSpan,
    'received per day': received.length / receivedTimeSpan,
  },
  'stats'
);
