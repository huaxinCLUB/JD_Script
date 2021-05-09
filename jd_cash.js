/*
签到领现金，每日2毛～5毛
可互助，助力码每日不变，只变日期
活动入口：京东APP搜索领现金进入
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#签到领现金
2 0-23/4 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_cash.js, tag=签到领现金, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "2 0-23/4 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_cash.js,tag=签到领现金

===============Surge=================
签到领现金 = type=cron,cronexp="2 0-23/4 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_cash.js

============小火箭=========
签到领现金 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_cash.js, cronexpr="2 0-23/4 * * *", timeout=3600, enable=true
 */
const $ = new Env('签到领现金');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
let helpAuthor = true;
const randomCount = $.isNode() ? 20 : 5;
let t = +new Date()
let cash_exchange = false;//是否消耗2元红包兑换200京豆，默认否
const inviteCodes = [
  ``,
  ``
]
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
let allMessage = '';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  //await requireConfig()
  //await getAuthorShareCode();
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      if(helpAuthor){
        await shuye72()
      }
      await jdCash()
    }
  }
  if (allMessage) {
    if ($.isNode() && (process.env.CASH_NOTIFY_CONTROL ? process.env.CASH_NOTIFY_CONTROL === 'false' : !!1)) await notify.sendNotify($.name, allMessage);
    $.msg($.name, '', allMessage);
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdCash() {
  await index()
  //await shareCodesFormat()
  //await helpFriends()
  await getReward()
  await getReward('2');
  $.exchangeBeanNum = 0;
  cash_exchange = $.isNode() ? (process.env.CASH_EXCHANGE ? process.env.CASH_EXCHANGE : `${cash_exchange}`) : ($.getdata('cash_exchange') ? $.getdata('cash_exchange') : `${cash_exchange}`);
  if (cash_exchange === 'true') {
    console.log(`\n\n开始花费2元红包兑换200京豆，一周可换四次`)
    for (let item of ["-1", "0", "1", "2", "3"]) {
      $.canLoop = true;
      if ($.canLoop) {
        for (let i = 0; i < 4; i++) {
          await exchange2(item);//兑换200京豆(2元红包换200京豆，一周四次。)
        }
        if (!$.canLoop) {
          console.log(`已找到符合的兑换条件，跳出\n`);
          break
        }
      }
    }
    if ($.exchangeBeanNum) {
      message += `兑换京豆成功，获得${$.exchangeBeanNum * 100}京豆\n`;
    }
  }
  await index(true)
  // await showMsg()
}
function index(info=false) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_home",), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.code===0 && data.data.result){
              if(info){
                if (message) {
                  message += `当前现金：${data.data.result.signMoney}元`;
                  allMessage += `京东账号${$.index}${$.nickName}\n${message}${$.index !== cookiesArr.length ? '\n\n' : ''}`;
                }
                console.log(`\n\n当前现金：${data.data.result.signMoney}元`);
                return
              }
              // console.log(`您的助力码为${data.data.result.inviteCode}`)
              //console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.data.result.inviteCode}\n`);
              let helpInfo = {
                'inviteCode': data.data.result.inviteCode,
                'shareDate': data.data.result.shareDate
              }
              $.shareDate = data.data.result.shareDate;
              // $.log(`shareDate: ${$.shareDate}`)
              // console.log(helpInfo)
              for(let task of data.data.result.taskInfos){
                if (task.type === 4) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.skuId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 2) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.shopId)
                    await $.wait(5000)
                  }
                }
                else if (task.type === 16 || task.type===3 || task.type===5 || task.type===17 || task.type===21) {
                  for (let i = task.doTimes; i < task.times; ++i) {
                    console.log(`去做${task.name}任务 ${i+1}/${task.times}`)
                    await doTask(task.type, task.jump.params.url)
                    await $.wait(5000)
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    console.log(`去帮助好友${code['inviteCode']}`)
    await helpFriend(code)
    if(!$.canHelp) break
    await $.wait(1000)
  }
  // if (helpAuthor && $.authorCode) {
  //   for(let helpInfo of $.authorCode){
  //     console.log(`去帮助好友${helpInfo['inviteCode']}`)
  //     await helpFriend(helpInfo)
  //     if(!$.canHelp) break
  //     await $.wait(1000)
  //   }
  // }
}
function helpFriend(helpInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_assist", {...helpInfo,"source":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0 && data.data.bizCode === 0){
              console.log(`助力成功，获得${data.data.result.cashStr}`)
              // console.log(data.data.result.taskInfos)
            } else if (data.data.bizCode===207){
              console.log(data.data.bizMsg)
              $.canHelp = false
            } else{
              console.log(data.data.bizMsg)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function doTask(type,taskInfo) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_doTask",{"type":type,"taskInfo":taskInfo}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if( data.code === 0){
              console.log(`任务完成成功`)
              // console.log(data.data.result.taskInfos)
            }else{
              console.log(data)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function getReward(source = 1) {
  return new Promise((resolve) => {
    $.get(taskUrl("cash_mob_reward",{"source": Number(source),"rewardNode":""}), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.code === 0 && data.data.bizCode === 0) {
              console.log(`领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}】`)
              message += `领奖成功，${data.data.result.shareRewardTip}【${data.data.result.shareRewardAmount}元】\n`;
              // console.log(data.data.result.taskInfos)
            } else {
              // console.log(`领奖失败，${data.data.bizMsg}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function exchange2(node) {
  let body = '';
  const data = {node,"configVersion":"1.0"}
  if (data['node'] === '-1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595890027&sign=92a8abba7b6846f274ac9803aa5a283d&sv=102`;
  } else if (data['node'] === '0') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597882090&sign=e00bd6c3af2a53820825b94f7a648551&sv=100`;
  } else if (data['node'] === '1') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619595655007&sign=2e72bbd21e5f5775fe920eac129f89a2&sv=111`;
  } else if (data['node'] === '2') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597924095&sign=c04c70370ff68d71890de08a18cac981&sv=112`;
  } else if (data['node'] === '3') {
    body = `body=${encodeURIComponent(JSON.stringify(data))}&uuid=8888888&client=apple&clientVersion=9.4.1&st=1619597953001&sign=4c36b3d816d4f0646b5c34e7596502f8&sv=122`;
  }
  return new Promise((resolve) => {
    const options = {
      url: `${JD_API_HOST}?functionId=cash_exchangeBeans&t=${Date.now()}&${body}`,
      body: `body=${escape(JSON.stringify(data))}`,
      headers: {
        'Cookie': cookie,
        'Host': 'api.m.jd.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.post(options, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === 0) {
              if (data.data.bizCode === 0) {
                console.log(`花费${data.data.result.needMoney}元红包兑换成功！获得${data.data.result.beanName}\n`)
                $.exchangeBeanNum += parseInt(data.data.result.needMoney);
                $.canLoop = false;
              } else {
                console.log('花费2元红包兑换200京豆失败：' + data.data.bizMsg)
                if (data.data.bizCode === 504) $.canLoop = true;
                if (data.data.bizCode === 120) $.canLoop = false;
              }
            } else {
              console.log(`兑换京豆失败：${JSON.stringify(data)}\n`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
function showMsg() {
  return new Promise(resolve => {
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: "https://cdn.jsdelivr.net/gh/wuzhi-docker1/RandomShareCode@main/JD_Cash.json",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
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
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
      let authorCode = deepCopy($.authorCode)
      $.newShareCodes = [...(authorCode.map((item, index) => authorCode[index] = item['inviteCode'])), ...$.newShareCodes];
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    $.newShareCodes.map((item, index) => $.newShareCodes[index] = { "inviteCode": item, "shareDate": $.shareDate })
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    let shareCodes = [];
    if ($.isNode()) {
      if (process.env.JD_CASH_SHARECODES) {
        if (process.env.JD_CASH_SHARECODES.indexOf('\n') > -1) {
          shareCodes = process.env.JD_CASH_SHARECODES.split('\n');
        } else {
          shareCodes = process.env.JD_CASH_SHARECODES.split('&');
        }
      }
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}
function deepCopy(obj) {
  let objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        //判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key] && typeof obj[key] === "object") {
          objClone[key] = deepCopy(obj[key]);
        } else {
          //如果不是，简单复制
          objClone[key] = obj[key];
        }
      }
    }
  }
  return objClone;
}
function taskUrl(functionId, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${functionId}&body=${escape(JSON.stringify(body))}&appid=CashRewardMiniH5Env&appid=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'http://wq.jd.com/wxapp/pages/hd-interaction/index/index',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

function getAuthorShareCode(url = "https://cdn.jsdelivr.net/gh/wuzhi-docker1/updateTeam@master/shareCodes/jd_updateCash.json") {
  return new Promise(resolve => {
    $.get({url, headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }, timeout: 200000,}, async (err, resp, data) => {
      $.authorCode = [];
      try {
        if (err) {
        } else {
          $.authorCode = JSON.parse(data)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
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
      }
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