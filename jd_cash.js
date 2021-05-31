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
  await requireConfig()
  await getAuthorShareCode();
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
  await shareCodesFormat()
  await helpFriends()
  await getReward()
  await getReward('2');
  $.exchangeBeanNum = 0;
  cash_exchange = $.isNode() ? (process.env.CASH_EXCHANGE ? process.env.CASH_EXCHANGE : `${cash_exchange}`) : ($.getdata('cash_exchange') ? $.getdata('cash_exchange') : `${cash_exchange}`);
  if (cash_exchange === 'true') {
    console.log(`\n\n开始花费2元红包兑换200京豆，一周可换四次`)
    for (let item of ["-1", "0", "1", "2", "3"]) {
      $.canLoop = true;
      if ($.canLoop) {
        for (let i = 0; i < 5; i++) {
          await exchange2(item);//兑换200京豆(2元红包换200京豆，一周五次。)
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
              //console.log(`您的助力码为${data.data.result.inviteCode}`)
              console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${data.data.result.inviteCode}\n`);
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
var _0xodE='jsjiami.com.v6',_0x2e44=[_0xodE,'W8KfXsOPw4c=','P8KWVMOYQg==','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDu8KzwoLDqMOOfVsyw6sHwrbCrMOEMcOnw7MswonCjVvDpsOow6TCosKaw5fCr8Kvwpg6wrjCs3zDpcKsw781HiXCjcOUPMKoNB/DkF7Dv3jCg8O1w5E1wq/DtQvDr8OJw67DjhU7w7/DuB3DlsORJmQ=','w7NPw6UWw4s=','F8Ozw4rDvlXCvcOcwoVEwojDpsOyJcKbwpR/w4DDrsKOTcKMwrYaRsK1HQLCmMOzwqc2w4DCgzrCicKMfRLDngB8w5HCmWBAw5TCvEDDncKmIA4BJmhlw4VQIsOAwp3DnCfDkhpjdsO9McKsMcOjAFRSO8OdF8KWGyrCjcOtwp8Zw5XCuWrDisOhbsOMTFvCjRoaT8ONdcO7eMOCccKwDcOEw4QdEAgYwprCpMKZNsOPwrnDtsK/w6jCvGTClMOXw41Iw4/CvMKgEARKYsOYYSEywqLCsAvCusOacsOjDcOmHMO2w5BwwpknD8OLw7HCiiljUxDCgUrCtcKfw50zZsONScO5IsOUwpNhw47Dh8O9JREfKsOYYR3DpEwpw55j','wqnDi8KWw7pVw7cIw7XDhsKcR8Ocw7lxD00Pwo5GaMOsBHjCm8KOwpUsDMKhEl9rwoYTwqk4wpw+SCLCgEHCosKSJCcRC8OAJENcwqhmHHl8dXDDn8O6wq4WF8Kfw7pKbiwqUcKAK8Kew4XDr13Ds8KhTcKgw4lWcj/CqcOiMi9uwp/DhsKzQsO/w5NUwrQyw7E0','UsOAw5fCpg==','w7PCnsOOw4Jl','woJtwoVyMw==','dsOOwpVsWw==','UxdzdEk=','F8KYbMOOdw==','ccOlw5TCvMKN','EUXCq0TChA==','KBfCn2lI','DsKwXMOwbQ==','b8KkD8K5ZA==','SMOwwrhyVA==','QsKmw7jDjcOZ','w45QLcOnw6U=','wpQXw6phw44=','CjUgXSw=','WMKzwqNk','bFEyeR8=','B8KzE3pi','w7I4wrfDvgc=','w7nCiMO7w7XCpA==','wrM3aj/Dgw==','w5JXwok7Rw==','LwM2wpFy','w7zCpMO7w5DDrA==','wq9FwrQ=','wpMmYx4=','w50GXjLorZXms7vlpr/ot77vvKDorrnmoZLmno/nvr/otYrphLHoroE=','d8OiRsKSZQ==','w6NTwpbDs8OK','w4J2w5JcwpE=','wqsKMMKyw6E=','GikATXg=','ScOQYcK0RA==','w4jDqsOlwovDmQ==','RMKhAA==','M2A7XQ==','wrNmwpEi6K+75rGk5aem6Las77+E6K2j5qOr5p+7572q6LSQ6YeI6K2I','w7tIwqjCiMOf','ZhBIYWA=','w5zDt8OWwoAfw7k=','w73ChcOVLcO1','HgRmw549','F8O3w5/CuMKB','YSVuKsKG','wqM5w6pxw4Q=','wpZDw5vCi0ZN','JcKsEA==','RsKvCsKY','DcKtWcOA6K2z5rGV5aWl6LSI77646K+e5qOH5p6C57yt6LS26YeP6K6U','FBYKwoJW','F33Cg33Cpg==','w45owqtuIw==','wrdgw7TDoMOP','woYAw5JSw6Q=','DDDCgGNQ','w4tVH8Oqw6c=','acOee8KRbmPDmCpyAcOswp7ClmvDhh3CocKxw5PCr8KLw4/CkMOzCMO1w7PDosO7w5nCkMOxwrwlwrnDpMOGw5hVwrTCuF4OEcK6GMKhOAbDhMKTEMOTwotlw6MBO8O0w7R7SQ==','wpQnGMKNw45rAjnCpcKWwrPDlTdSw4EVX217w6TCqSdJJTJgZcKrXcKfbsKJHsOow7PDkFFfAlzCl8O2w4bCmmAvw6fCmsKfw63DvcKww7MBwqkpw6XDmMK6w7TDpRAYewcrHTF1woIvw64zEGYOwqRMwr0ow7DCtsKqUMOfw6HCpUHCnTIzD1nDqz9owrbDg10yw45pH8O+wqHCp8Ofw7DDv8OKw5rDonQGwrLDisK7w5U3wr3CsknDlsOFw63ChcO3IRHCsgjDh1PDsQFTwrnDlW4eW1Yqwr7CncOkDkbCmMOQTlvCkV9iwrc=','w7cswoBxwpg=','woopw61cw7U=','w7zChsOXCsOK','wqgaw4llw5U=','w4k+wpzDrzM=','NW3Csw==','w5rCqMOzKsOa','Z8KNBsK1Qw==','wpkzKGIU','wqMjFMKzw4k=','OBcWwrUH','AyzCimNpw7U=','HsOKw4rDkno=','LsKPNn1p','w65qw7JVwqg=','w4fCjMOp','Jyhew7A=','w7kJMsKt6K2V5rGF5aWS6LSz776c6K2P5qGD5pyQ572O6LeU6YWc6K6o','wpEoaQ==','Fy4AYg==','WQ49TuiuqOaxp+Wlsei0he+/guisr+aipeadtOe+oei1uOmGl+itgA==','esOww4HCv8KE','w40HwpzDiyA=','XsKYTMOHw4w=','TMK9wqRxDQJZ','HAA7TWU=','w4bCg8Kgwpk1','w6bCgMOTw7pn','AcOmLVLDlsKpKA==','w43Cv8O5Ow==','w7wwwqVTwpV7','PsKTb8O/YQ==','w53CrMKgwpMc','M1caesKs','wrELM3Is','w6vDqsOFwpPDjQ==','w6/CrMOoP8OKwohd','w7XCiMKJwrQ=','w4fChsOgw7XDscK1','w4B0w6IWw63DiEQ=','w7fCl8OJw7E=','w4fDucOYwrE=','w5/CuMK7wrkQ','w4Nsw50yw5M=','AcKWWQ==','ABITwqQ=','wrAUwpt96KyW5rGR5aa36LSo77256KyG5qCL5p2F576u6Lai6YSf6K6v','Ojw7ZQleeVs=','wo0mfAjDhw==','w5gzwoLDvyPCoQs=','w61Hw4d3woXChnBd','w5LCkMOFw7A=','TMKPw73Do8OfZg==','w65zwrHCm8Ol','f8K1woFdBg==','w5ErwprDrCXDskAzAFzCunBQB8OUw4s8woIbd8KgYWE+wrjDvHrCgsKVwovDs8KLw4YGw7jCr8OjTUYyAifCqsKjwofCtcOEw6vDh8O6w6HDuB/Dt8KNw6XCqThpIsKzwrbDtcK2wpw8woVWYMKYw41AM0xGw6PDvMKFw5/CtBZlRh7DiUcgUsKOw6tn','ZcKhHcKUWH7CrsK2w4bCkUnDpsOVb8Kmw5Ngw6lowpbCj8O4M8Oxw7LCjsOqHsO2fcKywrMhw5sEwoYTcXNLHTARbMOsWMKQw7RBwpjDvMOfHTXCsE3Do8O7wr9awqI5wq90wqJdYBjCsGjDn0wsRnZjw6xMw63CjcO+KS/CpMKTbMOMw7wGTSk0PGh9FMKdXBLCqCjDo8OXSAQCw4oKwosAw4HChsKFA19hDgbChQTCoxBAWsOKNiIpw7XDghEDwrcMfnXCucKlw5lawoJMwobCnG/DkMO0w57DiTvDlsOVw59swpRT','w4LCgMOfw6NZ','w5AzwqfDjwE=','XsKfDsKfeA==','YCBTcEk=','w49mwoM=','w5hywqJ8Fg==','wpEVw6tGw40=','OAY6','w5bDqsO6wp0=','LlorSuiujeawtOWkrui1gO+/pOitqOagheadp+e/qui0p+mFruitmA==','w5XChMOYw7XCoVskUw==','fnoJcB8=','QcKMw7bDhcOYfVA=','YcO3wqtbfcKALhQ=','IQkJwoY=','w6VJw5RTwrDCkQ==','w78awoBQwqQ=','wp8JJg==','wrNDw5zDhw==','XcKNe8O6w6E=','w5vCnMKpwpsX','w79vHsOkw6Q=','LyBgw7Mq','w7lAMsO5w4I=','w4RywrnDtcOe','w6TCiMORw7ly','woQxAmgF','GhotQCI=','wrVWw4XDksOVfcKATsK1woHCqMKWAVElKwXCucOpD2HDjMKVX8OTK1xCwrDDhsORcMOLe8KTBcKmJ8O3wojDp8O8elZHYEXCtcK4RMK4JcO8wrrDoEIbwofDjMOsGHzDhhBZOADCgA==','w506wrFdwo1/w6ciQMOfw7vCgMOXJMKCEgl2w4XDiMOqTVsmw7vDtQnCuUvDsEzCr8K2w4w7C2vDgMK/wqx+DE7Cq8OEVHzCj8K0McK1w7HDjsOFFSU2wobDlsOCQ8K5w6zChTnDshLDncOKw6jDicKhI3rCjMOXw5pxbsKGwpshHAjCg8Kqw4DCt1M4RD7DmmfDtnTCpE15w63CjcKbFsK5wp4mwqnDqMKVXlBCFBzDpcOGRDTCu3fCtsOpwoHCk1DDlMOrwofCrHDCoQbDtMOQw67DniwbNGLDiMOuw63DiSwAw5PDosKOwoVIw5vChCosTg==','w6kGwqTDuhc=','NQgWwpA/','w4pDw4FXwoc=','w7lGwojCvMOy','w73DnMOewr3DpQ==','PWcEw4fCmA==','Ix0rZsK2','w4DClcObw6TDow==','w5HCrMO3w5pR','KMKud8OYeg==','woU+w7FHw6c=','HgQJwpZq','wqhNw4fDusOB','wqpWw4fDkMO1','w6NIwq3CrMOq','OyMZSTU=','wrFNw5bDp8OUNQ==','cRRO','w693w4whw6Q=','w6VFwqcCfw==','bSxvI8Ku','LMK5JkRq','OVEHQMKR','HEMtw5DChg==','JcKsEHtxwoU=','PGAUfMKz','EW8BfcK9','Ih0pwoRN','w7PCnsOSGcOk','OggwcQ==','OAscTiw=','wpcVJEk+','w4Bmw7MVw4E=','wpV1w6jCgFE=','wr0pFsKFw6ViFw==','WMKvFcKOUQ==','w5jDtcOBwrc0','w61Hw4d3woXChnA=','w4RmwpnDnsOtJQ==','w4hOwovCl8Ov','w6oQwpxywpQ=','FDYpwodM','HcKIdMOKTg==','w4xiwoPDmMOeKMKi','BjlWw7suCG3DtMO9FsKKacOM','w4hww7gQw57DhQ==','Nj8IaQ1AJHDCr8K7DsO0woQ=','YMO2w4/Cqg==','N8Ohw6DCpMKL','dcO3wq1JXw==','w7w6wqw=','Z8OeUhk=','wpHCpMO8w53orJHmsbzlpaHotYfvvaXor7jmoaHmnqjnvb/otpHphoXor4w=','bcOFaMKkbys=','acKYwqFZOQ==','w5wNwqrDvQI=','a0k/Yi4=','biJ0VWw=','w5sfwopNwq4=','ZcKqc8Obw5M=','wpw3Z1XDj8KXw6TCvwItw70H','w61GCMOHw4Y1woDDuno4O8KNKMKCEMOfKGhTO8KNwq3DgA0Vw5HCjnUDw5XCtQLCtA==','w4B3woPDicOqd8O5w6HCnsObw77CgMKTb1QKMcO5wow=','wrpYw5jDksKKZ8OLBMK0woTCvcKHAVNmJho=','H8O6w4bDqxbCqMKNwoFXwoo=','w4lzwofDlcOwLsK3wrrCn8KBwr7DgsOXdl9KfsK2wpXDnD7DgCPCsWl3w4cAeDvDjsKQBg==','Q8OWa8OOZsKAYMOJDMO+PgnDqA==','w6JHwqLDuA==','wpkCIFslZGvDp8OfwqnCncK2JcOkGQwuKMKDw6cyIRV2KcKrdsKqDcOiXMOOU8KXKD7DugN3wq5Tw6nDscO9R8OMH13CrD3Dj8OCwp57IcKLwqdLw5vCpMKDw6YDw7/Cj8OWbwfCrVLDgMOWw4zCjBVGw4I=','UsKmSsKeWg==','wpwrYhjDl8OQw6o=','O205V8K7','VmIjcRI=','X8KNZ8Otw6t6','M2TCq3XCm8KUw4I=','bcOPYcKGaTE=','w5jCi8Ovw6DDoMKew6htVQ==','ZsOjwrZeBw==','w6RCDMObw5xsw47CoXInPMKMPcKBDcOMcSZaOcOQwqPCgRECw5PCnzUBw5nCpQ7Cv2Y=','w5zCicOCw4hD','dcOFw7HCnMKG','wq9tw5PCn3g=','TcOvRMK3Ww==','csKEw7nDqcO3','w5/CpsO0w5TDvA==','BwAwwq5dw4c=','w53DpcOh','w5ljwp4+X2PChcOWwonDk25Qbw==','w5wxwpg=','PsObw7zDjmjCjMKzwrdgwqjDgsOIAw==','bC1LKcKe','fQlMIcKi','wqgUSynDvcO4w4nCnmIa','w7RCwrUPbVLCtg==','Nkccw7/ClQ==','w49mwoPDncO4OcK3','TTR1BsKg','w6Anwol1wrY=','w4PCl8O6w6LDtsOnwqgmWMO3w47DnW3CgMOLJEEQWMOfBsKFwoQzw6rDu8OowrRlwqZUwpfCsMOLwrpsXzZnwp5nNwdYJC80EGXDn0bDulLDvQQJw6fDkcK8L3ZTCsO6wql4wodWwrDDgWUXAlYdwoFUc8OiRcOKwocWw4cAwpUgwqs9','fcO+w4fCq8KW','A8OyN1DDpcKlM8OUSFvDlgQ5w5B1Ay4Fw5lHw6fCmXHCvcK/wrDDlsO3Aw1Ow53DhsKBcyDDnsO9wrs5KcK9Q8Og','T8OVHMOzQsK/WsKqccKZUnHCmV5qw7rCl8OXLnHDuMKfWsKyRWTDvcOew7Y2worDp1DCjMKoworDmcOaMgorN3LCpcOyfxwqFsKKNsOkI2DDisOVJhIPwrVKRiY3NWjDn1IfXkjDumlLeABFfFMbw6jCnxUHJsKv','w6EBwqhTwps=','eMKow57DhMOM','w7/ChMOAw4bDvw==','wqknEcKQ','Y8KWwrd9Lg==','OcKBT8OEdw==','w5hOCcOyw7s=','TMK9wqRxDQJZTQ==','w5vCgsO8w6HDoA==','TMKAZcOqw7F+MA==','ScKNfcOow4NyIBw=','dMOiw4/Cug==','acO5wrg=','Q8KNZMOs','IcOrX8Ko6K+q5rCb5aeG6LSg77yZ6K6f5qGY5pye576i6Laq6YWo6K6n','w4RswpDDvMOrPw==','wpk2BFk3','w4lYw5suw6s=','asOCwoV4ag==','w5rDjMO1wo3Dmg==','NMKJZMOJUA==','BMOPw6nDsU0=','wrBmw7bCpHE=','MTY4wrU0','e8O8w47CmsK/','F8Oew4LCksK5','w7ElwqIawow9w6xpW8KSwqTDjQ==','ScKswqB8IwRMCExSKMKBwocyGQ1/S8OvXkByJ8K5UMKFMMOlwoMlwqzCl1Y=','w6RCDMObw5xsw47CoXwnMMOMIsOKA8OYPiZeMcKLw63ChxwLw5TCn35Ow5DCtUnCs2fDuw==','P8OCw53CmsOCTsOFwqIXw5HDrVzDo8OuwoTClcKH','wpgDJFt4Pm7DnsOBwqM=','w5LCisKcwr0QwojDjcKxaBfCtcOUwotVw7Nwwp1cQADDsMKBwqBHVcKewovDtnolc2B0','w7rDnMOkwoQ=','fBVbYnV3VcKRMlDDv23Cs8OzOhFdPy/CljLDnMOyaMO0AEzDvQLCp8Odw7zCnkrCqcKaw752w6LCrDdvwrvDosK/QlUPw6bCscOew4sTwq/ChsO6OXPCphUbwqx8w7pJBsO3w5TClG3DmGjDrHzDowMz','MyEew7YS','w7vChsOXw7BTw7cIw7U=','f8Ojw5LCrsKmHMK9KUTDll8HwqLDvmjCssKswpQ/w4FsOCt3wqI=','wrE6w49Jw7c=','dsKQw7TDoMO0','wq4yWQLDpg==','w77CqsK6wpc8','TsOOw7DCtsK3','w77DrcOWwpTDmA==','ScKTw5TDicOJcQ==','ZMOEeQ==','CDg/wrc/w6UJXcOnwr5Gelo=','EcOxw5U=','w6JHwqjDrMOKCMKEwpHCt8KpwpXCo8Op','wqwpC8K9w6o=','Rw5tKcKl','w4UGwo5mwr5Sw4FIO8Kl','w7cwwr9QwoBnw6c=','woUVFm0W','CCbCmUJ6w7Mm','VxhujPrsKjiamifggz.fygczom.v6=='];(function(_0x344f48,_0x31a60c,_0x15bca7){var _0x4b7bc3=function(_0x273671,_0x583c0f,_0x15425f,_0x504a80,_0x16bb10){_0x583c0f=_0x583c0f>>0x8,_0x16bb10='po';var _0x5265a8='shift',_0x5b22ef='push';if(_0x583c0f<_0x273671){while(--_0x273671){_0x504a80=_0x344f48[_0x5265a8]();if(_0x583c0f===_0x273671){_0x583c0f=_0x504a80;_0x15425f=_0x344f48[_0x16bb10+'p']();}else if(_0x583c0f&&_0x15425f['replace'](/[VxhuPrKfggzfygz=]/g,'')===_0x583c0f){_0x344f48[_0x5b22ef](_0x504a80);}}_0x344f48[_0x5b22ef](_0x344f48[_0x5265a8]());}return 0x8bf5f;};var _0x1dd13f=function(){var _0x13191d={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x33774d,_0xcc81e9,_0x2e2ad0,_0x132fc3){_0x132fc3=_0x132fc3||{};var _0x38f4f4=_0xcc81e9+'='+_0x2e2ad0;var _0x1dc251=0x0;for(var _0x1dc251=0x0,_0x58626e=_0x33774d['length'];_0x1dc251<_0x58626e;_0x1dc251++){var _0x2af0f6=_0x33774d[_0x1dc251];_0x38f4f4+=';\x20'+_0x2af0f6;var _0x2a5762=_0x33774d[_0x2af0f6];_0x33774d['push'](_0x2a5762);_0x58626e=_0x33774d['length'];if(_0x2a5762!==!![]){_0x38f4f4+='='+_0x2a5762;}}_0x132fc3['cookie']=_0x38f4f4;},'removeCookie':function(){return'dev';},'getCookie':function(_0x32d34c,_0x58ae95){_0x32d34c=_0x32d34c||function(_0x1283a5){return _0x1283a5;};var _0x53d03a=_0x32d34c(new RegExp('(?:^|;\x20)'+_0x58ae95['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x1cdfc5=typeof _0xodE=='undefined'?'undefined':_0xodE,_0x5870e8=_0x1cdfc5['split'](''),_0x1e4283=_0x5870e8['length'],_0x27354c=_0x1e4283-0xe,_0x567295;while(_0x567295=_0x5870e8['pop']()){_0x1e4283&&(_0x27354c+=_0x567295['charCodeAt']());}var _0x5cfc1b=function(_0x349671,_0x50d114,_0x452573){_0x349671(++_0x50d114,_0x452573);};_0x27354c^-_0x1e4283===-0x524&&(_0x567295=_0x27354c)&&_0x5cfc1b(_0x4b7bc3,_0x31a60c,_0x15bca7);return _0x567295>>0x2===0x14b&&_0x53d03a?decodeURIComponent(_0x53d03a[0x1]):undefined;}};var _0x59b992=function(){var _0x4f4c84=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x4f4c84['test'](_0x13191d['removeCookie']['toString']());};_0x13191d['updateCookie']=_0x59b992;var _0xeb6b9a='';var _0x22cea4=_0x13191d['updateCookie']();if(!_0x22cea4){_0x13191d['setCookie'](['*'],'counter',0x1);}else if(_0x22cea4){_0xeb6b9a=_0x13191d['getCookie'](null,'counter');}else{_0x13191d['removeCookie']();}};_0x1dd13f();}(_0x2e44,0xd3,0xd300));var _0x4092=function(_0x294e53,_0x432754){_0x294e53=~~'0x'['concat'](_0x294e53);var _0x20b228=_0x2e44[_0x294e53];if(_0x4092['njkJFA']===undefined){(function(){var _0x389496;try{var _0x7aa3a2=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x389496=_0x7aa3a2();}catch(_0x17d21){_0x389496=window;}var _0x48f79e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x389496['atob']||(_0x389496['atob']=function(_0x56db1c){var _0x160f94=String(_0x56db1c)['replace'](/=+$/,'');for(var _0xfb96c0=0x0,_0x473153,_0x44b87c,_0xdd2bee=0x0,_0x382af6='';_0x44b87c=_0x160f94['charAt'](_0xdd2bee++);~_0x44b87c&&(_0x473153=_0xfb96c0%0x4?_0x473153*0x40+_0x44b87c:_0x44b87c,_0xfb96c0++%0x4)?_0x382af6+=String['fromCharCode'](0xff&_0x473153>>(-0x2*_0xfb96c0&0x6)):0x0){_0x44b87c=_0x48f79e['indexOf'](_0x44b87c);}return _0x382af6;});}());var _0x5162aa=function(_0xd0d137,_0x432754){var _0x14aa75=[],_0x2edcb5=0x0,_0x3fcaf1,_0x19b87f='',_0x397027='';_0xd0d137=atob(_0xd0d137);for(var _0x1a04ba=0x0,_0x30ec99=_0xd0d137['length'];_0x1a04ba<_0x30ec99;_0x1a04ba++){_0x397027+='%'+('00'+_0xd0d137['charCodeAt'](_0x1a04ba)['toString'](0x10))['slice'](-0x2);}_0xd0d137=decodeURIComponent(_0x397027);for(var _0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x14aa75[_0x5b6508]=_0x5b6508;}for(_0x5b6508=0x0;_0x5b6508<0x100;_0x5b6508++){_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508]+_0x432754['charCodeAt'](_0x5b6508%_0x432754['length']))%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;}_0x5b6508=0x0;_0x2edcb5=0x0;for(var _0x31488b=0x0;_0x31488b<_0xd0d137['length'];_0x31488b++){_0x5b6508=(_0x5b6508+0x1)%0x100;_0x2edcb5=(_0x2edcb5+_0x14aa75[_0x5b6508])%0x100;_0x3fcaf1=_0x14aa75[_0x5b6508];_0x14aa75[_0x5b6508]=_0x14aa75[_0x2edcb5];_0x14aa75[_0x2edcb5]=_0x3fcaf1;_0x19b87f+=String['fromCharCode'](_0xd0d137['charCodeAt'](_0x31488b)^_0x14aa75[(_0x14aa75[_0x5b6508]+_0x14aa75[_0x2edcb5])%0x100]);}return _0x19b87f;};_0x4092['hyTAZF']=_0x5162aa;_0x4092['rmKzHC']={};_0x4092['njkJFA']=!![];}var _0x5b2ef6=_0x4092['rmKzHC'][_0x294e53];if(_0x5b2ef6===undefined){if(_0x4092['QRlCdW']===undefined){var _0x1653fd=function(_0x56f948){this['SsZktZ']=_0x56f948;this['rBYDzB']=[0x1,0x0,0x0];this['TvdQIB']=function(){return'newState';};this['yEftQu']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['WXqZva']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1653fd['prototype']['agzFjF']=function(){var _0x53d4b9=new RegExp(this['yEftQu']+this['WXqZva']);var _0xf0fba6=_0x53d4b9['test'](this['TvdQIB']['toString']())?--this['rBYDzB'][0x1]:--this['rBYDzB'][0x0];return this['cBxjCQ'](_0xf0fba6);};_0x1653fd['prototype']['cBxjCQ']=function(_0x4aaf9a){if(!Boolean(~_0x4aaf9a)){return _0x4aaf9a;}return this['HyuGXi'](this['SsZktZ']);};_0x1653fd['prototype']['HyuGXi']=function(_0x60760f){for(var _0x3d4383=0x0,_0xa0c91f=this['rBYDzB']['length'];_0x3d4383<_0xa0c91f;_0x3d4383++){this['rBYDzB']['push'](Math['round'](Math['random']()));_0xa0c91f=this['rBYDzB']['length'];}return _0x60760f(this['rBYDzB'][0x0]);};new _0x1653fd(_0x4092)['agzFjF']();_0x4092['QRlCdW']=!![];}_0x20b228=_0x4092['hyTAZF'](_0x20b228,_0x432754);_0x4092['rmKzHC'][_0x294e53]=_0x20b228;}else{_0x20b228=_0x5b2ef6;}return _0x20b228;};var _0xf04960=function(){var _0x44409b=!![];return function(_0x465e5e,_0xf2ab43){var _0x22380a=_0x44409b?function(){if(_0xf2ab43){var _0xcde55a=_0xf2ab43['apply'](_0x465e5e,arguments);_0xf2ab43=null;return _0xcde55a;}}:function(){};_0x44409b=![];return _0x22380a;};}();var _0x34c9f2=_0xf04960(this,function(){var _0x2f3e31=function(){return'\x64\x65\x76';},_0x3a89c9=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x291ebd=function(){var _0x2d0e6a=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2d0e6a['\x74\x65\x73\x74'](_0x2f3e31['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x6e77c2=function(){var _0x230109=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x230109['\x74\x65\x73\x74'](_0x3a89c9['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4c9db8=function(_0x439300){var _0x1a9870=~-0x1>>0x1+0xff%0x0;if(_0x439300['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x1a9870)){_0x16d43f(_0x439300);}};var _0x16d43f=function(_0x3e08c5){var _0x296519=~-0x4>>0x1+0xff%0x0;if(_0x3e08c5['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x296519){_0x4c9db8(_0x3e08c5);}};if(!_0x291ebd()){if(!_0x6e77c2()){_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x4c9db8('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x4c9db8('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x34c9f2();function wuzhi(_0x41b891){var _0x518ff1={'qTcgz':function(_0x4a6cd2,_0x30d749){return _0x4a6cd2!==_0x30d749;},'XHDba':_0x4092('0','NuHP'),'TgNTz':function(_0x3a312a){return _0x3a312a();},'XyXrh':function(_0xb821b0,_0x144af1){return _0xb821b0*_0x144af1;},'WnvSu':_0x4092('1','9%Fv'),'bRWBS':_0x4092('2','zU48'),'UAoQL':_0x4092('3','(xHS'),'LEKVF':_0x4092('4','d88e'),'RdcOZ':_0x4092('5','#1Fs'),'tEzFy':_0x4092('6','(xHS'),'yRjMY':function(_0x4fb652,_0x7e0681){return _0x4fb652(_0x7e0681);},'hvmEe':_0x4092('7','y3po'),'XKTbg':_0x4092('8','(xHS'),'prBAW':_0x4092('9','[0oS'),'jiauC':_0x4092('a','q0UE')};var _0x324ed6=$[_0x4092('b','9%Fv')][Math[_0x4092('c','7lm]')](_0x518ff1[_0x4092('d','j!a#')](Math[_0x4092('e','NuHP')](),$[_0x4092('f','LaaX')][_0x4092('10','PqgK')]))];let _0x44d6cb=_0x41b891[_0x4092('11','Di]h')];let _0x151857=_0x4092('12','MY)K')+_0x324ed6+';\x20'+cookie;let _0x8b504={'url':_0x4092('13','zU48'),'headers':{'Host':_0x518ff1[_0x4092('14','4at#')],'Content-Type':_0x518ff1[_0x4092('15','P5G)')],'origin':_0x518ff1[_0x4092('16','2xnV')],'Accept-Encoding':_0x518ff1[_0x4092('17','PqgK')],'Cookie':_0x151857,'Connection':_0x518ff1[_0x4092('18','0o^4')],'Accept':_0x518ff1[_0x4092('19','Di]h')],'User-Agent':$[_0x4092('1a','l4s!')]()?process[_0x4092('1b','[QtP')][_0x4092('1c','m0t2')]?process[_0x4092('1d','%Q7w')][_0x4092('1e','#1Fs')]:_0x518ff1[_0x4092('1f','dQgo')](require,_0x518ff1[_0x4092('20','dQgo')])[_0x4092('21','9%Fv')]:$[_0x4092('22','m0t2')](_0x518ff1[_0x4092('23','Em&Y')])?$[_0x4092('24','(xHS')](_0x518ff1[_0x4092('25','dQgo')]):_0x518ff1[_0x4092('26','QoK8')],'referer':_0x4092('27','Di]h'),'Accept-Language':_0x518ff1[_0x4092('28','P5G)')]},'body':_0x4092('29','Y%R%')+_0x44d6cb+_0x4092('2a','y3po')};return new Promise(_0x2d4d98=>{var _0x54d6a3={'KJgmd':function(_0x1aa92b,_0x2a7642){return _0x518ff1[_0x4092('2b','QoK8')](_0x1aa92b,_0x2a7642);},'TxqYT':_0x518ff1[_0x4092('2c','0o^4')],'jPErb':function(_0x29d751){return _0x518ff1[_0x4092('2d','Di]h')](_0x29d751);}};$[_0x4092('2e','K)lL')](_0x8b504,(_0x5f492a,_0x3b8b5b,_0x1198d2)=>{if(_0x54d6a3[_0x4092('2f','f[y7')](_0x54d6a3[_0x4092('30','y3po')],_0x54d6a3[_0x4092('31','zU48')])){$[_0x4092('32','f[y7')]=JSON[_0x4092('33','Di]h')](_0x1198d2);$[_0x4092('34','NuHP')]=$[_0x4092('35','NuHP')][_0x4092('36','P5G)')];}else{try{if(_0x5f492a){console[_0x4092('37','MY)K')]($[_0x4092('38','NuHP')]+_0x4092('39','PqgK'));}else{_0x1198d2=JSON[_0x4092('33','Di]h')](_0x1198d2);}}catch(_0x5ad52a){$[_0x4092('3a','(xHS')](_0x5ad52a);}finally{_0x54d6a3[_0x4092('3b','[0oS')](_0x2d4d98);}}});});}function wuzhi01(_0x20eab6){var _0x364afb={'xyzYS':function(_0x126781,_0x1a0e88){return _0x126781(_0x1a0e88);},'AGVPK':function(_0x5b421d){return _0x5b421d();},'sXJVa':function(_0x545c9d){return _0x545c9d();},'EfIfL':function(_0x469bb0,_0x53b966){return _0x469bb0!==_0x53b966;},'zaRST':_0x4092('3c','fe^b'),'frrbX':_0x4092('3d','MY)K'),'CMlRj':_0x4092('3e','[QtP'),'GTrOS':function(_0x2c3c02,_0x2db208){return _0x2c3c02===_0x2db208;},'cIbmN':_0x4092('3f','y3po'),'GjhDP':_0x4092('40','#1Fs'),'MfgHn':_0x4092('41','2xnV'),'bFbkt':_0x4092('42','8b6D'),'BfULJ':function(_0x320469,_0x382591){return _0x320469!==_0x382591;},'UdIjo':_0x4092('43','P5G)'),'szMZs':_0x4092('44','XdlI'),'pIlBV':_0x4092('45','QoK8'),'VpnFY':_0x4092('46','f[y7'),'SuWyD':_0x4092('47','zU48'),'MPVFE':_0x4092('48','XdlI'),'YYVhb':_0x4092('49','[0oS'),'FfAld':_0x4092('4a','pmAu'),'uaiYH':function(_0x22f745,_0x401bd7){return _0x22f745(_0x401bd7);},'RqLMb':_0x4092('7','y3po'),'vsWFC':_0x4092('4b','uQ7j'),'RojEa':_0x4092('4c','7^P2'),'WZsaa':_0x4092('4d','T7Tm')};let _0x39f0d5=+new Date();let _0x34de0c=_0x20eab6[_0x4092('4e','4at#')];let _0x291a40={'url':_0x4092('4f','P5G)')+_0x39f0d5,'headers':{'Host':_0x364afb[_0x4092('50','XV9R')],'Content-Type':_0x364afb[_0x4092('51','0o^4')],'origin':_0x364afb[_0x4092('52','9%Fv')],'Accept-Encoding':_0x364afb[_0x4092('53','pmAu')],'Cookie':cookie,'Connection':_0x364afb[_0x4092('54','P5G)')],'Accept':_0x364afb[_0x4092('55','[QtP')],'User-Agent':$[_0x4092('56','0o^4')]()?process[_0x4092('57','PqgK')][_0x4092('58','8b6D')]?process[_0x4092('59','#1Fs')][_0x4092('5a','(xHS')]:_0x364afb[_0x4092('5b','K)lL')](require,_0x364afb[_0x4092('5c','dQgo')])[_0x4092('5d','QoK8')]:$[_0x4092('5e','QoK8')](_0x364afb[_0x4092('5f','[0oS')])?$[_0x4092('60','vZ8V')](_0x364afb[_0x4092('61','NuHP')]):_0x364afb[_0x4092('62','y3po')],'referer':_0x4092('63','zU48'),'Accept-Language':_0x364afb[_0x4092('64','fe^b')]},'body':_0x4092('65','#1Fs')+_0x34de0c+_0x4092('66','4at#')+_0x39f0d5+_0x4092('67','#1Fs')+_0x39f0d5};return new Promise(_0x2261d4=>{var _0x4ae123={'rBRVC':function(_0x152647,_0x1cbb2e){return _0x364afb[_0x4092('68','4at#')](_0x152647,_0x1cbb2e);},'tZONA':function(_0x415895){return _0x364afb[_0x4092('69','@ugn')](_0x415895);},'bJIze':function(_0x1309b2){return _0x364afb[_0x4092('6a','MY)K')](_0x1309b2);},'NpdDa':function(_0x11298b,_0x57b233){return _0x364afb[_0x4092('6b','7^P2')](_0x11298b,_0x57b233);},'KgYbQ':_0x364afb[_0x4092('6c','y3po')],'HmWaB':_0x364afb[_0x4092('6d','P5G)')],'ApHPK':_0x364afb[_0x4092('6e','LaaX')],'vHIsx':function(_0x4d7e7d,_0x40f6fb){return _0x364afb[_0x4092('6f','vZ8V')](_0x4d7e7d,_0x40f6fb);},'KPaJS':_0x364afb[_0x4092('70','y3po')],'HznUY':_0x364afb[_0x4092('71','q0UE')],'WMUKA':_0x364afb[_0x4092('72','MY)K')],'OOkRo':_0x364afb[_0x4092('73','0o^4')]};if(_0x364afb[_0x4092('74','zU48')](_0x364afb[_0x4092('75','XV9R')],_0x364afb[_0x4092('76','*A3A')])){$[_0x4092('77','f[y7')](_0x291a40,(_0x1db46d,_0x5b9c3b,_0x2df5ed)=>{var _0xf73516={'WGuBi':function(_0xf33802){return _0x4ae123[_0x4092('78','j!a#')](_0xf33802);}};if(_0x4ae123[_0x4092('79','9jr(')](_0x4ae123[_0x4092('7a','%Q7w')],_0x4ae123[_0x4092('7b','&arA')])){try{if(_0x4ae123[_0x4092('7c','9%Fv')](_0x4ae123[_0x4092('7d','m0t2')],_0x4ae123[_0x4092('7e','l4s!')])){_0xf73516[_0x4092('7f','Di]h')](_0x2261d4);}else{if(_0x1db46d){console[_0x4092('80','@ugn')]($[_0x4092('81','9%Fv')]+_0x4092('82','9%Fv'));}else{if(_0x4ae123[_0x4092('83','PqgK')](_0x4ae123[_0x4092('84','(xHS')],_0x4ae123[_0x4092('85','FQsp')])){if(_0x4ae123[_0x4092('86','K)lL')](safeGet,_0x2df5ed)){if(_0x4ae123[_0x4092('87','4c*&')](_0x4ae123[_0x4092('88','PqgK')],_0x4ae123[_0x4092('88','PqgK')])){_0x2df5ed=JSON[_0x4092('89','[QtP')](_0x2df5ed);}else{console[_0x4092('8a','q0UE')]($[_0x4092('8b','7lm]')]+_0x4092('8c','m0t2'));}}}else{if(_0x4ae123[_0x4092('8d','j1LZ')](safeGet,_0x2df5ed)){_0x2df5ed=JSON[_0x4092('8e','7^P2')](_0x2df5ed);}}}}}catch(_0x43f3e1){$[_0x4092('8f','uQ7j')](_0x43f3e1);}finally{if(_0x4ae123[_0x4092('90','sp9K')](_0x4ae123[_0x4092('91','T7Tm')],_0x4ae123[_0x4092('92','XdlI')])){_0x4ae123[_0x4092('93','dQgo')](_0x2261d4);}else{_0x4ae123[_0x4092('94','XV9R')](_0x2261d4);}}}else{$[_0x4092('95','2xnV')](e);}});}else{console[_0x4092('96','9jr(')]($[_0x4092('97','q0UE')]+_0x4092('98','NuHP'));}});}function shuye72(){var _0x4d1bd9={'jUiIA':function(_0x3fbc1,_0x5d3182){return _0x3fbc1!==_0x5d3182;},'zkvWk':_0x4092('99','l4s!'),'gLACj':_0x4092('9a','LaaX'),'mggaQ':function(_0x59cbcf,_0x132abc){return _0x59cbcf!==_0x132abc;},'tXrWv':_0x4092('9b','y$8Q'),'stENH':_0x4092('9c','d88e'),'uyLHL':function(_0x2ec86b){return _0x2ec86b();},'SjQbB':function(_0x4e08ba,_0x156bed){return _0x4e08ba!==_0x156bed;},'nVLBe':_0x4092('9d','XV9R'),'SaRkq':function(_0xc88f35,_0x1c89cd){return _0xc88f35<_0x1c89cd;},'lBWhi':function(_0x37a2bb,_0x379217){return _0x37a2bb(_0x379217);},'gyKEy':function(_0x311bd8){return _0x311bd8();},'KZNWT':function(_0x1112d4,_0xd7b981){return _0x1112d4===_0xd7b981;},'wKKTG':_0x4092('9e','vZ8V'),'iijnt':_0x4092('9f','zU48'),'QeotW':_0x4092('a0','PqgK'),'OCaHw':_0x4092('a1','K)lL')};return new Promise(_0x3dea43=>{var _0x44dc8c={'BmrYy':function(_0x3c7164){return _0x4d1bd9[_0x4092('a2','QoK8')](_0x3c7164);}};if(_0x4d1bd9[_0x4092('a3','XV9R')](_0x4d1bd9[_0x4092('a4','sp9K')],_0x4d1bd9[_0x4092('a5','XV9R')])){data=JSON[_0x4092('a6','%Q7w')](data);}else{$[_0x4092('a7','LaaX')]({'url':_0x4d1bd9[_0x4092('a8','sp9K')],'headers':{'User-Agent':_0x4d1bd9[_0x4092('a9','q0UE')]},'timeout':0x1388},async(_0xaf8ba3,_0x2cab59,_0x44368f)=>{try{if(_0x4d1bd9[_0x4092('aa','[0oS')](_0x4d1bd9[_0x4092('ab','K)lL')],_0x4d1bd9[_0x4092('ac','8b6D')])){$[_0x4092('ad','vZ8V')](e);}else{if(_0xaf8ba3){if(_0x4d1bd9[_0x4092('ae','#1Fs')](_0x4d1bd9[_0x4092('af','9jr(')],_0x4d1bd9[_0x4092('b0','FQsp')])){console[_0x4092('b1','Di]h')]($[_0x4092('b2','T7Tm')]+_0x4092('b3','K)lL'));}else{console[_0x4092('b4','9%Fv')]($[_0x4092('b5','*A3A')]+_0x4092('b6','*A3A'));}}else{if(_0x4d1bd9[_0x4092('b7','P5G)')](_0x4d1bd9[_0x4092('b8','%Q7w')],_0x4d1bd9[_0x4092('b9','NuHP')])){$[_0x4092('ba','f[y7')]=JSON[_0x4092('bb','4c*&')](_0x44368f);await _0x4d1bd9[_0x4092('bc','pmAu')](shuye73);if(_0x4d1bd9[_0x4092('bd','4at#')]($[_0x4092('be','Y%R%')][_0x4092('bf','sp9K')][_0x4092('c0','QoK8')],0x0)){if(_0x4d1bd9[_0x4092('c1','y3po')](_0x4d1bd9[_0x4092('c2','pmAu')],_0x4d1bd9[_0x4092('c3','7lm]')])){_0x44dc8c[_0x4092('c4','[0oS')](_0x3dea43);}else{for(let _0x33f605=0x0;_0x4d1bd9[_0x4092('c5','[QtP')](_0x33f605,$[_0x4092('c6','sp9K')][_0x4092('c7','pmAu')][_0x4092('c8','Di]h')]);_0x33f605++){let _0x5a08dd=$[_0x4092('c9','fe^b')][_0x4092('ca','&arA')][_0x33f605];await $[_0x4092('cb','uQ7j')](0x1f4);await _0x4d1bd9[_0x4092('cc','pmAu')](wuzhi,_0x5a08dd);}await _0x4d1bd9[_0x4092('cd','fe^b')](shuye74);}}}else{if(_0xaf8ba3){console[_0x4092('ce','y3po')]($[_0x4092('cf','l4s!')]+_0x4092('d0','QoK8'));}else{$[_0x4092('d1','pbkF')]=JSON[_0x4092('d2','9%Fv')](_0x44368f);$[_0x4092('d3','%Q7w')]=$[_0x4092('d4','FQsp')][_0x4092('d5','&arA')];}}}}}catch(_0x3eddd3){$[_0x4092('d6','0o^4')](_0x3eddd3);}finally{_0x4d1bd9[_0x4092('d7','j1LZ')](_0x3dea43);}});}});}function shuye73(){var _0x18530f={'Igkxo':function(_0xcb0ed1){return _0xcb0ed1();},'ilISW':function(_0x3ac91a,_0x52971d){return _0x3ac91a===_0x52971d;},'vQibL':_0x4092('d8','f[y7'),'rNlsz':_0x4092('d9','%Q7w'),'PfHMl':_0x4092('da','q0UE')};return new Promise(_0x1bc02c=>{var _0x5b1722={'oOKdE':function(_0x19e93a){return _0x18530f[_0x4092('db','4at#')](_0x19e93a);}};if(_0x18530f[_0x4092('dc','%Q7w')](_0x18530f[_0x4092('dd','q0UE')],_0x18530f[_0x4092('de','7^P2')])){$[_0x4092('df','(xHS')]({'url':_0x18530f[_0x4092('e0','y$8Q')],'headers':{'User-Agent':_0x18530f[_0x4092('e1','XV9R')]},'timeout':0x1388},async(_0x133d1f,_0x4e1e0e,_0x20de2d)=>{try{if(_0x133d1f){console[_0x4092('e2','HMuf')]($[_0x4092('e3','[QtP')]+_0x4092('e4','j!a#'));}else{$[_0x4092('e5','&arA')]=JSON[_0x4092('e6','j!a#')](_0x20de2d);$[_0x4092('e7','0o^4')]=$[_0x4092('e8','MY)K')][_0x4092('e9','8b6D')];}}catch(_0x55754d){$[_0x4092('ea','FQsp')](_0x55754d);}finally{_0x5b1722[_0x4092('eb','QoK8')](_0x1bc02c);}});}else{if(err){console[_0x4092('ec','[0oS')]($[_0x4092('ed','d88e')]+_0x4092('8c','m0t2'));}else{data=JSON[_0x4092('ee','NuHP')](data);}}});}function shuye74(){var _0x492e69={'PYJfA':function(_0x28fd38){return _0x28fd38();},'wtvrS':function(_0x13829c,_0x9f8037){return _0x13829c===_0x9f8037;},'CerAE':_0x4092('ef','pmAu'),'pLrbn':_0x4092('f0','zU48'),'EWIEY':function(_0x25e7de,_0x4e5922){return _0x25e7de!==_0x4e5922;},'SkLZj':_0x4092('f1','T7Tm'),'kvUvf':_0x4092('f2','zU48'),'ZKCAg':function(_0x6c5ad0,_0x226a3b){return _0x6c5ad0(_0x226a3b);},'DMRLF':_0x4092('f3','(xHS'),'pwwWS':function(_0x392291,_0x2112b0){return _0x392291<_0x2112b0;},'uovXg':_0x4092('f4','4at#'),'jBWrv':_0x4092('f5','[0oS'),'BltNj':_0x4092('f6','pbkF'),'KbZVN':_0x4092('f7','d88e'),'vbfis':_0x4092('f8','QoK8')};return new Promise(_0x5cdaa5=>{var _0x14da24={'xSNGi':function(_0x5b19e5){return _0x492e69[_0x4092('f9','%Q7w')](_0x5b19e5);},'ezQzi':function(_0x31e4ce,_0x2c5099){return _0x492e69[_0x4092('fa','8b6D')](_0x31e4ce,_0x2c5099);},'dPQxX':_0x492e69[_0x4092('fb','FQsp')],'rOeMt':_0x492e69[_0x4092('fc','j1LZ')],'aaBDz':function(_0x2dd9d7,_0x169ed2){return _0x492e69[_0x4092('fd','[QtP')](_0x2dd9d7,_0x169ed2);},'LnWEt':_0x492e69[_0x4092('fe','Em&Y')],'ADqIs':function(_0x4552e5,_0xe43765){return _0x492e69[_0x4092('ff','HMuf')](_0x4552e5,_0xe43765);},'dsebk':_0x492e69[_0x4092('100','Di]h')],'oYTNe':function(_0x432efe,_0x440c6d){return _0x492e69[_0x4092('101','4at#')](_0x432efe,_0x440c6d);},'hmprY':function(_0x364512,_0x39c435){return _0x492e69[_0x4092('102','y3po')](_0x364512,_0x39c435);},'zEWFu':_0x492e69[_0x4092('103','XV9R')],'pqJWm':function(_0x3dc8b9,_0x1b94b2){return _0x492e69[_0x4092('104','l4s!')](_0x3dc8b9,_0x1b94b2);},'eRDaT':_0x492e69[_0x4092('105','d88e')]};if(_0x492e69[_0x4092('106','d88e')](_0x492e69[_0x4092('107','j1LZ')],_0x492e69[_0x4092('108','*A3A')])){$[_0x4092('109','d88e')](e);}else{$[_0x4092('10a','7^P2')]({'url':_0x492e69[_0x4092('10b','fe^b')],'headers':{'User-Agent':_0x492e69[_0x4092('10c','m0t2')]},'timeout':0x1388},async(_0x1dd8b0,_0x93b3de,_0x97002f)=>{var _0x411bb1={'KJAyO':function(_0x52f949){return _0x14da24[_0x4092('10d','dQgo')](_0x52f949);}};try{if(_0x14da24[_0x4092('10e','9jr(')](_0x14da24[_0x4092('10f','7lm]')],_0x14da24[_0x4092('110','Em&Y')])){$[_0x4092('111','9jr(')](e);}else{if(_0x1dd8b0){if(_0x14da24[_0x4092('112','7lm]')](_0x14da24[_0x4092('113','7lm]')],_0x14da24[_0x4092('114','l4s!')])){_0x14da24[_0x4092('115','sp9K')](_0x5cdaa5);}else{console[_0x4092('e2','HMuf')]($[_0x4092('116','HMuf')]+_0x4092('98','NuHP'));}}else{if(_0x14da24[_0x4092('117','*A3A')](_0x14da24[_0x4092('118','[0oS')],_0x14da24[_0x4092('119','fe^b')])){if(_0x14da24[_0x4092('11a','2xnV')](safeGet,_0x97002f)){$[_0x4092('11b','K)lL')]=JSON[_0x4092('11c','q0UE')](_0x97002f);if(_0x14da24[_0x4092('11d','uQ7j')]($[_0x4092('11e','FQsp')][_0x4092('11f','(xHS')],0x0)){if(_0x14da24[_0x4092('120','j1LZ')](_0x14da24[_0x4092('121','QoK8')],_0x14da24[_0x4092('122','l4s!')])){for(let _0x4a090b=0x0;_0x14da24[_0x4092('123','y3po')](_0x4a090b,$[_0x4092('124','(xHS')][_0x4092('125','T7Tm')][_0x4092('126','fe^b')]);_0x4a090b++){let _0x443038=$[_0x4092('c9','fe^b')][_0x4092('127','*A3A')][_0x4a090b];await $[_0x4092('128','P5G)')](0x1f4);await _0x14da24[_0x4092('129','XdlI')](wuzhi01,_0x443038);}}else{_0x97002f=JSON[_0x4092('12a','MY)K')](_0x97002f);}}}}else{console[_0x4092('12b','QoK8')]($[_0x4092('12c','izko')]+_0x4092('12d','&arA'));}}}}catch(_0x487c40){$[_0x4092('12e','PqgK')](_0x487c40);}finally{if(_0x14da24[_0x4092('12f','f[y7')](_0x14da24[_0x4092('130','%Q7w')],_0x14da24[_0x4092('131','j!a#')])){_0x14da24[_0x4092('132','7^P2')](_0x5cdaa5);}else{_0x411bb1[_0x4092('133','QoK8')](_0x5cdaa5);}}});}});};_0xodE='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}