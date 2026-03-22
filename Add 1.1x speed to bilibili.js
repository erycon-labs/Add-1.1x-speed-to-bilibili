
// ==UserScript==
// @name         b站增加1.1倍速
// @namespace    https://github.com/Penguin-Killer
// @version      0.4.0
// @description  将0.75倍速修改为1.1倍速
// @author       Penguin-Killer
// @match        *://*.bilibili.com/video/*
// @match        *://*.bilibili.com/list/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bilibili.com
// @grant        none
// @license      MIT

// @downloadURL https://update.greasyfork.org/scripts/494155/b%E7%AB%99%E5%A2%9E%E5%8A%A011%E5%80%8D%E9%80%9F.user.js
// @updateURL https://update.greasyfork.org/scripts/494155/b%E7%AB%99%E5%A2%9E%E5%8A%A011%E5%80%8D%E9%80%9F.meta.js
// ==/UserScript==

/*
***********************************************************
如果不想自动使用1.1倍速，可以将第30行 “element.click();” 注释掉
***********************************************************
*/
(function() {
    'use strict';

    // 配置选项
    const CONFIG = {
        targetSelector: '.bpx-player-ctrl-playbackrate-menu-item[data-value="0.75"]',
        newSpeedText: '1.1x',
        newSpeedValue: '1.1',
        checkInterval: 800, // 检测间隔缩短
        maxAttempts: 30,// 增加尝试次数
        autoClick: true// 自动点击开关
    };

    /**
     * 检查并修改元素
     */
    function checkAndModifyElement() {
        const element = document.querySelector(CONFIG.targetSelector);

        if (element) {
            // 保存原始值用于后续恢复
            if (!element.dataset.originalText) {
                element.dataset.originalText = element.textContent;
                element.dataset.originalValue = element.getAttribute('data-value');
            }

            // 修改元素
            element.textContent = CONFIG.newSpeedText;
            element.setAttribute('data-value', CONFIG.newSpeedValue);

            console.log(`✓ ${CONFIG.newSpeedValue}倍速修改成功！`);

            // 如果启用自动点击，则触发点击事件
            if (CONFIG.autoClick) {
                element.click();
                console.log(`✓ 已自动切换到${CONFIG.newSpeedText}`);
            }

            return true;
        }

        return false;
    }

    /**
     * 延迟执行函数
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 异步检测循环
     */
    async function startAsyncChecking() {
        let attempts = 0;

        while (attempts < CONFIG.maxAttempts) {
            attempts++;

            if (checkAndModifyElement()) {
                console.log('✓ 目标元素已成功修改，停止检测');
                return;
            }

            console.log(`⏳ 第${attempts}次检测未找到元素，等待下一次检查...`);
            await delay(CONFIG.checkInterval);
        }

        console.log(`⚠ 达到最大尝试次数(${CONFIG.maxAttempts})，停止检测`);
    }

    /**
     * MutationObserver 监听DOM变化
     */
    function observeDomChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // 检查新增的节点
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查新增节点本身
                        if (node.matches && node.matches(CONFIG.targetSelector)) {
                            console.log('🔍 在新增节点中发现目标元素');
                            checkAndModifyElement();
                        }

                        // 检查新增节点的子节点
                        const targetInAddedNode = node.querySelector && node.querySelector(CONFIG.targetSelector);
                        if (targetInAddedNode) {
                            console.log('🔍 在新增节点的子节点中发现目标元素');
                            checkAndModifyElement();
                        }
                    }
                });

                // 如果属性发生变化，也重新检查
                if (mutation.type === 'attributes') {
                    checkAndModifyElement();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-value']
        });

        return observer;
    }

    /**
     * 主启动函数
     */
    function initializeScript() {
        console.log('🚀 B站播放速度优化脚本启动');
        console.log(`📋 配置: ${CONFIG.newSpeedValue}倍速, 检测间隔${CONFIG.checkInterval}ms, 最大尝试${CONFIG.maxAttempts}次`);

        // 启动异步检测
        startAsyncChecking();

        // 启动DOM观察器
        const domObserver = observeDomChanges();

        // 页面可见性改变时重新检测
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('🔄 页面重新获得焦点，启动快速检测');
                // 页面重新可见时立即检测一次
                setTimeout(checkAndModifyElement, 500);
            }
        });

        // 页面完全加载后再检测一次
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(checkAndModifyElement, 1000);
            });
        } else {
            setTimeout(checkAndModifyElement, 1000);
        }

        // 导出配置以便调试
        window.BilibiliSpeedConfig = CONFIG;
    }

    // 初始化脚本
    initializeScript();

    // 添加清理函数到全局作用域
    window.cleanupBilibiliSpeedScript = function() {
        console.log('🧹 清理B站播放速度脚本');
        // 这里可以添加清理逻辑
    };

})();
