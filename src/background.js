'use strict';

import { franc, francAll } from 'franc';
import { FrancCodeToLangCode } from './langcodes';

console.log('ENV:', process.env.NODE_ENV);

if (process.env.NODE_ENV == 'development') {
  // 디버그용: popup.html 페이지 탭을 미리 열어 둔다.
  chrome.runtime.onInstalled.addListener(async () => {
    let url = chrome.runtime.getURL('popup.html');
    console.debug(`onInstalled url ${url}`);

    let tab = await chrome.tabs.create({ url });
    console.debug(`onInstalled tab ${tab.id}`);
  });
}

const contextMenuId = 'Toss-To-Translator';
let toCode = '';

// 우클릭 팝업메뉴에 메뉴를 추가한다.
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
//
chrome.runtime.onInstalled.addListener(async () => {
  console.debug('onInstalled begin selection', ['selection']);

  const savedTo = await chrome.storage.sync.get('toLang');
  toCode = savedTo.toLang;
  console.debug('to', savedTo, toCode);

  const saved = await chrome.storage.sync.get('fromLang');
  const fromCode = saved.fromLang;
  console.debug('from', saved, fromCode);

  if (fromCode == undefined) {
    // default is 'Auto Detect'
    chrome.storage.sync.set({ fromLang: 'AD' });
  }
  console.log('selection', ['selection']);

  // 우클릭 메뉴 아이템 추가
  const menuId = chrome.contextMenus.create({
    id: contextMenuId,
    title: 'Toss To Translator',
    type: 'normal',
    contexts: ['selection'],
  });
  console.debug('onInstalled end menuId', menuId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message == 'updateContextMenu') {
    // update 후 바로 컨텐스트 메뉴가 없데이트 되지 않고
    // 2번째 우클릭에 반영되는 문제가 있다.. 때문에
    // popip.js 쪽에서 마우스업 타이밍에 미리 보내는 식으로 대응;
    chrome.contextMenus.update(contextMenuId, {
      title: 'Toss To Translator' + ` [${request.autoFromCode}-${toCode}]`,
    });
  } else {
    sendResponse({});
  }
});

// Open a new search tab when the user clicks a context menu
// 오른쪽 메뉴팝업을 클릭하면, 새 탭을 열어 선택한 문자열을 번역 사이트에 넘긴다.
chrome.contextMenus.onClicked.addListener(clickTossMemu);

async function clickTossMemu(item, tab) {
  const saved = await chrome.storage.sync.get('fromLang');
  let fromCode = saved.fromLang;
  console.debug('from', saved, fromCode);

  const savedTo = await chrome.storage.sync.get('toLang');
  const toCode = savedTo.toLang;
  console.debug('to', savedTo, toCode);

  if (toCode == 'xx' || toCode == undefined) {
    chrome.tabs.create({
      url: 'javascript:document.write("<h1>Toss To Translator</h1><h2>You need to choose [To] options first!</h2><h3>[To] options are in the TTT popup window.</h3>")',
      index: tab.index + 1,
    });
    return;
  }

  const sentence = encodeURI(item.selectionText);
  console.log('item.selectionText', item.selectionText);

  // TODO: 두번 판정하고 있다, 한번으로~
  if (fromCode == 'AD') {
    const francDetectLang = franc(item.selectionText, {
      minLength: 3,
      ignore: ['por', 'ekk'],
    });
    console.debug('franc ret:', francDetectLang);

    fromCode = FrancCodeToLangCode[francDetectLang];
    console.debug('franc ret:', fromCode);
  }

  let url = new URL(
    `https://papago.naver.com/?sk=${fromCode}&tk=${toCode}&hn=0&st=${sentence}`
  );
  console.debug('url:', url);

  chrome.tabs.create({ url: url.href, index: tab.index + 1 });
}
