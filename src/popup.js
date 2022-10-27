'use strict';

import './popup.css';
import { LangCodes } from './langcodes';

console.debug('LangCodes:', LangCodes);

// 폼을 동적으로 생성
createForm().catch(console.error);

async function createForm() {
  const saved = await chrome.storage.sync.get('toLang');
  const toLang = saved.toLang;

  let select = document.createElement('select');
  select.name = 'languages';
  select.id = 'languages';
  select.addEventListener('change', (event) => {
    handleSelect(event).catch(console.error);
  });

  for (const [key, value] of Object.entries(LangCodes)) {
    let option = document.createElement('option');
    option.value = key;
    option.text = value;
    // console.debug(key, toLang);

    if (key == toLang) {
      option.selected = true;
      console.debug('selected one:', option);
    }
    select.appendChild(option);
  }

  let label = document.createElement('label');
  label.innerHTML = 'To ';
  label.htmlFor = 'languages';

  let form = document.getElementById('form');
  form.appendChild(label).append(select);
}

async function handleSelect(event) {
  const selectEl = event.target;
  const toLang = selectEl.value;
  console.debug('toLang', toLang);

  chrome.storage.sync.set({ toLang: toLang });
}
