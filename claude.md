base
  1.code===200，则请求成功；否则失败，toast出message

文件上传
  接口：/admin/pinball/file/upload
  出参：使用filePathUrl字段
    {
      "code": 0,
      "data": {
        "fileName": "",
        "filePathUrl": "",
        "fileType": "",
        "originalFileName": "",
        "storePath": ""
      },
      "message": ""
    }

一.分类管理
  1.查询分类列表
    接口：admin/pinball/shop/category/list
    入参：categoryId	分类ID		
         categoryName	分类名称		
         icon	分类图标URL		
         parentId	父级分类ID，0-顶级		
         sortOrder	排序序号	(int32)	
         status	状态：0-禁用，1-启用	(int32)	
    出参：[
          {
            "categoryId": 0,
            "categoryName": "",
            "icon": "",
            "parentId": 0,
            "sortOrder": 0,
            "status": 0
          }
         ]
  2.新增/编辑分类
    接口：/admin/pinball/shop/category/save
    入参：categoryId	分类ID（新增时为空，编辑时必填）
         categoryName	分类名称			
         icon	分类图标URL		需要本地选择图片上传，上传接口你先mock
         sortOrder	排序序号			
         status	状态：0-禁用，1-启用			
    出参：{
          "code": 0,
          "data": 0,
          "message": ""
         }
  3.删除分类
    接口：/admin/pinball/shop/category/delete
    入参：categoryId	分类ID
    出参：{
          "code": 0,
          "data": 0,
          "message": ""
         }

二.商品管理
  1.分页查询商品
    接口：/admin/pinball/shop/product/page
    入参：
      categoryId	分类ID
      current	当前页
      pageSize	每页大小
      productName	商品名称（模糊查询）
      sortField	排序字段集合
      OrderItem
        asc
        column
      status	状态：0-下架，1-上架
    出参：
      code
      data
        current	当前页
        data	返回数据(数组)
          categoryId	分类ID		
          createTime	创建时间		
          description	商品简介		
          images	商品图片列表JSON		
          mainImage	商品主图URL		
          memberOnly	是否会员专属：0-否，1-是
          minSkuId	最低价SKU的ID		
          minSkuPointType	最低价SKU的支付类型：0-积分卡，1-会员积分		
          minSkuPrice	最低价SKU的价格		
          productId	商品ID		
          productName	商品名称		
          sortOrder	排序序号		
          status	状态：0-下架，1-上架		
        pageSize	每页大小
        total	总条数
      message	
  2.新增\编辑商品
    接口：/admin/pinball/shop/product/save
    入参：
      categoryId	分类ID			
      description	商品简介			
      detailHtml	商品详情富文本HTML			
      images	商品图片列表JSON			
      mainImage	商品主图URL			
      memberOnly	是否会员专属：0-否，1-是			
      productId	商品ID（新增时为空，编辑时必填）
      productName	商品名称
      sortOrder	排序序号
      status	状态：0-下架，1-上架
    出参：
  3.删除商品
    接口：/admin/pinball/shop/product/delete
    入参：productId 商品ID
    出参：
      {
        "code": 0,
        "message": ""
      }
  4.新增\编辑SKU-商品规格
    接口：/admin/pinball/shop/product/sku/save
    入参：
      image	规格配图URL			
      pointType	支付方式：0-积分卡，1-会员积分			
      price	兑换所需积分卡数量			
      productId	商品ID			
      skuAttrs	规格属性JSON			
      skuId	SKUID（新增时为空，编辑时必填）			
      skuName	规格名称			
      status	状态：0-禁用，1-启用			
      stock	库存数量			
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  5.删除SKU-商品规格
    接口：/admin/pinball/shop/product/sku/delete
    入参：skuId SKUID
    出参：
      {
        "code": 0,
        "message": ""
      }
  6.根据商品ID查SKU列表
    接口：/admin/pinball/shop/product/sku/list
    入参：productId	商品ID			
    出参：
      code
      data	array	
        image	规格配图URL		
        pointType	支付方式：0-积分卡，1-会员积分	
        price	兑换所需积分卡数量	
        productId	商品ID	
        skuAttrs	规格属性JSON		
        skuId	SKU ID	
        skuName	规格名称		
        status	状态：0-禁用，1-启用	
        stock	库存数量	
      message		
三.签到奖励配置
  1.查询签到奖励配置
    接口：/admin/pinball/signIn/getConfig
    入参：
    出参：
      code
      data		array	
        dayIndex	连续签到天数索引：1-7表示第N天，0表示连续超7天的默认奖励
        rewardMarble	奖励弹珠数量（单位：个）
        message		
  2.保存签到奖励配置
    接口：/admin/pinball/signIn/saveConfig
    入参：
      configs	签到奖励配置列表（需包含 day_index 0-7 共8条）			
        dayIndex	连续签到天数索引：1-7表示第N天，0表示连续超7天的默认奖励			
        rewardMarble	奖励弹珠数量（单位：个）			
    出参：
      {
        "code": 0,
        "message": ""
      }
四.Banner广告
  1.Banner列表查询
    接口：/admin/pinball/banner/listBanner
    入参：bannerType	大类：1-轮播广告，2-拉新活动，不传查全部
    出参：
      code
      data	array
        bannerType	大类：1-轮播广告，2-拉新活动
        createTime	创建时间	
        expireTime	过期时间，为空表示永久有效	
        id	Banner ID
        imgUrl	Banner图片地址	
        jumpUrl	跳转链接	
        sort	排序号
        status	状态：0-已结束，1-启用	
        title	标题	
      message
  2.新增Banner
    接口：/admin/pinball/banner/addBanner
    入参：
      bannerType	大类：1-轮播广告，2-拉新活动			
      expireTime	过期时间，不传表示永久有效			
      imgUrl	Banner图片地址			
      jumpUrl	跳转链接			
      sort	排序号			
      title	标题			
    出参：
      {
        "code": 0,
        "message": ""
      }
  3.修改Banner
    接口：/admin/pinball/banner/updateBanner
    入参：
      id	Banner ID	
      bannerType	大类：1-轮播广告，2-拉新活动			
      expireTime	过期时间，不传表示永久有效			
      imgUrl	Banner图片地址			
      jumpUrl	跳转链接			
      sort	排序号			
      title	标题
    出参：
      {
        "code": 0,
        "message": ""
      }
  4.删除Banner
    接口：/admin/pinball/banner/deleteBanner
    入参：id	Banner ID	
    出参：
      {
        "code": 0,
        "message": ""
      }
  5.修改Banner排序
    接口：/admin/pinball/banner/updateBannerSort
    入参：
      id	Banner ID		
      sort	排序号
    出参：
      {
        "code": 0,
        "message": ""
      }
五.邀请好友管理
  1.分页列表
    接口：/admin/pinball/invitation/activity/page
    入参：
      activityName	活动名称（模糊查询）			
      current	当前页			
      enableFlag	启用开关：0-禁用，1-启用			
      pageSize	每页大小			
      sortField	排序字段集合			
        asc				
        column				
    出参：
      code
      data
        current	当前页		
        data	返回数据	array	
          activityId	活动ID		
          activityName	活动名称		
          createTime	创建时间		
          description	活动说明		
          enableFlag	启用开关：0-禁用，1-启用		
          endTime	活动结束时间		
          inviteLimit	单个邀请人邀请上限（0=不限）		
          realNameRequired	是否要求被邀请人实名：0-否，1-是		
          rechargeRequired	是否要求被邀请人完成弹珠充值：0-否，1-是		
          rewardMarble	奖励弹珠数量		
          rewardMemberPoint	奖励会员积分数量		
          rewardPointCard	奖励积分卡数量		
          rewardWithdrawAmount	奖励提现金额（仅记录，不发放）		
          startTime	活动开始时间		
        pageSize	每页大小		
        total	总条数		
      message		
  2.详情
    接口：/admin/pinball/invitation/activity/detail
    入参：
      activityId	活动ID	
    出参：
      code
      data	
        activityId	活动ID
        activityName	活动名称		
        createTime	创建时间
        description	活动说明		
        enableFlag	启用开关：0-禁用，1-启用	
        endTime	活动结束时间
        inviteLimit	单个邀请人邀请上限（0=不限）	
        realNameRequired	是否要求被邀请人实名：0-否，1-是	
        rechargeRequired	是否要求被邀请人完成弹珠充值：0-否，1-是	
        rewardMarble	奖励弹珠数量	
        rewardMemberPoint	奖励会员积分数量	
        rewardPointCard	奖励积分卡数量	
        rewardWithdrawAmount	奖励提现金额（仅记录，不发放）	
        startTime	活动开始时间
      message		
  3.新增\编辑
    接口：/admin/pinball/invitation/activity/save
    入参：
      activityId	活动ID（新增时为空，编辑时必填）			
      activityName	活动名称			
      description	活动说明			
      enableFlag	启用开关：0-禁用，1-启用，默认 0			
      endTime	活动结束时间			
      inviteLimit	单个邀请人邀请上限（0=不限）			
      realNameRequired	是否要求被邀请人实名：0-否，1-是			
      rechargeRequired	是否要求被邀请人完成弹珠充值：0-否，1-是			
      rewardMarble	奖励弹珠数量			
      rewardMemberPoint	奖励会员积分数量			
      rewardPointCard	奖励积分卡数量			
      rewardWithdrawAmount	奖励提现金额（仅记录）			
      startTime	活动开始时间			
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  4.删除
    接口：/admin/pinball/invitation/activity/delete
    入参：
      activityId	活动ID	
    出参：
      {
        "code": 0,
        "message": ""
      }
  5.邀请记录-分页列表
    接口：/admin/pinball/invitation/record/page
    入参：
      activityId	活动ID			
      current	当前页			
      inviteePhone	被邀请人手机号			
      inviterUserId	邀请人用户ID			
      pageSize	每页大小			
      recordStatus	整体状态：1-进行中，2-成功，3-失败			
      sortField	排序字段集合			
        asc				
        column				
    出参：
      code	
      data		
        current	当前页		
        data	返回数据	array	InvitationRecordResp
          activityId	活动ID		
          activityName	活动名称		
          invitationCode	使用的邀请码		
          inviteTime	邀请时间		
          inviteeCertificateNo	被邀请人证件号码		
          inviteePhone	被邀请人手机号		
          inviteeUserId	被邀请人用户ID		
          inviterNickName	邀请人昵称		
          inviterUserId	邀请人用户ID		
          realNameStatus	实名进度：0-未完成，1-已完成		
          realNameTime	实名完成时间		
          rechargeStatus	充值进度：0-未完成，1-已完成		
          rechargeTime	充值完成时间		
          recordId	记录ID		
          recordStatus	整体状态：1-进行中，2-成功，3-失败		
          rewardStatus	奖励发放状态：0-未发放，1-已发放		
          rewardTime	奖励发放时间		
        pageSize	每页大小		
        total	总条数		
      message		
六.充值套餐管理
  1.分页查询充值套餐
    接口：/admin/pinball/recharge/page
    入参：
      current	当前页			
      packageName	套餐名称（模糊查询）			
      pageSize	每页大小			
      sortField	排序字段集合			
        asc				
        column				
      status	状态：1-启用，0-停用
    出参：
      code
      data
        current	当前页	
        data	返回数据
          createTime	创建时间		
          createUserName	创建人姓名		
          giftMarbleAmount	赠送弹珠数量		
          giftMemberPointAmount	赠送会员积分数量		
          giftPointCardAmount	赠送积分卡数量		
          marbleAmount	充值弹珠数量		
          packageId	套餐ID		
          packageName	套餐名称		
          payAmount	支付金额（元）		
          remark	备注		
          sortOrder	显示排序		
          status	状态：1-启用，0-停用		
          updateTime	更新时间		
          updateUserName	更新人姓名		
        pageSize	每页大小	
        total	总条数	
      message	
  2.新增充值套餐
    接口：/admin/pinball/recharge/add
    入参：
      giftMarbleAmount	赠送弹珠数量			
      giftMemberPointAmount	赠送会员积分数量			
      giftPointCardAmount	赠送积分卡数量			
      marbleAmount	充值弹珠数量			
      packageName	套餐名称			
      payAmount	支付金额（元，精确到2位小数）			
      remark	备注			
      sortOrder	显示排序（越小越靠前）			
      status	状态：1-启用，0-停用（新增不传默认启用）
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  3.修改充值套餐
    接口：/admin/pinball/recharge/update
    入参：	
      giftMarbleAmount	赠送弹珠数量			
      giftMemberPointAmount	赠送会员积分数量			
      giftPointCardAmount	赠送积分卡数量			
      marbleAmount	充值弹珠数量			
      packageId	套餐ID（新增时为空，修改时必填）			
      packageName	套餐名称			
      payAmount	支付金额（元，精确到2位小数）			
      remark	备注			
      sortOrder	显示排序（越小越靠前）			
      status	状态：1-启用，0-停用（新增不传默认启用）
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  4.删除充值套餐
    接口：/admin/pinball/recharge/delete
    入参：packageId	套餐ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  5.启用-禁用充值套餐
    接口：/admin/pinball/recharge/status
    入参：	
      packageId	套餐ID
      status	状态：1-启用，0-停用
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
七.会员等级管理
  1.新增等级规则
    接口：/admin/pinball/level/config/add
    入参：	
      goldBonusRate	金币加成（%）			
      levelName	等级名称			
      levelValue	等级对应的值，从1开始			
      serviceLevel	客服支持：1-标准客服，2-优先客服，3-专属客服，4-vip专属客服，5-首席客服			
      shoppingDiscountRate	购物折扣（%）			
      status	状态：1-启用，0-停用（新增不传默认启用）			
      upgradeAmount	晋升该等级所需充值金额（单位：元）	
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  2.修改等级规则
    接口：/admin/pinball/level/config/update
    入参：	
      goldBonusRate	金币加成（%）			
      levelId	等级ID（新增时为空，修改时必填）			
      levelName	等级名称			
      levelValue	等级对应的值，从1开始			
      serviceLevel	客服支持：1-标准客服，2-优先客服，3-专属客服，4-vip专属客服，5-首席客服			
      shoppingDiscountRate	购物折扣（%）			
      status	状态：1-启用，0-停用（新增不传默认启用）			
      upgradeAmount	晋升该等级所需充值金额（单位：元）	
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  3.删除等级规则
    接口：/admin/pinball/level/config/delete
    入参：levelId	等级ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  4.查询等级规则列表
    接口：/admin/pinball/level/config/list
    入参：
    出参：
      code
      data
        beginTime			
        createTime	创建时间
        createUser	创建人	
        createUserName	创建人姓名		
        deleteFlag	是否删除：0-未删除，1-已删除		
        endTime			
        goldBonusRate	金币加成	
        levelId	等级ID	
        levelName	等级名称		
        levelValue	等级对应的值，从1开始	
        params	其他搜索内容, K-V结构	object	
        searchTime			
        serviceLevel	客服支持：1-标准客服，2-优先客服，3-专属客服，4-vip专属客服，5-首席客服		
        shoppingDiscountRate	购物折扣	
        status	状态：1-启用，0-停用		
        updateTime	更新时间
        updateUser	更新人	
        updateUserName	更新人姓名		
        upgradeAmount	晋升该等级所需充值金额		
      message
  5.查询等级规则详情
    接口：/admin/pinball/level/config/detail
    入参：levelId	等级ID
    出参：
      code	
      data	用户等级晋升配置对象
        beginTime			
        createTime	创建时间	
        createUser	创建人	
        createUserName	创建人姓名		
        deleteFlag	是否删除：0-未删除，1-已删除	
        endTime			
        goldBonusRate	金币加成	
        levelId	等级ID	
        levelName	等级名称		
        levelValue	等级对应的值，从1开始	
        params	其他搜索内容, K-V结构		
        searchTime			
        serviceLevel	客服支持：1-标准客服，2-优先客服，3-专属客服，4-vip专属客服，5-首席客服	
        shoppingDiscountRate	购物折扣	
        status	状态：1-启用，0-停用	
        updateTime	更新时间	
        updateUser	更新人	
        updateUserName	更新人姓名		
        upgradeAmount	晋升该等级所需充值金额	
      message
  6.管理员手动指定用户等级
    接口：/admin/pinball/level/user/assign
    入参：	
      levelValue	目标等级值			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  7.【全局策略】查询等级策略配置
    接口：/admin/pinball/level/strategy/getConfig
    入参：
      code
      data		用户等级策略配置
        configId	配置ID	
        createTime	创建时间	
        createUser	创建人	
        createUserName	创建人姓名		
        downgradeDays	降级观察天数（strategy_type=2时有效）	
        downgradeMinRechargeAmount	观察期内最低充值金额，低于此值降1级（strategy_type=2时有效）	
        remark	备注		
        rewardValidityDays	等级奖励有效期（天），0=永久	
        strategyType	等级策略：1-只升不降，2-有降有升	
        updateTime	更新时间	
        updateUser	更新人	
        updateUserName	更新人姓名		
      message
    出参：
  8.【全局策略】保存等级策略配置
    接口：/admin/pinball/level/strategy/saveConfig
    入参：
      downgradeDays	降级观察天数（strategy_type=2时必填）			
      downgradeMinRechargeAmount	观察期内最低充值金额（strategy_type=2时必填）			
      remark	备注			
      rewardValidityDays	等级奖励有效期（天），0=永久			
      strategyType	等级策略：1-只升不降，2-有降有升
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
八.用户管理
  1.分页查询用户列表
    接口：/admin/pinball/user/page
    入参：
      current	当前页			
      levelValue	会员等级			
      nickName	用户昵称（模糊查询）			
      pageSize	每页大小			
      phone	手机号码（模糊查询）			
      sortField	排序字段集合			
        asc				
        column				
      status	帐号状态：1-正常，0-停用			
      userName	用户账号（模糊查询）
    出参：
      code
      data
        current	当前页	
        data	返回数据	array
          avatar	头像地址		
          birthday	生日		
          createTime	注册时间		
          gender	用户性别：1-男，2-女，3-未知		
          levelName	会员等级名称		
          levelValue	会员等级值		
          loginDate	最近登录时间		
          marbleAmount	弹珠余额		
          memberPointAmount	会员积分余额		
          nickName	用户昵称		
          phone	手机号码		
          pointCardAmount	积分卡余额		
          status	帐号状态：1-正常，0-停用		
          totalRechargeAmount	充值总金额（元，统计成功充值订单）	
          userId	用户ID		
          userName	用户账号		
        pageSize	每页大小	
        total	总条数	
      message	
  2.查询用户详情
    接口：/admin/pinball/user/detail
    入参：userId	用户ID
    出参：
      code
      data object
        avatar	头像地址		
        birthday	生日		
        createTime	注册时间		
        gender	用户性别：1-男，2-女，3-未知		
        levelName	会员等级名称		
        levelValue	会员等级值		
        loginDate	最近登录时间		
        marbleAmount	弹珠余额		
        memberPointAmount	会员积分余额		
        nickName	用户昵称		
        phone	手机号码		
        pointCardAmount	积分卡余额		
        status	帐号状态：1-正常，0-停用		
        totalRechargeAmount	充值总金额（元，统计成功充值订单）	
        userId	用户ID		
        userName	用户账号		
      message
  3.修改用户资料
    接口：/admin/pinball/user/update
    入参：
      avatar	头像地址			
      birthday	生日			
      gender	用户性别：1-男，2-女，3-未知			
      nickName	用户昵称			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  4.删除用户
    接口：/admin/pinball/user/delete
    入参：userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  5.启用-停用用户
    接口：/admin/pinball/user/status
    入参：
      status	帐号状态：1-正常，0-停用			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  6.给指定用户发放弹珠
    接口：/admin/pinball/user/grantMarble
    入参：
      amount	发放弹珠数量			
      remark	备注			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  7.给指定用户发放会员积分
    接口：/admin/pinball/user/grantMemberPoint
    入参：
      amount	发放会员积分数量			
      remark	备注			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
  8.给指定用户发放积分卡
    接口：/admin/pinball/user/grantPointCard
    入参：
      amount	发放积分卡数量			
      remark	备注			
      userId	用户ID
    出参：
      {
        "code": 0,
        "data": 0,
        "message": ""
      }
九.首页管理
  1.首页概览统计（GMV、用户数、会员数、订单总量）
    接口：/admin/pinball/statistics/homeOverview
    入参：
    出参：
      code
      data object
        gmv	GMV：成功充值总金额（元）		
        memberCount	会员数：等级>1的付费会员数	
        orderCount	订单总量：成功充值订单数	
        userCount	用户数：已注册未删除用户数	
      message	
十.MQTT消息日志
  1.分页查询MQTT消息日志
    接口：/admin/pinball/mqttLog/page
    入参：
      beginTime	创建时间起			
      cmd	指令码			
      current	当前页			
      deviceId	设备ID			
      direction	方向：0-下行发送，1-上行接收			
      endTime	创建时间止			
      pageSize	每页大小			
      sortField	排序字段集合			
        asc				
        column				
      status	处理状态：0-成功，1-失败
    出参：
      code
      data
        current	当前页
        data	返回数据	array
          cmd	指令码		
          createTime	创建时间		
          deviceId	设备ID		
          direction	方向：0-下行发送，1-上行接收		
          errorMsg	错误信息		
          logId	日志ID		
          payload	完整报文(JSON)		
          status	处理状态：0-成功，1-失败		
          topic	MQTT主题		
        pageSize	每页大小
        total	总条数
      message
十一.订单管理
  1.分页查询订单
    接口：/admin/pinball/shop/order/page
    入参：
      createTimeEnd	创建时间止（含）			
      createTimeStart	创建时间起（含）			
      current	当前页			
      orderId	订单号（模糊查询）			
      orderStatus	订单状态：0-待支付，1-已支付，2-已发货，3-已收货，4-退款中，5-已退款，6-已关闭
      pageSize	每页大小			
      recipientPhone	收货人电话（模糊查询）			
      sortField	排序字段集合			
        asc				
        column		
    出参：
      code
      data
        current	当前页
        data	array
          createTime	创建时间		
          firstProductImage	商品主图（第一个商品）		
          firstProductName	商品名称（第一个商品，冗余展示）		
          memberPointAmount	会员积分支付金额		
          orderId	订单号		
          orderStatus	订单状态：0-待支付，1-已支付，2-已发货，3-已收货，4-退款中，5-已退款，6-已关闭		
          payAmount	实付积分卡数		
          pointCardAmount	积分卡支付金额		
          totalAmount	商品总积分卡数		
          totalQuantity	商品总数		
        pageSize	每页大小
        total	总条数
      message
  2.订单详情
    接口：/admin/pinball/shop/order/detail
    入参：
      orderId	订单号
    出参：
      code
      data object
        createTime	创建时间	
        items	订单明细列表	array	
          pointType	支付方式：0-积分卡，1-会员积分		
          price	下单时单价		
          productImage	商品主图		
          productName	商品名称		
          quantity	数量		
          skuName	规格名称		
        logistics	物流信息	object
          lastQueryTime	最后查询时间		
          logisticsCompany	快递公司名称		
          logisticsNo	物流单号		
          logisticsStatus	最新物流状态		
          trackingJson	快递100轨迹JSON		
        orderId	订单号		
        orderStatus	订单状态：0-待支付，1-已支付，2-已发货，3-已收货，4-退款中，5-已退款，6-已关闭	
        payAmount	实付积分卡数	
        payTime	支付时间	
        recipientAddress	收货详细地址		
        recipientName	收货人姓名		
        recipientPhone	收货人电话		
        refund	退款信息	object
          auditRemark	审核备注		
          refundAmount	退款积分卡数		
          refundId	退款ID		
          refundReason	退款原因		
          refundStatus	退款状态：0-待审核，1-已同意，2-已拒绝，3-已完成		
          refundTime	退款完成时间		
        remark	用户备注		
        totalAmount	商品总积分卡数	
      message
  3.录入物流单号（发货）
    接口：/admin/pinball/shop/logistics/save
    入参：
      logisticsCompany	快递公司名称			
      logisticsCompanyCode	快递100公司编码（如yuantong），参考快递100编码表			
      logisticsNo	物流单号			
      orderId	订单号
    出参：
      {
        "code": 0,
        "message": ""
      }
  4.分页查询退款申请
    接口：/admin/pinball/shop/refund/page
    入参：
      createTimeEnd	创建时间止（含）			
      createTimeStart	创建时间起（含）			
      current	当前页			
      orderId	订单号（模糊查询）			
      pageSize	每页大小			
      refundStatus	退款状态：0-待审核，1-已同意，2-已拒绝，3-已完成			
      sortField	排序字段集合			
        asc				
        column				
      userId	用户ID
    出参：
      code
      data
        current
        data	array
          auditRemark	审核备注		
          refundAmount	退款积分卡数		
          refundId	退款ID		
          refundReason	退款原因		
          refundStatus	退款状态：0-待审核，1-已同意，2-已拒绝，3-已完成		
          refundTime	退款完成时间		
        pageSize	每页大小	
        total	总条数	
      message
  5.审核退款
    接口：/admin/pinball/shop/refund/audit
    入参：
      approved	审核结果：1-同意，2-拒绝			
      auditRemark	审核备注			
      refundId	退款ID
    出参：
      {
        "code": 0,
        "message": ""
      }
十二.提现管理
  1.审核提现
    接口：/admin/pinball/withdraw/audit
    入参：
      auditRemark	审核备注
      auditResult	审核结果：1-通过，2-拒绝
      withdrawNo	提现单号
    出参：
      {
        "code": 0,
        "message": ""
      }
  2.提现记录详情
    接口：/admin/pinball/withdraw/log/detail
    入参：
      withdrawNo	提现单号
    出参：
      code
      data
        actualAmount	实际转账金额		
        applyTime	申请时间	
        auditTime	审核时间	
        auditUserName	审核人姓名		
        failReason	失败或拒绝原因		
        feeAmount	手续费金额		
        finishTime	完成时间	
        transferTime	发起转账时间	
        userId	用户ID	
        withdrawAmount	申请提现金额		
        withdrawChannel	提现渠道		
        withdrawId	提现记录ID	
        withdrawNo	平台提现单号		
        withdrawStatus	提现状态：0-待审核，1-转账中，2-提现成功，3-提现失败，4-审核拒绝，5-用户取消		
      message
  3.分页查询提现记录
    接口：/admin/pinball/withdraw/log/page
    入参：
      applyTimeEnd	申请时间止			
      applyTimeStart	申请时间起			
      current	当前页			
      pageSize	每页大小			
      sortField	排序字段集合			
        asc				
        column				
      userId	用户ID			
      withdrawNo	提现单号			
      withdrawStatus	提现状态：0-待审核，1-转账中，2-提现成功，3-提现失败，4-审核拒绝，5-用户取消
    出参：
      code			
      data
        current	当前页	
        data	返回数据	array
          actualAmount	实际转账金额		
          applyTime	申请时间		
          auditTime	审核时间		
          auditUserName	审核人姓名		
          failReason	失败或拒绝原因		
          feeAmount	手续费金额		
          finishTime	完成时间		
          transferTime	发起转账时间		
          userId	用户ID		
          withdrawAmount	申请提现金额		
          withdrawChannel	提现渠道		
          withdrawId	提现记录ID		
          withdrawNo	平台提现单号		
          withdrawStatus	提现状态：0-待审核，1-转账中，2-提现成功，3-提现失败，4-审核拒绝，5-用户取消		
        pageSize	每页大小	
        total	总条数	
      message
  4.主动查询支付宝转账状态
    接口：/admin/pinball/withdraw/queryTransfer
    入参：
      withdrawNo	提现单号
    出参：
      {
        "code": 0,
        "message": ""
      }
  5.重试支付宝转账
    接口：/admin/pinball/withdraw/retryTransfer
    入参：
      withdrawNo	提现单号
    出参：
      {
        "code": 0,
        "message": ""
      }