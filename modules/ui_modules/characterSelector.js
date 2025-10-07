/**
 * 角色选择器模块
 * 处理多角色切换的UI逻辑
 * 
 * @module CharacterSelector
 * @description 提供角色选择和切换功能，支持数据隔离和状态管理
 * @version 1.0.0
 */

import { PhoneSim_State } from '../state.js';

// 全局API引用
let SillyTavern_Main_API, TavernHelper_API;

/**
 * 角色选择器对象
 * @namespace CharacterSelector
 */
const CharacterSelector = {
    /** @type {boolean} 下拉菜单是否打开 */
    isDropdownOpen: false,
    
    /**
     * 初始化角色选择器
     */
    init() {
        console.log('[CharacterSelector] 开始初始化角色选择器');
        try {
            // 初始化API引用
            const parentWin = typeof window.parent !== 'undefined' ? window.parent : window;
            SillyTavern_Main_API = parentWin.SillyTavern;
            TavernHelper_API = parentWin.TavernHelper;
            
            // 检查必要的API是否可用
            if (!SillyTavern_Main_API) {
                console.warn('[CharacterSelector] SillyTavern API 不可用');
            }
            
            this.bindEvents();
            this.loadCharacterList();
            this.updateCurrentCharacterDisplay();
            console.log('[CharacterSelector] 角色选择器初始化完成');
        } catch (error) {
            console.error('[CharacterSelector] 初始化失败:', error);
        }
    },
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        try {
            const currentCharacterDisplay = document.getElementById('current-character-display');
            const characterDropdown = document.getElementById('character-dropdown');
            
            // 点击当前角色显示区域切换下拉菜单
            if (currentCharacterDisplay) {
                currentCharacterDisplay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown();
                });
            } else {
                console.warn('[CharacterSelector] 未找到 current-character-display 元素');
            }
            
            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.character-selector')) {
                    this.closeDropdown();
                }
            });
            
            // 阻止下拉菜单内部点击事件冒泡
            if (characterDropdown) {
                characterDropdown.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            } else {
                console.warn('[CharacterSelector] 未找到 character-dropdown 元素');
            }
        } catch (error) {
            console.error('[CharacterSelector] 绑定事件失败:', error);
        }
    },
    
    /**
     * 切换下拉菜单显示状态
     */
    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    },
    
    /**
     * 打开下拉菜单
     */
    openDropdown() {
        const dropdown = document.getElementById('character-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
            this.isDropdownOpen = true;
            this.loadCharacterList(); // 每次打开时刷新角色列表
        }
    },
    
    /**
     * 关闭下拉菜单
     */
    closeDropdown() {
        const dropdown = document.getElementById('character-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.isDropdownOpen = false;
        }
    },
    
    /**
     * 加载角色列表
     * @function loadCharacterList
     * @description 从状态管理器加载并显示所有可用角色
     */
    loadCharacterList() {
        try {
            console.log('[CharacterSelector] 开始加载角色列表');
            
            // 直接从状态管理器获取角色列表
            const characters = PhoneSim_State.availableCharacters || [];
            console.log('[CharacterSelector] 获取到角色:', characters);
            
            // 获取当前角色
            const currentCharacter = PhoneSim_State.currentCharacter || null;
            
            // 渲染角色列表
            this.renderCharacterList(characters, currentCharacter);
            
            console.log('[CharacterSelector] 角色列表加载完成');
        } catch (error) {
            console.error('[CharacterSelector] 加载角色列表失败:', error);
            
            // 显示错误状态
            const characterList = document.getElementById('character-list');
            if (characterList) {
                characterList.innerHTML = `
                    <div class="character-item error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>加载角色列表失败</span>
                    </div>
                `;
            }
        }
    },
    
    /**
     * 添加新角色
     * @function addCharacter
     * @param {string} characterName - 角色名称
     * @returns {boolean} 是否添加成功
     * @description 手动添加新角色到列表中
     */
    addCharacter(characterName) {
        try {
            if (!characterName || !characterName.trim()) {
                console.warn('[CharacterSelector] 角色名称不能为空');
                return false;
            }
            
            const name = characterName.trim();
            
            // 检查是否已存在
            if (PhoneSim_State.availableCharacters.includes(name)) {
                console.warn('[CharacterSelector] 角色已存在:', name);
                return false;
            }
            
            // 添加到列表
            PhoneSim_State.availableCharacters.push(name);
            PhoneSim_State.saveAvailableCharacters();
            
            console.log('[CharacterSelector] 成功添加角色:', name);
            return true;
        } catch (error) {
            console.error('[CharacterSelector] 添加角色失败:', error);
            return false;
        }
    },

    /**
     * 删除角色
     * @function removeCharacter
     * @param {string} characterName - 角色名称
     * @returns {boolean} 是否删除成功
     * @description 从列表中删除角色并清理其数据
     */
    removeCharacter(characterName) {
        try {
            console.log('[CharacterSelector] 开始删除角色:', characterName);
            console.log('[CharacterSelector] 当前可用角色列表:', PhoneSim_State.availableCharacters);
            
            if (!characterName || typeof characterName !== 'string') {
                console.error('[CharacterSelector] 无效的角色名称:', characterName);
                return false;
            }
            
            const name = characterName.trim();
            console.log('[CharacterSelector] 处理后的角色名称:', `"${name}"`);
            
            // 检查PhoneSim_State.availableCharacters是否为数组
            if (!Array.isArray(PhoneSim_State.availableCharacters)) {
                console.error('[CharacterSelector] availableCharacters不是数组:', typeof PhoneSim_State.availableCharacters, PhoneSim_State.availableCharacters);
                PhoneSim_State.availableCharacters = [];
                return false;
            }
            
            // 检查数组中每个元素的类型和值
            PhoneSim_State.availableCharacters.forEach((char, idx) => {
                console.log(`[CharacterSelector] 索引${idx}:`, typeof char, char);
                
                let charName;
                if (typeof char === 'string') {
                    charName = char;
                } else if (typeof char === 'object' && char !== null && char.name) {
                    charName = char.name;
                } else {
                    console.warn(`[CharacterSelector] 索引${idx} 无效数据格式`);
                    return;
                }
                
                console.log(`[CharacterSelector] 索引${idx} 角色名称: "${charName}"`);
                console.log(`[CharacterSelector] 索引${idx} 长度:`, charName.length, '字符编码:', [...charName].map(c => c.charCodeAt(0)));
                console.log(`[CharacterSelector] 索引${idx} 与目标比较:`, charName === name, charName.trim() === name.trim());
            });
            
            console.log(`[CharacterSelector] 目标角色 "${name}" 长度:`, name.length, '字符编码:', [...name].map(c => c.charCodeAt(0)));
            
            // 使用findIndex进行更灵活的查找，支持字符串和对象格式
            const index = PhoneSim_State.availableCharacters.findIndex(char => {
                let charStr;
                
                // 处理不同的数据格式
                if (typeof char === 'string') {
                    charStr = char.trim();
                } else if (typeof char === 'object' && char !== null && char.name) {
                    charStr = char.name.trim();
                    console.log('[CharacterSelector] 处理对象格式角色:', char);
                } else {
                    console.warn('[CharacterSelector] 发现无效的角色数据:', typeof char, char);
                    return false;
                }
                
                const nameStr = name.trim();
                
                console.log(`[CharacterSelector] 比较 "${charStr}" 与 "${nameStr}"`);
                
                // 精确匹配
                if (charStr === nameStr) {
                    console.log('[CharacterSelector] 精确匹配成功');
                    return true;
                }
                
                // 去除所有空白字符后匹配
                const charNoSpace = charStr.replace(/\s+/g, '');
                const nameNoSpace = nameStr.replace(/\s+/g, '');
                if (charNoSpace === nameNoSpace) {
                    console.log('[CharacterSelector] 去空格匹配成功');
                    return true;
                }
                
                // 包含匹配
                if (charStr.includes(nameStr) || nameStr.includes(charStr)) {
                    console.log('[CharacterSelector] 包含匹配成功');
                    return true;
                }
                
                return false;
            });
            
            console.log('[CharacterSelector] 查找结果索引:', index);
            
            if (index === -1) {
                console.warn('[CharacterSelector] 角色不存在:', name);
                return false;
            }
            
            // 从列表中移除
            const removedCharacter = PhoneSim_State.availableCharacters[index];
            console.log('[CharacterSelector] 即将删除的角色:', removedCharacter);
            
            PhoneSim_State.availableCharacters.splice(index, 1);
            console.log('[CharacterSelector] 删除后的角色列表:', PhoneSim_State.availableCharacters);
            
            // 保存更新后的列表
            console.log('[CharacterSelector] 开始保存角色列表...');
            PhoneSim_State.saveAvailableCharacters();
            console.log('[CharacterSelector] 角色列表保存完成');
            
            // 清理角色数据
            console.log('[CharacterSelector] 开始清理角色数据...');
            this.clearCharacterData(name);
            console.log('[CharacterSelector] 角色数据清理完成');
            
            // 如果删除的是当前角色，切换到第一个可用角色或清空
            if (PhoneSim_State.currentCharacter === name || PhoneSim_State.currentCharacter === removedCharacter) {
                console.log('[CharacterSelector] 删除的是当前角色，需要切换...');
                if (PhoneSim_State.availableCharacters.length > 0) {
                    console.log('[CharacterSelector] 切换到第一个可用角色:', PhoneSim_State.availableCharacters[0]);
                    this.switchCharacter(PhoneSim_State.availableCharacters[0]);
                } else {
                    console.log('[CharacterSelector] 没有可用角色，清空当前角色');
                    PhoneSim_State.currentCharacter = null;
                    PhoneSim_State.saveCurrentCharacter();
                }
            }
            
            console.log('[CharacterSelector] 成功删除角色:', name);
            return true;
        } catch (error) {
            console.error('[CharacterSelector] 删除角色失败:', error);
            console.error('[CharacterSelector] 错误堆栈:', error.stack);
            console.error('[CharacterSelector] 错误详情:', {
                name: error.name,
                message: error.message,
                characterName: characterName,
                availableCharacters: PhoneSim_State.availableCharacters
            });
            return false;
        }
    },

    /**
     * 清理角色数据
     * @function clearCharacterData
     * @param {string} characterName - 角色名称
     * @description 清理指定角色的所有存储数据
     */
    clearCharacterData(characterName) {
        try {
            const keys = [
                `phoneSimState_${characterName}`,
                `phoneSimContacts_${characterName}`,
                `phoneSimEmails_${characterName}`,
                `phoneSimMoments_${characterName}`,
                `phoneSimCallLogs_${characterName}`,
                `phoneSimForumData_${characterName}`,
                `phoneSimLiveCenterData_${characterName}`,
                `phoneSimBrowserData_${characterName}`,
                `phoneSimBrowserHistory_${characterName}`
            ];
            
            keys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log('[CharacterSelector] 已清理角色数据:', characterName);
        } catch (error) {
            console.error('[CharacterSelector] 清理角色数据失败:', error);
        }
    },


    
    /**
     * 渲染角色列表
     */
    renderCharacterList(characters, currentCharacter) {
        console.log('[CharacterSelector] 开始渲染角色列表，角色数量:', characters.length);
        try {
            const characterList = document.getElementById('character-list');
            if (!characterList) {
                console.error('[CharacterSelector] 未找到 character-list 元素');
                return;
            }
            
            // 验证输入参数
            if (!Array.isArray(characters)) {
                console.warn('[CharacterSelector] characters 参数不是数组');
                return;
            }
            
            characterList.innerHTML = '';
            
            // 添加角色管理按钮
            const addButton = document.createElement('div');
            addButton.className = 'character-item add-character';
            addButton.innerHTML = '<i class="fas fa-plus"></i><span>添加角色</span>';
            addButton.addEventListener('click', () => {
                this.showAddCharacterDialog();
            });
            characterList.appendChild(addButton);
            
            if (characters.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.className = 'character-item empty';
                emptyItem.innerHTML = '<i class="fas fa-info-circle"></i><span>点击上方添加角色</span>';
                characterList.appendChild(emptyItem);
                console.log('[CharacterSelector] 显示空状态');
                return;
            }
            
            characters.forEach(character => {
                const characterName = typeof character === 'string' ? character : character.name;
                if (!characterName) {
                    console.warn('[CharacterSelector] 跳过无效角色:', character);
                    return;
                }
                
                const item = document.createElement('div');
                item.className = 'character-item';
                if (characterName === currentCharacter) {
                    item.classList.add('current');
                }
                
                // 角色图标和名称
                const icon = document.createElement('i');
                icon.className = 'fas fa-user';
                
                const span = document.createElement('span');
                span.textContent = characterName;
                
                // 删除按钮
                const deleteBtn = document.createElement('i');
                deleteBtn.className = 'fas fa-times delete-character';
                deleteBtn.title = '删除角色';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showDeleteCharacterDialog(characterName);
                });
                
                item.appendChild(icon);
                item.appendChild(span);
                item.appendChild(deleteBtn);
                
                item.addEventListener('click', () => {
                    this.switchCharacter(characterName);
                });
                
                characterList.appendChild(item);
                console.log('[CharacterSelector] 渲染角色项:', characterName);
            });
            
            console.log('[CharacterSelector] 角色列表渲染完成');
        } catch (error) {
            console.error('[CharacterSelector] 渲染角色列表失败:', error);
        }
    },

    /**
     * 显示添加角色对话框
     */
    showAddCharacterDialog() {
        const name = prompt('请输入角色名称:');
        if (name && name.trim()) {
            if (this.addCharacter(name.trim())) {
                this.loadCharacterList();
                alert('角色添加成功！');
            } else {
                alert('角色添加失败，可能已存在同名角色。');
            }
        }
    },

    /**
     * 显示删除角色确认对话框
     */
    showDeleteCharacterDialog(characterName) {
        console.log('[CharacterSelector] 显示删除对话框，角色:', characterName);
        
        if (!characterName) {
            console.error('[CharacterSelector] 删除对话框：角色名称为空');
            alert('错误：角色名称无效！');
            return;
        }
        
        const confirmMessage = `确定要删除角色 "${characterName}" 吗？\n\n注意：这将删除该角色的所有数据，且无法恢复！`;
        
        if (confirm(confirmMessage)) {
            console.log('[CharacterSelector] 用户确认删除角色:', characterName);
            
            try {
                const deleteResult = this.removeCharacter(characterName);
                console.log('[CharacterSelector] 删除结果:', deleteResult);
                
                if (deleteResult) {
                    // 重新加载角色列表和更新显示
                    this.loadCharacterList();
                    this.updateCurrentCharacterDisplay();
                    
                    console.log('[CharacterSelector] 角色删除成功，UI已更新');
                    alert('角色删除成功！');
                } else {
                    console.error('[CharacterSelector] 角色删除失败');
                    alert('角色删除失败！请检查控制台获取详细信息。');
                }
            } catch (error) {
                console.error('[CharacterSelector] 删除过程中发生错误:', error);
                alert('删除过程中发生错误！请检查控制台获取详细信息。');
            }
        } else {
            console.log('[CharacterSelector] 用户取消删除操作');
        }
    },
    
    /**
     * 切换角色
     * @async
     * @function switchCharacter
     * @param {string} characterName - 要切换到的角色名称
     * @returns {Promise<void>}
     * @description 保存当前角色状态，切换到新角色，加载新角色数据
     */
    async switchCharacter(characterName) {
        try {
            // 如果是当前角色，直接返回
            if (PhoneSim_State.currentCharacter === characterName) {
                this.closeDropdown();
                return;
            }
            
            console.log(`[CharacterSelector] 开始切换角色: ${PhoneSim_State.currentCharacter} → ${characterName}`);
            
            // 保存当前状态
            await this.saveCurrentCharacterState();
            
            // 切换到新角色
            await PhoneSim_State.switchToCharacter(characterName);
            
            // 清除数据缓存，强制重新加载
            if (window.PhoneSim_DataHandler && window.PhoneSim_DataHandler.clearLorebookCache) {
                window.PhoneSim_DataHandler.clearLorebookCache();
            }
            
            // 更新UI显示
            this.updateCurrentCharacterDisplay();
            
            // 重新加载数据
            await this.loadCharacterData();
            
            // 添加短暂延迟，确保数据加载完成
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 强制重新渲染所有UI组件
            if (window.PhoneSim_UI) {
                console.log('[CharacterSelector] 强制重新渲染UI...');
                
                // 强制重新渲染当前视图
                if (window.PhoneSim_UI.rerenderCurrentView) {
                    window.PhoneSim_UI.rerenderCurrentView({ 
                        forceRerender: true,
                        chatUpdated: true,
                        emailUpdated: true,
                        momentsUpdated: true,
                        profileUpdated: true,
                        browserUpdated: true,
                        forumUpdated: true,
                        liveCenterUpdated: true
                    });
                }
                
                // 特别重新渲染关键组件
                setTimeout(() => {
                    if (window.PhoneSim_UI.renderContacts) {
                        window.PhoneSim_UI.renderContacts();
                    }
                    if (window.PhoneSim_UI.renderContactsList) {
                        window.PhoneSim_UI.renderContactsList();
                    }
                    if (window.PhoneSim_UI.renderHomeScreen) {
                        window.PhoneSim_UI.renderHomeScreen();
                    }
                    if (window.PhoneSim_UI.updateGlobalUnreadCounts) {
                        window.PhoneSim_UI.updateGlobalUnreadCounts();
                    }
                }, 50);
            }
            
            // 关闭下拉菜单
            this.closeDropdown();
            
            console.info(`[CharacterSelector] 已切换到角色: ${characterName}`);
        } catch (error) {
            console.error('切换角色失败:', error);
        }
    },
    
    /**
     * 保存当前角色状态
     */
    async saveCurrentCharacterState() {
        try {
            if (PhoneSim_State?.currentCharacter) {
                // 保存UI状态
                PhoneSim_State.saveUiState(PhoneSim_State.currentCharacter);
                
                // 这里可以添加保存其他状态的逻辑
            }
        } catch (error) {
            console.warn('[CharacterSelector] 保存角色状态失败:', error);
        }
    },
    
    /**
     * 加载角色数据
     */
    async loadCharacterData() {
        try {
            console.log('[CharacterSelector] 开始加载角色数据...');
            
            // 清除所有缓存数据
            PhoneSim_State.contacts = {};
            PhoneSim_State.emails = [];
            PhoneSim_State.moments = [];
            PhoneSim_State.callLogs = [];
            PhoneSim_State.forumData = {};
            PhoneSim_State.liveCenterData = {};
            
            // 重置活动状态
            PhoneSim_State.activeContactId = null;
            PhoneSim_State.activeEmailId = null;
            PhoneSim_State.activeProfileId = null;
            PhoneSim_State.activeForumBoardId = null;
            PhoneSim_State.activeForumPostId = null;
            PhoneSim_State.activeLiveBoardId = null;
            PhoneSim_State.activeLiveStreamId = null;
            
            // 加载UI状态
            if (PhoneSim_State?.currentCharacter) {
                PhoneSim_State.loadUiState(PhoneSim_State.currentCharacter);
            }
            
            // 清除数据处理器缓存
            if (window.PhoneSim_DataHandler) {
                if (window.PhoneSim_DataHandler.clearLorebookCache) {
                    window.PhoneSim_DataHandler.clearLorebookCache();
                }
                if (window.PhoneSim_DataHandler.clearAllCaches) {
                    window.PhoneSim_DataHandler.clearAllCaches();
                }
            }
            
            // 重新获取所有数据
            if (window.PhoneSim_DataHandler && window.PhoneSim_DataHandler.fetchAllData) {
                console.log('[CharacterSelector] 重新获取所有数据...');
                await window.PhoneSim_DataHandler.fetchAllData();
            }
            
            // 强制重新渲染UI
            if (window.PhoneSim_UI) {
                console.log('[CharacterSelector] 重新渲染UI...');
                
                // 先尝试完全重新渲染
                if (window.PhoneSim_UI.renderAll) {
                    window.PhoneSim_UI.renderAll();
                }
                
                // 然后强制重新渲染当前视图
                if (window.PhoneSim_UI.rerenderCurrentView) {
                    window.PhoneSim_UI.rerenderCurrentView({ forceRerender: true });
                }
                
                // 特别重新渲染聊天和联系人
                if (window.PhoneSim_UI.renderContacts) {
                    window.PhoneSim_UI.renderContacts();
                }
                if (window.PhoneSim_UI.renderChat) {
                    window.PhoneSim_UI.renderChat();
                }
                if (window.PhoneSim_UI.renderHomeScreen) {
                    window.PhoneSim_UI.renderHomeScreen();
                }
            }
            
            console.log('[CharacterSelector] 角色数据加载完成');
        } catch (error) {
            console.error('加载角色数据失败:', error);
        }
    },
    
    /**
     * 更新当前角色显示
     */
    updateCurrentCharacterDisplay() {
        try {
            const currentCharacterDisplay = document.getElementById('current-character-display');
            if (!currentCharacterDisplay) {
                console.warn('[CharacterSelector] 未找到 current-character-display 元素');
                return;
            }
            
            const currentCharacter = PhoneSim_State?.currentCharacter;
            if (currentCharacter) {
                currentCharacterDisplay.textContent = currentCharacter;
            } else {
                currentCharacterDisplay.textContent = '未选择角色';
                console.warn('[CharacterSelector] 当前角色未设置');
            }
        } catch (error) {
            console.error('[CharacterSelector] 更新角色显示失败:', error);
        }
    }
};

// 导出模块
export { CharacterSelector };