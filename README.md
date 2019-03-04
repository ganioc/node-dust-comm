# readme
## Usage

```
host
├── index.js
├── yhost.js            // 通讯命令API
└── yhostsession.js     // 会话管理，回调

lib
└── hj212
    ├── common.js       // 常量定义,  本机数据,数据存取API,
    ├── cp.js           // CP参数对象
    ├── crc.js          // crc16算法
    ├── datasegment.js  // 数据包对象
    ├── frame.js        // 帧对象
    ├── index.js
    ├── package.json
    ├── session.js      // 会话对象
    └── sessionctrl.js  // 会话控制对象，会话队列

client
├── index.js
├── yclient.js          // 通讯命令API
└── yclientsession.js   // 会话管理，回调
```
## 实现内容

演示server, client之间的通讯过程. 已实现传输标准附录C中的

- C.1 设置超时时间及重发次数
- C.2 提取现场机时间
- C.3 设置现场机时间
- C.4 现场机时间校准请求
- C.5 提取实时数据间隔

## 使用
### start server
node host/index.js

### start client
node client/index.js
