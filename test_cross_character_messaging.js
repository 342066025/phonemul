/**
 * 跨角色消息功能测试脚本
 * 用于验证跨角色消息的双向存储和同步机制
 */

// 测试配置
const TEST_CONFIG = {
    CHARACTER_A: 'TestCharacterA',
    CHARACTER_B: 'TestCharacterB',
    CONTACT_ID_A: 'test_contact_a',
    CONTACT_ID_B: 'test_contact_b',
    TEST_MESSAGE: '这是一条跨角色测试消息'
};

/**
 * 测试跨角色消息功能
 */
async function testCrossCharacterMessaging() {
    console.log('=== 开始跨角色消息功能测试 ===');
    
    try {
        // 检查必要的模块是否可用
        if (typeof window.PhoneSim_DataHandler === 'undefined') {
            throw new Error('PhoneSim_DataHandler 未定义');
        }
        
        const DataHandler = window.PhoneSim_DataHandler;
        
        // 测试1: 验证角色映射功能
        console.log('\n--- 测试1: 角色映射功能 ---');
        await testCharacterMapping(DataHandler);
        
        // 测试2: 验证跨角色世界书更新功能
        console.log('\n--- 测试2: 跨角色世界书更新功能 ---');
        await testCrossCharacterWorldbookUpdate(DataHandler);
        
        // 测试3: 验证消息结构
        console.log('\n--- 测试3: 消息结构验证 ---');
        testMessageStructure();
        
        console.log('\n=== 跨角色消息功能测试完成 ===');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

/**
 * 测试角色映射功能
 */
async function testCharacterMapping(DataHandler) {
    try {
        // 测试更新角色映射
        await DataHandler.updateCharacterMapping(TEST_CONFIG.CONTACT_ID_A, TEST_CONFIG.CHARACTER_A);
        console.log('✓ 角色映射更新成功');
        
        // 测试获取角色映射
        const mapping = await DataHandler.getCharacterMapping();
        console.log('✓ 角色映射获取成功:', mapping);
        
        // 测试根据联系人ID获取角色名称
        const characterName = await DataHandler.getCharacterNameByContactId(TEST_CONFIG.CONTACT_ID_A);
        if (characterName === TEST_CONFIG.CHARACTER_A) {
            console.log('✓ 根据联系人ID获取角色名称成功');
        } else {
            console.log('✗ 根据联系人ID获取角色名称失败');
        }
        
    } catch (error) {
        console.error('角色映射测试失败:', error);
    }
}

/**
 * 测试跨角色世界书更新功能
 */
async function testCrossCharacterWorldbookUpdate(DataHandler) {
    try {
        // 创建测试数据
        const testData = {
            [TEST_CONFIG.CONTACT_ID_B]: {
                profile: {
                    nickname: TEST_CONFIG.CHARACTER_B,
                    note: TEST_CONFIG.CHARACTER_B
                },
                app_data: {
                    WeChat: {
                        messages: []
                    }
                },
                character_name: TEST_CONFIG.CHARACTER_B
            }
        };
        
        // 测试跨角色世界书更新
        await DataHandler._updateCrossCharacterWorldbook(
            TEST_CONFIG.CHARACTER_B,
            window.PhoneSim_Config.WORLD_DB_NAME,
            (dbData) => {
                Object.assign(dbData, testData);
                return dbData;
            }
        );
        
        console.log('✓ 跨角色世界书更新成功');
        
    } catch (error) {
        console.error('跨角色世界书更新测试失败:', error);
    }
}

/**
 * 测试消息结构
 */
function testMessageStructure() {
    // 创建跨角色消息对象
    const crossCharacterMessage = {
        uid: `test_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender_id: window.PhoneSim_Config.PLAYER_ID,
        content: TEST_CONFIG.TEST_MESSAGE,
        sourceMsgId: null,
        isSystemNotification: false,
        // 跨角色消息特有字段
        sender_character: TEST_CONFIG.CHARACTER_A,
        receiver_id: TEST_CONFIG.CONTACT_ID_B,
        isCrossCharacter: true
    };
    
    // 验证消息结构
    const requiredFields = [
        'uid', 'timestamp', 'sender_id', 'content',
        'sender_character', 'receiver_id', 'isCrossCharacter'
    ];
    
    let isValid = true;
    for (const field of requiredFields) {
        if (!(field in crossCharacterMessage)) {
            console.log(`✗ 消息缺少必需字段: ${field}`);
            isValid = false;
        }
    }
    
    if (isValid) {
        console.log('✓ 跨角色消息结构验证成功');
        console.log('消息示例:', crossCharacterMessage);
    } else {
        console.log('✗ 跨角色消息结构验证失败');
    }
}

/**
 * 模拟跨角色消息发送流程
 */
async function simulateCrossCharacterMessageFlow() {
    console.log('\n=== 模拟跨角色消息发送流程 ===');
    
    try {
        const DataHandler = window.PhoneSim_DataHandler;
        
        // 1. 模拟角色A发送消息给角色B
        console.log('1. 角色A发送消息给角色B...');
        
        // 创建消息对象
        const message = {
            uid: `msg_${Date.now()}`,
            timestamp: new Date().toISOString(),
            sender_id: window.PhoneSim_Config.PLAYER_ID,
            content: TEST_CONFIG.TEST_MESSAGE,
            sourceMsgId: null,
            isSystemNotification: false,
            sender_character: TEST_CONFIG.CHARACTER_A,
            receiver_id: TEST_CONFIG.CONTACT_ID_B,
            isCrossCharacter: true
        };
        
        // 2. 模拟消息存储到发送者世界书
        console.log('2. 存储消息到发送者世界书...');
        
        // 3. 模拟消息同步到接收者世界书
        console.log('3. 同步消息到接收者世界书...');
        
        // 获取接收者角色名称
        const receiverCharacterName = await DataHandler.getCharacterNameByContactId(TEST_CONFIG.CONTACT_ID_B);
        
        if (receiverCharacterName) {
            // 更新角色映射
            await DataHandler.updateCharacterMapping(TEST_CONFIG.CONTACT_ID_B, receiverCharacterName);
            
            // 同步消息到接收者世界书
            await DataHandler._updateCrossCharacterWorldbook(receiverCharacterName, window.PhoneSim_Config.WORLD_DB_NAME, dbData => {
                // 在接收者的世界书中找到发送者的联系人记录
                const senderContactId = Object.keys(dbData).find(id => {
                    const contact = dbData[id];
                    return contact?.character_name === TEST_CONFIG.CHARACTER_A;
                });
                
                if (senderContactId && dbData[senderContactId]?.app_data?.WeChat) {
                    if (!dbData[senderContactId].app_data.WeChat.messages) {
                        dbData[senderContactId].app_data.WeChat.messages = [];
                    }
                    
                    // 创建接收者视角的消息
                    const receiverMessage = {
                        ...message,
                        sender_id: senderContactId,
                        receiver_character: receiverCharacterName,
                        isReceivedCrossCharacter: true
                    };
                    
                    dbData[senderContactId].app_data.WeChat.messages.push(receiverMessage);
                }
                return dbData;
            });
            
            console.log('✓ 跨角色消息发送流程模拟完成');
        } else {
            console.log('✗ 无法获取接收者角色名称');
        }
        
    } catch (error) {
        console.error('跨角色消息发送流程模拟失败:', error);
    }
}

/**
 * 验证跨角色消息功能的完整性
 */
function validateCrossCharacterMessagingImplementation() {
    console.log('\n=== 验证跨角色消息功能实现 ===');
    
    const requiredFunctions = [
        'getCharacterMapping',
        'updateCharacterMapping',
        'getCharacterNameByContactId',
        '_updateCrossCharacterWorldbook'
    ];
    
    const DataHandler = window.PhoneSim_DataHandler;
    let implementationComplete = true;
    
    for (const funcName of requiredFunctions) {
        if (typeof DataHandler[funcName] === 'function') {
            console.log(`✓ ${funcName} 已实现`);
        } else {
            console.log(`✗ ${funcName} 未实现`);
            implementationComplete = false;
        }
    }
    
    // 检查配置
    if (window.PhoneSim_Config && window.PhoneSim_Config.WORLD_CHARACTER_MAPPING) {
        console.log(`✓ 角色映射数据库配置: ${window.PhoneSim_Config.WORLD_CHARACTER_MAPPING}`);
    } else {
        console.log('✗ 角色映射数据库配置缺失');
        implementationComplete = false;
    }
    
    if (implementationComplete) {
        console.log('✓ 跨角色消息功能实现完整');
    } else {
        console.log('✗ 跨角色消息功能实现不完整');
    }
    
    return implementationComplete;
}

// 浏览器环境下的兼容性处理
// 移除Node.js模块导出，仅保留浏览器全局函数

// 如果在浏览器环境中，将函数添加到全局对象
if (typeof window !== 'undefined') {
    window.testCrossCharacterMessaging = testCrossCharacterMessaging;
    window.simulateCrossCharacterMessageFlow = simulateCrossCharacterMessageFlow;
    window.validateCrossCharacterMessagingImplementation = validateCrossCharacterMessagingImplementation;
}

console.log('跨角色消息测试脚本已加载');
console.log('可用的测试函数:');
console.log('- testCrossCharacterMessaging(): 运行完整测试');
console.log('- simulateCrossCharacterMessageFlow(): 模拟消息发送流程');
console.log('- validateCrossCharacterMessagingImplementation(): 验证实现完整性');