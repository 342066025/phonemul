# 数据隔离测试指南

## 概述
本指南将帮助您测试PhoneSim多角色版的数据隔离功能，确保不同角色之间的数据不会混合。

## 修复内容
我们已经修复了以下关键问题：

1. **`_updateWorldbook` 函数**：现在正确使用当前角色的世界书名称
2. **角色切换缓存清理**：修复了 `window.PhoneSim_DataHandler` 的暴露问题
3. **所有数据操作函数**：确保所有联系人、消息、通话记录等数据都写入正确的角色世界书

## 测试步骤

### 自动测试（推荐）

1. **打开浏览器开发者工具**
   - 按 F12 或右键选择"检查"
   - 切换到 Console 标签页

2. **运行自动测试**
   ```javascript
   // 运行完整测试
   window.testDataIsolation.runTest()
   ```

3. **按照控制台提示进行操作**
   - 测试会自动添加测试联系人
   - 按提示切换角色
   - 验证数据隔离效果

### 手动测试步骤

#### 第一步：准备两个角色
1. 确保您有至少两个不同的角色卡
2. 当前选择角色A

#### 第二步：为角色A添加数据
```javascript
// 检查当前角色的世界书
window.testDataIsolation.getCurrentLorebookName()

// 添加测试联系人
window.testDataIsolation.addTestContact("alice_test", "测试联系人Alice")

// 验证联系人存在
window.testDataIsolation.checkContactExists("alice_test")
```

#### 第三步：切换到角色B
1. 使用角色选择器切换到角色B
2. 观察控制台是否显示缓存清理日志

#### 第四步：验证数据隔离
```javascript
// 检查新角色的世界书（应该不同）
window.testDataIsolation.getCurrentLorebookName()

// 检查角色A的联系人是否存在（应该不存在）
window.testDataIsolation.checkContactExists("alice_test")

// 为角色B添加不同的联系人
window.testDataIsolation.addTestContact("bob_test", "测试联系人Bob")
```

#### 第五步：切换回角色A验证
1. 切换回角色A
2. 验证数据完整性：
```javascript
// 应该能看到Alice但看不到Bob
window.testDataIsolation.checkContactExists("alice_test")  // 应该存在
window.testDataIsolation.checkContactExists("bob_test")   // 应该不存在
```

## 预期结果

### ✅ 正确的行为
- 每个角色有独立的世界书名称
- 切换角色时会清理缓存
- 角色A的数据在角色B中不可见
- 角色B的数据在角色A中不可见
- 切换回原角色时数据完整保留

### ❌ 错误的行为（如果出现请报告）
- 不同角色看到相同的联系人
- 角色切换后数据混合
- 缓存未正确清理
- 世界书名称相同

## 故障排除

### 如果测试函数不可用
```javascript
// 手动检查DataHandler是否可用
console.log(window.PhoneSim_DataHandler)

// 手动检查当前角色状态
console.log(window.PhoneSim_State?.currentCharacter)
```

### 如果数据隔离失败
1. 检查控制台是否有错误信息
2. 确认角色切换时是否显示缓存清理日志
3. 验证 `_updateWorldbook` 函数是否使用正确的世界书名称

## 清理测试数据

测试完成后，您可以删除测试联系人：
```javascript
// 删除测试联系人（需要在对应角色下执行）
window.PhoneSim_DataHandler.deleteContact("alice_test")
window.PhoneSim_DataHandler.deleteContact("bob_test")
```

## 技术细节

### 关键修复点
1. **`getOrCreatePhoneLorebook` 函数**：现在正确使用 `PhoneSim_State.currentCharacter`
2. **`_updateWorldbook` 函数**：动态获取当前角色的世界书名称
3. **角色切换流程**：确保 `clearLorebookCache` 正确调用
4. **所有数据操作**：统一使用 `_updateWorldbook` 函数

### 数据存储结构
- 每个角色的数据存储在独立的世界书中
- 世界书名称格式：`PhoneSim_Data_[角色名]`
- 缓存变量在角色切换时重置为 `null`

如果您在测试过程中发现任何问题，请记录详细的错误信息和重现步骤。