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
    } else if ($.inviteFriendRes && $.inviteFriendRes.helpResult && $.inviteFriendRes.helpResult.code === '17') {
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
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
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
      UserAgent: $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
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
var _0xodc='jsjiami.com.v6',_0x2642=[_0xodc,'LGfDgBEJ','KsKZSCfDrQ==','NMOxw43ChsOv','fDLCr2Fz','M1bDiMK+','wrhZN8OF6Kyo5rKt5aaX6Lea77636K2x5qKy5pyv57+e6LWP6YSg6K6z','w6DCoCoww40=','OVbDkcK6BcKBdMOB','wrXCicOhN8Kf','w4DCjyXDvsKvwrRW','TWs1worDjMOGwqHCmg==','RXkyTA==','wrkGUMO6w6XDkw==','DXNPARQ=','wqLDj8K3w6rCuw==','w7QawqnDnsOn','GlYjw6Zt','wqTCkRU=','RQ8nw5E=','Cy8aw73orL/msJHlpLXot7nvvYPor6vmo5XmnZTnvI/otKjphJboroU=','wr/Crz/Cp8K2','w5nCg3Nrw7k=','Y0QzwrvDpQ==','w6TChA3DpMKy','RD/CrsKXw5A=','Qxo+w4TCu2krw7ModWHDlDvDqcK4P8OLw6omHnNjwr0Cwo18w5dWwoDCrsOxbsO7wpRmwohtTsKswpZrWFzCthplZR3Co3cVM8KKw686w5TCkDXDsMKIK8KEw5k5wrPCvsOMw6I=','wojCh8OpLcKWAsO/L05PLsOLBcKLw7nDtcOsw6BUwpcGUwfCszjCpFTCqMKWX8Kewp9nYQhLw7LClsOXXMOlZBfCkcOZw6vDpTvDrsO7wocPMl1Tw5PDojtKwqJQwpcJK8OOw6HDkUJGwqXDnzUXwqjDsjfDtcKwPsKTwpIEGU7Ci8Ovw5vCp8K1M0TDosOuwr/DolozQMKvIsKKwoDCsVLDuMKaE8O3NgnDrRxcwqEFKQzDvMKqwpdkPsKGwrM4wqkCIcKnwq7DmMOxPA8zw4USw74Jw59Ce1AZM8K1HMOJw4Mhw4onwrXDnisK','w44TwobDu8OW','wrrClj1pJg==','bA3CqcKaw5A=','dsKTw5zDgxQ=','wrfCvQc=','WBcTw7nCgQ==','PcO7w7fCkMOe','LXgLw47DiQ==','DVIew4fDnA==','w5/DvzYDwqo=','wqLCi8OSEMKj','w6PCtyw=','wrzDvMOswqc=','wrkGUA==','TB/CkMKY','woHCohnDlOisreayn+Wkg+i0pO+9j+isuuahseaepOe8rOi0numFjOivkg==','DcKEw7dEw7I=','wqzCnwZeNMKww4A=','XApHWVI=','w50swpPDrcOB','Qm0vScKdTk0=','XcKGDcK0w63CuA==','w4odwqzDlsOS','CB1xwr0FdMOgwrbDsXPDrzQi','wrfCvSjCssKJRA==','w7nCgcKrGMOwwqnCuQ==','w67CkyzDs8KIwrhWUSLCrsOaJAk=','FcK0w4Rm','F1UVw4N8','wqnCnyJSGA==','wr3CtwXCscKn','LTR6wp8k','XzXCgEZHwqs=','wqbCkCJFNA==','w50EwpbDh8Os','w6oxwo3Dt8O0','KUXDpzkO','Ai54wpYg','w6PCkDosw5U=','Sh4jwprCpX1uwrhhf3rDnA==','TGLCkMK0wpcSwrvDt8OPBMKuwqNyCmvCsmgWGMOxw5DDvArClsKZw7PDoMOdV2nDjQpp','SgrCicKNw5lawrpTwotxZ8KDaMKYwpbDmxnCisO7','TBQjw4TDpHNgwrkpcHTDhTvDq8O7MsOU','wrvCvRZ7d8Oow4QfwoIQ','Jld5OgnCksK6N8OAB0/DigUDwrrCjQvDqcK8HCjDnznDuVwlw440ZcKJwpLDtTc=','LcK9asOJwqTDrcKICQ0SwqrDgsKo','w5TChkdi','w44PwqPDhMOzw5bClFEtwoVWX8OfRsKDw7nCkUrDkCzCvGVBDUxWwr9ywotRekXCucOoX8Ozw7zCp8Oxw70yw63DgMOVb8O5QsKXNFbDmcOfwo7Dh3bCtmEEw4HCrMO3w6fDvHNcwr1MLMOgw4jCscOEw4wSw7rCukQ=','NMKkO8O9MQ==','V01Tw4TDrMOVCg==','I2/DoQ8V','Hgp4wqIt','wp3CoEUOaMKk','wrVMw6DCpcONA8Ok','w7LCp3xEw6jDsQ==','XnrCgcKqwpsywrXDp8OD','wpDDmcOLw7bCug==','w7XClMKrCcOEw7bDosKLVTfDnMKzw7sdw40Zwqk/JANrFB3DuifDtMOpM8OawpYLwqkwGQ==','wpjCth/CusK+','wpQRXsO1w78=','w5/DgA88wr0=','B8KywpRrw5Y=','VsOZesOewoc=','P0BMNSo=','wobCsmUFY8Ks','K8KiYA==','F3PDusKOEcKhUsKvQsKFAsOeAg==','worCr10=','eQxcRMOxRcOhw4oVRirCqMOP','UsOzcMOpwqQ=','G8KTw5hkw7s=','w7TCsAzDj8KFwpx1RA3CmQ==','TMK4w7Adw4TDlz0=','fRo6A8O0','TAs+w5DCqSdl','G0Yqw5DDjA==','woxTw7vCo8OL','G8KTwrpQw7F2UUQDe8K3wrbCuD0QS8OmwofDlMORHRbCjMOpw4bChzzCl0NQPcOQw6zDp8OXw459w7PDisK1wrkuJMOhw7Q+KgUafhHCmMK7wr8Kw7vDrEvCkRhhwpnCvcOvwqTDqQXDv8OtXnDCicOlVEUTwq7DiyfCqsO8w4VuCMONH8KEwqRh','UmY3YsK2','wqHDvcKzwr12L8OCS3TDg0HDkQnCs8O1wpLDn8KdJ3PDocKDw5LCosKjdcOlRSpPTWvClwnDj8OZEMKkw41mw5sYSwg=','YcORBCjDmnLDg8K5w6LCvS1vbMK8GDYWwrDDncOowqwUND19ElLCpX3CoMORwrdmw5vCm8KLBsO+YUXDp2grQzdmEsKeXsO3ZSbCjlbClgViS8OgfcK2w6NqwrPCkjTDlMOtPsKqbAkwwqRRwqNPw6bDncORw5nDjEVww5FV','wpnDi8OAw5zDog==','CGgiw6VQ','cCs7JMOT','w47CrGdFPg==','eQIZKcOo','ZWXCtcK/wqk=','c8O9TMOu','ZAsyFMOC','wp82woQwJg==','AyXCpxdG','b8O9WA==','woFcaDk=','w6XCqcODDeisjeawrOWmr+i0pe+9t+iuluajnuacjue9vOi0jemFpOitiA==','w4gEwqU=','IMKte8O7','ZyxEwprorqDmsZPlprXot4Pvvpzor6fmoYTmnrTnvIfotJPphZPorZo=','QzvClXBQ','dTN9SE8=','I8KtwoBhw64=','wpfDgsKTwp9u','XydkVMOQcg==','Wk5Yw6LDq8OO','XgI2AMOr','w7zDuAoawo0=','w4bDuhEdwo8=','w5rDoDYYwqE=','FSlfwoEl','J8K7UMORKQ==','e8KQJcKdw54=','wrVQw6XDqMOVRMOqw7/CisOiEVY=','UirCl29cwrpPwozDp8K9w7Q4wqPCusKowpfDt2PCv8OUwpQ3wqBDDyh0OSTDtUTCj8OX','L1N9JhPDi8O0bMOGGETCix0VwrHCk0bCqsKjHCTChnzDrVwtw5M/Z8ODw5zDtH4+BA==','wrXDp8OowrIzw5lEw6NDMMKYaTzCpXR6MA==','KMKYQzbCln7DisOywq7Dug==','PEfDlcK3K8KHYcKEasKtKcK/PHIbw5bCq8KCMMK+N8OUwoRkXcKQE8KETcKZwqDCuWk=','Wjoaw43DmxtxWcKlTcKuasK6','aDrCqMK8','CMKxw4xiw4fDuSVDwrjChgkEwrLDoT/DtcOGQcOneSZrwpjCiMKjbsOCwq9DJXLCocOWAsKNw4jDusOawq5qwp9lX8OeM8KFw4xzX8OdZA1jwqjCmGhZwqHDu8OsbCbCk2bDmsK2w5jCgsOKOCrCuXzDpRfDrsOt','UQZnw5fCpg==','XXPCg8KzwpsFwpPDpw==','LXfDuhAUw5J1wprChcOGwrTDhcKLwo58WU3DgTPCrDR8AsK9wq4=','woXCi0YZTg==','bcKFw6TDgT4=','WMKNFcKww5Q=','w7zCmxLCvhE=','VD1LYsOt','GybCkzlx','X1Jxw4jDvcOZ','w7jCjsKp','Sk/DrijDgzsJGMKvwoxpEHg=','VMKNFQ==','wqJeXRLDpA==','SHjCnXbDlQ==','LxzCtCJAwrPDp0ZPwrY=','TsKcw6gdw7M=','BcKww5l2w5bCti0=','wr7CmSrCscKr','FmU3w7he','w7rChgnCrQUUw44Jfy5nP1XDlzRAw7PCt8KvX8KSw5BXw6QDwrRkcEPDrFZ/LUzCnMOIwr8pwrXDqsKOw5nDh1ZUw7bCksK9XgJtA8KBUsK0HkDDvU8nVMOgHkIoFwV8MF7Cm1LDjMK/Jx48worCggfCknsFJy7DiMK9w6fDj0nCpcKTT05Jw5LDqcOCBVx+VcKY','D8K0esO1HQ==','Y2fDmBjDvgpmKsKLwqxNKl7DusKpw6pnw7MAw7wDwq3CvMO7HsKXMlNRw756w4RCEcKaLCJewqDChzAdw4EqCEbCj8OuAnXDvcO8wqxWd8KdwokrHzLDpVzDs29NwpwMwovCs8Kcwr/Co8OoLMOIwq7DvMOLcV8dwrk4E0t2w5NdWsKtDzpAw7lxw7Rawp0uw55yfwfCnsKIaxrCv8KAbsKUXsKqw7fDsUnCrcKfw7vCmj7DmVxKwoBgw69Dw4QpI8KnacKrw6nDn8O9MDHDi1zDoMKLwofCvsOXC8KSDC4CS8Kxw6QPwonCssOMcsOtw4fCgMO+wpbCj8Kkw7TDscKtasKiN2jCsWxSDsKewrUIwooRwp0LwpLDs8OXwpcCwqM=','CUJow5XCqydNwrhtJjfChjjDt8OrYMKfwqEwEz8/w6xFw51twppRwpzCuMO/asKxw4lBw5A4E8OmwoA5TkvDuVc0dwrCvjYuJsKBw6Uhw5/CnRHDgsKfIcKVw5hkw7vDt8KBw79HScOxOnfDhcO3woQgwoFHHmALLk/DvsOhFBnChsOIwpnDkVNmQVEHWcKCLcOw','RMKKw5kv','cTlVY8Og','wq0+XsO5w5o=','HiHCkBpQ','wp/Cvh5+NA==','wp9afAjDsw==','NsO6w53CqsOs','HgbCnwpT','w4TCgTrCsR0=','A8KGUsOkDQ==','eXFlw5bDkw==','wqDCtwB/','F8KAw5t5w5E=','wpTCrQpFLg==','MsOaw4fCgsOl','wrXCuE0EcA==','wpbDqMO4woxr','UTFmdsOr','GDbClBdW','woszwp4wEw==','KWzDqQ==','w7zCkxDCuA==','DCplY+ivgOazpOWmg+i3uu+9heiutOaim+actOe9sOi2kOmFs+iuiw==','MsK0w4B7w7k=','woDDqsOzw5fDsw==','WA5MTUI=','WyxCblA=','w6h5FcO/wro=','Vm0pW8K/','woNSYhnDkxI=','fiY4CMOUbg==','wrbCrsOCAcKO','fgDCj2t3','ZFApwoPDiQ==','Q3RJw4zDvw==','LVjDqMKCJQ==','wq7CixdwEQ==','JsK4YsOuLBPDkGbChsKzw6M1wrHCjnkVwpZ5wo3CjcKjwpzDvcOcLAhawprCnsKRwpVhSWZDwrXCusO1WGfClMKwRQfCiWQZwrJOdsKAwpV+K8Kfw5FIBD4tJsO+','ZsKyw74Qw4nDjz3DosOZw5vCt8OJEMOFFAHDucOSccKowo8kw744ZcK3w4JtRcOzGG7DgsKgw4HCjsKcUsKZbcKsw7EKfcKLwr3DmSpeGCEmw74sWsOWwpQ7I8OKwr0AV8OAwp82w4xow4TCkn8AZcO+wot+OnhiRB/Du1sAX0fDj3lew5h5w5DDosKRwoleeAIzw7gibsOsw4wuw67Dr8OFOSvCrwDCqw1XVm7DssOgw6PDrsKveErDpCjCvMK4wo9sw7XCuMKGwr3DqwvDtDLDoMKIR1PDqMKBw4sMJTPCr0Bwb8KyLHAn','RRvCiQ==','wqXDusOqw73DoA==','w6nChcK1LsOz','woNSYg==','w5PDrcOyw5vorbDmsI/lp5botqbvvpXorYjmoaXmnarnv6votYvphaborpY=','w5HDtBYYwonDtGM=','wqvCuTTCpsKY','wqbDhMOswoVF','TMK1w4o9w5A=','ZGrDhRzDlxsv','dSjCgmY=','w43ChifDusKuwrU=','wrY5f8O0w7U=','wrbDvMO1wqNYwpxU','w6fCkSzDuA==','GHAhw7nDqiE=','wqrDqMKGw6nCncOsw6Q=','NcKVwqtF','wowzwoU3','SGAwesK1','Ql3CtFzDjw==','ecKmw5rDpxc=','wp/Ck3Edfw==','SMKyw5LDkxY=','dHnCi8K/woY=','woHCoEYP','w7UoZ8O26K2g5rOj5aeQ6La1776P6K+35qGu5p2T57216LS96YWA6K6x','fFNrw7LDlw==','DVQ9w5F0','wobCgl8oag==','w5daEsOqwpk=','wpbDr8Orw6vDpg==','Q8Kpw7AJw5bCmXPDosKfwp3DssKQXcKbdkfDtcOTcMO6w4EAwoADIMKqwr11BcO+EirDpMKdwobCksOMYsOPV8KywrYTfcKEwr3DlgMQGG4Nw4RiZcOSw5cVN8Ofw7wCdcOMwpkYwop7woLDkGBHKsK4wooibis+aiXCgGIpABPCjXpGw5I3','wrnDu8OUw6fDlw==','EXfDoyoC','fsKuJsK8w5g=','QlsYcsKb','CcOfw6PCjsOH','GcOrw5XCiMOe','QMO+TsOqwoc=','EF7DsMK1NA==','MlM5w6Bp','KcKpYg==','wrMUwpUpMg==','bFgdf8Ku','wo51TjXDhg==','HBjsjYiamiByLq.dcOMOopXwm.v6=='];(function(_0xd5494d,_0x5024df,_0x58e0e0){var _0x2554ac=function(_0x40079e,_0x44dda7,_0x171cd3,_0x503dc6,_0x5d8ec0){_0x44dda7=_0x44dda7>>0x8,_0x5d8ec0='po';var _0x203017='shift',_0x340491='push';if(_0x44dda7<_0x40079e){while(--_0x40079e){_0x503dc6=_0xd5494d[_0x203017]();if(_0x44dda7===_0x40079e){_0x44dda7=_0x503dc6;_0x171cd3=_0xd5494d[_0x5d8ec0+'p']();}else if(_0x44dda7&&_0x171cd3['replace'](/[HBYByLqdOMOpXw=]/g,'')===_0x44dda7){_0xd5494d[_0x340491](_0x503dc6);}}_0xd5494d[_0x340491](_0xd5494d[_0x203017]());}return 0x87117;};var _0x3b2831=function(){var _0x3c77e8={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x2bf38d,_0x636315,_0x5d3676,_0x39ba77){_0x39ba77=_0x39ba77||{};var _0x5c0911=_0x636315+'='+_0x5d3676;var _0x59beef=0x0;for(var _0x59beef=0x0,_0x196ef4=_0x2bf38d['length'];_0x59beef<_0x196ef4;_0x59beef++){var _0x46316b=_0x2bf38d[_0x59beef];_0x5c0911+=';\x20'+_0x46316b;var _0x5dd047=_0x2bf38d[_0x46316b];_0x2bf38d['push'](_0x5dd047);_0x196ef4=_0x2bf38d['length'];if(_0x5dd047!==!![]){_0x5c0911+='='+_0x5dd047;}}_0x39ba77['cookie']=_0x5c0911;},'removeCookie':function(){return'dev';},'getCookie':function(_0x34a5a2,_0x359e90){_0x34a5a2=_0x34a5a2||function(_0x54eb9b){return _0x54eb9b;};var _0x26810f=_0x34a5a2(new RegExp('(?:^|;\x20)'+_0x359e90['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x48268b=typeof _0xodc=='undefined'?'undefined':_0xodc,_0x46f56e=_0x48268b['split'](''),_0x41324f=_0x46f56e['length'],_0x429262=_0x41324f-0xe,_0x5cab6a;while(_0x5cab6a=_0x46f56e['pop']()){_0x41324f&&(_0x429262+=_0x5cab6a['charCodeAt']());}var _0x56a0c6=function(_0x6a252c,_0x2dd205,_0xfbaee3){_0x6a252c(++_0x2dd205,_0xfbaee3);};_0x429262^-_0x41324f===-0x524&&(_0x5cab6a=_0x429262)&&_0x56a0c6(_0x2554ac,_0x5024df,_0x58e0e0);return _0x5cab6a>>0x2===0x14b&&_0x26810f?decodeURIComponent(_0x26810f[0x1]):undefined;}};var _0x3c8640=function(){var _0x5c09e0=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x5c09e0['test'](_0x3c77e8['removeCookie']['toString']());};_0x3c77e8['updateCookie']=_0x3c8640;var _0x21976e='';var _0xad7e3b=_0x3c77e8['updateCookie']();if(!_0xad7e3b){_0x3c77e8['setCookie'](['*'],'counter',0x1);}else if(_0xad7e3b){_0x21976e=_0x3c77e8['getCookie'](null,'counter');}else{_0x3c77e8['removeCookie']();}};_0x3b2831();}(_0x2642,0x13e,0x13e00));var _0x32b9=function(_0x4fdc40,_0x4a399b){_0x4fdc40=~~'0x'['concat'](_0x4fdc40);var _0x229f5a=_0x2642[_0x4fdc40];if(_0x32b9['yJZiJS']===undefined){(function(){var _0x51492d;try{var _0x1b1739=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x51492d=_0x1b1739();}catch(_0x3b17b5){_0x51492d=window;}var _0x2a490d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x51492d['atob']||(_0x51492d['atob']=function(_0x366a4a){var _0x3f06e5=String(_0x366a4a)['replace'](/=+$/,'');for(var _0x335dff=0x0,_0x2b6e98,_0x4cb629,_0x5158cc=0x0,_0x1b2a54='';_0x4cb629=_0x3f06e5['charAt'](_0x5158cc++);~_0x4cb629&&(_0x2b6e98=_0x335dff%0x4?_0x2b6e98*0x40+_0x4cb629:_0x4cb629,_0x335dff++%0x4)?_0x1b2a54+=String['fromCharCode'](0xff&_0x2b6e98>>(-0x2*_0x335dff&0x6)):0x0){_0x4cb629=_0x2a490d['indexOf'](_0x4cb629);}return _0x1b2a54;});}());var _0x36c423=function(_0xe17d6,_0x4a399b){var _0x403060=[],_0x2447e0=0x0,_0x2c1edb,_0x22bdb8='',_0x2da970='';_0xe17d6=atob(_0xe17d6);for(var _0x2aab31=0x0,_0x1b2ca8=_0xe17d6['length'];_0x2aab31<_0x1b2ca8;_0x2aab31++){_0x2da970+='%'+('00'+_0xe17d6['charCodeAt'](_0x2aab31)['toString'](0x10))['slice'](-0x2);}_0xe17d6=decodeURIComponent(_0x2da970);for(var _0x4e0d85=0x0;_0x4e0d85<0x100;_0x4e0d85++){_0x403060[_0x4e0d85]=_0x4e0d85;}for(_0x4e0d85=0x0;_0x4e0d85<0x100;_0x4e0d85++){_0x2447e0=(_0x2447e0+_0x403060[_0x4e0d85]+_0x4a399b['charCodeAt'](_0x4e0d85%_0x4a399b['length']))%0x100;_0x2c1edb=_0x403060[_0x4e0d85];_0x403060[_0x4e0d85]=_0x403060[_0x2447e0];_0x403060[_0x2447e0]=_0x2c1edb;}_0x4e0d85=0x0;_0x2447e0=0x0;for(var _0x18e915=0x0;_0x18e915<_0xe17d6['length'];_0x18e915++){_0x4e0d85=(_0x4e0d85+0x1)%0x100;_0x2447e0=(_0x2447e0+_0x403060[_0x4e0d85])%0x100;_0x2c1edb=_0x403060[_0x4e0d85];_0x403060[_0x4e0d85]=_0x403060[_0x2447e0];_0x403060[_0x2447e0]=_0x2c1edb;_0x22bdb8+=String['fromCharCode'](_0xe17d6['charCodeAt'](_0x18e915)^_0x403060[(_0x403060[_0x4e0d85]+_0x403060[_0x2447e0])%0x100]);}return _0x22bdb8;};_0x32b9['OOWNiQ']=_0x36c423;_0x32b9['JvhPOM']={};_0x32b9['yJZiJS']=!![];}var _0x783355=_0x32b9['JvhPOM'][_0x4fdc40];if(_0x783355===undefined){if(_0x32b9['QcHAHf']===undefined){var _0x3bdf11=function(_0x43da67){this['iuhyyG']=_0x43da67;this['QsVPsT']=[0x1,0x0,0x0];this['fKhkOV']=function(){return'newState';};this['YCqCsS']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['rTlszj']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x3bdf11['prototype']['VaNIWR']=function(){var _0x409ae7=new RegExp(this['YCqCsS']+this['rTlszj']);var _0x53d2c5=_0x409ae7['test'](this['fKhkOV']['toString']())?--this['QsVPsT'][0x1]:--this['QsVPsT'][0x0];return this['sypPYW'](_0x53d2c5);};_0x3bdf11['prototype']['sypPYW']=function(_0x32cd4a){if(!Boolean(~_0x32cd4a)){return _0x32cd4a;}return this['EWfErU'](this['iuhyyG']);};_0x3bdf11['prototype']['EWfErU']=function(_0x4a3ae4){for(var _0x50f8e1=0x0,_0x389a05=this['QsVPsT']['length'];_0x50f8e1<_0x389a05;_0x50f8e1++){this['QsVPsT']['push'](Math['round'](Math['random']()));_0x389a05=this['QsVPsT']['length'];}return _0x4a3ae4(this['QsVPsT'][0x0]);};new _0x3bdf11(_0x32b9)['VaNIWR']();_0x32b9['QcHAHf']=!![];}_0x229f5a=_0x32b9['OOWNiQ'](_0x229f5a,_0x4a399b);_0x32b9['JvhPOM'][_0x4fdc40]=_0x229f5a;}else{_0x229f5a=_0x783355;}return _0x229f5a;};var _0x1f392a=function(){var _0x19cebe=!![];return function(_0x46bdee,_0x27bab6){var _0x28f5e7=_0x19cebe?function(){if(_0x27bab6){var _0x4403f1=_0x27bab6['apply'](_0x46bdee,arguments);_0x27bab6=null;return _0x4403f1;}}:function(){};_0x19cebe=![];return _0x28f5e7;};}();var _0xedb798=_0x1f392a(this,function(){var _0x30780c=function(){return'\x64\x65\x76';},_0x27b9ab=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x5b5333=function(){var _0x4cc179=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4cc179['\x74\x65\x73\x74'](_0x30780c['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4f9dfe=function(){var _0xc0ee6e=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0xc0ee6e['\x74\x65\x73\x74'](_0x27b9ab['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2cd82a=function(_0x3622c5){var _0x5b7ce0=~-0x1>>0x1+0xff%0x0;if(_0x3622c5['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5b7ce0)){_0x35cdc3(_0x3622c5);}};var _0x35cdc3=function(_0x512b60){var _0x3dc615=~-0x4>>0x1+0xff%0x0;if(_0x512b60['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x3dc615){_0x2cd82a(_0x512b60);}};if(!_0x5b5333()){if(!_0x4f9dfe()){_0x2cd82a('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x2cd82a('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x2cd82a('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0xedb798();function wuzhi(_0x4a6a0c){var _0x5e9738={'jgbNe':function(_0x295bff,_0x494d0f){return _0x295bff!==_0x494d0f;},'plmpi':_0x32b9('0','RXJ8'),'bbdiu':_0x32b9('1','LW(G'),'IqWyG':function(_0x4bfea9,_0x29f70b){return _0x4bfea9===_0x29f70b;},'kKFdN':_0x32b9('2','TogX'),'HwUgW':function(_0x1dc081){return _0x1dc081();},'Yglqz':function(_0xe9cdd6,_0x436c9f){return _0xe9cdd6*_0x436c9f;},'CnYoC':_0x32b9('3','xzN1'),'AxiJh':_0x32b9('4','gU9('),'jUmEs':_0x32b9('5','S&pX'),'tUZKT':_0x32b9('6','xzN1'),'UKEDf':_0x32b9('7','@fKG'),'xgEcJ':_0x32b9('8','qCP('),'QaOsE':function(_0x265aab,_0x466764){return _0x265aab(_0x466764);},'yFuvL':_0x32b9('9','ny]c'),'oSeNR':_0x32b9('a','Xl^F'),'Xswes':_0x32b9('b',']072'),'tjlJl':_0x32b9('c','UW0z')};var _0x18a3d8=$[_0x32b9('d','J7ec')][Math[_0x32b9('e','RXJ8')](_0x5e9738[_0x32b9('f','LW(G')](Math[_0x32b9('10','*lOW')](),$[_0x32b9('11','a9GM')][_0x32b9('12','Xl^F')]))];let _0x3e1817=_0x4a6a0c[_0x32b9('13','gU9(')];let _0x23f8b9=_0x32b9('14','acse')+_0x18a3d8+';\x20'+cookie;let _0x973d18={'url':_0x32b9('15','N#qE'),'headers':{'Host':_0x5e9738[_0x32b9('16','[9pj')],'Content-Type':_0x5e9738[_0x32b9('17','^&(L')],'origin':_0x5e9738[_0x32b9('18','FG%@')],'Accept-Encoding':_0x5e9738[_0x32b9('19','KA5z')],'Cookie':_0x23f8b9,'Connection':_0x5e9738[_0x32b9('1a','ny]c')],'Accept':_0x5e9738[_0x32b9('1b','qCP(')],'User-Agent':$[_0x32b9('1c','*lOW')]()?process[_0x32b9('1d','UW0z')][_0x32b9('1e','YMJK')]?process[_0x32b9('1f','*lOW')][_0x32b9('20',']ClE')]:_0x5e9738[_0x32b9('21','ny]c')](require,_0x5e9738[_0x32b9('22','6E$*')])[_0x32b9('23','Fz76')]:$[_0x32b9('24','V9od')](_0x5e9738[_0x32b9('25','7zGv')])?$[_0x32b9('26','xzN1')](_0x5e9738[_0x32b9('27','2z9K')]):_0x5e9738[_0x32b9('28','a9GM')],'referer':_0x32b9('29','KA5z'),'Accept-Language':_0x5e9738[_0x32b9('2a','11m3')]},'body':_0x32b9('2b','JK6O')+_0x3e1817+_0x32b9('2c','UwAS')};return new Promise(_0x36f51c=>{var _0x5c3321={'vBmYd':function(_0x40ed24,_0x381b60){return _0x5e9738[_0x32b9('2d','acse')](_0x40ed24,_0x381b60);},'ddhsP':_0x5e9738[_0x32b9('2e','04Im')],'yjVgY':_0x5e9738[_0x32b9('2f','7zGv')],'YXHbx':function(_0x41bf55,_0x4d95a2){return _0x5e9738[_0x32b9('30','e*%M')](_0x41bf55,_0x4d95a2);},'PJNAl':_0x5e9738[_0x32b9('31','7zGv')],'LKiMM':function(_0x13d6f3){return _0x5e9738[_0x32b9('32','gU9(')](_0x13d6f3);}};$[_0x32b9('33','ny]c')](_0x973d18,(_0x23d565,_0x7eefe4,_0x2ae5fc)=>{try{if(_0x23d565){if(_0x5c3321[_0x32b9('34','7zGv')](_0x5c3321[_0x32b9('35','NA2b')],_0x5c3321[_0x32b9('36','X2mD')])){console[_0x32b9('37','ny]c')]($[_0x32b9('38','USSM')]+_0x32b9('39','Y&T5'));}else{console[_0x32b9('3a',']072')]($[_0x32b9('3b','UW0z')]+_0x32b9('3c','LW(G'));}}else{_0x2ae5fc=JSON[_0x32b9('3d','%nVA')](_0x2ae5fc);}}catch(_0x3b836a){if(_0x5c3321[_0x32b9('3e','S*Ha')](_0x5c3321[_0x32b9('3f','KA5z')],_0x5c3321[_0x32b9('40','JK6O')])){$[_0x32b9('41',']ClE')](_0x3b836a);}else{$[_0x32b9('42','J7ec')](_0x3b836a);}}finally{_0x5c3321[_0x32b9('43','7zGv')](_0x36f51c);}});});}function wuzhi01(_0x105e26){var _0x29ad69={'BqVrB':function(_0x38c96b){return _0x38c96b();},'xWiFM':function(_0x20ec9f,_0x368553){return _0x20ec9f!==_0x368553;},'dnajO':_0x32b9('44','FG%@'),'Ofmun':_0x32b9('45','FG%@'),'pgyTR':_0x32b9('46','FG%@'),'McXNE':function(_0x18afb0,_0x2c38b3){return _0x18afb0(_0x2c38b3);},'dInzL':function(_0x255c8b,_0x402263){return _0x255c8b===_0x402263;},'VsGlk':_0x32b9('47','LW(G'),'MJDzR':_0x32b9('48','UW0z'),'OPZqJ':_0x32b9('49','ouKJ'),'jJmsI':_0x32b9('4a','a9GM'),'UeleP':_0x32b9('4b','%nVA'),'invcM':_0x32b9('4c','qCP('),'niocg':_0x32b9('4d','0kRw'),'guHsO':_0x32b9('4e','UwAS'),'aibIn':_0x32b9('4f','YMJK'),'nNZkW':_0x32b9('50','2z9K'),'eAldV':_0x32b9('51','S&pX'),'naxmg':_0x32b9('52','6E$*'),'AxlkB':_0x32b9('53','xzN1')};let _0x491e0a=+new Date();let _0x2d4fcb=_0x105e26[_0x32b9('54','gU9(')];let _0x23dfe2={'url':_0x32b9('55','RXJ8')+_0x491e0a,'headers':{'Host':_0x29ad69[_0x32b9('56','*lOW')],'Content-Type':_0x29ad69[_0x32b9('57','!GQ5')],'origin':_0x29ad69[_0x32b9('58','ouKJ')],'Accept-Encoding':_0x29ad69[_0x32b9('59','iNBu')],'Cookie':cookie,'Connection':_0x29ad69[_0x32b9('5a',']ClE')],'Accept':_0x29ad69[_0x32b9('5b','X2mD')],'User-Agent':$[_0x32b9('5c','J7ec')]()?process[_0x32b9('5d','N#qE')][_0x32b9('5e','J]CI')]?process[_0x32b9('5f','ouKJ')][_0x32b9('5e','J]CI')]:_0x29ad69[_0x32b9('60','USSM')](require,_0x29ad69[_0x32b9('61','QkO)')])[_0x32b9('62','X2mD')]:$[_0x32b9('26','xzN1')](_0x29ad69[_0x32b9('63','V9od')])?$[_0x32b9('64','6E$*')](_0x29ad69[_0x32b9('65','[9pj')]):_0x29ad69[_0x32b9('66','04Im')],'referer':_0x32b9('67','iNBu'),'Accept-Language':_0x29ad69[_0x32b9('68','UW0z')]},'body':_0x32b9('69','J]CI')+_0x2d4fcb+_0x32b9('6a','xzN1')+_0x491e0a+_0x32b9('6b','6E$*')+_0x491e0a};return new Promise(_0x5c3096=>{var _0x5b6caf={'uUvkf':function(_0x4a4d97){return _0x29ad69[_0x32b9('6c',']ClE')](_0x4a4d97);},'DuyNt':function(_0x13fd9c,_0x198a3d){return _0x29ad69[_0x32b9('6d','^&(L')](_0x13fd9c,_0x198a3d);},'ICBfL':_0x29ad69[_0x32b9('6e','X2mD')],'Zyfnw':_0x29ad69[_0x32b9('6f','@fKG')],'byegI':_0x29ad69[_0x32b9('70','USSM')],'PamiN':function(_0x3b37ed,_0x59e2ca){return _0x29ad69[_0x32b9('71','C^Hy')](_0x3b37ed,_0x59e2ca);},'sFQEt':function(_0x2a72de,_0x1ed64f){return _0x29ad69[_0x32b9('72','X2mD')](_0x2a72de,_0x1ed64f);},'teygu':_0x29ad69[_0x32b9('73','iNBu')],'wGwDg':_0x29ad69[_0x32b9('74','UW0z')],'MZhhB':_0x29ad69[_0x32b9('75','J7ec')]};$[_0x32b9('76','@fKG')](_0x23dfe2,(_0x2f354a,_0x4178dc,_0x23173c)=>{var _0x589b83={'poMYg':function(_0x69a26f){return _0x5b6caf[_0x32b9('77','6E$*')](_0x69a26f);}};try{if(_0x5b6caf[_0x32b9('78','@fKG')](_0x5b6caf[_0x32b9('79','C^Hy')],_0x5b6caf[_0x32b9('7a','*lOW')])){if(_0x2f354a){if(_0x5b6caf[_0x32b9('7b','0kRw')](_0x5b6caf[_0x32b9('7c',']ClE')],_0x5b6caf[_0x32b9('7d','X2mD')])){_0x23173c=JSON[_0x32b9('7e','NA2b')](_0x23173c);}else{console[_0x32b9('7f','RXJ8')]($[_0x32b9('80','iNBu')]+_0x32b9('81','S*Ha'));}}else{if(_0x5b6caf[_0x32b9('82','6E$*')](safeGet,_0x23173c)){if(_0x5b6caf[_0x32b9('83','acse')](_0x5b6caf[_0x32b9('84','S*Ha')],_0x5b6caf[_0x32b9('85','S*Ha')])){_0x23173c=JSON[_0x32b9('86','^7pz')](_0x23173c);}else{_0x23173c=JSON[_0x32b9('87','11m3')](_0x23173c);}}}}else{$[_0x32b9('88','USSM')](e);}}catch(_0x5abe50){$[_0x32b9('89','7zGv')](_0x5abe50);}finally{if(_0x5b6caf[_0x32b9('8a','Y&T5')](_0x5b6caf[_0x32b9('8b','%nVA')],_0x5b6caf[_0x32b9('8c','weh*')])){_0x5b6caf[_0x32b9('8d','J7ec')](_0x5c3096);}else{_0x589b83[_0x32b9('8e','YMJK')](_0x5c3096);}}});});}function shuye72(){var _0x40c5f4={'tYmGZ':function(_0x3f9314){return _0x3f9314();},'ghNDu':function(_0x29b6d9,_0x4d1a89){return _0x29b6d9!==_0x4d1a89;},'cPHKb':function(_0x5b72bb,_0xa60fad){return _0x5b72bb<_0xa60fad;},'nlkRo':function(_0x413efc,_0x24c3aa){return _0x413efc(_0x24c3aa);},'dksAM':function(_0x5b2719){return _0x5b2719();},'AFRCy':function(_0x56a366,_0x495a03){return _0x56a366===_0x495a03;},'pRZwx':_0x32b9('8f','a!u]'),'Ykkgx':function(_0x5066e6){return _0x5066e6();},'VVHog':_0x32b9('90','UW0z'),'tejWD':_0x32b9('91','V9od')};return new Promise(_0x1e9fa6=>{$[_0x32b9('92','S&pX')]({'url':_0x40c5f4[_0x32b9('93','acse')],'headers':{'User-Agent':_0x40c5f4[_0x32b9('94','N#qE')]},'timeout':0x1388},async(_0x3c88eb,_0x4881d2,_0x27f6e7)=>{try{if(_0x3c88eb){console[_0x32b9('95','USSM')]($[_0x32b9('38','USSM')]+_0x32b9('96','acse'));}else{$[_0x32b9('97','FG%@')]=JSON[_0x32b9('98','[9pj')](_0x27f6e7);await _0x40c5f4[_0x32b9('99','0kRw')](shuye73);if(_0x40c5f4[_0x32b9('9a','V9od')]($[_0x32b9('9b','J]CI')][_0x32b9('9c','%nVA')][_0x32b9('9d','Fz76')],0x0)){for(let _0x44028e=0x0;_0x40c5f4[_0x32b9('9e','^&(L')](_0x44028e,$[_0x32b9('9f','0kRw')][_0x32b9('a0','Fz76')][_0x32b9('a1','2z9K')]);_0x44028e++){let _0x324251=$[_0x32b9('a2','bdQY')][_0x32b9('a3','KA5z')][_0x44028e];await $[_0x32b9('a4','NA2b')](0x1f4);await _0x40c5f4[_0x32b9('a5','11m3')](wuzhi,_0x324251);}await _0x40c5f4[_0x32b9('a6','QkO)')](shuye74);}}}catch(_0x54481d){$[_0x32b9('88','USSM')](_0x54481d);}finally{if(_0x40c5f4[_0x32b9('a7','!GQ5')](_0x40c5f4[_0x32b9('a8','*lOW')],_0x40c5f4[_0x32b9('a9','!GQ5')])){_0x40c5f4[_0x32b9('aa','gU9(')](_0x1e9fa6);}else{console[_0x32b9('7f','RXJ8')]($[_0x32b9('ab','*lOW')]+_0x32b9('ac','^&(L'));}}});});}function shuye73(){var _0x54d07e={'JWvuP':function(_0x305164){return _0x305164();},'TtmJe':function(_0x4d7a6c,_0x34a8e7){return _0x4d7a6c!==_0x34a8e7;},'OMEoA':_0x32b9('ad','J7ec'),'dWCZA':_0x32b9('ae','04Im'),'rFfjn':function(_0x2fd0a3,_0x115157){return _0x2fd0a3===_0x115157;},'brPlw':_0x32b9('af','*lOW'),'Clqpf':_0x32b9('b0','^7pz'),'MiUnv':_0x32b9('b1','acse'),'HFyjD':_0x32b9('b2','V9od')};return new Promise(_0x1eb44b=>{var _0x31b7d2={'oxaEv':function(_0x3b4469){return _0x54d07e[_0x32b9('b3','acse')](_0x3b4469);},'JTFWt':function(_0x33ef0d,_0x38fe49){return _0x54d07e[_0x32b9('b4','RXJ8')](_0x33ef0d,_0x38fe49);},'aHKig':_0x54d07e[_0x32b9('b5','ouKJ')],'idNqn':_0x54d07e[_0x32b9('b6','11m3')],'idnaV':function(_0x4fd875,_0x2dc54c){return _0x54d07e[_0x32b9('b7','C^Hy')](_0x4fd875,_0x2dc54c);},'OhHbF':_0x54d07e[_0x32b9('b8','C^Hy')],'lFEba':_0x54d07e[_0x32b9('b9','ny]c')],'Pqkjd':_0x54d07e[_0x32b9('ba','YMJK')],'bRlsT':function(_0x2e3cc2){return _0x54d07e[_0x32b9('bb','04Im')](_0x2e3cc2);}};$[_0x32b9('bc','UW0z')]({'url':_0x54d07e[_0x32b9('bd','NA2b')],'timeout':0x1388},async(_0x2ac166,_0x267a77,_0x2b34a3)=>{if(_0x31b7d2[_0x32b9('be','11m3')](_0x31b7d2[_0x32b9('bf','USSM')],_0x31b7d2[_0x32b9('c0','RXJ8')])){try{if(_0x2ac166){if(_0x31b7d2[_0x32b9('c1','UwAS')](_0x31b7d2[_0x32b9('c2','C^Hy')],_0x31b7d2[_0x32b9('c3','%nVA')])){console[_0x32b9('37','ny]c')]($[_0x32b9('c4','YMJK')]+_0x32b9('c5','^7pz'));}else{_0x31b7d2[_0x32b9('c6','TogX')](_0x1eb44b);}}else{$[_0x32b9('c7','YMJK')]=JSON[_0x32b9('c8','Y&T5')](_0x2b34a3);$[_0x32b9('c9','Fz76')]=$[_0x32b9('ca','weh*')][_0x32b9('cb','11m3')];}}catch(_0x144696){$[_0x32b9('cc','^&(L')](_0x144696);}finally{if(_0x31b7d2[_0x32b9('cd','qCP(')](_0x31b7d2[_0x32b9('ce','bdQY')],_0x31b7d2[_0x32b9('cf',']072')])){_0x31b7d2[_0x32b9('d0','04Im')](_0x1eb44b);}else{console[_0x32b9('d1','a!u]')]($[_0x32b9('d2','xzN1')]+_0x32b9('d3','xzN1'));}}}else{$[_0x32b9('88','USSM')](e);}});});}function shuye74(){var _0x50f5af={'YmDPW':function(_0x35bd66){return _0x35bd66();},'yGQYB':function(_0x1bbff4,_0x594023){return _0x1bbff4!==_0x594023;},'jjTzd':_0x32b9('d4','[9pj'),'gcATY':_0x32b9('d5','Xl^F'),'oQZVE':function(_0x48a5be,_0x25abdf){return _0x48a5be(_0x25abdf);},'nvnbQ':function(_0x33664a,_0x63c944){return _0x33664a<_0x63c944;},'foCdZ':_0x32b9('d6','weh*'),'jYnLs':_0x32b9('d7','Fz76'),'yoTso':function(_0x51d89c){return _0x51d89c();},'jxDOU':function(_0xe5ee5e){return _0xe5ee5e();},'rhOVU':function(_0x462a2b,_0x329ab0){return _0x462a2b===_0x329ab0;},'NsTgz':_0x32b9('d8','S&pX'),'syYMI':_0x32b9('d9','xzN1'),'Fbrtw':_0x32b9('da','Y&T5')};return new Promise(_0x375913=>{var _0x405539={'NZOCw':function(_0x159d74){return _0x50f5af[_0x32b9('db',']072')](_0x159d74);}};if(_0x50f5af[_0x32b9('dc','a!u]')](_0x50f5af[_0x32b9('dd','S&pX')],_0x50f5af[_0x32b9('de','!GQ5')])){$[_0x32b9('df','@fKG')]({'url':_0x50f5af[_0x32b9('e0','xzN1')],'headers':{'User-Agent':_0x50f5af[_0x32b9('e1','C^Hy')]},'timeout':0x1388},async(_0x59c892,_0x616821,_0x391504)=>{var _0x5eeab6={'nnPzG':function(_0x11f221){return _0x50f5af[_0x32b9('e2','2z9K')](_0x11f221);}};try{if(_0x59c892){if(_0x50f5af[_0x32b9('e3','2z9K')](_0x50f5af[_0x32b9('e4','FG%@')],_0x50f5af[_0x32b9('e5','Y&T5')])){console[_0x32b9('e6','TogX')]($[_0x32b9('e7','0kRw')]+_0x32b9('3c','LW(G'));}else{console[_0x32b9('e8','^&(L')]($[_0x32b9('e9','S&pX')]+_0x32b9('ea','Fz76'));}}else{if(_0x50f5af[_0x32b9('eb','6E$*')](safeGet,_0x391504)){$[_0x32b9('ec','a!u]')]=JSON[_0x32b9('ed','S*Ha')](_0x391504);if(_0x50f5af[_0x32b9('ee',']072')]($[_0x32b9('ef','11m3')][_0x32b9('f0','ouKJ')],0x0)){for(let _0x3caffd=0x0;_0x50f5af[_0x32b9('f1',']072')](_0x3caffd,$[_0x32b9('9b','J]CI')][_0x32b9('f2','LW(G')][_0x32b9('f3','[9pj')]);_0x3caffd++){let _0x3b9342=$[_0x32b9('f4','N#qE')][_0x32b9('f5','Fz76')][_0x3caffd];await $[_0x32b9('f6','6E$*')](0x1f4);await _0x50f5af[_0x32b9('f7','04Im')](wuzhi01,_0x3b9342);}}}}}catch(_0x373b35){if(_0x50f5af[_0x32b9('f8','@fKG')](_0x50f5af[_0x32b9('f9','[9pj')],_0x50f5af[_0x32b9('fa','LW(G')])){$[_0x32b9('fb','%nVA')](_0x373b35);}else{_0x5eeab6[_0x32b9('fc','a!u]')](_0x375913);}}finally{_0x50f5af[_0x32b9('fd',']072')](_0x375913);}});}else{_0x405539[_0x32b9('fe',']072')](_0x375913);}});};_0xodc='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}