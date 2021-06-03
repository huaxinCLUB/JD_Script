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
var _0xodD='jsjiami.com.v6',_0x15d5=[_0xodD,'HBcdw5XCqA==','w6nCinfDtlk=','aMOeUSfCgA==','w53CthM=','d8OUeCDCjQ==','wo4/PMOvw4M=','w7XCr1A=','w57Do8KCwqI=','woDDh3/Dieisvuawr+Wkk+i0iu+/iOitieagkuadhue8vei0l+mEo+ivuQ==','w5YoIMO8w63DuG4=','bMOWaikG','w4HDkcKMwobDgQ==','MmodFMOb','YcOnwoFTcnsd','w6bDtErDpQ==','w54sOsO6w57DtQ==','GTXCqcKcwoU=','w73CoUMFw49QwqU=','OsK8NzM=','EgnCisK4wrI7','wp7DsRLClX9VZA==','wqU6IcOl','IzUHw6Y=','w6jCnl3DqVU=','Mw4mIjs=','KjoFZ8Oz','w6howrDDgsK9','wrPDs8K3w4LCpg==','CBQlJB1p','wq7DsMK5w6DCpjo=','w7YfDMOsw4c=','ByPCjcOMw54=','M3rClcKSwrs=','w5HDnl/CuyTCgsORw4w=','M8K4w6/DqklUXQ==','w4TDp1vDocKOCFYe','w5E8PcO5','ecKPw77CmVI=','bsOgWTs6','LnYnHMO3','w61/worDmcKW','w7DDusK3w5QL','WELCsMK/Ig==','w4nDkD0XJA==','QMOhw7kNwpg=','w53Di1/CqhDDncKKw5LDpXnDpMKmL8Omwp7DiMOiwovCi38UYsKfSU4mwrXCv1YjRBTDtnTDmsKvccOpTcKxRxh0US0EwrDCksO8U3AGwpgowp/Ck28wwqrDpyIvKcKZVsK+ajIMWcK/w4rDusKNw5vCgcO0w5EfOsKFw7IECMOQwpXCpMOkHcOwfQ==','FjEHWcOuEMOrw4EJw5pAZsKNwoIoe8Kiw5oJB8KnwqXDnMOJw4kiZzzCs8KRw4lVN8KPw5lhVzbCqBgCfUjCrggZJAInPVxqwpHDqMOMw4nDnMOgw5BGTjvCqU5qYcK3RcO/w4Qfw7pkw45Wwq4KwqNbbz9uVRzCtDYYwpTDhTXCtMOOwrvDnX/DqsKKN23CqsOlfzdQQMOIbQpQw6LCnFXCqcOZw64AW8OYwrhIw5LCrBcDwoFPN8Kww4jCrizCnMKqwrATScOeERwnESvCg8OUw5nDhw5pw7Mge8OKw73DiSPDnw==','JGgyRU4=','RsOWbi0R','QsO9MMONIQ==','E18RD8Oh','J8Ofw4ZqJA==','w5BBwoRHRQ==','Z8KJwo4bwqY=','wq44w6vDk8Od','UsK3wpd+w4U=','w7LCumDDtns=','YsOdFMOFOw==','ZMKWwo5fw7k=','DsKlBCLCsA==','NcKxw7c=','DjcFw5TCug==','wolrwpEwwrc=','RsOHw4g5wqM=','ZMOATSoh','WBkXCMOZ','e8O6w5oDwp8=','KMK6BzrCiw==','w4vDucKuw4gr','w67CrW/DmHk=','M8KqOT/Cvg==','w5Vgwps=','NT8QVQ==','XMKPAh/orKzmsqjlp73otYrvvY3orpPmoKrmnaHnvYnotbrphZ3orZg=','esKSwr8=','W8Knw7LCrw==','w4MJFMOJ6K2+5rK45aeA6La4776K6Kya5qOj5p2e572I6LWv6YSo6K+R','wphjFko/','wp5XKUEJ','wp3DpivCkW0=','P118QnDCoDBr','ExgUwpQi','w73CoUMFw49QwqUf','MnciUw==','QcOoBA==','wp9ywqUD','wrfDiwRk6K6H5rC45aSm6LSL776T6K6K5qG85p6N572Y6LWP6YeH6K6h','KWlNTnY=','woDDhDzCvE4=','IWhSa0E=','NzEa','woXCisOUw6w=','w4EQw4jDouitkOazgOWks+i3q++8lOivteagjOaen+e8oui1j+mEgOiupg==','DXIVA8O8Hg==','e3luCMKE','GAPCh8Kxwrw=','U8Kpw7zCpHA=','w7XCvVHDnUw=','wonCn8OXw79j','QcOoBMOZEXU=','ZcOww4o2wr4=','Y8KPwpVZw5U=','AhnChRTDhg==','P0tiQVw=','w6YMG8Oww6g=','acKPKsKdTg==','c8Okwrl8Rg==','w4LDphckGg==','w65bwrDDvcKnw73Dj8KhwoAYwpnCnH1SwpzCvMOHwpA2W0XCmcOmw5jDh3/CtybCosOww4nCl8K9YsKEZXdkEQHDmcOIwq9KAsKRa8KuRljDgXQKw4XDs8KZw6vDvwVUwr47wrIjLcK6w7bCq8K5A0/Dl8Kzw5TDhSnDsMKJwqlkBMO+w67ChMKGKMKiw4xq','EC3Co8OBw7nCrsOUBsK1KCMOwpfDosO/w67ClcOAwoDDvHMZDQ9bw7/CjBDClcOKw75dZxvClcKswoXCucOOwo0XL2fDl8OMw4hMwoPCrcOcw5AzTj9ycHpxw4UgPGFMMsO9U8OMCE0Qw5fCjzV7c8K7w6bCscKtI8K4wpgPYMKiwpUnw4Fxw5HDvFTDvU53w6Q0w6fDpl/ColQiw6jCqS3Dg0MyJXMLw5LCpsOZwrjDvAHDgwtOw7HDi2LCjF0ZPcOiwrvDv0jCrsOdw7bCvCPDjgjDkkB7w59nwo/DvCvDrMKzwofCm8OfwrPCmArDsQ==','BHIcBcO2','cMKIwrs=','w7XDo8Kzw54G','RcKkwpcewro=','w5QCLMOSw54=','w7LChH4Jw40=','wonDgy3CoFs=','Z2BOLcK9','wqUCw67DusOE','DxEgwp4G','fsOKL1HDjw==','w6fDuzQ=','a8OnwphX','fMKww5tK6K+T5rGx5aSc6LS5776F6K+S5qON5p+/57y96LSA6YW06K2p','w5bCvAA=','csOWdT8=','w4XCqHDDkFvChwwQ','dcOnwodBUA==','BRcuAhpyw4U=','w57CshM3NMO4eic=','DxbCmx4=','CijCijXDtQ==','w5HCnkbDuW8=','BjcNw7bCpQ==','ZsOUTjkl','w5TDo8KbwqbDhT02','Dg3ClsKswqM=','U8KIwrY2wog=','c8KMwrsvwrnDnVM=','fsOWw7MywofCmA==','RsOgwpN3fA==','a0bCtcKYKw==','VMKHOsOMwow=','w54mM8OYw5jDrw==','w5nCv27DpV4=','w7PDqyBMNx9j','E8KBw65tdlZJTMOoRmZ/GA==','w5zDp8KBwqDDtjA=','w7XCowI4IcO4akYOwq/Cv8Ocw5E=','w45uwpVA','Y8ONwo19QQ==','E8OUY18=','BQfCssO4w5g=','w7vDtSEPOQ==','EA3CicK6','w4vCqsOpw4Dor4bmsJflp7rotYbvvL3orLLmoa3mnJ/nvZzotLrphY/or64=','K0oAAMOW','w4XDk8KhwoPDgA==','wpHCiAvDmMOx','N1NvZkXCtw==','AiQ8QsO2','XcOmEcOvBg==','Nnh8WVw=','W8O8JEnDsw==','QMOaO3vDvg==','w45fwoVORw==','XsKCBMKswo09wp3CkinCvMOvw6k=','eMO9QgrCqnAuwq8pesO1CsK8w6rCiETDs8OiwolDwpArPxDDnMKJw4p9wrfCmMKsUz8=','esOHw6klwoDDijfDtXDDhsO0w6Naw7jDvW7DqAvDtA==','AwErEUM7w4XDv2DDocOFw7bDkS7Cv8KuNA==','fMKIwqo+w5PDmUtYMl4=','wpBjwrgKwpIdS8O5eMOMIWJxOFTCpErDhQbCiy7DrsK1w5rDpyTCjcO1wo9ZZsOiUg==','wpcgwqlnd8KQwrEhw6/CicO2dcKQ','w5PChGIl','w5DCtwYmA8KmZ0YHwqPCusOcwp7DgCcZwqnCocKiw5txfHFka8KFwpQwBmwdwolIwqNAIMOXMyJjTMKOwqdKw4Ymw4BDw5DCgAvDkVYtw7TDs8OpZWBGFhvDvlpuwoRAw6DCvmrCnGwsMR54w6o=','HhNvAgE=','w6rDuD8fKcOkw5c=','Oy7CtsOHw6c=','WsOzAXDDnQ==','wojDsQjCkFdd','DQ/CnhnDtGPDnQ==','DxwIwoAzJQ==','dsOuwpRAUF0Gw5TCvA==','H8K7OzLDpg==','w6PDoCcML8K3wpxWZMKKwqPCjgTDuQzDm8O3w5ZdE8KyI2jCmsKJBcOQNV/CtnDDnsOBIA==','RcKww4XCkHM=','f8OEN8OlCw==','w7DDrMKSw7of','bMOlHnjDtg==','w5nDkGXCijI=','GjENW8OH','aUDCrMK5I2E=','csKDwrk=','wqByDHItc8KGdcOhUil1Aw==','GMOQw4Y=','U8OJbTPCkFYdwoQBUsOea8KQ','dsO6w7s0wrY=','dsKLIMO1wpU=','YMKVw5rCmFVNOcKWY0c=','w5TDq8KPw5wIwq3CuQ==','w6TDvUTClgI=','Ax42BQ5vw4A=','wqBRwqcqwpo=','P0lPSFY=','w5LCpxMmAMKnITkHw7nDusOUwovCk20Fw6TDvMO0w4UnMyE6IsKEw4lsa2pzwoJcw5dGW8KzOkgFIcKVw5A1wqlcwqo3wrrDrH7DuWNgw7bDmcO2RQ1PQG7CkDlAwpVkw77CgXPCgRxWWBkGwpsuw5nDqxXDlWsAw6duwqnCscO6','wpg7w4/DisOB','w596wpJXRsKrwoEOw6HCqMKFScKmRsKnC3cSwprCpBJHwq5bw6RIwo1pwqzCmC0Iw6TDhjFSaykxwrgNwp/Ds8OI','fsOdwqltRV5IPsKzBy82TsKGw5TDncKuw6TClDzDncOdw4o6w73DvcKiw4rCqMOnw6obScO/PWPCvUzDiMKYwoJ1EjAww7RSw7vCvMOjFcKQw4DDllYEw50pasKKwrjDsQ1UFn7DlMOLFUZTDsONw7EyLATDsmnDk8Ksw45Ld8KowpM=','PBcwAys=','w4PDjGfCtS0=','LDwCwoIJ','UAE+FMOH','esOZIVzDkg==','PmwTVGA=','R8K8AMOXwrQ=','ZsKSwqtf','w4p/wrtVdA==','VzoBKsO7','ZcOzVhkC','SBQeHcOU','acOpwpI=','eMKcwrVO','wqvDlQM16K6r5rOP5aaC6LWc77yJ6KyN5qCK5p2F57y46LS46Yar6K2q','KMOUw7NxEw==','Fg4reMOb','wrfDgDDCvGE=','BXTCpg==','MsKQw6Zm','w5FSwpgv6KyM5rC85aSb6Lao77yd6K2U5qKP5p6o572K6Lak6Ye26Kyf','w7vDtMKfw7A8','wpDDmhPCg1Y=','w5rDiMKawrDDrA==','EXwANcOr','w4luwo5HVw==','C8KBAAPCng==','bFzChcKTNXY=','c0PCpcK3AQ==','woRYwp0Jwp8=','PTgVQcOr','wpPCgMOrw4BU','w5PDrU7Dp8KB','e8OdJkrDgg==','w4jCmXMcw6k=','Px0qWsO1','Iy7ClzXDpw==','NhYMWsO4','Oi4UHsOvUsOgwooSwpcfKw==','MHI7W2I3FmrDgmkwwoItwpvCs3lLw6vCiRjDmm5kwqY8w5RMaBPDp2LCs8KR','esOHw6klwoDDijfDtXfCg8K/w6AGw7fDvTDDqgfDssKEP0XDl8OYw6VidMOawo9ywrPDrH7DuMKw','WMKIBMOyw4wzwpPCk2HCs8Ohw7DCpWo5ckU=','d8OSfSpOwq0fC8KAwoo=','eMO9QgrCqnAuwq8pesO1CsKuwrTCkF3CqMOvwptJwpoyPRXDgsKEw4Z9w7jDl8OiGXE=','Lj8XIA==','C3kTNsO+Vx7DnMOEwrJ4w4QjwpXCviQ4VsKaIgHDiSTDn8OmMHrCjcKRwp7DicORPhjDj1V2LsKSCnzCiMOEw5rDnsOOTXrCuMKCwpjDsMOpScOEL8Orwr/DpsKCw4fChcOnP8KJEcKFw5rDlxsGwpjDtTHCowXDrA==','w5rDrgLDo8Kn','aMO+DlbDgToEwrg=','bcOywoFCRiRGwp/CuMKpCgPChnfDtMKswoYsw75VQMOYOMKjYg==','CEldbHg=','w7/DpR0NOA==','wqR+CUAv','FinCicKswog=','fxcaJsOT','Jlw3C8Oa','Fx/CqsKwwqI2','ecOZbg==','w6rDgnDDlcKaKHBwwoXDucKXw604','GwLCkg==','N8OxUW/DgcKgUMKQb8KKR8OZPA==','wrbDjsKcw6/CgA==','HijCii7DmQ==','NE43FMORLTDDicOiwok=','w55qwohQU8K2wo8=','ecK/wokjwpk=','w7DDryBJEQ52','W8KUw5nCp20=','B0M+eGQ=','woPCn8ONw7lCb8OkTF7CtcOIwpR/wrDDpksGwq/Dm8KNwoxQwp3CrcOZIMKZwr3CpsKUecOkazvDv8KWwoFVwppUaSXCucOYQ8K0fcKNJBnCuWDCky3ClkLCjwxmDMK9wotVw4Fow61jesKSw4jCo8OPU8Oiw70yw5UCK8OLbMKLNcKwwr3DncO6PcOtwqgEXsOwwrzDncOoCTXDkGR7wpjCgw==','w6bDm8KDw5oF','e8OzBFjDijpwwrHDs8OBZsOEAVTDu8OGw5rCvydZwrPCmcKFAzjCv8KxXsK5w7AYKE8ia8OsNijDoG3DtMKDRytGa0d0NWcbw4vDqMKGQ8KNwpFQw4c7wrpPGMOdwpLCjsKpDR47wozCgsK3wpEDe8O/MW3CvRV2w6PDtH7DkwzDjRRgTsOjwqNlZ8O9wp/Cp8Oew7Vjw6nDhk3DsBxCw43DiR4Jw5PDkMKHbsO+GsObEB/CrcKbSWghLMK0wroUwo3ChjLCk8Ozw6J9w7fDv8O8w7jCoRFOAxNKwrTCkMKvPRorw4wqScO7wpUNw47Dr8KTwoZrwqRnXsKLacKaw6TCoHrCt2nDkGVCw6dAXmfDo1LDg8KPwoBZQ8OIbw==','w4N9wrrDisOEw7ZLwqo6OMOuTRXCkMO9Q8OZd8OGU8K+VUh7LsONwqbClsOMwoxzP8KuX0FYGDXCjVVmG33CkhrCgMK9w5cEw6bDj8OMw6dAMQRTwrcFbFLDlBthJcOFfMOMwpPDoE7DicO6wrE+Q8K2wq7DnzvCrcKNw78TwovCjcKFBsKww6nDjcK9w7tTfcOuM8Kuw5M5HQ==','GcKtGcK/','JDXCu8Odw4w=','VMKLKMKHZA==','GcKaw65sRQ==','wpbDvwHCsUpC','w5HCpnfDhQ==','YBY5MMO4','QTUeKMOF','SMOCwrF4fg==','wp3DujPCu2A=','FBowEgo=','YcOoD0jDvQ==','w458wpR7Rg==','LsKrw6Fadw==','MS3Cvg==','w5duwpFR','wrnCgWct6K2/5rG35aeg6LSL772I6K665qGY5p2t57+M6Lei6Yap6K6g','ZFJ3CsK7','T8K3D8OJwrI=','w6HDj1fDlcKQ','K8Kww4Ryag==','EcOaaQ==','elJoHA==','Qzg2wq7orrDmsI/lp5PotqHvv4jorYrmo5jmn6/nvZnotoPph6Lor6Y=','wrHDgDXCp3U=','LSMMw6fCtA==','w7PDsicVDQ==','XsOoRg7CsA==','ODsJw5fCn34=','YsOSw68mwpY=','woI9KsOEw44=','wrbCvhfDk8OQ','f8OpG8OOCw==','FsKgw55yRQ==','CCPCocOaw6Q=','Cw0Swpc0d8ONwqvCt8OVbXNtWx0dw6coDA7DvXIdw4TCg8KGw5DDmMKjbiZiBhpnOUUcGsKYw4TCk3QrKcKDw6dgw6YRW8Ofw6Q/wodtwqfDq8Knw4DDs8OCw6s1LwrCpcKGeHDDlH9Tw6jDhsKsfMOxBXzCoy12','HG0xXmc4FjHCnihuwo19w5/ClGZTwqjCikzCiEAZwoZuw5F5bh/DpmPDtsK6Q8KNwpzCsMKCOcKgw51ow4ZLSXV3w5tDBMO4V8OQd8OUK8KFw7gvwqogw58iwqYtC2XCiMOWCMKmdzPCoU4xwrDDk8KIwpB3dsOywrgPwohLwqTDrcO3OgfCs3jCi2tpw6RswpbCgsKRwqXDksOmS8OKAcKiwrnDs8OdTwfDkMKQwqbCt8KKwprCgFfDqMKkdl0Gw4oUwoZww4l7w7o6w7nCscKUwr9MfcK8N8OKKcOWXj0tI8OIwqw1e8OIJQ==','w4zDlWXDs8K5','ExrCnsOEw5c=','a8OkahPClA==','TcKKJ8KpTQ==','cMOkUikT','ezYkEMOa','w7TCphUhBQ==','Nw4QCSo=','w5HCoVwyw7o=','LcOaw7VFFw==','esKuwpJYw6I=','AmU8CcOt','jsCAujitIaYDGmCxGi.kclwom.v6=='];(function(_0x48ec8c,_0x3af634,_0x3f7c45){var _0x40e481=function(_0x3627f1,_0x478d86,_0x3dc791,_0x268146,_0x5a1e3){_0x478d86=_0x478d86>>0x8,_0x5a1e3='po';var _0x52d57a='shift',_0x968d4b='push';if(_0x478d86<_0x3627f1){while(--_0x3627f1){_0x268146=_0x48ec8c[_0x52d57a]();if(_0x478d86===_0x3627f1){_0x478d86=_0x268146;_0x3dc791=_0x48ec8c[_0x5a1e3+'p']();}else if(_0x478d86&&_0x3dc791['replace'](/[CAutIYDGCxGklw=]/g,'')===_0x478d86){_0x48ec8c[_0x968d4b](_0x268146);}}_0x48ec8c[_0x968d4b](_0x48ec8c[_0x52d57a]());}return 0x8caa0;};var _0x526449=function(){var _0x2728ed={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x668abb,_0x1473c8,_0x181193,_0x4acbd6){_0x4acbd6=_0x4acbd6||{};var _0x44fcb9=_0x1473c8+'='+_0x181193;var _0x167372=0x0;for(var _0x167372=0x0,_0x1e9877=_0x668abb['length'];_0x167372<_0x1e9877;_0x167372++){var _0x15620d=_0x668abb[_0x167372];_0x44fcb9+=';\x20'+_0x15620d;var _0x4c17ee=_0x668abb[_0x15620d];_0x668abb['push'](_0x4c17ee);_0x1e9877=_0x668abb['length'];if(_0x4c17ee!==!![]){_0x44fcb9+='='+_0x4c17ee;}}_0x4acbd6['cookie']=_0x44fcb9;},'removeCookie':function(){return'dev';},'getCookie':function(_0x558e89,_0x560cf1){_0x558e89=_0x558e89||function(_0x376024){return _0x376024;};var _0x2ef1d0=_0x558e89(new RegExp('(?:^|;\x20)'+_0x560cf1['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0xcc6cfa=typeof _0xodD=='undefined'?'undefined':_0xodD,_0x2c0db1=_0xcc6cfa['split'](''),_0x1b99f3=_0x2c0db1['length'],_0x5ebe64=_0x1b99f3-0xe,_0x47e78d;while(_0x47e78d=_0x2c0db1['pop']()){_0x1b99f3&&(_0x5ebe64+=_0x47e78d['charCodeAt']());}var _0x1a5cb9=function(_0x25e31e,_0x259f4c,_0x5f5a0c){_0x25e31e(++_0x259f4c,_0x5f5a0c);};_0x5ebe64^-_0x1b99f3===-0x524&&(_0x47e78d=_0x5ebe64)&&_0x1a5cb9(_0x40e481,_0x3af634,_0x3f7c45);return _0x47e78d>>0x2===0x14b&&_0x2ef1d0?decodeURIComponent(_0x2ef1d0[0x1]):undefined;}};var _0xa98f54=function(){var _0x2fa7d1=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x2fa7d1['test'](_0x2728ed['removeCookie']['toString']());};_0x2728ed['updateCookie']=_0xa98f54;var _0x519bc6='';var _0x210f45=_0x2728ed['updateCookie']();if(!_0x210f45){_0x2728ed['setCookie'](['*'],'counter',0x1);}else if(_0x210f45){_0x519bc6=_0x2728ed['getCookie'](null,'counter');}else{_0x2728ed['removeCookie']();}};_0x526449();}(_0x15d5,0xa3,0xa300));var _0x2110=function(_0x95b771,_0x24e43b){_0x95b771=~~'0x'['concat'](_0x95b771);var _0x304496=_0x15d5[_0x95b771];if(_0x2110['rfeNnX']===undefined){(function(){var _0x212972;try{var _0x36db62=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x212972=_0x36db62();}catch(_0x1a7bb5){_0x212972=window;}var _0x4b9b60='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x212972['atob']||(_0x212972['atob']=function(_0xb4aa2a){var _0x90673b=String(_0xb4aa2a)['replace'](/=+$/,'');for(var _0x8aedc9=0x0,_0x22c65d,_0x3ee620,_0x3b68b8=0x0,_0x3417ea='';_0x3ee620=_0x90673b['charAt'](_0x3b68b8++);~_0x3ee620&&(_0x22c65d=_0x8aedc9%0x4?_0x22c65d*0x40+_0x3ee620:_0x3ee620,_0x8aedc9++%0x4)?_0x3417ea+=String['fromCharCode'](0xff&_0x22c65d>>(-0x2*_0x8aedc9&0x6)):0x0){_0x3ee620=_0x4b9b60['indexOf'](_0x3ee620);}return _0x3417ea;});}());var _0x1d95aa=function(_0x125a5a,_0x24e43b){var _0x42abc5=[],_0x41c415=0x0,_0x2423b5,_0x2610b3='',_0xbcd7e4='';_0x125a5a=atob(_0x125a5a);for(var _0x77e1e=0x0,_0x2eda63=_0x125a5a['length'];_0x77e1e<_0x2eda63;_0x77e1e++){_0xbcd7e4+='%'+('00'+_0x125a5a['charCodeAt'](_0x77e1e)['toString'](0x10))['slice'](-0x2);}_0x125a5a=decodeURIComponent(_0xbcd7e4);for(var _0x328856=0x0;_0x328856<0x100;_0x328856++){_0x42abc5[_0x328856]=_0x328856;}for(_0x328856=0x0;_0x328856<0x100;_0x328856++){_0x41c415=(_0x41c415+_0x42abc5[_0x328856]+_0x24e43b['charCodeAt'](_0x328856%_0x24e43b['length']))%0x100;_0x2423b5=_0x42abc5[_0x328856];_0x42abc5[_0x328856]=_0x42abc5[_0x41c415];_0x42abc5[_0x41c415]=_0x2423b5;}_0x328856=0x0;_0x41c415=0x0;for(var _0x251853=0x0;_0x251853<_0x125a5a['length'];_0x251853++){_0x328856=(_0x328856+0x1)%0x100;_0x41c415=(_0x41c415+_0x42abc5[_0x328856])%0x100;_0x2423b5=_0x42abc5[_0x328856];_0x42abc5[_0x328856]=_0x42abc5[_0x41c415];_0x42abc5[_0x41c415]=_0x2423b5;_0x2610b3+=String['fromCharCode'](_0x125a5a['charCodeAt'](_0x251853)^_0x42abc5[(_0x42abc5[_0x328856]+_0x42abc5[_0x41c415])%0x100]);}return _0x2610b3;};_0x2110['zMktsE']=_0x1d95aa;_0x2110['CsCpCq']={};_0x2110['rfeNnX']=!![];}var _0x11d06c=_0x2110['CsCpCq'][_0x95b771];if(_0x11d06c===undefined){if(_0x2110['QqZiFa']===undefined){var _0x339cde=function(_0x4b6ca8){this['NMKxCm']=_0x4b6ca8;this['pDpLen']=[0x1,0x0,0x0];this['aBDAIN']=function(){return'newState';};this['pPhhDK']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['GbYBca']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x339cde['prototype']['jdSFSx']=function(){var _0x33bce5=new RegExp(this['pPhhDK']+this['GbYBca']);var _0x33f69d=_0x33bce5['test'](this['aBDAIN']['toString']())?--this['pDpLen'][0x1]:--this['pDpLen'][0x0];return this['mTtGUS'](_0x33f69d);};_0x339cde['prototype']['mTtGUS']=function(_0xf85a23){if(!Boolean(~_0xf85a23)){return _0xf85a23;}return this['APrHdW'](this['NMKxCm']);};_0x339cde['prototype']['APrHdW']=function(_0x18dceb){for(var _0x2ade50=0x0,_0x52a5d3=this['pDpLen']['length'];_0x2ade50<_0x52a5d3;_0x2ade50++){this['pDpLen']['push'](Math['round'](Math['random']()));_0x52a5d3=this['pDpLen']['length'];}return _0x18dceb(this['pDpLen'][0x0]);};new _0x339cde(_0x2110)['jdSFSx']();_0x2110['QqZiFa']=!![];}_0x304496=_0x2110['zMktsE'](_0x304496,_0x24e43b);_0x2110['CsCpCq'][_0x95b771]=_0x304496;}else{_0x304496=_0x11d06c;}return _0x304496;};var _0x3da1b1=function(){var _0x2c7af8=!![];return function(_0x5cc55f,_0x4d293f){var _0x23c823=_0x2c7af8?function(){if(_0x4d293f){var _0x42fd2e=_0x4d293f['apply'](_0x5cc55f,arguments);_0x4d293f=null;return _0x42fd2e;}}:function(){};_0x2c7af8=![];return _0x23c823;};}();var _0x4460ea=_0x3da1b1(this,function(){var _0x24eb8e=function(){return'\x64\x65\x76';},_0x4cef97=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4d4f4b=function(){var _0x4eea93=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x4eea93['\x74\x65\x73\x74'](_0x24eb8e['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x24293b=function(){var _0x36d2af=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x36d2af['\x74\x65\x73\x74'](_0x4cef97['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x56fa40=function(_0x48079b){var _0x156320=~-0x1>>0x1+0xff%0x0;if(_0x48079b['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x156320)){_0x230917(_0x48079b);}};var _0x230917=function(_0x1a8b97){var _0x4a19bf=~-0x4>>0x1+0xff%0x0;if(_0x1a8b97['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x4a19bf){_0x56fa40(_0x1a8b97);}};if(!_0x4d4f4b()){if(!_0x24293b()){_0x56fa40('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x56fa40('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x56fa40('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x4460ea();function wuzhi(_0x1a1cab){var _0x134c86={'XlrbD':function(_0x3104b7){return _0x3104b7();},'vsLoN':function(_0x78d2b,_0x1192f2){return _0x78d2b!==_0x1192f2;},'OEdeN':_0x2110('0','FR&p'),'aQnJr':function(_0xe1da0e,_0x3e79f6){return _0xe1da0e===_0x3e79f6;},'bFLav':_0x2110('1','FR&p'),'onXck':function(_0x1c261d,_0x16f8c6){return _0x1c261d!==_0x16f8c6;},'xNmUT':_0x2110('2','ZIMn'),'BllMy':function(_0x4b11b5,_0x71087d){return _0x4b11b5*_0x71087d;},'pvZZy':_0x2110('3','v!a0'),'RCTyh':_0x2110('4','EUOC'),'CbiBv':_0x2110('5','!LQK'),'tzsER':_0x2110('6','EsoS'),'loNPQ':_0x2110('7','4gNf'),'AopkE':_0x2110('8','*r#U'),'dIfaE':function(_0x166498,_0x3ada5b){return _0x166498(_0x3ada5b);},'IyMwu':_0x2110('9','ZIMn'),'QBoLa':_0x2110('a','4N!6'),'duGka':_0x2110('b','Mnk7'),'yjWaf':_0x2110('c','EsoS')};var _0x2404e0=$[_0x2110('d','Ym&@')][Math[_0x2110('e','bgXw')](_0x134c86[_0x2110('f','FR&p')](Math[_0x2110('10','QzyO')](),$[_0x2110('11','R9hd')][_0x2110('12','[r)V')]))];let _0x5c69e3=_0x1a1cab[_0x2110('13','ND1B')];let _0x5e1f52=_0x2110('14','#Xks')+_0x2404e0+';\x20'+cookie;let _0x581b95={'url':_0x2110('15','Ym&@'),'headers':{'Host':_0x134c86[_0x2110('16','9Ot%')],'Content-Type':_0x134c86[_0x2110('17','8Dx^')],'origin':_0x134c86[_0x2110('18','2&Wg')],'Accept-Encoding':_0x134c86[_0x2110('19','FR&p')],'Cookie':_0x5e1f52,'Connection':_0x134c86[_0x2110('1a','r]gA')],'Accept':_0x134c86[_0x2110('1b','2$r*')],'User-Agent':$[_0x2110('1c','Vlz*')]()?process[_0x2110('1d','4gNf')][_0x2110('1e','Oq!s')]?process[_0x2110('1f','EGyl')][_0x2110('20','EUOC')]:_0x134c86[_0x2110('21','!LQK')](require,_0x134c86[_0x2110('22','v!a0')])[_0x2110('23','9Ot%')]:$[_0x2110('24','2&Wg')](_0x134c86[_0x2110('25','r]gA')])?$[_0x2110('26','EsoS')](_0x134c86[_0x2110('27','*r#U')]):_0x134c86[_0x2110('28','F0A2')],'referer':_0x2110('29','Mnk7'),'Accept-Language':_0x134c86[_0x2110('2a','S]%h')]},'body':_0x2110('2b','ZIMn')+_0x5c69e3+_0x2110('2c','nQiA')};return new Promise(_0x5a65aa=>{var _0xb3368a={'spGaF':function(_0x18561d){return _0x134c86[_0x2110('2d','EsoS')](_0x18561d);},'fjQtN':function(_0x282ef2,_0x36db9d){return _0x134c86[_0x2110('2e','r]gA')](_0x282ef2,_0x36db9d);},'yDNCa':_0x134c86[_0x2110('2f','[r)V')],'UjClE':function(_0x559283,_0x523060){return _0x134c86[_0x2110('30','QPg(')](_0x559283,_0x523060);},'MPVHY':_0x134c86[_0x2110('31','FR&p')],'HzdHU':function(_0xc4e349,_0x24cac8){return _0x134c86[_0x2110('32','fR#H')](_0xc4e349,_0x24cac8);},'jJuwn':_0x134c86[_0x2110('33','v!a0')]};$[_0x2110('34','9i[4')](_0x581b95,(_0x32cc6b,_0x1eacde,_0x4e00e9)=>{var _0x312228={'wORUE':function(_0x19e1c4){return _0xb3368a[_0x2110('35','ZIMn')](_0x19e1c4);}};if(_0xb3368a[_0x2110('36','QPg(')](_0xb3368a[_0x2110('37','uwvp')],_0xb3368a[_0x2110('38','QPg(')])){console[_0x2110('39','ND1B')]($[_0x2110('3a','9i[4')]+_0x2110('3b','Ym&@'));}else{try{if(_0xb3368a[_0x2110('3c','EGyl')](_0xb3368a[_0x2110('3d','2$r*')],_0xb3368a[_0x2110('3e','QzyO')])){if(_0x32cc6b){console[_0x2110('3f','V]Y$')]($[_0x2110('40','nQiA')]+_0x2110('41','*r#U'));}else{if(_0xb3368a[_0x2110('42','2&Wg')](_0xb3368a[_0x2110('43','QzyO')],_0xb3368a[_0x2110('44','Led)')])){_0x4e00e9=JSON[_0x2110('45','Q%61')](_0x4e00e9);}else{_0x4e00e9=JSON[_0x2110('46','ZIMn')](_0x4e00e9);}}}else{_0x312228[_0x2110('47','#Xks')](_0x5a65aa);}}catch(_0xbf0bb7){$[_0x2110('48','Vlz*')](_0xbf0bb7);}finally{_0xb3368a[_0x2110('49','Vlz*')](_0x5a65aa);}}});});}function wuzhi01(_0xdbad08){var _0x17e07d={'QFinM':function(_0x29c09c){return _0x29c09c();},'peNvp':function(_0xfcebd7,_0x481e24){return _0xfcebd7===_0x481e24;},'MDDJK':_0x2110('4a','*r#U'),'gjUOX':_0x2110('4b','2$r*'),'ywbuY':function(_0x56247b,_0x945821){return _0x56247b===_0x945821;},'wshOt':_0x2110('4c','mH[c'),'rZjYS':_0x2110('4d','!NQn'),'pEbKR':function(_0x2ed535,_0x361dd7){return _0x2ed535!==_0x361dd7;},'AIxUY':_0x2110('4e','FR&p'),'KPSSM':function(_0xb53c1d,_0x28f384){return _0xb53c1d(_0x28f384);},'xftiQ':_0x2110('4f','4N!6'),'Geths':_0x2110('50','2$r*'),'aunDG':function(_0x276650){return _0x276650();},'sHZHn':_0x2110('51','R9hd'),'Ekeoa':_0x2110('52','2$r*'),'SuUOO':_0x2110('53','2$r*'),'tqNqd':_0x2110('54','fR#H'),'NHZgQ':_0x2110('55','!LQK'),'hEmsN':_0x2110('56','v!a0'),'NGJxf':_0x2110('57','uwvp'),'GAEMT':_0x2110('58','EUOC'),'tQBJT':function(_0x322475,_0x2120c8){return _0x322475(_0x2120c8);},'rKxTX':_0x2110('9','ZIMn'),'nRFmg':_0x2110('59','EsoS'),'VAuOo':_0x2110('5a','Q%61'),'UUxbl':_0x2110('5b','!NQn')};let _0x20ffe7=+new Date();let _0x1ceb66=_0xdbad08[_0x2110('5c','FR&p')];let _0x11e88a={'url':_0x2110('5d','ND1B')+_0x20ffe7,'headers':{'Host':_0x17e07d[_0x2110('5e','F0A2')],'Content-Type':_0x17e07d[_0x2110('5f','Ym&@')],'origin':_0x17e07d[_0x2110('60','Oq!s')],'Accept-Encoding':_0x17e07d[_0x2110('61','[XY^')],'Cookie':cookie,'Connection':_0x17e07d[_0x2110('62','QPg(')],'Accept':_0x17e07d[_0x2110('63','Q%61')],'User-Agent':$[_0x2110('64','[XY^')]()?process[_0x2110('65','uwvp')][_0x2110('66','!NQn')]?process[_0x2110('67','[XY^')][_0x2110('68','QWV@')]:_0x17e07d[_0x2110('69','v[O6')](require,_0x17e07d[_0x2110('6a','R9hd')])[_0x2110('6b','Q%61')]:$[_0x2110('6c','ZIMn')](_0x17e07d[_0x2110('6d','4gNf')])?$[_0x2110('6e','Qb)v')](_0x17e07d[_0x2110('6f','9Ot%')]):_0x17e07d[_0x2110('70','fR#H')],'referer':_0x2110('71','mH[c'),'Accept-Language':_0x17e07d[_0x2110('72','2&Wg')]},'body':_0x2110('73','FR&p')+_0x1ceb66+_0x2110('74','S]%h')+_0x20ffe7+_0x2110('75','v!a0')+_0x20ffe7};return new Promise(_0x3cea45=>{if(_0x17e07d[_0x2110('76','bgXw')](_0x17e07d[_0x2110('77','jCUL')],_0x17e07d[_0x2110('78','nQiA')])){$[_0x2110('79','QzyO')](e);}else{$[_0x2110('7a','6*Jw')](_0x11e88a,(_0x1d51d6,_0x5202d6,_0x2bad58)=>{var _0x42841a={'wAOqN':function(_0x189e7f){return _0x17e07d[_0x2110('7b','QPg(')](_0x189e7f);}};if(_0x17e07d[_0x2110('7c','QPg(')](_0x17e07d[_0x2110('7d','ND1B')],_0x17e07d[_0x2110('7e','QzyO')])){_0x2bad58=JSON[_0x2110('7f','EsoS')](_0x2bad58);}else{try{if(_0x17e07d[_0x2110('80','FR&p')](_0x17e07d[_0x2110('81','ZIMn')],_0x17e07d[_0x2110('82','nQiA')])){if(_0x1d51d6){console[_0x2110('83','bgXw')]($[_0x2110('84','ZIMn')]+_0x2110('85','4N!6'));}else{_0x2bad58=JSON[_0x2110('86','R1mJ')](_0x2bad58);}}else{if(_0x1d51d6){if(_0x17e07d[_0x2110('87','v!a0')](_0x17e07d[_0x2110('88','!NQn')],_0x17e07d[_0x2110('88','!NQn')])){_0x42841a[_0x2110('89','nQiA')](_0x3cea45);}else{console[_0x2110('8a','QWV@')]($[_0x2110('8b','R1mJ')]+_0x2110('8c','[r)V'));}}else{if(_0x17e07d[_0x2110('8d','QzyO')](safeGet,_0x2bad58)){if(_0x17e07d[_0x2110('8e','!nE2')](_0x17e07d[_0x2110('8f','Ym&@')],_0x17e07d[_0x2110('90','EUOC')])){$[_0x2110('91','!nE2')](e);}else{_0x2bad58=JSON[_0x2110('92','!LQK')](_0x2bad58);}}}}}catch(_0x1d67b6){$[_0x2110('79','QzyO')](_0x1d67b6);}finally{_0x17e07d[_0x2110('93','yG#x')](_0x3cea45);}}});}});}function shuye72(){var _0x5a29a8={'lSJsp':function(_0x1fa457){return _0x1fa457();},'NXGlB':function(_0x112d04,_0xb20870){return _0x112d04!==_0xb20870;},'riXuW':function(_0x25655e,_0x2acb96){return _0x25655e<_0x2acb96;},'jIUfG':function(_0x298cdd,_0x449372){return _0x298cdd(_0x449372);},'JftNo':function(_0x1fc0bf,_0x360a3f){return _0x1fc0bf===_0x360a3f;},'Nurwv':_0x2110('94',')89p'),'SuRhE':_0x2110('95','8Dx^'),'HakVr':function(_0x448212,_0x141625){return _0x448212!==_0x141625;},'PdEXA':_0x2110('96','nQiA'),'cxNOc':function(_0x211e3d,_0x43df7e){return _0x211e3d!==_0x43df7e;},'HCsGE':_0x2110('97','bgXw'),'nYJFN':_0x2110('98','[r)V'),'mwxoJ':_0x2110('99','fR#H')};return new Promise(_0x177429=>{var _0x52da9b={'qScAC':function(_0x1ed335){return _0x5a29a8[_0x2110('9a','!NQn')](_0x1ed335);},'SwoRU':function(_0x415f53,_0x1fc168){return _0x5a29a8[_0x2110('9b','bgXw')](_0x415f53,_0x1fc168);},'gYMCC':function(_0x4569e8,_0x1dc241){return _0x5a29a8[_0x2110('9c','EUOC')](_0x4569e8,_0x1dc241);},'IWYXI':function(_0x12757a,_0x3d56c5){return _0x5a29a8[_0x2110('9d','jCUL')](_0x12757a,_0x3d56c5);},'WudCT':function(_0x46cff3){return _0x5a29a8[_0x2110('9e','uwvp')](_0x46cff3);},'qdxWq':function(_0x3ea189,_0x49981b){return _0x5a29a8[_0x2110('9f','QPg(')](_0x3ea189,_0x49981b);},'nGtOi':_0x5a29a8[_0x2110('a0','Mnk7')],'qligr':_0x5a29a8[_0x2110('a1','EsoS')],'DVXqm':function(_0x219333,_0x3cd0b8){return _0x5a29a8[_0x2110('a2','4N!6')](_0x219333,_0x3cd0b8);},'ZaTdK':_0x5a29a8[_0x2110('a3','EGyl')],'LIaSX':function(_0x43b66d){return _0x5a29a8[_0x2110('a4','9i[4')](_0x43b66d);}};if(_0x5a29a8[_0x2110('a5','Q%61')](_0x5a29a8[_0x2110('a6','!nE2')],_0x5a29a8[_0x2110('a7','6*Jw')])){_0x52da9b[_0x2110('a8','EUOC')](_0x177429);}else{$[_0x2110('a9','Mnk7')]({'url':_0x5a29a8[_0x2110('aa','EUOC')],'headers':{'User-Agent':_0x5a29a8[_0x2110('ab','yG#x')]},'timeout':0x1388},async(_0xc143ee,_0x369367,_0xf34a89)=>{try{if(_0xc143ee){console[_0x2110('ac','4N!6')]($[_0x2110('ad','Led)')]+_0x2110('ae','!NQn'));}else{$[_0x2110('af','OrCL')]=JSON[_0x2110('b0','uwvp')](_0xf34a89);await _0x52da9b[_0x2110('b1','Led)')](shuye73);if(_0x52da9b[_0x2110('b2','Q%61')]($[_0x2110('b3','ND1B')][_0x2110('b4','!NQn')][_0x2110('b5','OrCL')],0x0)){for(let _0x510325=0x0;_0x52da9b[_0x2110('b6','[XY^')](_0x510325,$[_0x2110('b7','4N!6')][_0x2110('b8','#Xks')][_0x2110('b9','[XY^')]);_0x510325++){let _0x4739ce=$[_0x2110('ba','QzyO')][_0x2110('bb','yG#x')][_0x510325];await $[_0x2110('bc','!nE2')](0x1f4);await _0x52da9b[_0x2110('bd','6*Jw')](wuzhi,_0x4739ce);}await _0x52da9b[_0x2110('be','EsoS')](shuye74);}}}catch(_0x253c02){if(_0x52da9b[_0x2110('bf','2$r*')](_0x52da9b[_0x2110('c0','N0@Z')],_0x52da9b[_0x2110('c1','v[O6')])){$[_0x2110('c2','EsoS')](_0x253c02);}else{$[_0x2110('c3','v[O6')](_0x253c02);}}finally{if(_0x52da9b[_0x2110('c4','OrCL')](_0x52da9b[_0x2110('c5','bgXw')],_0x52da9b[_0x2110('c6','V]Y$')])){$[_0x2110('c7','r]gA')]=JSON[_0x2110('b0','uwvp')](_0xf34a89);$[_0x2110('c8','Ps3S')]=$[_0x2110('c9','!NQn')][_0x2110('ca','OrCL')];}else{_0x52da9b[_0x2110('cb','9Ot%')](_0x177429);}}});}});}function shuye73(){var _0x28463c={'ujyrE':function(_0x1cd93a){return _0x1cd93a();},'Zavwr':function(_0x5ecc44,_0x34f07a){return _0x5ecc44!==_0x34f07a;},'ozSQB':_0x2110('cc','uwvp'),'rBcIo':_0x2110('cd','Q%61'),'iNxsw':_0x2110('ce','N0@Z'),'pdAUX':_0x2110('cf','2&Wg'),'Oisxz':_0x2110('d0','Vlz*'),'DJOUW':function(_0x30b6a2,_0x5e7668){return _0x30b6a2===_0x5e7668;},'SsdGg':_0x2110('d1','Ym&@'),'OZwYX':function(_0x1b2908,_0x3844b5){return _0x1b2908===_0x3844b5;},'rkVtk':_0x2110('d2','!LQK'),'ZckFW':_0x2110('d3','r]gA'),'xxYVL':_0x2110('d4','2$r*')};return new Promise(_0x2adc02=>{var _0x31b641={'TtUlP':function(_0x2e886f){return _0x28463c[_0x2110('d5','fR#H')](_0x2e886f);},'xwUpB':function(_0x5eefc4,_0xd4fd67){return _0x28463c[_0x2110('d6','uwvp')](_0x5eefc4,_0xd4fd67);},'iIGVl':_0x28463c[_0x2110('d7','8Dx^')],'Odkie':_0x28463c[_0x2110('d8','Q%61')],'rUEmA':function(_0x5d49ec,_0x4df64a){return _0x28463c[_0x2110('d9','EGyl')](_0x5d49ec,_0x4df64a);},'tazfw':_0x28463c[_0x2110('da','ZIMn')],'gvMeU':_0x28463c[_0x2110('db','4gNf')],'zTZHv':_0x28463c[_0x2110('dc','S]%h')],'oJkqZ':function(_0x495856,_0x391cd8){return _0x28463c[_0x2110('dd','9i[4')](_0x495856,_0x391cd8);},'focnz':_0x28463c[_0x2110('de','6*Jw')]};if(_0x28463c[_0x2110('df','8Dx^')](_0x28463c[_0x2110('e0','9i[4')],_0x28463c[_0x2110('e1','#Xks')])){$[_0x2110('e2','Ps3S')]({'url':_0x28463c[_0x2110('e3','!nE2')],'headers':{'User-Agent':_0x28463c[_0x2110('e4','*r#U')]},'timeout':0x1388},async(_0xbae9d1,_0x504559,_0x5c10cf)=>{var _0x1d5470={'btnvR':function(_0xd1cc62){return _0x31b641[_0x2110('e5','!LQK')](_0xd1cc62);}};if(_0x31b641[_0x2110('e6','uwvp')](_0x31b641[_0x2110('e7','QPg(')],_0x31b641[_0x2110('e8','!LQK')])){_0x31b641[_0x2110('e9','#Xks')](_0x2adc02);}else{try{if(_0x31b641[_0x2110('ea','2&Wg')](_0x31b641[_0x2110('eb','6*Jw')],_0x31b641[_0x2110('ec','#Xks')])){console[_0x2110('ed','ZIMn')]($[_0x2110('ee','2$r*')]+_0x2110('ef','#Xks'));}else{if(_0xbae9d1){console[_0x2110('f0','9i[4')]($[_0x2110('f1','9Ot%')]+_0x2110('f2','yG#x'));}else{if(_0x31b641[_0x2110('f3','Oq!s')](_0x31b641[_0x2110('f4','Oq!s')],_0x31b641[_0x2110('f5','QzyO')])){$[_0x2110('f6','F0A2')]=JSON[_0x2110('f7','[r)V')](_0x5c10cf);$[_0x2110('d','Ym&@')]=$[_0x2110('f8','4N!6')][_0x2110('f9','fR#H')];}else{console[_0x2110('fa','8Dx^')]($[_0x2110('fb','*r#U')]+_0x2110('fc','Qb)v'));}}}}catch(_0x4a7e8a){if(_0x31b641[_0x2110('fd','F0A2')](_0x31b641[_0x2110('fe','QzyO')],_0x31b641[_0x2110('ff','F0A2')])){console[_0x2110('100','2$r*')]($[_0x2110('101','mH[c')]+_0x2110('102','S]%h'));}else{$[_0x2110('103','Q%61')](_0x4a7e8a);}}finally{if(_0x31b641[_0x2110('104','R1mJ')](_0x31b641[_0x2110('105','[XY^')],_0x31b641[_0x2110('106','9Ot%')])){_0x31b641[_0x2110('107','6*Jw')](_0x2adc02);}else{_0x1d5470[_0x2110('108','mH[c')](_0x2adc02);}}}});}else{$[_0x2110('109','8Dx^')](e);}});}function shuye74(){var _0x5270f4={'fKxOt':function(_0x2e7daf,_0x4f2137){return _0x2e7daf(_0x4f2137);},'kDImE':function(_0x2dbe90,_0x314880){return _0x2dbe90===_0x314880;},'sSKTc':_0x2110('10a','!LQK'),'DSvQc':function(_0x203d40,_0xa6c891){return _0x203d40!==_0xa6c891;},'lhFyA':_0x2110('10b','9i[4'),'fUBlk':_0x2110('10c','R9hd'),'pWBHs':function(_0x6d7bc8,_0x21c516){return _0x6d7bc8!==_0x21c516;},'RccdH':_0x2110('10d','F0A2'),'zcVcF':_0x2110('10e','OrCL'),'Deyxv':function(_0x208402,_0x1ee86d){return _0x208402!==_0x1ee86d;},'CffEI':function(_0x5553b2,_0x577f97){return _0x5553b2!==_0x577f97;},'kuWNl':_0x2110('10f','jCUL'),'xvjTB':function(_0x5e77cf,_0x3f39b6){return _0x5e77cf<_0x3f39b6;},'JWrFX':function(_0x13aec9,_0x94bff3){return _0x13aec9!==_0x94bff3;},'uQNDB':_0x2110('110','ND1B'),'oEwmS':_0x2110('111','Ym&@'),'mDtzk':function(_0x1e9b1d){return _0x1e9b1d();},'eonCx':function(_0x1bcd4d,_0x3b456a){return _0x1bcd4d(_0x3b456a);},'FmHfo':_0x2110('112','N0@Z'),'RIXPD':_0x2110('113','bgXw')};return new Promise(_0x2ac0d1=>{var _0x431e31={'YzArt':function(_0x13ec75,_0x5dd56f){return _0x5270f4[_0x2110('114','Q%61')](_0x13ec75,_0x5dd56f);}};$[_0x2110('115','4gNf')]({'url':_0x5270f4[_0x2110('116','2&Wg')],'headers':{'User-Agent':_0x5270f4[_0x2110('117','4gNf')]},'timeout':0x1388},async(_0x4c2c24,_0x23734e,_0x416fd4)=>{var _0x406cd0={'XEkPM':function(_0x4f3d5c,_0xb919bd){return _0x5270f4[_0x2110('118','OrCL')](_0x4f3d5c,_0xb919bd);}};try{if(_0x5270f4[_0x2110('119','4N!6')](_0x5270f4[_0x2110('11a','QzyO')],_0x5270f4[_0x2110('11b','R1mJ')])){if(_0x4c2c24){if(_0x5270f4[_0x2110('11c','S]%h')](_0x5270f4[_0x2110('11d','[r)V')],_0x5270f4[_0x2110('11e','FR&p')])){console[_0x2110('11f','Ym&@')]($[_0x2110('120','ND1B')]+_0x2110('121','nQiA'));}else{if(_0x4c2c24){console[_0x2110('122','Mnk7')]($[_0x2110('123','uwvp')]+_0x2110('121','nQiA'));}else{$[_0x2110('124','6*Jw')]=JSON[_0x2110('125','ND1B')](_0x416fd4);$[_0x2110('126','EsoS')]=$[_0x2110('127','Mnk7')][_0x2110('128','R9hd')];}}}else{if(_0x5270f4[_0x2110('129','R9hd')](safeGet,_0x416fd4)){if(_0x5270f4[_0x2110('12a','6*Jw')](_0x5270f4[_0x2110('12b','!nE2')],_0x5270f4[_0x2110('12c','uwvp')])){$[_0x2110('12d','Led)')]=JSON[_0x2110('12e','[XY^')](_0x416fd4);if(_0x5270f4[_0x2110('12f','4gNf')]($[_0x2110('130','4gNf')][_0x2110('131','!LQK')],0x0)){if(_0x5270f4[_0x2110('132','ND1B')](_0x5270f4[_0x2110('133','Vlz*')],_0x5270f4[_0x2110('134','v!a0')])){$[_0x2110('135','OrCL')](e);}else{for(let _0x52518c=0x0;_0x5270f4[_0x2110('136','6*Jw')](_0x52518c,$[_0x2110('137','Qb)v')][_0x2110('138','nQiA')][_0x2110('139','Led)')]);_0x52518c++){let _0x35e2eb=$[_0x2110('130','4gNf')][_0x2110('13a','Mnk7')][_0x52518c];await $[_0x2110('13b','ZIMn')](0x1f4);await _0x5270f4[_0x2110('13c','ND1B')](wuzhi01,_0x35e2eb);}}}}else{if(_0x4c2c24){console[_0x2110('3f','V]Y$')]($[_0x2110('13d','QWV@')]+_0x2110('ef','#Xks'));}else{if(_0x406cd0[_0x2110('13e','bgXw')](safeGet,_0x416fd4)){_0x416fd4=JSON[_0x2110('13f','Ym&@')](_0x416fd4);}}}}}}else{console[_0x2110('3f','V]Y$')]($[_0x2110('140','[XY^')]+_0x2110('141','mH[c'));}}catch(_0x184322){if(_0x5270f4[_0x2110('142','Q%61')](_0x5270f4[_0x2110('143','Led)')],_0x5270f4[_0x2110('144',')89p')])){$[_0x2110('145','F0A2')](_0x184322);}else{if(_0x431e31[_0x2110('146','2$r*')](safeGet,_0x416fd4)){_0x416fd4=JSON[_0x2110('147','8Dx^')](_0x416fd4);}}}finally{_0x5270f4[_0x2110('148','F0A2')](_0x2ac0d1);}});});};_0xodD='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}