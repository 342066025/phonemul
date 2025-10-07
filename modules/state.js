import { PhoneSim_Config } from '../config.js';

let parentWindow;

export const PhoneSim_State = {
    isNavigating: false, // Prevents concurrent navigation actions
    isPanelVisible: false,
    panelPos: null,
    contacts: {},
    emails: [],
    moments: [],
    callLogs: [],
    forumData: {},
    liveCenterData: {},
    activeContactId: null,
    activeEmailId: null,
    activeProfileId: null,
    activeForumBoardId: null,
    activeForumPostId: null,
    activeLiveBoardId: null,
    activeLiveStreamId: null,
    activeLiveStreamData: null,
    activeReplyUid: null,
    worldDate: new Date(),
    worldTime: '12:00',
    customization: { isMuted: false, playerNickname: '我', enabled: true },
    stagedPlayerMessages: [],
    stagedPlayerActions: [],
    currentCharacter: null,
    availableCharacters: [],
    pendingFriendRequests: [],
    lastTotalUnread: 0,
    isVoiceCallActive: false,
    activeCallData: null,
    isPhoneCallActive: false,
    activePhoneCallData: null,
    isCallRecording: false,
    incomingCallData: null,
    currentView: 'HomeScreen',
    activeSubviews: {},
    browserHistory: [], // This is now officially the SESSION history for back/forward
    persistentBrowserHistory: [], // This is the full history log for the Library view
    browserData: {},
    browserDirectory: {},
    browserHistoryIndex: -1,
    isBrowserLoading: false,
    pendingBrowserAction: null,
    browserBookmarks: [],
    pendingAnimations: {},

    init: function(win) {
        parentWindow = win;
    },

    loadCustomization: function() {
        try {
            const saved = JSON.parse(parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CUSTOMIZATION) || '{}');
            const defaultCustomization = { isMuted: false, playerNickname: '我', enabled: true };
            this.customization = { ...defaultCustomization, ...this.customization, ...saved };
        } catch (e) {
            console.error('[Phone Sim] Failed to load customization state from localStorage:', e);
            this.customization = { isMuted: false, playerNickname: '我', enabled: true };
        }
    },

    saveCustomization: function() {
        try {
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CUSTOMIZATION, JSON.stringify(this.customization));
        } catch (er) {
            console.error('[Phone Sim] Failed to save customization to localStorage:', er);
        }
    },

    loadUiState: function(characterName = null) {
        try {
            const storageKey = characterName ? 
                `${PhoneSim_Config.STORAGE_KEY_UI}-${characterName}` : 
                PhoneSim_Config.STORAGE_KEY_UI;
            const s = JSON.parse(parentWindow.localStorage.getItem(storageKey) || '{}');
            // Selectively assign properties to avoid overwriting initialized objects
            const propertiesToLoad = [
                'isPanelVisible', 'panelPos', 'currentView', 'activeContactId', 
                'activeEmailId', 'activeProfileId', 'activeForumBoardId', 
                'activeForumPostId', 'activeLiveBoardId', 'activeLiveStreamId', 
                'activeSubviews'
            ];
            for (const prop of propertiesToLoad) {
                if (s[prop] !== undefined) {
                    this[prop] = s[prop];
                }
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to load UI state from localStorage:', e);
        }
    },
    saveUiState: function(characterName = null) {
        try {
            const stateToSave = { 
                isPanelVisible: this.isPanelVisible, 
                panelPos: this.panelPos,
                currentView: this.currentView,
                activeContactId: this.activeContactId,
                activeEmailId: this.activeEmailId,
                activeProfileId: this.activeProfileId,
                activeForumBoardId: this.activeForumBoardId,
                activeForumPostId: this.activeForumPostId,
                activeLiveBoardId: this.activeLiveBoardId,
                activeLiveStreamId: this.activeLiveStreamId,
                activeSubviews: this.activeSubviews
            };
            const storageKey = characterName ? 
                `${PhoneSim_Config.STORAGE_KEY_UI}-${characterName}` : 
                PhoneSim_Config.STORAGE_KEY_UI;
            parentWindow.localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (e) {
            console.error('[Phone Sim] Failed to save UI state to localStorage:', e);
        }
    },

    loadCurrentCharacter: function() {
        try {
            const saved = parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CURRENT_CHARACTER);
            if (saved) {
                this.currentCharacter = saved;
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to load current character from localStorage:', e);
        }
    },

    saveCurrentCharacter: function() {
        try {
            if (this.currentCharacter) {
                parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CURRENT_CHARACTER, this.currentCharacter);
            }
        } catch (e) {
            console.error('[Phone Sim] Failed to save current character to localStorage:', e);
        }
    },

    loadAvailableCharacters: function() {
        try {
            const saved = JSON.parse(parentWindow.localStorage.getItem(PhoneSim_Config.STORAGE_KEY_CHARACTER_LIST) || '[]');
            this.availableCharacters = saved;
        } catch (e) {
            console.error('[Phone Sim] Failed to load available characters from localStorage:', e);
            this.availableCharacters = [];
        }
    },

    saveAvailableCharacters: function() {
        try {
            parentWindow.localStorage.setItem(PhoneSim_Config.STORAGE_KEY_CHARACTER_LIST, JSON.stringify(this.availableCharacters));
        } catch (e) {
            console.error('[Phone Sim] Failed to save available characters to localStorage:', e);
        }
    },

    addCharacterToList: function(characterName) {
        if (!this.availableCharacters.includes(characterName)) {
            this.availableCharacters.push(characterName);
            this.saveAvailableCharacters();
        }
    },

    switchToCharacter: function(characterName) {
        // Save current character's UI state
        if (this.currentCharacter) {
            this.saveUiState(this.currentCharacter);
        }
        
        // Switch to new character
        this.currentCharacter = characterName;
        this.saveCurrentCharacter();
        
        // Load new character's UI state
        this.loadUiState(characterName);
        
        // Add to character list if not already present
        this.addCharacterToList(characterName);
    }
};
