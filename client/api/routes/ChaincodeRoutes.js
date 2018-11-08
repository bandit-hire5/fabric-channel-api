'use strict';

module.exports = function(app) {
    const chaincode = require('../controllers/ChaincodeController');

    app.route('/chaincode/install')
        .post(chaincode.install);

    app.route('/chaincode/instantiate')
        .post(chaincode.instantiate);
};