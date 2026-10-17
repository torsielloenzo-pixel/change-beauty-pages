'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'../header-editorial.css'),'utf8');

test('editorial header loads after viewport layout and keeps existing navigation',()=>{
 assert.ok(html.indexOf('first-screen-fluid.css')>=0);
 assert.ok(html.indexOf('header-editorial.css')>html.indexOf('first-screen-fluid.css'));
 assert.match(html, /<header class="site-header">/);
 assert.match(html, /class="desktop-menu change-home-nav"/);
 assert.match(html, /class="header-actions"/);
 assert.match(html, /class="nav-reserve"/);
 assert.match(html, /id="mobile-toggle"/);
 assert.match(html, /id="mobile-menu"/);
});
test('header follows all four visual requirements',()=>{
 assert.match(css, /grid-template-columns:minmax\(0,1fr\) minmax\(0,max-content\) minmax\(0,1fr\)/);
 assert.match(css, /\.wordmark small/);
 assert.match(css, /\.wordmark small::before/);
 assert.match(css, /\.wordmark small::after/);
 assert.match(css, /\.nav-reserve/);
 assert.match(css, /background:linear-gradient\(180deg,rgba\(251,246,241/);
 assert.match(css, /backdrop-filter:blur\(7px\)/);
});
test('header degrades gracefully across narrow screens, scrolled and reduced motion',()=>{
 assert.match(css, /@media\(max-width:1250px\)/);
 assert.match(css, /@media\(max-width:680px\)/);
 assert.match(css, /@media\(max-width:365px\)/);
 assert.match(css, /\.mobile-toggle/);
 assert.match(css, /\.mobile-menu\[hidden\]\{display:none!important\}/);
 assert.match(css, /\.change-stage-scrolled/);
 assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
