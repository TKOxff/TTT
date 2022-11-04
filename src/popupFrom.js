'use strict';

import './popup.css';
import { LangCodes } from './langcodes';
import { FrancCodeToLangCode } from './langcodes';
import { franc, francAll } from 'franc';
//
// This popupFrom.js is only available in the popup.html.
//
console.debug('LangCodes:', LangCodes);
let userFromCode = null;

async function loadFromCode() {
  const saved = await chrome.storage.sync.get('fromLang');
  userFromCode = saved.fromLang;
  console.debug('loadFromCode userFromCode:', userFromCode, saved);
}

loadFromCode();

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

    if (key == 'none') {
      option.value = 'auto';
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

  chrome.runtime.sendMessage({
    message: 'changeFromLang',
    fromCode: userFromCode,
  });
}
