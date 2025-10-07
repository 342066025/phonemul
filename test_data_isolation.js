// 数据隔离测试脚本
// 用于验证不同角色间的数据隔离功能

console.log('=== PhoneSim 数据隔离测试 ===');

// 测试函数：检查当前角色的世界书名称
function getCurrentLorebookName() {
    if (window.PhoneSim_DataHandler && window.PhoneSim_DataHandler.getOrCreatePhoneLorebook) {
        return window.PhoneSim_DataHandler.getOrCreatePhoneLorebook().then(lorebook => {
            console.log('当前世界书名称:', lorebook?.name || '未找到');
            return lorebook?.name;
        });
    } else {
        console.log('PhoneSim_DataHandler 未初始化');
        return null;
    }
}

// 测试函数：添加测试联系人
async function addTestContact(contactId, nickname) {
    if (window.PhoneSim_DataHandler && window.PhoneSim_DataHandler.addContactManually) {
        console.log(`添加测试联系人: ${contactId} - ${nickname}`);
        await window.PhoneSim_DataHandler.addContactManually(contactId, nickname);
        console.log('联系人添加完成');
    } else {
        console.log('无法添加联系人：DataHandler 未初始化');
    }
}

// 测试函数：检查联系人是否存在
async function checkContactExists(contactId) {
    if (window.PhoneSim_DataHandler && window.PhoneSim_DataHandler.fetchAllData) {
        const data = await window.PhoneSim_DataHandler.fetchAllData();
        const exists = data.contacts && data.contacts[contactId];
        console.log(`联系人 ${contactId} 存在:`, !!exists);
        if (exists) {
            console.log(`联系人信息:`, exists.nickname);
        }
        return !!exists;
    } else {
        console.log('无法检查联系人：DataHandler 未初始化');
        return false;
    }
}

// 主测试函数
async function runDataIsolationTest() {
    console.log('\n--- 开始数据隔离测试 ---');
    
    try {
        // 1. 检查当前角色
        console.log('\n1. 检查当前角色的世界书:');
        await getCurrentLorebookName();
        
        // 2. 添加测试联系人到当前角色
        console.log('\n2. 为当前角色添加测试联系人:');
        await addTestContact('test_contact_1', '测试联系人1');
        
        // 3. 验证联系人是否存在
        console.log('\n3. 验证联系人是否存在:');
        await checkContactExists('test_contact_1');
        
        // 4. 提示用户切换角色
        console.log('\n4. 请手动切换到另一个角色，然后运行以下命令:');
        console.log('   checkContactExists("test_contact_1")');
        console.log('   如果数据隔离正常，应该显示联系人不存在');
        
        // 5. 为新角色添加不同的联系人
        console.log('\n5. 切换角色后，可以运行以下命令添加不同的联系人:');
        console.log('   addTestContact("test_contact_2", "测试联系人2")');
        console.log('   然后再切换回原角色，验证是否只能看到原来的联系人');
        
    } catch (error) {
        console.error('测试过程中出现错误:', error);
    }
}

// 将测试函数暴露到全局作用域，方便在控制台中调用
window.testDataIsolation = {
    runTest: runDataIsolationTest,
    getCurrentLorebookName: getCurrentLorebookName,
    addTestContact: addTestContact,
    checkContactExists: checkContactExists
};

console.log('\n测试函数已准备就绪！');
console.log('运行 window.testDataIsolation.runTest() 开始测试');
console.log('或者单独运行各个测试函数:');
console.log('- window.testDataIsolation.getCurrentLorebookName()');
console.log('- window.testDataIsolation.addTestContact("id", "name")');
console.log('- window.testDataIsolation.checkContactExists("id")');