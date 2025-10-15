class HackTerminal {
    constructor() {
        this.outputArea = document.getElementById('output');
        this.commandInput = document.getElementById('command-input');
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.init();
    }
    
    init() {
        //bind events
        this.commandInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.commandInput.focus();
        
       
        this.addHelpCommand();
    }
    
    handleKeyDown(e) {
        if (e.key === 'Enter') {
            this.executeCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autoComplete();
        }
    }
    
    executeCommand() {
        const command = this.commandInput.value.trim();
        
        if (!command) {
            this.commandInput.value = '';
            return;
        }
        
        // show command in terminal
        this.displayCommand(command);
        
        // add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        
        // clear input
        this.commandInput.value = '';
        
        // command processing
        this.processCommand(command);
    }
    
    displayCommand(command) {
        const commandLine = document.createElement('div');
        commandLine.className = 'command-line';
        commandLine.innerHTML = `
            <span class="prompt">user@hack-terminal:~$ </span>
            <span class="command-text">${this.escapeHtml(command)}</span>
        `;
        this.outputArea.appendChild(commandLine);
    }
    
    displayOutput(content, type = 'info') {
        const outputLine = document.createElement('div');
        outputLine.className = `output-text ${type}`;
        outputLine.innerHTML = content;
        this.outputArea.appendChild(outputLine);
        this.scrollToBottom();
    }
    
    displayJsonOutput(data, processor = '') {
        const outputLine = document.createElement('div');
        outputLine.className = 'json-output';
        
        let processorBadge = '';
        if (processor) {
            const processorClass = processor === 'ai_mcp' ? 'ai' : 'backend';
            processorBadge = `<span class="processed-by ${processorClass}">[${processor}]</span>`;
        }
        
        outputLine.innerHTML = `
            ${JSON.stringify(data, null, 2)}
            ${processorBadge}
        `;
        this.outputArea.appendChild(outputLine);
        this.scrollToBottom();
    }
    
    async processCommand(command) {
        try {
            // local command handling
            if (this.handleLocalCommand(command)) {
                return;
            }
            
            // send backend request for other commands
            const response = await fetch('/api/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: command })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.displayJsonOutput(result, result.processed_by);
            } else {
                this.displayOutput(result.message, 'error');
            }
            
        } catch (error) {
            this.displayOutput(`网络错误: ${error.message}`, 'error');
        }
    }
    
    handleLocalCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        switch (cmd) {
            case 'help':
                this.displayHelp();
                return true;
                
            case 'clear':
                this.clearTerminal();
                return true;
                
            case 'history':
                this.displayHistory();
                return true;
                
            case 'date':
                this.displayOutput(new Date().toString(), 'info');
                return true;
                
            case 'whoami':
                this.displayOutput('user', 'info');
                return true;
                
            case 'pwd':
                this.displayOutput('/home/user/hack-terminal', 'info');
                return true;
                
            case 'ls':
                this.displayOutput('app.py  requirements.txt  static/', 'info');
                return true;
                
            case 'echo hello world':
                this.displayOutput('hello world', 'info');
                return true;
                
            default:
                return false;
        }
    }
    
    displayHelp() {
        const helpText = `
可用命令:
  help                    - 显示此帮助信息
  clear                   - 清空终端
  history                 - 显示命令历史
  date                    - 显示当前日期时间
  whoami                  - 显示当前用户
  pwd                     - 显示当前目录
  ls                      - 列出文件
  echo [text]             - 输出文本
  
AI MCP命令:
  以 'ai' 开头的命令将经过AI MCP处理
  例如: ai analyze system
  例如: ai generate report
  
其他命令将直接由后端处理
        `.trim();
        
        this.displayOutput(helpText, 'info');
    }
    
    addHelpCommand() {
        // 在欢迎信息后添加帮助提示
        setTimeout(() => {
            this.displayOutput('输入 "help" 查看可用命令', 'info');
        }, 1000);
    }
    
    clearTerminal() {
        this.outputArea.innerHTML = '';
    }
    
    displayHistory() {
        if (this.commandHistory.length === 0) {
            this.displayOutput('命令历史为空', 'info');
            return;
        }
        
        const historyText = this.commandHistory
            .map((cmd, index) => `${index + 1}. ${cmd}`)
            .join('\n');
        
        this.displayOutput(historyText, 'info');
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.commandInput.value = '';
        } else {
            this.commandInput.value = this.commandHistory[this.historyIndex];
        }
    }
    
    autoComplete() {
        // auto-complete logic
        const currentInput = this.commandInput.value.toLowerCase();
        const commands = ['help', 'clear', 'history', 'date', 'whoami', 'pwd', 'ls', 'echo'];
        
        const matches = commands.filter(cmd => cmd.startsWith(currentInput));
        
        if (matches.length === 1) {
            this.commandInput.value = matches[0];
        } else if (matches.length > 1) {
            this.displayOutput(`可能的命令: ${matches.join(', ')}`, 'info');
        }
    }
    
    scrollToBottom() {
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化终端
document.addEventListener('DOMContentLoaded', () => {
    new HackTerminal();
});

// global error handler
window.addEventListener('error', (e) => {
    console.error('终端错误: - script.js:257', e.error);
});
