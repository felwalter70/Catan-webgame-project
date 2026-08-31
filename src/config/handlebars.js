const moment = require('moment');
const path = require('path');

module.exports = {
    defaultLayout: 'main',
    partialsDir: path.join(__dirname, '/views/partials'),
    helpers: {
        formatDate: date => {
            return moment(date).format('DD/MM/YYYY');
        },
        formatDateHour: date => {
            return moment(date).format('DD/MM/YYYY, HH:mm:ss');
        },
        formatHourMinute: date => {
            return moment(date).format('HH:mm');
        },
        equal: (a, b) => {
            return (a === b);
        },
    },
};
