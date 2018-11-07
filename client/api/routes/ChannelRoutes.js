'use strict';

module.exports = function(app) {
    const channel = require('../controllers/ChannelController');

    app.route('/channels')
        .post(channel.create);

    app.route('/channels/join')
        .post(channel.join);
};