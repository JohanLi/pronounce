import {
  createPopper,
  Instance as PopperInstance, VirtualElement,
} from '@popperjs/core';

import { Pronunciations } from './lib/cambridgeDictionary';
import { Message, speed, Speed } from './iframe';

export type Position = { x: number; y: number };

/*
  Limitations that have been worked around:
  - Audio cannot be played in a service worker
  - DOMParser cannot be run in a service worker
  - Websites can have content security policies set — we're injecting an
    iframe to get around this issue. Otherwise, neither fetch nor audio
    can be used.
 */

/*
  For simplicity's sake, the entire tooltip and its wrapper is removed and
  remounted when looking up a new word. A smarter solution is to  update the
  tooltip position and content.
 */

let initialized = false;
let plugin: HTMLDivElement;
let tooltipContent: HTMLDivElement;
let popperInstance: PopperInstance;
let iframe: HTMLIFrameElement;
let tooltip: HTMLDivElement;

const Tooltip = {
  create: (position: Position) => new Promise<void>((resolve) => {
    const { x, y } = position;

    if (initialized) {
      Tooltip.remove();
    }

    initialized = true;

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

    const virtualElement = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: y,
        right: x,
        bottom: y,
        left: x,
      }),
    } as VirtualElement; // without casting, some additional properties that aren't used must be added

    popperInstance = createPopper(virtualElement, tooltip, {
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
        Tooltip.remove();
      }
    })

    iframe.onload = () => {
      resolve();
    };
  }),
  update: (position: Position, pronunciations: Pronunciations, onPlay: (src: string) => void) => {
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
      button.addEventListener('click', (e) => {
        if (!(e.target instanceof HTMLButtonElement)) {
          return;
        }

        onPlay(e.target.dataset.src)
      });
    });

    return popperInstance.update();
  },
  postMessage: (message: Message) => {
    // TODO figure out targetOrigin
    iframe.contentWindow.postMessage(message, '*');
  },
  getSpeed: () => {
    const value = tooltipContent.querySelector<HTMLInputElement>('input[name="speed"]:checked').value as unknown;

    if (!speed.find((s) => s === value)) {
      throw Error('Value is not one of the known speeds');
    }

    return value as Speed;
  },
  remove: () => {
    initialized = false;
    plugin.remove();
  },
}

export default Tooltip;
