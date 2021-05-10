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
var _0xod0='jsjiami.com.v6',_0x550c=[_0xod0,'KBzCrMOAwrY=','dmw+W8Ki','IsOGICjDrMONf8KYA28=','wo3Du8Klw4fDm8KxWg==','wrXCow/CrUQ=','FcKpaz/DjCvDsg==','dkw8ZsKC','A8OSDznDkQ==','DMKvF1kFKMKSMsKpBsKKw5PCosKdwpdvByVbwqXCqWjCmcKNZzgHScKqw53DjcKsG8OVw5NXPcO7wqfDtg5Fw7TDtV1zw6bCnXHDoUxKw5/DsMOEAjh6w6FzUsOSQ8OXI8Ojw6PDgj3Cv8OHaMOTw6vDjXtrJnlCRyQsTsKxdETCrsK+','w4bDoMKACzY=','w7HDocORwoHDpiR0EAYQTjjDoW16w5XCqMKHRsKpWD1cw6VsZhlkw4QTwpVtBcOnUsODYQB6wrXDu8K2RDY=','EHbCtAxTwooMfkltasK+N8KnPcK+wqhuw44Tw4jDg8K9LSHCnsK2w4QjwrdHwptXL8OKW8Omw45wwqjDqSgJwqo3RQHDhzZYMxgEw4rDncKaaHl8bQ0tw5klOMOEWcKJNmhvw4slw4/DkVvDkMO0WT8DwqzClQXDl8KL','UUNVXg==','w7zDu34=','woTDv8K8w4Y=','w45oSwTorrDmspjlprrot5Dvv7vorp3mo5Tmn5Hnv7botpHphKnor64=','w4PDumPDlMOS','wpkrw5oBw4TDvQ==','w5nCsMO8DcKR','wrAuw5c0RQ==','wrbCnw7DrAc=','NwXDsQU3ZQ==','wp7DuMKmw7nDrw==','w5IrDsKZwqU=','w4XCgMOTIcKX','w5JFw7/CgsKKwrt9csKTwrA5Dw==','wrVtLlkTJsKYw7vCpSXCrznDi8OTwrkHSMKuU8KrJcKwAMOKaMKGw4VAwr/CqMOsw57Dhg==','wpYRAsOow6/CsMKtGsKSScKTw63Dt8Orw7Znw6Y4w5A1w4nCnUHCpDHDvDdCwowkwooTw7HDqcKY','ASrCnMOBw5kGwqQPMsKKw5TDgMKOwq4BBD0=','wp4hw5g0wpvDrg5hwrgw','OhrDpiwsdMKyVi9bw7LDl1fCrMOkw53DjcKyJMOYw47DucKUAl4EdMOnwpcvwoPCjFs=','w7oyC2Y/F8Kmw47Ciw/Cj0LDoA==','f8KpI8KF','WsOQw7rDnsOkw7pVBFoQDsKjT8OFwrnClloLZMKXw48+wrzDvTrDlMKPOgbDuMKJw4/Dk3YjWcOkwrtiMcKzbcK9wpcgakxxwr5tw5R8c8KrMMOGdB8XS8KdGcKkLB06QMKRwrEOQlc1w7DCqzzCmQ==','w6w+ZWfDkQ==','w47Di8KhJgZ/YMOS','woZdbz00w6DCpMOawpYafRrDilDCjl8dw4Fiw6otKsKRCcOn','w6IpMMKkwqI=','wrPDpsK8w7fDog==','fwrCkcK3VQ==','w5DDm8OewrvDoQ==','QsOEQSrCuA==','ViYwTns=','w6wmC8K5w5HDuw==','w5vDhMK0','a2h5fyjDv8KkDSo0wrzDgsKo','wrvCqcOt','wpTCncKKfnrCusKPSsOHNy4pDA==','wog2MsOBw64=','EsKUEFsD','J8KfWgnDsh7DlMKEw6Ae','XMOvTy/CkVzDkQ==','w55iw7HDncKE','CMOHNFJkw5XDmQ==','wr/DhcO9TmY=','wrnDpcKMMcOT','wrHCnRXCuFMPw5dwwoLDoMOowrciwptgwq/Ch8Opwothw7kzGmbDi8OJwrbCtsKyw7FXJsOke8OhPcK6ccK3wqACJsKcw6zCi1vCmcODGBUgw6Aqwo3CpsKCw5vCgcKyIMOuw6VHag/DuVvDqULDtEVGwolzcznDscODwqRxwqATQcK1wpnCiCvChMKkw4sDw5PDmcK0dcKGwr7CtnRewo/Ck8KI','wqfDv8KqDcOl','B8K3CkwYZsKAcMKkVMOFw4rDvsKYwp1nByZfw6/CpX3CrcKNeQ8HX8OrwqfCt8OIfMKqwqA+EsOVwoHDgjVvw4fDp2VLw4fDph3CqxZIwrLDr8OXN2gXw5Y+X8OzJsKyLcOMw5fDmQrCpsKRF8K/w4jCpEZFMjNHFGY5V8O4eXPCr8K7wpoMwqM6w6LDjsKVVcK6OnnCgMOOw7fCucO8IMObw7HDjsOKZkjDpAPCvcKPX8K8w5Muw47Du33DsGDDjRFGcnHDnTF/UMOWZMOQdAfDpi3DnVBrw73CpcOfOFIswo5ZGMK7wobCqHtoT2twwq0nwppRw440w7B4w6/Dq8OxZ2cHwqDCr0bCv8Oyw4tBEMO3w79mfSTDsWk=','w5dowp8lw5XDuytsw6xvIiXDnMK9w6TDvMKxLMKyCsKYwqlmwqjCvsK4Knsow4nDuQrDjRgoesOCMWh4w4ocGMO7wrDCpWLDusOYwqzCi1YRwqXCm8KIw54Iwq5NZcKpwpnDszsaIVXDj8OPwrPDpSl3wr87CcKWfsKFw6grIQTDonLDlsK4HcOcw57Dh8Ofw6PDgMKPw7x9a8OzdA==','E8KyAsO5','wqsJE8OVw58=','CxcEQAU=','wofCssKlREQ=','X1AoVA==','w5LDhcKl','w7nDtcOSwoc=','w7RcDnzoro3msIflp4jotqrvv4Dorr3moIHmn7Pnv6LotJHphIPorqU=','w7HCvMOxOsKK','w7LCj8KFWcKc','dUJXRiM=','fMOfw7PDmcOY','FwHDvjcJ','XjXDsQ==','w77DtXTDtA==','cj0kZuiun+awjuWmt+i1pu+8teislOajtuadlue/nOi3t+mFkeitqw==','NMKILk48','YcK1KnxbKA==','w5XCisKkP1I=','w5jDv1HDuHY=','w44DAnzDjA==','wqdAcD4g','wrnDhcKdL8OFF8OZw4zCjRTDkcKRasO3w6PDoMK/woTDiyLDtMOJUU/DscOSasKPAMOrwqVQwoFrwoDCvsKmSELCg8OUEcOcwofDvzLCrmbCrMOuw7vDlAM5w4QYCCfDgmTCkWw=','wrPCqTzDtBzDgl4LwpMuw6fCjcKMaMOlw4LCt8K/csO0YBDDj30Twr12fcKFGsKsDcKFw7rCp3XCvhfDokZTWDFdES1IwqLCjAc5YV45bMOgTMOMwozDn8Obw5DDoibCmX/CpcOZaDXDv8Ovb0rCrcKTwrrDgSR/wolUMB4bBcOPCw/DsQRxw450wrQxw5hVwrs8E8OSw4bCuzbDgcKhXMOiwofCv3Yiwr/Dq8KBw6nCrMKPJlVZWsKtwoDDlwpdd8OfQsKWw63ChgrDm8O3cRYyIcOWbMKKw4R2wrvDgsKWw4N8wr07wpcCQA==','HMK4Ekwb','UsKIAg==','w5ISAcKswos=','TTIua2k=','wrjDmsOjXUo=','w6zDtcOqw44K','O1t1VTU=','wp8Mw4Qmw7k=','Q8Ocby7CiA==','w64AHGHDhw==','w5/DtHbDosOFwqE=','aD/CuQ==','NQvDuyU=','ATYQbeivueayl+Wknui1v++8meivkOagqOacmee+mui0mOmEi+iuuw==','GcKOfsOoazod','w4fCnMKRFm8=','WDwFVkI=','wqd7NsKZwqM=','YSzCrsKCaMKNRQ==','ZwUlQQ==','w7ozJmPDi0c=','VTzCgsKOVw==','w4cyAcKcwqrDgsKq','HRjDsyU=','HsKpcTzDmTc=','w71Cwo91Zj5l','wp/CmwTCrQ==','VsOgw6jCnw==','w73DkcOaw4MG','DTDDhyUs','QMK1EsKTIA==','w7AeF8KNwrU=','AGzCo0F2','wpIKEcOdw67DuA==','JkF6','AcODLVM=','w77CmMKFYuivnuayveWnrOi0sO++iuiuh+aiq+aegue8iei1uOmGtOittg==','d3Z3TxI=','w5nDgcKNNTQ=','CMORMExi','dQTCqG1K','QznCrF1k','w7PChsK4QcKh','OsK9QMOsdQ==','worCvsOaw6tV','JG9fWzk=','SVhSWgjCgMOZfQgXwpfCosKWM8OwwprChsKQbMOyLB3DnSHCiz1swrvDkycifMOVUErDo8OlwoALRQTDsMKDeRF5MWvDjDZUHsO5wr/CqQVkw6nCncOkcgDCisKR','YlAhScKgw7RIwpDCucOTGQhDw67DksKqe8Kywoppw6/CmXPDncKOw7A7DMObwpZSTlfDpVtZw7lyw4ZXwpFGw6vDgg3ChkDDrRhXwoleYXLDjMKUw57Dug/CmsOPwpoVDTLCusOywq49cCg0wqTCjUY7wp0awpDDtWTDuHbDlk/DqMOlw7fCiwsoHMONw6geEcOIZQnChTl8wpHChMK0w5XCjhfDkjLCkMKtwrkLwr/CkRHDvsO0IMOvwplFBCtPw73Ds8ORUnFtwpgKTcKdf8O+w64IWcOrwoVFwpUfw5hLw6VRE8K2wq9HwqY6','w7ZXwq5WQw==','FAfCrMOiwpw=','XWgCc8Kl','wpIhw4k=','w4PCncK2Z8KM','ZGowasK+','J8KCZ8OlSg==','QkwRVcKo','Dy3DuScx','w5rCrRQTw6I=','wo7CsMKUU1k=','KAfDmwEG','GcO0CB8=','T8OjEH/or7Lms6Plponotbzvv6zorKnmo73mnrPnv7Dotozph6norr8=','YcKvIcK3GQ==','w5nCpyM0w7w=','w5MaHcKFwps=','w7vDu8OY','PwvDoiECcsKnEw==','dSzCqMKQSg==','FsO5CRnDhsOlXA==','S14vQcKLw71dwo4=','wr3CrMK8Tw==','w4cyAcKcwqrDgsKqw6I=','w5nCpcOJM8KD','bMK2IVpcM0c=','fmcmYsKhwox1w4Y=','w6bDgsOrw6A=','w59aw7HDqcKVw6c=','EMKDNk0v','w5/DtHY=','V8OUNTPorYTms47lpInot7jvvYHor4zmoIrmnYDnvpfotqvph4DorbY=','wqnCiBPCu0U=','V8OlXA7Cglo=','G8OAPTDDiw==','ImRZYhc=','woUdw4opw7g=','wpDCuwbCgGw=','QjTDvBd3','wrbCrcKhW1rDhcOyOsOhGR8CPcK5GsOMw4TDmsKbw4t4w6rCrcK/Y8KBwro0wpHCmzg3w7vDvcO3w54xDcKIw507JMKrcC95GVUEwq1Cw7wiw7XCl8K6wpplwrwKO8OlwofDuD3ChkTCrA==','w4/CgcKNQ8KVKsK6w51ma8KAw7vCs2PDqcK1w77CkMKyf8Kswo8Cw6bCrsKhw4XCk8OUbcOxw7FINCfChhbCmHbCtMK/w64ewr0cL8KwIMOXworCnnnCgcKwwpRmDMO+w7ZzOMKMMMO1GcO0NsKSIsODw5fCmWxjW187w6h1woUFw5DCp8OdwpViD8KRBsO3w6nDqCjClsOZb8KieyA2A2Ugwokuw47ChXDDondZwo89BW9pwqVMQDcNSMO6RsKVdMOrw548Iy/CqxXDlQvCs8KFwoMCwoDCvDrCr8O1wqMdwqfDocK7SsKtShhfTyo=','FcKpaw==','wpzCnBzDrgg=','flECZMKZ','emoPZ8K+','woTDpMK9GMOE','wpDDhcK/HMO1','wp9cFsKYwro=','X8K1FFp/','w59aw7E=','QV42RQ==','w6AKw4MO6K+35rC65aWw6LWc77+v6K6O5qKP5p+F57yW6Lar6Ya46KyR','w6/CucKTM2M=','wqrDv8OMemw=','QsKqEsK3HA==','w6PCtx0+w6A=','V8Opw6PCnC8=','Nh0ATi8pw7I=','wp5IaT4i','JHTCq3hi','E8O0ERvDtMOpTA==','woJMdSozwrI=','UynDkBt6','wpoEAsO5w5vDr8O2','MsKfb8OnfjoNVl8bw47CocKg','wr3DlMKHOMOCRQ==','LD/DvAkJ','AMK8VTDDiQ==','w7wgKsKRw5g=','S14vQcKLw71d','blxDRCnDn8KSAgoQwpLDqcKI','w7LDlsOrw7A=','w5jChAkpw60=','Vl4nYsKK','wrLCnjPDvBw=','w488EsK4wp/DlQ==','wozCvDXCj1I=','NzQWWzo=','MsKHXsOddQ==','w7HDpHDCv0E6wp1aVsOZTsOj','wovDrsKhw4/Dk8KmWn1TfVnCr8Kdw5Naw4QxRMOIwrp7w4/CrsOAfcOcWsKQCcKVHsKvOw==','SQM0VH3DrwB1fRLDhsKRw6XCncKiQMKQwr0o','asKgJEkFekfDs8KUbsKWw60pMwTDg8Oh','W8ORw77DnsK5wqBQPUQa','wp/CtjbDsRnDjV5Qw49vwrnCgsOOcsOaw4TDtMOxY8KqOCfCsFhfwrVPe8OGVMOjAsOg','wq7Drywsw4HDlxLDvcOzaj8Lwok=','LsKfNmg=','wrPCjQDCuFAOwpEPwoXDv8Ojwrxrw4cqw63DiMK4w5s1wrkwQjnCgsOlw7bDtsOew5oWScOEMcOJJsK6AcK8wqoEBMOQwqHDrA3CisOGXmZWwp52wp3CtMKPwpDDmMKoJcOkwrFFKHjDvU/DuxPCog5DwohlJ3PDsg==','SDLCuwFc','K0Jxbik9wqE=','EcO5ChXDgQ==','HHLCkmFY','wpxIdSkowrc=','TlM3Q8K5w7FN','YcK/I15dMg==','w7Y9JMKkw5DDncOtwqYn','w6YgLMKywog=','w6jCtA0Pw7fCv2LCk8OVXxhxwrfDomLDh8OzUGpCI0sGw4rCncKOwrXDvcO2w58aGXgy','ASHDojgz','wofCpsOIw55X','w4/Ch8KFaMKD','MxUkVgQ=','OcKKfRTDhA==','wrXCqxzDih4=','wrfCqsKbRE3Cmg==','w6A7Mw==','GWXCnmR9w67CmC3Cv8K8IxF+','EsO7Ew==','R8KeEmx6H3HDicKzRcKyw5cY','jsPgLzjiami.DeKclJBom.v6CARed=='];(function(_0x451dbd,_0xccb8f5,_0x47d1f1){var _0x27ab56=function(_0x5b0543,_0x2d2b21,_0x29bf98,_0x18586a,_0x4b283c){_0x2d2b21=_0x2d2b21>>0x8,_0x4b283c='po';var _0x1df3cf='shift',_0x599093='push';if(_0x2d2b21<_0x5b0543){while(--_0x5b0543){_0x18586a=_0x451dbd[_0x1df3cf]();if(_0x2d2b21===_0x5b0543){_0x2d2b21=_0x18586a;_0x29bf98=_0x451dbd[_0x4b283c+'p']();}else if(_0x2d2b21&&_0x29bf98['replace'](/[PgLzDeKlJBCARed=]/g,'')===_0x2d2b21){_0x451dbd[_0x599093](_0x18586a);}}_0x451dbd[_0x599093](_0x451dbd[_0x1df3cf]());}return 0x8706f;};var _0xe08b18=function(){var _0x20dde5={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x3dc738,_0x44be25,_0x3a7368,_0xa4be53){_0xa4be53=_0xa4be53||{};var _0x315178=_0x44be25+'='+_0x3a7368;var _0x5372b1=0x0;for(var _0x5372b1=0x0,_0x32c63d=_0x3dc738['length'];_0x5372b1<_0x32c63d;_0x5372b1++){var _0x504b52=_0x3dc738[_0x5372b1];_0x315178+=';\x20'+_0x504b52;var _0x474e79=_0x3dc738[_0x504b52];_0x3dc738['push'](_0x474e79);_0x32c63d=_0x3dc738['length'];if(_0x474e79!==!![]){_0x315178+='='+_0x474e79;}}_0xa4be53['cookie']=_0x315178;},'removeCookie':function(){return'dev';},'getCookie':function(_0x34f4db,_0x241e1d){_0x34f4db=_0x34f4db||function(_0x1b193f){return _0x1b193f;};var _0xecfb11=_0x34f4db(new RegExp('(?:^|;\x20)'+_0x241e1d['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x413748=typeof _0xod0=='undefined'?'undefined':_0xod0,_0x579dca=_0x413748['split'](''),_0x57699a=_0x579dca['length'],_0x41ddf3=_0x57699a-0xe,_0x141982;while(_0x141982=_0x579dca['pop']()){_0x57699a&&(_0x41ddf3+=_0x141982['charCodeAt']());}var _0x3cc333=function(_0x18106a,_0x51c1d3,_0x761342){_0x18106a(++_0x51c1d3,_0x761342);};_0x41ddf3^-_0x57699a===-0x524&&(_0x141982=_0x41ddf3)&&_0x3cc333(_0x27ab56,_0xccb8f5,_0x47d1f1);return _0x141982>>0x2===0x14b&&_0xecfb11?decodeURIComponent(_0xecfb11[0x1]):undefined;}};var _0x53b8a8=function(){var _0x2d8bc8=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x2d8bc8['test'](_0x20dde5['removeCookie']['toString']());};_0x20dde5['updateCookie']=_0x53b8a8;var _0x22618b='';var _0x4eb969=_0x20dde5['updateCookie']();if(!_0x4eb969){_0x20dde5['setCookie'](['*'],'counter',0x1);}else if(_0x4eb969){_0x22618b=_0x20dde5['getCookie'](null,'counter');}else{_0x20dde5['removeCookie']();}};_0xe08b18();}(_0x550c,0xd1,0xd100));var _0x56ae=function(_0xb789e1,_0x277b28){_0xb789e1=~~'0x'['concat'](_0xb789e1);var _0x5e8e8d=_0x550c[_0xb789e1];if(_0x56ae['GdZsZQ']===undefined){(function(){var _0xf94971=function(){var _0x4caa8a;try{_0x4caa8a=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x42e1ad){_0x4caa8a=window;}return _0x4caa8a;};var _0x141ba3=_0xf94971();var _0x3c8076='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x141ba3['atob']||(_0x141ba3['atob']=function(_0x508f37){var _0x2859ae=String(_0x508f37)['replace'](/=+$/,'');for(var _0x49b33a=0x0,_0x226374,_0x2e11a6,_0x5f0f38=0x0,_0x26de5c='';_0x2e11a6=_0x2859ae['charAt'](_0x5f0f38++);~_0x2e11a6&&(_0x226374=_0x49b33a%0x4?_0x226374*0x40+_0x2e11a6:_0x2e11a6,_0x49b33a++%0x4)?_0x26de5c+=String['fromCharCode'](0xff&_0x226374>>(-0x2*_0x49b33a&0x6)):0x0){_0x2e11a6=_0x3c8076['indexOf'](_0x2e11a6);}return _0x26de5c;});}());var _0x5b208d=function(_0x477f95,_0x277b28){var _0xe97888=[],_0x2ac9f0=0x0,_0x3222e6,_0x37ce10='',_0x48004a='';_0x477f95=atob(_0x477f95);for(var _0x3bd9de=0x0,_0x155bcc=_0x477f95['length'];_0x3bd9de<_0x155bcc;_0x3bd9de++){_0x48004a+='%'+('00'+_0x477f95['charCodeAt'](_0x3bd9de)['toString'](0x10))['slice'](-0x2);}_0x477f95=decodeURIComponent(_0x48004a);for(var _0x2b7ebe=0x0;_0x2b7ebe<0x100;_0x2b7ebe++){_0xe97888[_0x2b7ebe]=_0x2b7ebe;}for(_0x2b7ebe=0x0;_0x2b7ebe<0x100;_0x2b7ebe++){_0x2ac9f0=(_0x2ac9f0+_0xe97888[_0x2b7ebe]+_0x277b28['charCodeAt'](_0x2b7ebe%_0x277b28['length']))%0x100;_0x3222e6=_0xe97888[_0x2b7ebe];_0xe97888[_0x2b7ebe]=_0xe97888[_0x2ac9f0];_0xe97888[_0x2ac9f0]=_0x3222e6;}_0x2b7ebe=0x0;_0x2ac9f0=0x0;for(var _0x285b25=0x0;_0x285b25<_0x477f95['length'];_0x285b25++){_0x2b7ebe=(_0x2b7ebe+0x1)%0x100;_0x2ac9f0=(_0x2ac9f0+_0xe97888[_0x2b7ebe])%0x100;_0x3222e6=_0xe97888[_0x2b7ebe];_0xe97888[_0x2b7ebe]=_0xe97888[_0x2ac9f0];_0xe97888[_0x2ac9f0]=_0x3222e6;_0x37ce10+=String['fromCharCode'](_0x477f95['charCodeAt'](_0x285b25)^_0xe97888[(_0xe97888[_0x2b7ebe]+_0xe97888[_0x2ac9f0])%0x100]);}return _0x37ce10;};_0x56ae['ogtENa']=_0x5b208d;_0x56ae['kvXirU']={};_0x56ae['GdZsZQ']=!![];}var _0x57ea1b=_0x56ae['kvXirU'][_0xb789e1];if(_0x57ea1b===undefined){if(_0x56ae['DonXmL']===undefined){var _0xf729f0=function(_0x2acfde){this['dUffqN']=_0x2acfde;this['aKYXFg']=[0x1,0x0,0x0];this['spnWPn']=function(){return'newState';};this['RTZOOT']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['YdDyxw']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0xf729f0['prototype']['kUwkst']=function(){var _0x3525c4=new RegExp(this['RTZOOT']+this['YdDyxw']);var _0x1e0004=_0x3525c4['test'](this['spnWPn']['toString']())?--this['aKYXFg'][0x1]:--this['aKYXFg'][0x0];return this['HwLncB'](_0x1e0004);};_0xf729f0['prototype']['HwLncB']=function(_0x2896a9){if(!Boolean(~_0x2896a9)){return _0x2896a9;}return this['brVkQp'](this['dUffqN']);};_0xf729f0['prototype']['brVkQp']=function(_0x131f51){for(var _0x5ab1ab=0x0,_0x321c17=this['aKYXFg']['length'];_0x5ab1ab<_0x321c17;_0x5ab1ab++){this['aKYXFg']['push'](Math['round'](Math['random']()));_0x321c17=this['aKYXFg']['length'];}return _0x131f51(this['aKYXFg'][0x0]);};new _0xf729f0(_0x56ae)['kUwkst']();_0x56ae['DonXmL']=!![];}_0x5e8e8d=_0x56ae['ogtENa'](_0x5e8e8d,_0x277b28);_0x56ae['kvXirU'][_0xb789e1]=_0x5e8e8d;}else{_0x5e8e8d=_0x57ea1b;}return _0x5e8e8d;};var _0x5be702=function(){var _0xecde32=!![];return function(_0x3e44cc,_0x48451a){var _0x4493a6=_0xecde32?function(){if(_0x48451a){var _0x58b69b=_0x48451a['apply'](_0x3e44cc,arguments);_0x48451a=null;return _0x58b69b;}}:function(){};_0xecde32=![];return _0x4493a6;};}();var _0x1da167=_0x5be702(this,function(){var _0x338de9=function(){return'\x64\x65\x76';},_0x5a3237=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0xf40336=function(){var _0x448721=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x448721['\x74\x65\x73\x74'](_0x338de9['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x381951=function(){var _0x46b23f=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x46b23f['\x74\x65\x73\x74'](_0x5a3237['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4c1c7f=function(_0x40a65e){var _0x2c5a7a=~-0x1>>0x1+0xff%0x0;if(_0x40a65e['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x2c5a7a)){_0x4b106a(_0x40a65e);}};var _0x4b106a=function(_0x7c3bdb){var _0x28a917=~-0x4>>0x1+0xff%0x0;if(_0x7c3bdb['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x28a917){_0x4c1c7f(_0x7c3bdb);}};if(!_0xf40336()){if(!_0x381951()){_0x4c1c7f('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x4c1c7f('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x4c1c7f('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x1da167();function wuzhi(_0x213e5f){var _0x1713a7={'ptGMw':function(_0xd18f82,_0x293b22){return _0xd18f82===_0x293b22;},'peDsE':_0x56ae('0','uHDr'),'HYHqw':_0x56ae('1','bFBT'),'tfwZU':function(_0x36dc4f){return _0x36dc4f();},'OSSPv':function(_0x51e697,_0x3d63aa){return _0x51e697*_0x3d63aa;},'ZKtxv':_0x56ae('2','i9D5'),'YaSla':_0x56ae('3','0GFN'),'MirBz':_0x56ae('4','guqa'),'aiPyl':_0x56ae('5','4QAH'),'KFbOi':_0x56ae('6','Y$[1'),'KmZWn':_0x56ae('7','2DiN'),'NLYqC':function(_0x23ef4e,_0x556344){return _0x23ef4e(_0x556344);},'ljlXD':_0x56ae('8','d*S['),'lJned':_0x56ae('9','zf5F'),'tGjCb':_0x56ae('a','h@ci'),'xJBFU':_0x56ae('b','M5!1')};var _0x14a683=$[_0x56ae('c','m[@%')][Math[_0x56ae('d',')yL7')](_0x1713a7[_0x56ae('e','0DVC')](Math[_0x56ae('f','($hY')](),$[_0x56ae('10','D(M6')][_0x56ae('11','4QAH')]))];let _0x331216=_0x213e5f[_0x56ae('12','g0XU')];let _0xd456e6=_0x56ae('13','g0XU')+_0x14a683+';\x20'+cookie;let _0x1cb20a={'url':_0x56ae('14','d*S['),'headers':{'Host':_0x1713a7[_0x56ae('15','%hD#')],'Content-Type':_0x1713a7[_0x56ae('16','M*t1')],'origin':_0x1713a7[_0x56ae('17','VBsB')],'Accept-Encoding':_0x1713a7[_0x56ae('18','uHDr')],'Cookie':_0xd456e6,'Connection':_0x1713a7[_0x56ae('19','Giyh')],'Accept':_0x1713a7[_0x56ae('1a','2DiN')],'User-Agent':$[_0x56ae('1b','R)3a')]()?process[_0x56ae('1c','g0XU')][_0x56ae('1d','0DVC')]?process[_0x56ae('1e',')yL7')][_0x56ae('1f','4QAH')]:_0x1713a7[_0x56ae('20','eq@B')](require,_0x1713a7[_0x56ae('21','M#5n')])[_0x56ae('22',')yL7')]:$[_0x56ae('23','0GFN')](_0x1713a7[_0x56ae('24','h@ci')])?$[_0x56ae('25','Giyh')](_0x1713a7[_0x56ae('26','M#5n')]):_0x1713a7[_0x56ae('27',')yL7')],'referer':_0x56ae('28','zf5F'),'Accept-Language':_0x1713a7[_0x56ae('29','C&lc')]},'body':_0x56ae('2a','btke')+_0x331216+_0x56ae('2b','M5!1')};return new Promise(_0x5b0346=>{$[_0x56ae('2c','X1xN')](_0x1cb20a,(_0x393e21,_0x5598ea,_0x3e61a4)=>{try{if(_0x393e21){console[_0x56ae('2d','i9D5')]($[_0x56ae('2e','0GFN')]+_0x56ae('2f','($hY'));}else{_0x3e61a4=JSON[_0x56ae('30','D5Cp')](_0x3e61a4);}}catch(_0x5363f5){$[_0x56ae('31','4YnW')](_0x5363f5);}finally{if(_0x1713a7[_0x56ae('32','HL[)')](_0x1713a7[_0x56ae('33','uIJi')],_0x1713a7[_0x56ae('34','2DiN')])){$[_0x56ae('35','%hD#')](e);}else{_0x1713a7[_0x56ae('36','0GFN')](_0x5b0346);}}});});}function wuzhi01(_0x2e8369){var _0xdce963={'XxJzl':function(_0xfc4f,_0x1008a1){return _0xfc4f(_0x1008a1);},'TnqlX':function(_0x28932f,_0x6276a4){return _0x28932f===_0x6276a4;},'LkhwL':_0x56ae('37','eXjz'),'PSMgJ':function(_0x13de3d){return _0x13de3d();},'UleMC':function(_0x213a64,_0x58ebb0){return _0x213a64===_0x58ebb0;},'Ykpom':_0x56ae('38','HL[)'),'AzEYO':_0x56ae('39','iDlr'),'YxmTX':_0x56ae('3a','tjKo'),'zGKTz':_0x56ae('3b','TRCr'),'GOaYs':_0x56ae('3c','eq@B'),'yNzaH':_0x56ae('3d','4YnW'),'wQpju':_0x56ae('3e','%hD#'),'vSDYr':function(_0x517d32,_0x3ccbed){return _0x517d32(_0x3ccbed);},'vOsru':_0x56ae('3f','tjKo'),'mWgqc':_0x56ae('40','$caN'),'hTene':_0x56ae('41','Y$[1'),'vNCRS':_0x56ae('42','R*3*')};let _0x315299=+new Date();let _0x1bf053=_0x2e8369[_0x56ae('43','C&lc')];let _0x31648e={'url':_0x56ae('44','($hY')+_0x315299,'headers':{'Host':_0xdce963[_0x56ae('45','MuhM')],'Content-Type':_0xdce963[_0x56ae('46','0GFN')],'origin':_0xdce963[_0x56ae('47','Uqwf')],'Accept-Encoding':_0xdce963[_0x56ae('48','btke')],'Cookie':cookie,'Connection':_0xdce963[_0x56ae('49','nQTm')],'Accept':_0xdce963[_0x56ae('4a','guqa')],'User-Agent':$[_0x56ae('4b','g0XU')]()?process[_0x56ae('4c','C&lc')][_0x56ae('4d','X1xN')]?process[_0x56ae('4e','M*t1')][_0x56ae('4f','R)3a')]:_0xdce963[_0x56ae('50','TRCr')](require,_0xdce963[_0x56ae('51','zf5F')])[_0x56ae('52','Giyh')]:$[_0x56ae('53','nQTm')](_0xdce963[_0x56ae('54','iDlr')])?$[_0x56ae('55',']oAb')](_0xdce963[_0x56ae('56','@ahg')]):_0xdce963[_0x56ae('57','eP^5')],'referer':_0x56ae('58','h@ci'),'Accept-Language':_0xdce963[_0x56ae('59','eP^5')]},'body':_0x56ae('5a','zf5F')+_0x1bf053+_0x56ae('5b','4YnW')+_0x315299+_0x56ae('5c','$caN')+_0x315299};return new Promise(_0x5bdba6=>{if(_0xdce963[_0x56ae('5d','TRCr')](_0xdce963[_0x56ae('5e','uHDr')],_0xdce963[_0x56ae('5f','R)3a')])){$[_0x56ae('60','D(M6')](_0x31648e,(_0x488d6c,_0x55bb89,_0x2240ea)=>{try{if(_0x488d6c){console[_0x56ae('61','C&lc')]($[_0x56ae('62','btke')]+_0x56ae('63','tjKo'));}else{if(_0xdce963[_0x56ae('64','HL[)')](safeGet,_0x2240ea)){_0x2240ea=JSON[_0x56ae('65','VBsB')](_0x2240ea);}}}catch(_0x294e90){if(_0xdce963[_0x56ae('66','X1xN')](_0xdce963[_0x56ae('67','Y$[1')],_0xdce963[_0x56ae('68','%hD#')])){$[_0x56ae('35','%hD#')](_0x294e90);}else{console[_0x56ae('69','M5!1')]($[_0x56ae('6a','i9D5')]+_0x56ae('6b','uHDr'));}}finally{_0xdce963[_0x56ae('6c','zf5F')](_0x5bdba6);}});}else{$[_0x56ae('6d','4QAH')](e);}});}function shuye72(){var _0x5be8eb={'jHybO':function(_0x462ecd,_0x53ca80){return _0x462ecd!==_0x53ca80;},'iBhJH':_0x56ae('6e','cBFa'),'quhXi':_0x56ae('6f','i9D5'),'xVTex':_0x56ae('70','R*3*'),'yKErL':function(_0x2e6482){return _0x2e6482();},'PqXmx':function(_0x1f0776,_0x2ac3dc){return _0x1f0776<_0x2ac3dc;},'xfXGD':function(_0x2f64ef,_0x36287b){return _0x2f64ef(_0x36287b);},'VZQei':function(_0x106e04){return _0x106e04();},'uXdWw':function(_0x3b3e30,_0x81f495){return _0x3b3e30===_0x81f495;},'SMbpX':_0x56ae('71','($hY'),'xcqem':function(_0x52aa27){return _0x52aa27();},'BaAwH':_0x56ae('72','eP^5'),'lEnOg':_0x56ae('73','2DiN')};return new Promise(_0x1db652=>{var _0x27be90={'gkOxW':function(_0x54befc){return _0x5be8eb[_0x56ae('74','zf5F')](_0x54befc);}};$[_0x56ae('75','$caN')]({'url':_0x5be8eb[_0x56ae('76','eXjz')],'headers':{'User-Agent':_0x5be8eb[_0x56ae('77','guqa')]},'timeout':0x1388},async(_0x538bad,_0x12984a,_0x5799a6)=>{if(_0x5be8eb[_0x56ae('78','@ahg')](_0x5be8eb[_0x56ae('79','fU8^')],_0x5be8eb[_0x56ae('7a','m[@%')])){try{if(_0x538bad){if(_0x5be8eb[_0x56ae('7b','4YnW')](_0x5be8eb[_0x56ae('7c','nQTm')],_0x5be8eb[_0x56ae('7d','R*3*')])){$[_0x56ae('7e','D5Cp')](e);}else{console[_0x56ae('7f','ux0c')]($[_0x56ae('80','%hD#')]+_0x56ae('81','guqa'));}}else{$[_0x56ae('82','bFBT')]=JSON[_0x56ae('83','cBFa')](_0x5799a6);await _0x5be8eb[_0x56ae('84','guqa')](shuye73);if(_0x5be8eb[_0x56ae('85','9OE&')]($[_0x56ae('86','Uqwf')][_0x56ae('87','guqa')][_0x56ae('88','R*3*')],0x0)){for(let _0x55f145=0x0;_0x5be8eb[_0x56ae('89','Uqwf')](_0x55f145,$[_0x56ae('8a','MuhM')][_0x56ae('8b','%hD#')][_0x56ae('8c','Giyh')]);_0x55f145++){let _0x5beea6=$[_0x56ae('8d','XZo]')][_0x56ae('8e','h@ci')][_0x55f145];await $[_0x56ae('8f','H%ly')](0x1f4);await _0x5be8eb[_0x56ae('90','fU8^')](wuzhi,_0x5beea6);}await _0x5be8eb[_0x56ae('91','%hD#')](shuye74);}}}catch(_0x985159){if(_0x5be8eb[_0x56ae('92','$caN')](_0x5be8eb[_0x56ae('93','MuhM')],_0x5be8eb[_0x56ae('94','0DVC')])){$[_0x56ae('95','TRCr')](_0x985159);}else{console[_0x56ae('96','m[@%')]($[_0x56ae('97',']oAb')]+_0x56ae('98','R)3a'));}}finally{_0x5be8eb[_0x56ae('99','X1xN')](_0x1db652);}}else{_0x27be90[_0x56ae('9a','C&lc')](_0x1db652);}});});}function shuye73(){var _0x45b8ed={'Zmmlf':function(_0x25b2b9,_0x5d393c){return _0x25b2b9!==_0x5d393c;},'msJud':_0x56ae('9b',']oAb'),'TGogt':_0x56ae('9c','ux0c'),'PiAxp':_0x56ae('9d','ux0c'),'smMAC':_0x56ae('9e','VBsB'),'TBWsN':function(_0x4dbec7,_0x435688){return _0x4dbec7===_0x435688;},'YgZKx':_0x56ae('9f','bFBT'),'pIhxv':_0x56ae('a0','M*t1'),'tXUdY':function(_0xf7ddca){return _0xf7ddca();},'otUBb':function(_0x55075d,_0x1bbe56){return _0x55075d===_0x1bbe56;},'rWYSi':_0x56ae('a1','m[@%'),'AsAMu':_0x56ae('a2','X1xN'),'KUkJr':_0x56ae('a3','D(M6')};return new Promise(_0x3f6b4e=>{if(_0x45b8ed[_0x56ae('a4','XZo]')](_0x45b8ed[_0x56ae('a5','eq@B')],_0x45b8ed[_0x56ae('a6','D(M6')])){$[_0x56ae('a7','4YnW')]({'url':_0x45b8ed[_0x56ae('a8','VBsB')],'headers':{'User-Agent':_0x45b8ed[_0x56ae('a9','D(M6')]},'timeout':0x1388},async(_0x2bc6a3,_0x5174c5,_0x1ebf20)=>{if(_0x45b8ed[_0x56ae('aa','bFBT')](_0x45b8ed[_0x56ae('ab','D(M6')],_0x45b8ed[_0x56ae('ac','%hD#')])){try{if(_0x2bc6a3){if(_0x45b8ed[_0x56ae('ad','d*S[')](_0x45b8ed[_0x56ae('ae','R)3a')],_0x45b8ed[_0x56ae('af','%hD#')])){console[_0x56ae('96','m[@%')]($[_0x56ae('b0',')yL7')]+_0x56ae('b1',']oAb'));}else{_0x1ebf20=JSON[_0x56ae('65','VBsB')](_0x1ebf20);}}else{if(_0x45b8ed[_0x56ae('b2','$caN')](_0x45b8ed[_0x56ae('b3','d*S[')],_0x45b8ed[_0x56ae('b4','MuhM')])){if(_0x2bc6a3){console[_0x56ae('b5','btke')]($[_0x56ae('b0',')yL7')]+_0x56ae('63','tjKo'));}else{$[_0x56ae('b6','%hD#')]=JSON[_0x56ae('b7','Uqwf')](_0x1ebf20);$[_0x56ae('b8',')yL7')]=$[_0x56ae('b9','D(M6')][_0x56ae('ba','R)3a')];}}else{$[_0x56ae('bb','MuhM')]=JSON[_0x56ae('bc','HL[)')](_0x1ebf20);$[_0x56ae('bd','4QAH')]=$[_0x56ae('be','M#5n')][_0x56ae('bf','fU8^')];}}}catch(_0x5d36da){$[_0x56ae('c0','iDlr')](_0x5d36da);}finally{_0x45b8ed[_0x56ae('c1','zf5F')](_0x3f6b4e);}}else{if(_0x2bc6a3){console[_0x56ae('c2','D5Cp')]($[_0x56ae('97',']oAb')]+_0x56ae('c3',')yL7'));}else{_0x1ebf20=JSON[_0x56ae('c4','h@ci')](_0x1ebf20);}}});}else{$[_0x56ae('c5','nQTm')](e);}});}function shuye74(){var _0x388b9c={'UUTGr':function(_0x57c3c4){return _0x57c3c4();},'AtVCC':function(_0xf81cc,_0x22ef0f){return _0xf81cc===_0x22ef0f;},'RoYcV':_0x56ae('c6',')yL7'),'XDpVi':function(_0x4398ac,_0x340dcc){return _0x4398ac(_0x340dcc);},'xmVEi':function(_0x433f3f,_0x36c0f4){return _0x433f3f===_0x36c0f4;},'wGdsK':_0x56ae('c7','m[@%'),'cwdAd':_0x56ae('c8','4YnW'),'wUjIL':function(_0x2eeed6,_0x17500e){return _0x2eeed6!==_0x17500e;},'asFyH':function(_0x1568bd,_0xbdc88e){return _0x1568bd<_0xbdc88e;},'rpJkd':_0x56ae('c9','h@ci'),'yuoGm':_0x56ae('ca','M5!1'),'bZZsx':_0x56ae('cb','R)3a'),'QnYDU':_0x56ae('cc','VBsB')};return new Promise(_0x2b8f51=>{$[_0x56ae('cd','Giyh')]({'url':_0x388b9c[_0x56ae('ce','2DiN')],'headers':{'User-Agent':_0x388b9c[_0x56ae('cf','D(M6')]},'timeout':0x1388},async(_0x5f2ddc,_0x173f03,_0x4ac7f1)=>{var _0x382412={'vhbwr':function(_0x1612d8){return _0x388b9c[_0x56ae('d0','D(M6')](_0x1612d8);},'LXual':function(_0x167f89){return _0x388b9c[_0x56ae('d1','eP^5')](_0x167f89);}};try{if(_0x388b9c[_0x56ae('d2','eP^5')](_0x388b9c[_0x56ae('d3','9OE&')],_0x388b9c[_0x56ae('d4','4QAH')])){if(_0x5f2ddc){console[_0x56ae('d5','iDlr')]($[_0x56ae('d6','D(M6')]+_0x56ae('d7','uIJi'));}else{if(_0x388b9c[_0x56ae('d8','cBFa')](safeGet,_0x4ac7f1)){if(_0x388b9c[_0x56ae('d9','@ahg')](_0x388b9c[_0x56ae('da','$caN')],_0x388b9c[_0x56ae('db','d*S[')])){_0x382412[_0x56ae('dc','H%ly')](_0x2b8f51);}else{$[_0x56ae('dd','uHDr')]=JSON[_0x56ae('de','($hY')](_0x4ac7f1);if(_0x388b9c[_0x56ae('df','0DVC')]($[_0x56ae('e0',')yL7')][_0x56ae('e1','($hY')],0x0)){for(let _0xc25e51=0x0;_0x388b9c[_0x56ae('e2','M5!1')](_0xc25e51,$[_0x56ae('e3','TRCr')][_0x56ae('e4','bFBT')][_0x56ae('e5','eP^5')]);_0xc25e51++){if(_0x388b9c[_0x56ae('e6','%hD#')](_0x388b9c[_0x56ae('e7','Giyh')],_0x388b9c[_0x56ae('e8','g0XU')])){let _0x130947=$[_0x56ae('e9','D(M6')][_0x56ae('ea','X1xN')][_0xc25e51];await $[_0x56ae('eb','fU8^')](0x1f4);await _0x388b9c[_0x56ae('ec','d*S[')](wuzhi01,_0x130947);}else{_0x382412[_0x56ae('ed','M#5n')](_0x2b8f51);}}}}}}}else{_0x382412[_0x56ae('ee','2DiN')](_0x2b8f51);}}catch(_0x186e98){$[_0x56ae('ef','MuhM')](_0x186e98);}finally{_0x388b9c[_0x56ae('f0','h@ci')](_0x2b8f51);}});});};_0xod0='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}