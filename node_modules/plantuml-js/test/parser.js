const expect = require('chai').expect;
const parser = require('../src/parser.js');

describe('parser', () => {

  describe('checkError', () => {

    it('Should return -1 if no error present in data', () => {
      const t1 = `alice -> bob: hello
                  bob -> alice: hi`;
      expect(parser.checkError(t1)).to.be.equal(-1);

      const t2 = `some incorrect syntax
                  but no error pattern`;
      expect(parser.checkError(t2)).to.be.equal(-1);
    });

    it('Should return line number if syntax error pattern is present with colon', () => {
      const t1 = '@startuml\n' +
                 'bob -> alice\n' +
                 'alice -> bob\n' +
                 'boundary\n' +
                 '^^^^^^^^\n' +
                 ' Syntax error: boundary\n';
      expect(parser.checkError(t1)).to.be.equal(3);
    });

    it('Should return line number if syntax error pattern is present with question mark', () => {
      const t1 = '@startuml\n' +
                 'alice -> bob: \n' +
                 'laksmc        \n' +
                 '^^^^^^        \n' +
                 ' Syntax Error?\n';
      expect(parser.checkError(t1)).to.be.equal(2);
    });

    it('Should return correct line number taking into account skipped lines', () => {
      const t1 = '... (skipping 3 lines) ...\n' +
                 '\n' +
                 'bob -> alice\n' +
                 'alice -> bob\n' +
                 'boundary\n' +
                 '^^^^^^^^\n' +
                 ' Syntax error: boundary\n';
      expect(parser.checkError(t1)).to.be.equal(6);
    });
  });
});