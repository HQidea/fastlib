# fastlib（杭电图书馆加速器）

杭电图书馆加速器通过缓存图书馆的搜索结果以提高搜索效率。

## 使用方法

**GET /query/{标题}** 搜索标题关键字为{标题}的书，结果同http://210.32.33.91:8080/opac/search.php 默认返回20条数据

**GET /query/{标题}?page={page}** 指定页码{page}

## 实现原理

+ 数据来源

抓取自学校图书馆网页

+ 数据存储

数据库为mongodb  
存储方式设想的是可以分布式，目前已采用一致性哈希算法把关键字映射到不同的集合

## 前端技术

+ HTML5+CSS3

+ 栅格系统

+ 媒体查询

+ CSS动画

+ 原生JS

+ 兼容不同屏幕尺寸

## 初始化

1. **PUT /admin/init** 创建管理员帐号
2. **PUT /admin/collection/{hash}** 增加集合，{hash}会在一致性哈希算法中用到 

## 搜索时间对比

|关键字           |结果数|首次搜索返回时间(ms)\*|第二次搜索返回时间(ms)\*\*|效率提升|
|:---------------:|:----:|:--------------------:|:------------------------:|:------:|
|javascript       |226   |3940                  |20                        |99.49%  |
|毛概             |0     |1058                  |2                         |99.81%  |
|模式识别         |83    |3604                  |11                        |99.69%  |
|写在人生边上     |4     |3444                  |7                         |99.80%  |
|鸟哥的linux私房菜|7     |3407                  |8                         |99.77%  |
|倚天屠龙记       |11    |3463                  |5                         |99.86%  |
|c语言程序设计    |826   |3894                  |8                         |99.79%  |

平均效率提升**99.74%**

\* 首次搜索由图书馆页面返回结果
\*\* 第二次及以后搜索由mongodb返回结果

## TODO List

+ 压缩部署前端资源 

+ 提供强制刷新搜索结果
