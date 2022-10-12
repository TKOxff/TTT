'use strict';

import './popup.css';
import { LangCodes } from './langcodes';

console.log('LangCodes:', LangCodes);

// 폼을 동적으로 생성
createForm().catch(console.error);

async function createForm() {
  const savedLang = await chrome.storage.sync.get('fromLang');
  const selectedLang = savedLang.fromLang;

  let select = document.createElement('select');
  select.name = 'lang-from';
  select.id = 'lang-from';
  select.addEventListener('change', (event) => {
    handleSelect(event).catch(console.error);
  });

  for (const [key, value] of Object.entries(LangCodes)) {
    let option = document.createElement('option');
    option.value = key;
    option.text = value;
    console.log(key, selectedLang);
    if (key == selectedLang) {
      option.selected = true;
      console.log('selected one:', option);
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

  const fromLang = selectEl.value;
  console.log('fromLang', fromLang);

  chrome.storage.sync.set({ fromLang: fromLang });
}
