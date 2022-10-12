'use strict';

import { FrancCodeToLangCode } from './langcodes';

// 우클릭 팝업메뉴에 메뉴를 추가한다.
// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
//
chrome.runtime.onInstalled.addListener(async () => {
  console.log(['selection']);

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
chrome.contextMenus.onClicked.addListener((item, tab) => {
  chrome.storage.sync.get('toLang').then((data) => {
    // console.log(data);
    console.log('item.menuItemId', item.menuItemId);
    console.log('item.selectionText', item.selectionText);

    // const toLangCode = 'ko';
    const toLangCode = data.toLang;
    console.log('toLangCode:', toLangCode);

    const fromLang = 'ja';
    console.log('fromLang:', fromLang);

    const sentence = encodeURI(item.selectionText);
    console.log('sentence', sentence);

    let url = new URL(
      `https://papago.naver.com/?sk=${fromLang}&tk=${toLangCode}&hn=0&st=${sentence}`
    );
    console.log('url:', url);

    chrome.tabs.create({ url: url.href, index: tab.index + 1 });
  });
});
