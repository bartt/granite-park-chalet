#!/usr/bin/env node

var debug = require('debug')('chalet');
var jsdom = require("jsdom");
var nma = require('nma');
var Prowl = require('node-prowl');
var prowl = new Prowl(process.env.PROWL_API_KEY);
var fs = require('fs')

var URL = 'http://www.graniteparkchalet.com/vacancy_g.html';
var APPLICATION = 'Granite Park Chalet';
var EVENT = 'Availability';
var PREV_AVAILABILITY_FILE = process.env.PREV_AVAILABILITY_FILE || './prev-availability.json';

function save(availableDays) {
    fs.writeFile(PREV_AVAILABILITY_FILE, JSON.stringify(availableDays), 'utf8', function(err) {
        if (err) {
            debug(err);
            throw err;
        }
        debug("Saved " + availableDays + " to " + PREV_AVAILABILITY_FILE);
    })
}

function difference(availableDays, prevAvailableDays) {
    var newAvailableDays = [];
    availableDays.forEach(function (day) {
        var seenBefore = prevAvailableDays.find(function(prevDay) {
            return prevDay == day;
        });
        if (!seenBefore) {
            newAvailableDays.push(day);
        }
    })
    return newAvailableDays;
}

function notify(availableDays) {
    var availabilityText = availableDays.length ? availableDays.join(', ') : 'No availability';
    debug("Notifing: " + availabilityText);
    prowl.push(
        EVENT,
        APPLICATION,
        {
            description: availabilityText,
            url: URL
        },
        function(err, remaining) {
            debug(remaining + ' prowl API calls left in the current hour');
        }
    );
    nma(
        {
            apikey: process.env.NMA_API_KEY,
            application: APPLICATION,
            event: EVENT,
            description: availabilityText,
            url: URL
        },
        function(err, resp, raw) {
            debug('Notidy my Android raw response: ' + raw);
        }
    );
}

jsdom.env(
    URL,
    function (err, window) {
        var days = window.document.querySelectorAll('#availability td[class]');
        
        var availability = Array.prototype.map.call(days, function(e) {
            return e.textContent.replace(/\W+/g, ' ').trim()
        });

        var availableDays = availability.filter(function(e) {
            return !e.match(/\bNO\b/) && e.match(/Aug \b[1-6]\b/)
        });

        debug("Available days: " + availableDays);
        if (availableDays.length) {
            var prevAvailableDays = [];
            var newAvailableDays = availableDays;
            fs.access(PREV_AVAILABILITY_FILE, fs.F_OK, function(err) {
                if (err) {
                    debug(PREV_AVAILABILITY_FILE + " doesn't exist yet");
                    save(newAvailableDays);
                    notify(newAvailableDays);
                } else {
                    fs.readFile(PREV_AVAILABILITY_FILE, 'utf8', function(err, data) {
                        if (err) {
                            debug(err);
                            throw err;
                        }
                        prevAvailableDays = JSON.parse(data);
                        debug("Previous available days: " + prevAvailableDays);
                        newAvailableDays = difference(availableDays, prevAvailableDays);
                        if (newAvailableDays.length) {
                            notify(newAvailableDays);
                        } else {
                            debug("No new availability, nothing to notify");
                        }
                    });
                }
            })
        }
    }
);
