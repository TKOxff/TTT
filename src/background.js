'use strict';

import { FrancCodeToLangCode } from './langcodes';

// 디버그용: popup.html 페이지 탭을 미리 열어 둔다.
// chrome.runtime.onInstalled.addListener(async () => {
//   let url = chrome.runtime.getURL('popup.html');
//   console.debug(`onInstalled url ${url}`);

//   let tab = await chrome.tabs.create({ url });
//   console.debug(`onInstalled tab ${tab.id}`);
// });

// 우클릭 팝업메뉴에 메뉴를 추가한다.
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
//
chrome.runtime.onInstalled.addListener(async () => {
  console.debug('onInstalled selection', ['selection']);

  // 우클릭 메뉴 아이템 추가
  chrome.contextMenus.create({
    id: 'Toss-To-Translator',
    title: 'Toss To Translator',
    type: 'normal',
    contexts: ['selection'],
  });
});

// Open a new search tab when the user clicks a context menu
// 오른쪽 메뉴팝업을 클릭하면, 새 탭을 열어 선택한 문자열을 번역 사이트에 넘긴다.
chrome.contextMenus.onClicked.addListener(clickTossMemu);

async function clickTossMemu(item, tab) {
  // console.log(item);
  // console.log(tab);

  const saved = await chrome.storage.sync.get('fromLang');
  const fromCode = saved.fromLang;
  console.debug(saved, fromCode);

  const savedTo = await chrome.storage.sync.get('toLang');
  const toCode = savedTo.toLang;
  console.debug(savedTo, toCode);

  if (fromCode == 'xx' || toCode == 'xx') {
    chrome.tabs.create({
      url: 'javascript:document.write("<h1>Toss To Translator</h1><h2>You need to choose [From, To] options first!</h2><h3>[From, To] options are in the TTT popup window.</h3>")',
      index: tab.index + 1,
    });
    return;
  }

  const sentence = encodeURI(item.selectionText);
  console.debug('item.selectionText', item.selectionText);

  let url = new URL(
    `https://papago.naver.com/?sk=${fromCode}&tk=${toCode}&hn=0&st=${sentence}`
  );
  console.debug('url:', url);

  chrome.tabs.create({ url: url.href, index: tab.index + 1 });
}
