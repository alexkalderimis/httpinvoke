var cfg = require('../dummyserver-config');
var httpinvoke = require('../httpinvoke-node');

var makeErrorFinished = function(done) {
    return function(err, output) {
        if(err) {
            return done();
        }
        done(new Error('Did not finish with an error'));
    };
};

describe('"input" option', function() {
    this.timeout(10000);
    cfg.eachBase(function(postfix, url) {
        it('finishes with error, if "inputType" option is not one of: "text", "auto", "json", "bytearray"' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                inputType: "string",
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if "inputType" option is "text" and "input" option is undefined' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                inputType: "text",
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if "inputType" option is "auto" and "input" option is undefined' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                inputType: "auto",
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if "inputType" option is "bytearray" and "input" option is undefined' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                inputType: "bytearray",
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if Content-Type header is defined and "input" option is undefined' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                headers: {
                    'Content-Type': 'application/json'
                },
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if Content-Type header is not defined, "input" option is defined and "inputType" option is "auto"' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                inputType: "auto",
                input: 'foobar',
                finished: makeErrorFinished(done)
            });
        });
        it('finishes with error, if Content-Type header is not defined, "input" option is defined and "inputType" option is undefined' + postfix, function(done) {
            httpinvoke(url, 'POST', {
                input: 'foobar',
                finished: makeErrorFinished(done)
            });
        });
        it('correctly sends the input when inputType is text' + postfix, function(done) {
            httpinvoke(url + 'text/utf8', 'POST', {
                input: cfg.textTest(),
                inputType: 'text',
                outputType: 'text',
                finished: function(err, output) {
                    if(err) {
                        return done(err);
                    }
                    if(output === 'OK') {
                        return done();
                    }
                    done(new Error('Server response about the input is: ' + output));
                }
            });
        });
        if(!httpinvoke.requestTextOnly) {
            it('correctly sends the input when inputType is bytearray and input is Array' + postfix, function(done) {
                httpinvoke(url + 'bytearray', 'POST', {
                    input: cfg.bytearrayTest(),
                    inputType: 'bytearray',
                    outputType: 'text',
                    finished: function(err, output) {
                        if(err) {
                            return done(err);
                        }
                        if(output === 'OK') {
                            return done();
                        }
                        done(new Error('Server response about the input is: ' + output));
                    }
                });
            });
            if(typeof Uint8Array !== 'undefined') {
                it('correctly sends the input when inputType is bytearray and input is ArrayBuffer' + postfix, function(done) {
                    httpinvoke(url + 'bytearray', 'POST', {
                        input: new Uint8Array(cfg.bytearrayTest()).buffer,
                        inputType: 'bytearray',
                        outputType: 'text',
                        finished: function(err, output) {
                            if(err) {
                                return done(err);
                            }
                            if(output === 'OK') {
                                return done();
                            }
                            done(new Error('Server response about the input is: ' + output));
                        }
                    });
                });
            }
            var convertByteArrayToBlob = function(bytearray) {
                var str;
                if(typeof Uint8Array === 'undefined') {
                    str = '';
                    for(var i = 0; i < bytearray.length; i += 1) {
                        str += String.fromCharCode(bytearray[i]);
                    }
                } else {
                    str = new Uint8Array(bytearray).buffer;
                }
                var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                if(typeof BlobBuilder === 'undefined') {
                    try {
                        return new Blob([str], {
                            type: 'application/octet-stream'
                        });
                    } catch(_) {
                        return null;
                    }
                } else {
                    var bb = new BlobBuilder();
                    bb.append(str);
                    return bb.getBlob('application/octet-stream');
                }
            };
            var blob = convertByteArrayToBlob(cfg.bytearrayTest());
            if(blob !== null) {
                it('correctly sends the input when inputType is bytearray and input is Blob' + postfix, function(done) {
                    httpinvoke(url + 'bytearray', 'POST', {
                        input: blob,
                        inputType: 'bytearray',
                        outputType: 'text',
                        finished: function(err, output) {
                            if(err) {
                                return done(err);
                            }
                            if(output === 'OK') {
                                return done();
                            }
                            done(new Error('Server response about the input is: ' + output));
                        }
                    });
                });
            }
        }
    });
});
