fdserver 分支切换工具

使用说明
1.当前目录执行npm install
2.修改package.json中的cfgPath项为全局fdserver的配置文件
3.添加workHelper所在目录到环境变量
    export PATH = $PATH:/XXX/XXXX/workHelper

4.执行workHelper 显示当前所有分支,指定分支[-f feature]则执行分支切换,指定分支并且指定路径则新建該分支并且切换到该分支
