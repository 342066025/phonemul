/**
 * 代码质量检查脚本
 * 用于检查JavaScript文件的基本语法和常见问题
 */

const fs = require('fs');
const path = require('path');

// 要检查的目录
const CHECK_DIRS = [
    './modules/ui_modules',
    './modules/data_modules'
];

// 代码质量规则
const QUALITY_RULES = {
    // 不应该使用console.log (应该使用console.info, console.warn, console.error)
    CONSOLE_LOG: /console\.log\(/g,
    
    // 空的catch块
    EMPTY_CATCH: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    
    // 未处理的Promise
    UNHANDLED_PROMISE: /\.then\([^)]*\)\s*;/g,
    
    // 缺少分号
    MISSING_SEMICOLON: /[^;]\s*\n/g,
    
    // TODO/FIXME注释
    TODO_COMMENTS: /(TODO|FIXME|XXX|HACK)/gi
};

/**
 * 检查单个文件
 */
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // 检查各种质量规则
    for (const [ruleName, pattern] of Object.entries(QUALITY_RULES)) {
        const matches = content.match(pattern);
        if (matches) {
            issues.push({
                rule: ruleName,
                count: matches.length,
                matches: matches.slice(0, 3) // 只显示前3个匹配
            });
        }
    }
    
    return issues;
}

/**
 * 递归检查目录
 */
function checkDirectory(dirPath) {
    const results = {};
    
    if (!fs.existsSync(dirPath)) {
        console.warn(`目录不存在: ${dirPath}`);
        return results;
    }
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            Object.assign(results, checkDirectory(fullPath));
        } else if (file.endsWith('.js')) {
            const issues = checkFile(fullPath);
            if (issues.length > 0) {
                results[fullPath] = issues;
            }
        }
    }
    
    return results;
}

/**
 * 主检查函数
 */
function runQualityCheck() {
    console.log('🔍 开始代码质量检查...\n');
    
    let totalIssues = 0;
    let totalFiles = 0;
    
    for (const dir of CHECK_DIRS) {
        console.log(`📁 检查目录: ${dir}`);
        const results = checkDirectory(dir);
        
        if (Object.keys(results).length === 0) {
            console.log('✅ 未发现问题\n');
        } else {
            for (const [filePath, issues] of Object.entries(results)) {
                totalFiles++;
                console.log(`\n📄 文件: ${filePath}`);
                
                for (const issue of issues) {
                    totalIssues += issue.count;
                    console.log(`  ⚠️  ${issue.rule}: ${issue.count} 个问题`);
                    if (issue.matches.length > 0) {
                        console.log(`     示例: ${issue.matches[0]}`);
                    }
                }
            }
            console.log('');
        }
    }
    
    console.log('📊 检查结果汇总:');
    console.log(`   文件数量: ${totalFiles}`);
    console.log(`   问题总数: ${totalIssues}`);
    
    if (totalIssues === 0) {
        console.log('🎉 恭喜！代码质量检查通过！');
    } else {
        console.log('⚠️  发现一些代码质量问题，建议修复。');
    }
}

// 运行检查
if (require.main === module) {
    runQualityCheck();
}

module.exports = { runQualityCheck, checkFile, checkDirectory };