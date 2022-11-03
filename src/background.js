'use strict';

import { franc, francAll } from 'franc';
import { FrancCodeToLangCode } from './langcodes';

console.debug('ENV:', process.env.NODE_ENV);

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
let fromCode = '';

function getMenuTitle(from, to) {
  return `Toss To Translator [ ${from} → ${to} ]`;
}

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
  fromCode = saved.fromLang;
  console.debug('from', saved, fromCode);

  if (fromCode == undefined) {
    // default is 'Auto Detect'
    chrome.storage.sync.set({ fromLang: 'auto' });
    fromCode = 'auto';
  }
  console.log('selection', ['selection']);

  // let menuTitle = 'Toss To Translator';
  // if (fromCode == 'auto') {
  //   menuTitle += ' [auto]';
  // }

  // 우클릭 메뉴 아이템 추가
  const menuId = chrome.contextMenus.create({
    id: contextMenuId,
    title: getMenuTitle(fromCode, toCode),
    type: 'normal',
    contexts: ['selection'],
  });
  console.debug('onInstalled end menuId', menuId);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('onMessage', request, ' current:', fromCode, toCode);

  if (request.message == 'changeToLang') {
    chrome.contextMenus.update(contextMenuId, {
      title: getMenuTitle(fromCode, request.toCode),
    });
    toCode = request.toCode;
  } else if (request.message == 'changeFromLang') {
    chrome.contextMenus.update(contextMenuId, {
      title: getMenuTitle(request.fromCode, toCode),
    });
    fromCode = request.fromCode;
  } else {
    sendResponse({});
  }
});

// Open a new search tab when the user clicks a context menu
// 오른쪽 메뉴팝업을 클릭하면, 새 탭을 열어 선택한 문자열을 번역 사이트에 넘긴다.
chrome.contextMenus.onClicked.addListener(clickTossMemu);

async function clickTossMemu(item, tab) {
  const saved = await chrome.storage.sync.get('fromLang');
  fromCode = saved.fromLang;
  console.debug('from', saved, fromCode);

  const savedTo = await chrome.storage.sync.get('toLang');
  const toCode = savedTo.toLang;
  console.debug('to', savedTo, toCode);

  if (toCode == 'none' || toCode == undefined) {
    chrome.tabs.create({
      url: 'javascript:document.write("<h1>Toss To Translator</h1><h2>You need to choose [To] options first!</h2><h3>[To] options are in the TTT popup window.</h3>")',
      index: tab.index + 1,
    });
    return;
  }

  const sentence = encodeURI(item.selectionText);
  console.log('item.selectionText', item.selectionText);

  // TODO: 두번 판정하고 있다, 한번으로~
  if (fromCode == 'auto') {
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
