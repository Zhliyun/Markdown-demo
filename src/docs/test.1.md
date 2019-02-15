# <center>node-mysql 模块介绍</center>

node-mysql是一个实现了MySQL协议的Node.js JavaScript客户端，通过这个模块可以与MySQL数据库建立连接、执行查询等操作，以下是根据官方文档整理的一些模块相关介绍。
### 1. 连接

#### 1.1 建立连接

安装node-mysql模块后，就可以使用这个模块连接MySQL数据库。建立连接可以使用createConnection()方法创建连接对象，再使用connect()建立连接：

```javascript
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'itbilu.com',
  user: 'example',
  password: 'secret'
});

connection.connect(function(err) {
  if (err) {
    console.error('连接错误: ' + err.stack);
    return;
  }  
  console.log('连接ID ' + connection.threadId);
}); 
```

建立连接也可以隐式的由查询自动创建：

```javascript
var connection = mysql.createConnection(...);

connection.query('SELECT 1', function(err, rows) {
  // 如果没有错误，则会连接成功!
});
```

#### 1.2 连接选项

在创建连接时，需要传入一些选项。可传入的选项参数如下：

>host－连接主机名（默认为localhost）
port－连接端口号（默认为3306）
localAddress－使用TCP连接时的IP地址
socketPath-unix域套接字路径，使用这个选项会忽略host和port选项
user－MySql连接用户名
password－MySql连接密码
database－要连接的数据库
charset－连接使用的字符编码（默认UTF8_GENERAL_CI）
timezone－连接使用的时区（默认local）
connectTimeout－连接超时时间（默认10000毫秒）
stringifyObjects－使用Stringify代替转换值
insecureAuth－允许连接到MySQL实例（旧方法）
typeCast－列值是否转换为本地JavaScript类型（默认true）
queryFormat－自定义查询格式函数
supportBigNumbers－处理大数字（BIGINT和DECIMAL）时需要启动此项（默认false）
bigNumberStrings－使用supportbignumbers和bignumberstrings时总是返回JavaScript字符串对象（默认false）
dateStrings－强制日期格式（TIMESTAMP, DATETIME, DATE）使用JavaScript日期对象（默认false）
debug－打印协议详细到stdout（默认false）
trace－生成堆栈错误跟踪信息（默认true）
multipleStatements－允许每个查询使用多个查询语句（默认false）
flags－使用默认值以外的连接标记列表
ssl－使用SSL连接对象

连接参数也可以一个查询字符串的形式：

```javascript
var connection = mysql.createConnection('mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700');
```

SSL连接

SSL连接选项可以是一个对象或字符串。当是一个对象时，其选项和tls.createSecureContext()方法选项一样，当是字符串时将返回一个预定义的SSL配置。

```javascript
var connection = mysql.createConnection({
  host: 'localhost',
  ssl: {
    ca: fs.readFileSync(__dirname + '/mysql-ca.crt')
  }
});
```

#### 1.3 关闭连接

关闭数据库连接可以使用两种方法。

通过end()方法，在执行结束后关闭连接：

```javascript
connection.end(function(err) {
  // The connection is terminated now
});
``` 

别一种方式是使用destroy()方法，这个方法会立即关闭连接套接字，而不管执行是否完毕，且这个方法不end()方法没有回调函数：

```javascript
connection.destroy();
``` 

#### 1.4 切换用户和改变连接

MySQL可以在当前不关闭套接字的情况下切换用户和改变连接，通过changeUser()方法能够实现这一功能：

```javascript
connection.changeUser({user : 'john'}, function(err) {
  if (err) throw err;
});
```

调用这一方法时可以传入一个包含以下可选值的对象：

>user－新用户的用户名（默认为之前用户）
password－新用户的密码（默认为之前用户密码）
charset－新连接的编码（默认为之前连接的字符编码）
database－新连接的数据库（默认为之前数据库）
 

### 2. 连接池

数据库连接是一种有限的，能够显著影响到整个应用程序的伸缩性和健壮性的资源，在多用户的网页应用程序中体现得尤为突出。

数据库连接池正是针对这个问题提出来的，它会负责分配、管理和释放数据库连接，允许应用程序重复使用一个现有的数据库连接，而不是重新建立一个连接，释放空闲时间超过最大允许空闲时间的数据库连接以避免因为连接未释放而引起的数据库连接遗漏。

数据库连接池能明显提高对数据库操作的性能，node-mysql同样支持建立连接池连接。

#### 2.1 连接池连接

通过createPool()方法可以使用连接池连接：

```javascript
var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit: 10,
  host: 'itbilu.com',
  user: 'example',
  password: 'secret'
});

pool.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;
  console.log('The solution is: ', rows[0].solution);
});
```

通过getConnection()方法连接可以共享一个连接，或管理多个连接：

```javascript
var mysql = require('mysql');
var pool = mysql.createPool({
  host: 'example.org',
  user: 'bob',
  password: 'secret'
});

pool.getConnection(function(err, connection) {
  // connected! (unless `err` is set)
});
```

关闭连接池连接

连接使用完后通过调用connection.release()方法可以将连接返回到连接池中，这个连接可以被其它人重复使用：

```javascript
var mysql = require('mysql');
var pool = mysql.createPool(...);

pool.getConnection(function(err, connection) {
  // Use the connection
  connection.query( 'SELECT something FROM sometable', function(err, rows) {
    // And done with the connection.
    connection.release();
    // Don't use the connection here, it has been returned to the pool.
  });
});
```

销毁连接池连接

connection.release()方法并不会将连接从连接池中移除，如果需要关闭连接且从连接池中移除，可以使用connection.destroy()。

#### 2.2 连接池选项

创建连接池时，我们同样传入了一个参数对象。所有在createConnection()方法中使用的参数，在创建连接池时同样可以使用。创建连接池还以下几个独有的选项：

>acquireTimeout：获取连接的毫秒（默认：10000）
waitForConnections：没有连接或达到最大连接时连接的形为。为true时，连接池会将连接排队以等待可用连接。为false将立即抛出错误（默认：true）
connectionLimit：单次可创建最大连接数（默认：10）
queueLimit：连接池的最大请求数，从getConnection方法前依次排队。设置为0将没有限制（默认：0） 

#### 2.3 连接池事件

createPool()方法会返回一个连接池实例对象，这个对象中有一些事件。

##### 'connection'

连接池中产生新连接时会发送'connection'事件，如果要在连接可用前设置一个session变量，需要监听这个事件。

```javascript
pool.on('connection', function (connection) {
  connection.query('SET SESSION auto_increment_increment=1')
}); 
```

##### 'enqueue'

当回调已经排队等待可用的连接时，连接池会发送一个'enqueue'事件。

```javascript
pool.on('enqueue', function () {
  console.log('Waiting for available connection slot');
});
```
#### 2.4 连接池关闭

当使用完连接池，要关闭所有连接，Node.js的事件循环在MySQL服务关闭前全然会有效。我们可以使用end()方法关闭连接池中的所有连接：

```javascript
pool.end(function (err) {
  // all connections in the pool have ended
});
```
### 3. 连接池集群（PoolCluster）

数据库集群（Cluster）是利两台或者多台数据库服务器，构成一个虚拟单一数据库逻辑映像，并像单数据库系统那样，向客户端提供透明的数据服务。MySQL同样支持建立数据库集群，利用node-mysql模块可以建立一个面向MySQL集群（MySQL Cluster）的连接。

#### 3.1 连接池集群连接

PoolCluster使我们可以建立一个面向多台主机的连接，它由createPoolCluster()方法创建返回：

```javascript
// 创建
var poolCluster = mysql.createPoolCluster();

// 添加配置
poolCluster.add(config); // anonymous group
poolCluster.add('MASTER', masterConfig);
poolCluster.add('SLAVE1', slave1Config);
poolCluster.add('SLAVE2', slave2Config);

// 移除配置
poolCluster.remove('SLAVE2'); // By nodeId
poolCluster.remove('SLAVE*'); // By target group : SLAVE1-2

// 目标群组 : 所有(anonymous, MASTER, SLAVE1-2), Selector : round-robin(default)
poolCluster.getConnection(function (err, connection) {});

// 目标群组 : MASTER, Selector : round-robin
poolCluster.getConnection('MASTER', function (err, connection) {});

// Target Group : SLAVE1-2, Selector : order
// If can't connect to SLAVE1, return SLAVE2. (remove SLAVE1 in the cluster)
poolCluster.on('remove', function (nodeId) {
  console.log('REMOVED NODE : ' + nodeId); // nodeId = SLAVE1 
});

poolCluster.getConnection('SLAVE*', 'ORDER', function (err, connection) {});

// of namespace : of(pattern, selector)
poolCluster.of('*').getConnection(function (err, connection) {});

var pool = poolCluster.of('SLAVE*', 'RANDOM');
pool.getConnection(function (err, connection) {});
pool.getConnection(function (err, connection) {});

// close all connections
poolCluster.end(function (err) {
  // all connections in the pool cluster have ended
});
```
 
#### 3.2 连接池集群选项

创建集群连接时，可以传入个含有以下可选值的参数对象：

>canRetry：当为true时，PoolCluster会在连接失败时尝试重连（默认：true）
removeNodeErrorCount：连接失败时Node的errorCount计数会增加。当累积到这个值时移除PoolCluster这个节点（默认：5）
restoreNodeTimeout：连接失败后重试连接的毫移数（默认：0）
defaultSelector：默认的选择器（selector）（默认：RR）
>>RR－依次选择
RANDOM－随机选择
ORDER－选择第一个可用节点 

### 4. 执行SQL语句

对数据库的操作都是通过SQL语句实现的，通过SQL语句可以实现创建数据库、创建表、及对表中数据库的增/删/改/查等操作。

#### 4.1 执行查询

在node-mysql中，通过Connection或Pool实例的query()执行SQL语句，所执行的SQL语句可以是一个SELECT查询或是其它数据库操作。query()方法有以下三种形式：

##### .query(sqlString, callback)

>sqlString－要执行的SQL语句
callback－回调函数，其形式为function (error, results, fields) {}

```javascript
connection.query('SELECT * FROM `books` WHERE `author` = "David"', function (error, results, fields) {
  // error 是一个错误对象，在查询发生错误时存在
  // results 为查询结果
  // fields 包含查询结果的字段信息
}); 
```

##### .query(sqlString, values, callback)

>sqlString－要执行的SQL语句
values－{Array}，要应用到查询占位符的值
callback－回调函数，其形式为function (error, results, fields) {}

```javascript
connection.query('SELECT * FROM `books` WHERE `author` = ?', ['David'], function (error, results, fields) {
  // error 是一个错误对象，在查询发生错误时存在
  // results 为查询结果
  // fields 包含查询结果的字段信息
});
```

 
##### .query(sqlString, values, callback)

>options－{Object}，查询选项参数
callback－回调函数，其形式为function (error, results, fields) {}

```javascript
connection.query({
  sql: 'SELECT * FROM `books` WHERE `author` = ?',
  timeout: 40000, // 40s
  values: ['David']
}, function (error, results, fields) {
  // error 是一个错误对象，在查询发生错误时存在
  // results 为查询结果
  // fields 包含查询结果的字段信息
});
```

当使用参数占位符时，第二种和第三种形式也可以结合使用。如，可以将上例中的values值独立为一个参数传入：

```javascript
connection.query({
  sql: 'SELECT * FROM `books` WHERE `author` = ?',
  timeout: 40000 // 40s
}, ['David'], function (error, results, fields) {
  // error 是一个错误对象，在查询发生错误时存在
  // results 为查询结果
  // fields 包含查询结果的字段信息
});
```

#### 4.2 查询编码与安全

为了防止SQL注入，可以传入参数进行编码。参数编码方法有：
***mysql.escape()* / *connection.escape()*  / *pool.escape()***
这三个方法可以在你需要的时候调用：

```javascript
var userId = 'some user provided value';
var sql = 'SELECT * FROM users WHERE id = ' + connection.escape(userId);
connection.query(sql, function(err, results) {
  // ...
}); 
```

同样的，也可以使用?做为查询参数占位符，这与查询值编码效果是一样的：

```javascript
connection.query('SELECT * FROM users WHERE id = ?', [userId], function(err, results) {
  // ...
});
``` 

在使用查询参数占位符时，在其内部自动调用connection.escape()方法对传入参数进行编码。

escape()方法编码规则如下：

>Numbers不进行转换
Booleans转换为true/false
Date对象转换为'YYYY-mm-dd HH:ii:ss'字符串
Buffers转换为hex字符串，如X'0fa5'
Strings进行安全转义
Arrays转换为列表，如['a', 'b']会转换为'a', 'b'
多维数组转换为组列表，如[['a', 'b'], ['c', 'd']]会转换为('a', 'b'), ('c', 'd')
Objects会转换为key=value键值对的形式
undefined/null会转换为NULL

使用查询查询占位符时时，其自动转换如下：

```javascript
var post = {id: 1, title: 'Hello MySQL'};
var query = connection.query('INSERT INTO posts SET ?', post, function(err, result) {
  // Neat!
});
console.log(query.sql); // INSERT INTO posts SET `id` = 1, `title` = 'Hello MySQL'
``` 

如果你要自己进行编码，可以像下面这样的使用编码函数：

```javascript
var query = "SELECT * FROM posts WHERE title=" + mysql.escape("Hello MySQL");

console.log(query); // SELECT * FROM posts WHERE title='Hello MySQL'
``` 

#### 4.3 编码查询标识符

如果你不信任用户传入的SQL标识符（数据库、表、字符名），你可以使用
***mysql.escapeId(identifier)/connection.escapeId(identifier)/pool.escapeId(identifier)***
三个方法进行编码：

```javascript
var sorter = 'date';
var sql = 'SELECT * FROM posts ORDER BY ' + connection.escapeId(sorter);
connection.query(sql, function(err, results) {
  // ...
});
```

这几个方法也可以指定标识符：

```javascript
var sorter = 'date';
var sql = 'SELECT * FROM posts ORDER BY ' + connection.escapeId('posts.' + sorter);
connection.query(sql, function(err, results) {
  // ...
});
``` 

标识符也可以使用 **??** 标识符占位符，你可以像下面这样使用：

```javascript
var userId = 1;
var columns = ['username', 'email'];
var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function(err, results) {
  // ...
});

console.log(query.sql); // SELECT `username`, `email` FROM `users` WHERE id = 1
```
 
#### 4.4 流式查询

.query()方法会返回一个query实例对象，它会发送一些特定的事件，这在进行大量数据查询时非常有用：

```javascript
var query = connection.query('SELECT * FROM posts');
query
  .on('error', function(err) {
    // 错误处理，在这个事件之后会发送一个'end'事件
  })
  .on('fields', function(fields) {
    // 查询行字段包信息
  })
  .on('result', function(row) {
    // 暂停你正在使用进程的I/O操作
    connection.pause();

    processRow(row, function() {
      connection.resume();
    });
  })
  .on('end', function() {
    // 所有行查询完成或发生错误后触发
});
```

查询流转接

query对象提供了一个.stream([option])方法，它会将查询事件包装成一个可读流，和对普通流的操作一样，你可以对它进行暂停/恢复等操作。同样也可将这个流通过pipe()方法转接到另一个流中：

```javascript
connection.query('SELECT * FROM posts')
  .stream({highWaterMark: 5})
  .pipe(...);
``` 
#### 4.5 多语句查询

出于安全考虑node-mysql默认禁止多语句查询（可以防止SQL注入），启用多语句查询可以将multipleStatements选项设置为true：

```javascript
var connection = mysql.createConnection({multipleStatements: true});
```

启用后可以在一个query查询中执行多条语句：

```javascript
connection.query('SELECT 1; SELECT 2', function(err, results) {
  if (err) throw err;

  // `results`是一个包含多个语句查询结果的数组
  console.log(results[0]); // [{1: 1}]
  console.log(results[1]); // [{2: 2}]
});
```

多语句查询同样适用于流式查询：

```javascript
var query = connection.query('SELECT 1; SELECT 2');

query
  .on('fields', function(fields, index) {
    // the fields for the result rows that follow
  })
  .on('result', function(row, index) {
    // index refers to the statement this result belongs to (starts at 0)
  });
```

  
#### 4.6 存储过程

存储过程可以在node-mysql的查询中调用，和在其它驱动中调用并没有区别。如果在存储过程的执行结果中有多个数据集，其暴露方式和多语句查询的使用一样。 

#### 4.7 事务

事务的支持可以简单的在connection级别上实现：

```javascript
connection.beginTransaction(function(err) {
  if (err) { throw err; }
  connection.query('INSERT INTO posts SET title=?', title, function(err, result) {
    if (err) {
      return connection.rollback(function() {
        throw err;
      });
    }

    var log = 'Post ' + result.insertId + ' added';

    connection.query('INSERT INTO log SET data=?', log, function(err, result) {
      if (err) {
        return connection.rollback(function() {
          throw err;
        });
      }  
      connection.commit(function(err) {
        if (err) {
          return connection.rollback(function() {
            throw err;
          });
        }
        console.log('success!');
      });
    });
  });
});
```

在这个示例中，beginTransaction、commit、rollback方法，其本质上都是执行了MySQL的START TRANSACTION、COMMIT和ROLLBACK命令。

 

### 5. 其它

#### 5.1 Ping方法

检测服务器是否可连接，可以使用connection.ping方法。当连接服务器没有响应时，会将错误传递到回调函数的error参数中：

```javascript
connection.ping(function (err) {
  if (err) throw err;
  console.log('Server responded to ping');
})
```
#### 5.2 超时

每个操作都应该有一个可选的超时（timeout）选项，在操作超过指定时间后会发送超时错误。超时并不是MySQL协议的组成部分，而是客户端的一个处理。

```javascript
// 60秒后断开查询
connection.query({sql: 'SELECT COUNT(*) AS count FROM big_table', timeout: 60000}, function (err, rows) {
  if (err && err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
    throw new Error('表 count 操作超时！');
  }

  if (err) {
    throw err;
  }

  console.log(rows[0].count + ' rows');
});
```

#### 5.3 错误处理

这个模块的错误处理机制与Node.js错误处理类似，其大多数错误对是JavaScript Error对象实例。在这个实例中有以下两个额外属性：

>err.code－错误码，可能是一个MySQL 服务端错误或Node.js错误或是一个内部错误
err.fatal－错误是否致命

当err.fatal为true时，错误被传递致所有回调中。

```javascript
var connection = require('mysql').createConnection({
  port: 84943, // WRONG PORT
});

connection.connect(function(err) {
  console.log(err.code); // 'ECONNREFUSED'
  console.log(err.fatal); // true
});

connection.query('SELECT 1', function(err) {
  console.log(err.code); // 'ECONNREFUSED'
  console.log(err.fatal); // true
});
```

一般的错误同样会被传递，只会被传递至第一次回调中，再次查询时依然可以正常进行：

```javascript
connection.query('USE name_of_db_that_does_not_exist', function(err, rows) {
  console.log(err.code); // 'ER_BAD_DB_ERROR'
});

connection.query('SELECT 1', function(err, rows) {
  console.log(err); // null
  console.log(rows.length); // 1
});
```

如果发生一个致命错误而没有等待回调，或一个正常的错误同样没有回调处理。错误会发出的一个到连接对象的'error'事件：

```javascript
connection.on('error', function(err) {
  console.log(err.code); // 'ER_BAD_DB_ERROR'
});

connection.query('USE name_of_db_that_does_not_exist');
``` 

#### 5.4 异常安全

这个模块是异常安全的，这意味着你可以使用Node.js的'uncaughtException'事件或domain模块进行异常捕获。 

#### 5.5 类型转换

node-mysql模块会自动将MySQL数据类型转换为JavaScript数据类型，其对应规则如下：

Number
- TINYINT
- SMALLINT
- INT
- MEDIUMINT
- YEAR
- FLOAT
- DOUBLE

Date
- TIMESTAMP
- DATE
- DATETIME

Buffer
- TINYBLOB
- MEDIUMBLOB
- LONGBLOB
- BLOB
- BINARY
- VARBINARY
- BIT (last byte will be filled with 0 bits as necessary)

String
- CHAR
- VARCHAR
- TINYTEXT
- MEDIUMTEXT
- LONGTEXT
- TEXT
- ENUM
- SET
- DECIMAL (may exceed float precision)
- BIGINT (may exceed float precision)
- TIME (could be mapped to Date, but what date would be set?)
- GEOMETRY (never used those, get in touch if you do) 

#### 5.6 连接标识

如果你想修改默认的连接标识，可以连接选项的flags参数中传入。一些可用的标识如下：

默认标识

以下是建立新连接时默认传入的标识：

>CONNECT_WITH_DB - 能够在连接中指定的数据库
FOUND_ROWS - 发送查找到的行替代受影响的行 affectedRows
IGNORE_SIGPIPE - 旧版本，不推荐使用
IGNORE_SPACE - 让分析器忽略(之前的空格
LOCAL_FILES - 可以使用LOAD DATA LOCAL.
LONG_FLAG
LONG_PASSWORD - 使用改进版的旧密码认证
MULTI_RESULTS - 可以处理多个结果集COM_QUERY
ODBC － 旧版本，不推荐使用
PROTOCOL_41 - 使用4.1版本的协议
PS_MULTI_RESULTS - 可以处理多个结果集COM_STMT_EXECUTE
RESERVED - 4.1版本的旧标识
SECURE_CONNECTION - 支持4.1版本的认证
TRANSACTIONS - 请求事务状态的标识

当multipleStatements选项为true时会发送以下标识：

>MULTI_STATEMENTS - 每个查询可以发送多个语句
TRANSACTIONS - 请求事务状态的标识

其它可以标识

下面其它的可用标识。虽然其并一定起作用，但依然可以指定：

>COMPRESS
INTERACTIVE
NO_SCHEMA
PLUGIN_AUTH
REMEMBER_OPTIONS
SSL
SSL_VERIFY_SERVER_CERT
