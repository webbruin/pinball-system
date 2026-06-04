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
        createTime	创建时间	(date-time)	
        expireTime	过期时间，为空表示永久有效	(date-time)	
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