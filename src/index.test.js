import {expect} from 'chai';
import jsdom from 'jsdom';
import fs from 'fs';

describe('Our first test', () => {
  it('should pass', () =>  {
    expect(true).to.equal(true);
  })
})

//let's try JSDOM
describe("index.html", () => {
  it('should say hello', (done) => {
    const index = fs.readFileSync('./src/index.html', 'utf-8');
    jsdom.env(index, (err, window) => {
      const h1 = window.document.getElementsByTagName('h1')[0];
      expect(h1.innerHTML).to.equal("Extract keywords from image using Azure Cognitive Services");
      done();
      window.close();
    });
  })
})
