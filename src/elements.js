import { createPopper } from '@popperjs/core';

/*
  Limitations that have been worked around:
  - Audio cannot be played in a service worker
  - DOMParser cannot be run in a service worker
  - Websites can have content security policies set —  we're injecting an
    iframe to get around this issue. Otherwise, neither fetch nor audio
    can be used.
 */

let initialized = false;
let plugin;
let tooltipContent;
let popperInstance;
let popperVirtualElement;
let iframe;
let tooltip;

const Elements = {
  init: (position) => new Promise((resolve) => {
    const { x, y } = position;

    popperVirtualElement = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      }),
    };

    if (initialized) {
      popperInstance.update();
      resolve();
      return;
    }

    plugin = document.createElement('div');
    document.body.appendChild(plugin);

    tooltip = document.createElement('div');
    tooltip.id = 'tooltip';

    const arrow = document.createElement('div');
    arrow.id = 'arrow';
    arrow.setAttribute('data-popper-arrow', '');

    tooltipContent = document.createElement('div');
    tooltipContent.innerHTML = `
      Loading...
    `;

    tooltip.appendChild(arrow);
    tooltip.appendChild(tooltipContent);

    const tooltipStyle = document.createElement('style');

    tooltipStyle.textContent = `
      #tooltip {
        all: initial;
        display: inline-block;
        background: #fff;
        border-radius: 4px;
        font-family: ui-sans-serif, system-ui;
        font-size: 16px;
        padding: 8px;
        filter: drop-shadow(rgba(0, 0, 0, 0.2) 0 2px 10px);
      }
    
      #arrow,
      #arrow::before {
        position: absolute;
        width: 8px;
        height: 8px;
        background: inherit;
      }
      
      #arrow {
        visibility: hidden;
      }
      
      #arrow::before {
        visibility: visible;
        content: '';
        transform: rotate(45deg);
      }
      
      #tooltip[data-popper-placement^='top'] > #arrow {
        bottom: -4px;
      }
      
      #tooltip[data-popper-placement^='bottom'] > #arrow {
        top: -4px;
      }
      
      #tooltip[data-popper-placement^='left'] > #arrow {
        right: -4px;
      }
      
      #tooltip[data-popper-placement^='right'] > #arrow {
        left: -4px;
      }
    `;

    iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('iframe.html');
    iframe.allow = 'autoplay'; //  Audio won't play in Chrome unless a user has interacted with a page. https://developer.chrome.com/blog/autoplay/#iframe-delegation
    iframe.style.visibility = 'hidden';
    iframe.style.width = '0';
    iframe.style.height = '0';

    const shadow = plugin.attachShadow({ mode: 'open' });
    shadow.appendChild(tooltipStyle);
    shadow.appendChild(tooltip);
    shadow.appendChild(iframe);

    popperInstance = createPopper(popperVirtualElement, tooltip, {
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 20],
          },
        },
        {
          name: 'eventListeners',
          options: { scroll: false },
        },
      ],
    });

    document.addEventListener('click', (e) => {
      const clickOutside = !e.composedPath().includes(tooltip);

      if (clickOutside) {
        Elements.hide();
      }
    })

    iframe.onload = () => {
      resolve();
    };
  }),
  update: (position, pronunciations, onPlay) => {
    tooltipContent.innerHTML = `
      <div>
        <div style="display: flex">
          <div>
            US
            ${pronunciations.us.map((pronunciation) => `
              <div>
                <button type="button" data-src="${pronunciation.src}">Play</button>
                ${pronunciation.ipa}
              </div>
            `).join()}
          </div>
          <div>
            UK
            ${pronunciations.uk.map((pronunciation) => `
              <div>
                <button type="button" data-src="${pronunciation.src}">Play</button>
                ${pronunciation.ipa}
              </div>
            `).join()}
          </div>
        </div>
      <div>
        <label>
          <input type="radio" name="speed" value="normal" checked>
          Normal
        </label>
        <label>
          <input type="radio" name="speed" value="slow">
          Slow
        </label>
        </div>
      </div>
    `;

    const buttonNodes = tooltipContent.querySelectorAll('button');

    Array.from(buttonNodes).forEach((button) => {
      button.addEventListener('click', (e) => onPlay(e.target.dataset.src));
    });

    popperInstance.update();
  },
  postMessage: (data) => {
    // TODO figure out targetOrigin
    iframe.contentWindow.postMessage(data, '*');
  },
  getSpeed: () => {
    return tooltipContent.querySelector('input[name="speed"]:checked').value;
  },
  hide: () => {
    plugin.remove();
    initialized = false;
  },
}

export default Elements;
