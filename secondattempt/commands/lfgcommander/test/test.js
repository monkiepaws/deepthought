var expect = require("chai").expect;
var lfgcommander = require("./../lfgcommander.js")
describe('lfgcommander', function() {
    describe('#lfgcommand()', function() {
        it('should find the games in the database', function() {
            var test1 = lfgcommander.lfgcommand(["sfv", "st"]);

            expect(test1.join()).to.equal("sfvst");
        });
    });
});