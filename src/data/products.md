1./Users/andy/Downloads/商品数据，该目录下是各分类的商品数据,这些数据调帮我上传
2.数据格式：products.json
3.商品图片：images文件夹
4.图片的话要先调文件上传接口,拿到oss的链接再上传
5.文件名就是分类名，你要先根据文件名新建9个分类；再把文件下的products.json转成可用于商品管理-新增商品的数据格式，上传到对应分类里面
6.对应的字段就是categoryId
7.如果商品名称超过8个字的话，简要概括一下；剩下的拼到简介里面
8.积分按照products.json里面price*10，就是积分数，四舍五入，最低1积分
9.分类接口数据格式，参考claude.md，分类管理-新增\编辑分类
10.商品接口数据格式，参考claude.md，商品管理-新增\编辑商品
11.商品接口数据格式，参考claude.md，商品管理-新增\编辑SKU-商品规格
12.文件上传接口，参考claude.md，文件上传
12.中外名酒和床上用品，这两个品类设置成会员专属

token：eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyTmFtZSI6ImFkbWluIiwidXNlcklkIjoxLCJ1c2VyS2V5IjoiZjM1NmFjNDAtZWMzYi00MjViLWE4OWItMmI2ZGZkOTM3NTJlIn0.0-p0CjHU-VTrj4plGlZ_xMwva4P7S-BJ7h-y2fCmGk1_ANhKyh4CSoQ8IB5YRvPGHWahZn5fnOqYpnwjJzM9Pg