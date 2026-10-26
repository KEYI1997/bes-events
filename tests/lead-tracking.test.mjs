import test from 'node:test';
import assert from 'node:assert/strict';
import { captureLeadAttribution, getLeadAttribution, formatLeadAttribution } from '../src/lib/leadAttribution.ts';
import { trackGoogleAdsLeadConversion, GOOGLE_ADS_LEAD_SEND_TO } from '../src/lib/googleAds.ts';
import nextConfig from '../next.config.ts';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('campaign identifiers survive navigation and unapproved query strings are discarded', () => {
  const storage = new Map();
  globalThis.window = { location: { href: 'https://besevent.com/services?gclid=example-click&utm_source=google&utm_medium=cpc&email=private@example.test' }, localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) } };
  globalThis.document = { referrer: 'https://www.google.com/search?q=private' };
  const entry = captureLeadAttribution();
  assert.equal(entry.params.gclid, 'example-click');
  assert.equal(entry.landing_url, 'https://besevent.com/services');
  assert.equal(entry.referrer, 'https://www.google.com/search');
  assert.ok(!JSON.stringify(entry).includes('private'));
  window.location.href = 'https://besevent.com/contact';
  const submission = getLeadAttribution();
  assert.equal(submission.params.gclid, 'example-click');
  assert.equal(submission.form_url, 'https://besevent.com/contact');
  const note = formatLeadAttribution(submission);
  assert.ok(note.includes('gclid：example-click'));
  assert.ok(note.includes('utm_source：google'));
  window.location.href = 'https://besevent.com/contact?gclid=new-click&utm_campaign=autumn';
  assert.equal(captureLeadAttribution().params.gclid, 'new-click');
});

test('server rejects expired, credential-bearing or off-site landing metadata', () => {
  const base = { landing_url: 'https://besevent.com/contact', captured_at: new Date().toISOString(), params: { gclid: 'click', secret: 'not allowed' } };
  assert.equal(formatLeadAttribution({...base, captured_at: '2000-01-01'}), '');
  assert.equal(formatLeadAttribution({...base, landing_url:'javascript:alert(1)'}), '');
  assert.equal(formatLeadAttribution({...base, landing_url:'https://user:pass@besevent.com/contact'}), '');
  assert.equal(formatLeadAttribution({...base, landing_url:'https://unrelated.example/contact'}), '');
  assert.ok(!formatLeadAttribution(base).includes('not allowed'));
});

test('successful conversion can queue before Google library loads, but previews remain excluded', () => {
  globalThis.window = { location: { hostname: 'besevent.com' }, __BES_GOOGLE_TAG_ENABLED__: true };
  trackGoogleAdsLeadConversion();
  assert.deepEqual(window.dataLayer[0], ['event','conversion',{send_to:GOOGLE_ADS_LEAD_SEND_TO,value:1,currency:'TWD'}]);
  window.location.hostname = 'preview.vercel.app';
  trackGoogleAdsLeadConversion();
  assert.equal(window.dataLayer.length,1);
  window.location.hostname = 'besevent.com';
  window.__BES_GOOGLE_TAG_ENABLED__ = false;
  trackGoogleAdsLeadConversion();
  assert.equal(window.dataLayer.length,1);
});

test('www redirect covers every path with a permanent canonical target', async () => {
  const rules=await nextConfig.redirects();
  assert.deepEqual(rules[0], { source:'/:path*', has:[{type:'host',value:'www.besevent.com'}], destination:'https://besevent.com/:path*', permanent:true });
});

test('contact endpoint persists source metadata alongside the enquiry without notifying real recipients', async () => {
  const writes=[];
  const dependencies={
    'next/server':{NextResponse:{json:(body,options={})=>new Response(JSON.stringify(body),{status:options.status||200})}},
    '@/lib/supabase':{supabase:{from:name=>({insert:async record=>{writes.push({name,record});return {error:null};}})}},
    resend:{Resend:class {}},
    '@/lib/emailTemplates':{contactEmailHtml:()=>''},
    '@/lib/adminLineNotifications':{pushAdminLineNotification:async()=>({sent:0,failed:0,status:'not_configured'})},
    '@/lib/productSelectionSummary':{productSelectionSummary:()=>''},
    '@/lib/phone':{normalizeTaiwanPhone:value=>value},
    '@/lib/eventDate':{isDateBeforeTaiwanToday:()=>false},
    '@/lib/leadAttribution':{formatLeadAttribution},
  };
  const source=fs.readFileSync(new URL('../src/app/api/contact/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(code,{module,exports:module.exports,require:id=>{assert.ok(id in dependencies,'Unexpected dependency '+id);return dependencies[id];},process:{env:{}},console});
  const payload={name:'Internal unit test',phone:'0912345678',event_location:'Test venue',description:'Original enquiry',attribution:{landing_url:'https://besevent.com/services',form_url:'https://besevent.com/contact',captured_at:new Date().toISOString(),params:{gclid:'unit-test-click',utm_source:'google'}}};
  const result=await module.exports.POST(new Request('https://besevent.com/api/contact',{method:'POST',body:JSON.stringify(payload)}));
  assert.equal(result.status,200);
  assert.equal(writes.length,1);
  assert.equal(writes[0].name,'contacts');
  assert.ok(writes[0].record.description.startsWith('Original enquiry'));
  assert.ok(writes[0].record.description.includes('gclid：unit-test-click'));
  const invalid=await module.exports.POST(new Request('https://besevent.com/api/contact',{method:'POST',body:JSON.stringify({...payload,phone:''})}));
  assert.equal(invalid.status,400);
  assert.equal(writes.length,1,'Invalid enquiry must not persist or produce a conversion');
});
