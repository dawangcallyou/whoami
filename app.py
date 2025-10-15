from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
from flask import render_template,Flask
from ssh import ssh_connect
from ddos import ddos
app = Flask(__name__)
CORS(app)

def process_ai_mcp_command(command):
    """
    处理以'ai'开头的命令，模拟MCP处理逻辑
    返回指定JSON格式
    """
    # 移除开头的'ai'并清理命令
    clean_command = command[2:].strip()
    
    # 模拟MCP处理逻辑 - 这里可以根据实际需求扩展
    response_data = {
        "status": "success",
        "command": clean_command,
        "processed_by": "ai_mcp",
        "result": f"AI MCP处理了命令: {clean_command}",
        "timestamp": "2025-10-15T17:00:00Z"
    }
    
    return response_data

def process_normal_command(command):
    """
    handle ordinary commands
    返回指定JSON格式
    """
    if "ip" in command:
        ip = command.split()[1]
        if "port" in command:
            port = command.split()[3]
            if "ssh_connect" in command:
                return ssh_connect(port, ip)
            if "ddos" in command:
                intensity = command.split()[5] 
                ddos(port, ip, intensity)
                return {
                    "status": "success",
                    "command": f"ip {ip} port {port} ddos intensity {intensity}",
                    "processed_by": "backend",
                    "result": f"对 {ip}:{port} 发起了强度为 {intensity} 的DDoS攻击 "
                }
            
        else:
            return {"status": "error", "message": "缺少端口信息"}
    else:
        return  "format_example: ip 192.168.1 port 22 ssh_connect"
    
            
@app.route('/api/command', methods=['POST'])
def handle_command():
    """
    处理前端发送的命令
    """
    try:
        data = request.get_json()
        command = data.get('command', '').strip()
        
        if not command:
            return jsonify({
                "status": "error",
                "message": "命令不能为空"
            }), 400
        
        # 检查命令是否以'ai'开头
        if command.lower().startswith('ai '):
            # 经过AI MCP处理
            result = process_ai_mcp_command(command)
        else:
            # 直接后端处理
            result = process_normal_command(command)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"处理命令时发生错误: {str(e)}"
        }), 500

@app.route('/')
def index():
    return render_template('index.html', title="黑客终端")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
