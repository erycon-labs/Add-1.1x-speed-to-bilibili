// ==UserScript==
// @name         B站直播自动选择1080P原画清晰度
// @namespace    http://tampermonkey.net/
// @version      1.4.1
// @description  鼠标放在清晰度按钮上后，自动选择B站直播的1080P原画清晰度
// @author       none
// @match        *://live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// @run-at       document-idle
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/537861/B%E7%AB%99%E7%9B%B4%E6%92%AD%E8%87%AA%E5%8A%A8%E9%80%89%E6%8B%A91080P%E5%8E%9F%E7%94%BB%E6%B8%85%E6%99%B0%E5%BA%A6.user.js
// @updateURL https://update.greasyfork.org/scripts/537861/B%E7%AB%99%E7%9B%B4%E6%92%AD%E8%87%AA%E5%8A%A8%E9%80%89%E6%8B%A91080P%E5%8E%9F%E7%94%BB%E6%B8%85%E6%99%B0%E5%BA%A6.meta.js
// ==/UserScript==
(function() {
    'use strict';

    const MAX_ATTEMPTS = 60;
    const INTERVAL = 1000;
    let attempts = 0;
    let timerId = null; // 保存定时器ID，便于清除

    function selectHighestQuality() {
        // 修正：严格检查是否超过最大次数
        if (attempts >= MAX_ATTEMPTS) {
            console.log('达到最大尝试次数，停止');
            cleanup();
            return;
        }
        attempts++;
        try {
            let qualityOption = document.querySelector('.list-it.svelte-1n48lz1');
            if (!qualityOption) {
                const options = document.querySelectorAll('[class*="list-it"]');
                qualityOption = Array.from(options).find(el => el.textContent.includes('1080P'));
            }

            if (qualityOption && qualityOption.textContent.includes('1080P')) {
                qualityOption.click();
                console.log('已选择1080P清晰度');
                cleanup(); // 成功后清理
                return;
            }
        } catch (e) {
            console.error('清晰度选择出错:', e);
        }

        // 继续尝试
        timerId = setTimeout(selectHighestQuality, INTERVAL);
    }

    function cleanup() {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', cleanup);

    // 初始启动
    timerId = setTimeout(selectHighestQuality, 2000);
})();
