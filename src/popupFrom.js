'use strict';

import './popup.css';
import { LangCodes } from './langcodes';
import { FrancCodeToLangCode } from './langcodes';
import { franc, francAll } from 'franc';

console.debug('LangCodes:', LangCodes);
let userFromCode = null;

// 폼을 동적으로 생성
createForm().catch(console.error);

async function createForm() {
  const savedLang = await chrome.storage.sync.get('fromLang');
  userFromCode = savedLang.fromLang;

  let select = document.createElement('select');
  select.name = 'lang-from';
  select.id = 'lang-from';
  select.addEventListener('change', (event) => {
    handleSelect(event).catch(console.error);
  });

  for (const [key, value] of Object.entries(LangCodes)) {
    let option = document.createElement('option');

    if (key == 'xx') {
      option.value = 'AD';
      option.text = 'Auto Detect';
    } else {
      option.value = key;
      option.text = value;
    }

    // console.debug(key, fromCode);

    if (key == userFromCode) {
      option.selected = true;
      console.debug('selected one:', option);
    }
    select.appendChild(option);
  }

  let label = document.createElement('label');
  label.innerHTML = 'From ';
  label.htmlFor = 'langFrom';

  let form = document.getElementById('formFrom');
  form.appendChild(label).append(select);
}

async function handleSelect(event) {
  const selectEl = event.target;

  userFromCode = selectEl.value;
  console.debug('formCode', userFromCode);

  chrome.storage.sync.set({ fromLang: userFromCode });
}

async function onMouseUp(event) {
  var selectedText = window.getSelection().toString();
  console.debug('selectedText:', selectedText);

  if (selectedText.length < 1) {
    console.debug('selectedText is too short');
    return;
  }

  // 정확히 판정하려면 단어가 아닌 가능한 긴 문장으로 대응해야 한다.
  // minLengh를 안 걸면 일본어 판독이 안 되네?
  const francDetectLang = franc(selectedText, {
    minLength: 2,
    ignore: ['por', 'ekk'],
  });
  const autoFromCode = FrancCodeToLangCode[francDetectLang];
  console.debug('autoFromCode:', autoFromCode);
  console.debug('userFromCode:', userFromCode);

  chrome.runtime.sendMessage({
    message: 'updateContextMenu',
    autoFromCode: autoFromCode,
    userFromCode: userFromCode,
  });
}

// 'mouseup' timing is proper to get selected text
document.addEventListener('mouseup', onMouseUp, false);
