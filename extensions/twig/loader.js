/**
 * This file loads all the twig extentions
 * @type {*}
 */
Twig = require('twig');
tableBodyBox  = require('./tableBodyBox');
getURL = require('./router');

// registering extensions
Twig.extendFunction('tableBodyBox' , tableBodyBox);
Twig.extendFunction('getURL' , getURL.getURL);
Twig.extendFunction('getDate' , getURL.getDate);
