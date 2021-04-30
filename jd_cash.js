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
var _0xods='jsjiami.com.v6',_0x41b2=[_0xods,'E8OYw6bDiG4=','Xg7CuT/CkA==','woTCmG0rw5A=','w6bDuDELAA==','c8KCUcKnIw==','P8OGwoLDm8Km','a8KoFSh9','w6B1w6wtwpoG','K2kc','NDglwrc=','Y8KEOhvor4bmsoXlpYrotIzvvqror6Hmo5nmnInnv5rotJXphIroraM=','QMKXCjVa','OwwOwqgH','wpYkw4x8w74=','w6B1w6w=','TUzDlMKO','ScKPw6bCo+isteaxkuWkhui0hO++pOiskOajr+ael+e/pui0i+mEiOituQ==','w5vDgMK9WVE=','bcKfw7zCgMOV','N2cJJmw=','OcKtw57CjcKJ','JUA+dsK0','w5rCtkXDhMK4','w6nDugHDqcOoTQ==','T8KwSHfDlA==','WMKRwrvCoBA=','J8KqP8KddQ==','YhHCk8Kdew==','w6TDuQ8rBg==','w7XDtBTDn8O/','wpUwwpcmwrk=','e2DDhRLCrQ==','w5jCjmLDoMKe','dF7Dt8KKMg==','w47CgMOEe3LDqcKpw4LCuhbCsys=','w5vDiR08OcOEQ0PCj8OTw5vDoHo6wqfDhX3DuiEKw7dpwpVgAl5QaADDqX/DumgRw6o=','YsK/Kz0aC8KeBcKaNmpEwrUvw5dtTA==','HsODacOGw7fCogkSw5PCtQ==','WcOfw61UFUN0QAbCix/CpWIGworDhsK7w6LCpsOaNxXCkMKAbA7DjXZtw6vDsk0e','UFzCpUx5wq9tAxLDqsKKQHE=','wpvCmWAt','wqZtw5RGwojCtGtrfhfCgMOnwrg0PUVxKMOQUXZMw5nCjlbDp8KhwqIlOgnCqsK0woTClH3Do8OCwqbCkMOXbDPDmcK8wqLDnsO5wp4nwpXDmsO7DMKmPg9Nb8ODw6YUw6BtGU5Hwp3DqVxxKMKIwpvDncOlw5c=','wrxyw6t7Nw==','TgluYBPDnWnCgA==','LcO4w77ClSbCh8OIQDNwGSBfw7jCm8Kuwp9/w6Miw77CuC4Fwpg=','bsKjETpC','HjLDm8KvSA==','AsKdHQdi','GcOPY8Ohwp0=','H8Onw7jCnTI=','QyLCjDTCqg==','ZScTwq5hwpM=','w6DDuxA=','IMKGwqcbw7LCj8KqCA0Gw5jDqMOr','JsKrHA==','MsO1fMOQwps=','w5YTw4t0aA==','OsKyFwxqGiM2KcOw','woxcwrIcLA==','w6s7ZMOjW8Kow5M=','wpw1w45Jw4w=','HivDr8Orw6M=','K2M7dMK/woQEw63DqDTChsOHcsKuFMKWCDjDqDbDuwrDm8K7wohrw6VtHHQuw6RMAcKUFAbChivDh0lXYcOzwoTCvsK3wpbCisKZwrByS8KIw7HCkXlTwqXDlsKQN8OsVMO8YcOuZmzCvnlya3xjMAnDkcKJXsOhHHsAJjPCiCHCi0Q/w5XDpyTDrX9owqnCi8KkJ8Kaw4s=','BWkjEVg=','FsOKZcOTwrTCt1gWw4DCtx0JwpfCsMOHU8OTPTzCghLDs8OEwopmwqU2c8KWw49nLzlPwod9wr3CtCrDk2gEwpbCmcKDw5gyw5gVZMKQw7/Dt8Onw5tcBEPDlMOBdMO0w5VEUcOPw4t1BRQ/UkETw4dMK2d8w4t1VcOiw6FYwqxiSmgHwqbChTMVMcKTdxElEMOFWMOMwpoQfV/Dt8KCw5Z4TMKEwpXCj8KiWsOOWSrDkG7DhsO/RcK0HcKcw6RBBBvCmFfCtHXCjX/DgRLDly7DscOLw5oVw4HCjUXCjsKyTsKPWcK2woMXw5/Cp8K3wp1cwrvCmcKJw7TCswBBwovCrMOiSMKPUsOFI1QTUMK9woPCmCbCtyTDvMOEwrxd','P8OSwqzCksOTHMOmwpLCh0PCqcKCwq5nwqE1An7ClVFuY3XCsRBhcMKNwqHDqsKUd8K0wpQKwp/ClsKCQMOwUypMJsKtwrTDkHQfG8OtRkfDhsOywojCqTvCscOiU2fDucOBw6PCplccw646wpQha2TCnsOUPF/Dr8Kjw6XCvMOdwrbDkUzDr33DgcOIGDLCszPCqwl4I29xXw==','QsOpw6vCmQ==','QsKTJC9P','KMKOIDFh','CjbCmEdx','w75Mw5okwqI=','asKLw43CpMO9','wrgkw7hew5g=','w6TDtzglEA==','w6oqCDE=','CX4vAn0=','wp7CvMORC8Op','w5vCkcOBOlo=','w6Axdw==','fgHCuMKI','wp8qw7NN6K+d5rCV5ae26Las77606K+X5qC15p+/57y16LSu6YeC6K6p','w4vCkcOZNFjCosK3wpc=','Kjg6wqED','w5LDkQUvP8KXCA==','TsKsfMKgNsOEw7cx','w7kwEiE=','YjUwwqQ=','SsKowonCvj0=','FsKsw6bDisOO','wojCucOwNMOV','HksVEXo=','L8KqDRdDwrU=','asOHKQXCqQ==','wobCssOaIcOeFA==','JxXCgWll','w4lCw4Y5wp8=','acKfWcK7FA==','bX7Dj8KOEA==','VcKONQFc','DsOTw7PDsE8=','KcKPGhdb','GAnDpcK5T8Oqf8KnD8KQw6bCs30Nw5RrwrrCvMO+IMKWO8KCWExZw7PCr8OtVRorw7nDvMKLK0A8wpjDmD3Cp8O+w7/Dii8lw7Vpw7fDvWUDwr7CoS1oYQPCjFfCkQ==','SMKqOCRaR8KbT8OJdDsQw7hqwqdnUcKPKifCghpCw4bChsO/w73Cni7Dkhx9AzrCtGfDrMOxw4p9MSQSC8O+w7cKw5XDk8KBwonCky9FwqHDjcObBUDDuwcowol0w4jCqmfDg3PDnFfCnsKNA8OTV2Aow6lbd8Kcw4bCtH/ClMOPw4czG2DCvcOJa8OxOsO0E8KlwrYKw47Ctl/Cs8KrNsOhwozDocOlORw+Qjk1OMOTwoJ1V8K6woDDncOywqIrw5LCmcOfVgTCo8KIwrzDrsKCwqnDkHHDoGTDucOHa8K6w67DvcOHwpxvbFfDisOQ','JjzDqMKmfQ==','HsOSQ8O4woA=','w5gOw5c=','ScOtHhrClA==','fcOPDy/ClQ==','w5k1GjQz','BwjDoMOmw68=','MjTCvV5l','Z8KjMQ==','UAlgbg==','LBUNwojor7LmsrTlpqnot7jvv5/or4fmoobmnYznvL3otaXph7jorq4=','wot3wpE=','YcKrQ2w=','XMOAwqfDheistOaymuWksei1k++/p+iuhuagoOafm+e8oui0numHkuisig==','K8K6w5LDiMO9','w6HDhsKZf24=','wqR8wqB6Kg==','JcKWw6PCvsKR','VcKNFWfDhkfCog==','eMKTwqHCtD4=','aMKua1wy','PRXDlcKtTw==','w4/DgMK7S3Mkwoc=','w63Dk8KqTw==','Ug1jbALDgQ==','C8KDw7fCssKj','OsKgw6vDi8Oq','ATzDp8K4dw==','f8KSw5nCi8OH','WcKNZkgo','f8KXX3zDm8OVSQ==','wop7w5BT','wqBsw5tRwozDpw==','DcKsEwZU','wr59wpg2EQ==','wpVsw5tTwpY=','R0zDjcKKOsOvMw==','M8OUacOT','w5jCkcOEIQ==','w7nCscOUOl4=','CMOZw7g=','wol5wps2','w7HCnGUl6K2t5rK95aaz6LaH772M6K+E5qKT5p6D576N6LaP6Yeg6K2N','w4zDhcKKf3s=','w5nDqQMxccOB','w4fDjsKob0Yz','ZMK+YUcn','w4Jqw58ewqQ=','ejwFwopQ','w7IxDzUMBMOmJsKdw5poIcOXMsO8w5Vtw4lfw77DssOBw6J6KhTDpmgnw57Dm8K0EUV1woF0JjXDkcO1wqzCiFXCpnAiVcOwOsOuOFIuEMKTJUjClsKHwq15OWjCv8KAXMOnwqt+w6bCm8KhwphH','dcOAw6dREEx0G1rDikHCqiAcwrXDgMO4wqzCt8KEbyLDr8KlIAbDtHAuwqXCvUJ7CHcqwrwuEMOvEn4XE0g4w7EXwo01w58GwobCu1BxwqPCqEo3w6/DncKtC1Qcw5IKw4IEF8OiFXXDkcOVecO5w6ArYcOowrHDhcKewrvCg0xZw4HCvUPDhh4LMsKDSsKDE13CkX0oKkA0WsKVNS5PBmoIXMO4NwIYLwbDucKtwoXDhiHCtVnCl8OdLcOVCGEZw5Z0wpIcw4whBcOTw7pJH3zCvMKXURPCoRV/wog=','FynDgMK8aw==','woRYwo1yMw==','WsKcZU4o','WMKHwovCkB8=','w5LDoxA=','fsKveFke','woXCtMO/EsOO','w4bCl8OmHVM=','w4DCi2/DgcKT','wrIGw69Ww7E=','L3go','aSDCjTw=','wo/CscO9HOivqOayheWnsui2g+++mOiuguagnOaeo+e+rei0humFreitgw==','BsKtwp8=','EBLCnXo=','w4rCnMOtLeitm+awpOWknOi3kO+/huiumuahmOacpue+lui3vOmFrOivvg==','w5fDnB0tDcKbGF0=','S8KJMi59wqbCrQ==','bMKTwqfCphzCmcOQfA==','eMKDQnk=','dsOJPDPCvjM=','MGUZEWg=','Vhx5ewXCkw/Di8OvwpzCnjVdEsOCwp1FwrXDv8KKw4fDsMK2KcKGcCrDh8OfLcKUwpMfwokuw5QCw7Qowp3CrmQrVsKtw71Nw5UWw5UbL8Oyw4jCmMKrOsK5L1zDt8K5ayDDuTfDq1Y=','CmkBPGXCvQcrw67CvgREw4fDjsKPQXbCoMOXwpjDq1taBsO2w6Zqwr03OjI5wpltKULCqMOJLsOBwplBJU16cxNIwoF5wqfCv1vCucKww5bCpTjCosOBNQLDmErCrsKSwpsec8OVw7bCv8OCw5LDn8Opw7nCun/DnG9xw67Ckkh+w4DClz5Tw7ciVMOxw7BCw7zCnCJ+VhXCiXjCpcKHwr7Dmx/CgXBoM8Kyw7fCssOJL8O2YsORbEPDsHI9w6LDvE5WW2YxJ8K+S2Yew7PDgC/ChsOlwqBuA2IDG2vDkMK7U8O3LMK5','w5TDmB0=','Kh7DlMKDWw==','wq1PwrwpEw==','RMKEMyg=','wpPDvDkF6K695rK85aWd6LWJ77+s6K2U5qG+5p2r572Z6Law6YSO6K2g','P8KZCcKebw==','I2cPNE7CtBI=','DhLCgmxZ','PMKxBjdN','NjwmwrUSHw==','KcKsJRJN','EcOHeMOXwp3CphE=','N8Kpw6bDi8OXZhgWwol7d8KHcw==','wr3CuFsLw67Clw==','HMK4w7fDhMOCZgg=','SDHChTfCkDvDksOuIUnCp8KCwoM=','AsKfw5/CgMK4','RsKKOQh6wr0=','wofCp8OcIMOL','w4bDicK4XWA=','egbCocKveg==','fcKfFBdG','czbCky3CoA==','QxfCoinClA==','w73DkzEtJA==','bATCkjbCtg==','bsK6RycQGMOzfXdjXDc=','w47CgMOdOXbCpMKiw5LDvRrCsmnChMOEw5fDocOrw7PCuS5CwqDCvSrDhsOAC8KFw6BSRcO4CA==','S1nDjcKbDsKwaMKxGS7Di3LCpE0GScKJw7fDnA==','esKEw6fCg8KcSMOLwpPDgxXDqsOBwq17wrFnSQ==','GxjDtMK5EcKxPMOhHsKc','d0DDsCfCj8O1WsKDC1DDpn/DhjgGV3DCmzw3DDXDn8OqDcKLBC92eFbCo8Op','w6Imw6Blwr3DnV16UT3CoMOWw5A=','H8KfLMKs','d8Kaw6/Cg8OAU8OGwqbDjRbDpcOQw7Nuwr83FSjDiwJjf3LCvg1AcMOKw5DDjsOXU8OPwokrwpzCgsO4HcKxWQhbPcKvwqTCmDRQNsOfbUzDlsOMwonCsiTDjcKnACPCusKSwoXDvQcYwqV4wplyNT7DhsKuYw==','wqvCtRgPw7Q=','asKgOm12w7rCkA==','PDUnwr0U','QQ7Cp8KBUg==','TAljbxnDhA==','w43CtnvDpcKnw6TCmg==','VMOKw7NfCEg=','C8Kxw6LDl8OgQBMiwo0=','IMKwAzYM','w7IxDzUMBMOmJsKbw4N1asOfMsO1w54uwoVDw7vCqMOLw7Z6IR3Co3dpw47Dh8KoF1M=','J8OvY8Ojwr4=','dTnCrgPCoA==','LcOZw6fDjk8=','G8K7w5rDtsOj','wrUkw55rw5M=','N8KzBhZy','w7M2NSobWw==','RkPDjw==','V8K6w5HCpsOjLcO9wqnDpD7DjsO7wpw=','dQ7Cow==','woc3wrEbwq5vw4lLLsKZIXBO','IcKnPSZa','Nl4IbcK5','UhLCpQvCnR/DscO7Dn4=','JMKgHjZQwrMa','OxwuwpMs','wqoWwpoqwpxew7o=','DsKkNB9/','A8O+fsO0wps=','bzXClCnCsWTCmcKRKB/DosKKw5nDm8KLByZYwqwew6gpVMO3wovCtAPDhGh8wo1AYsOUQsKnOW7DkknDlDrCrcKLc8Omw63Dgz8Ow77DnxEdw554AMK9c8KSwoTCnVLCpsOjw4QKGsKqWTNZw4TDtsO6KcOOwqbDqz47woPDssKrw4QGw6bCkWw=','O1IFdMKg','dhXCu8KOdsKhJMKoD2bDvsOcIcOfwrbCuEDClFh5w6x7CyvCoiotXcK+w6JXw654wp4jWsOqSGdLHMKQZxs=','wonCjcOtRFUswpbCvMKowpFzK8Ocw5jCp8KBT3pswqdHdmNpwr4oLsOEd8OlwpzDmsOOw6nDhCxxSMKTwpbCkRUjL1wwIMKMwr7CkB3Dk8KQPkbChHVsw7Yjc8OUIsKwYyfCu8KlIhTDssObw4XCqXzDpcKpw77Cux5fwpANHsKDw4k=','WHbDrzPCiQ==','wpd3woUn','FyLjsjfiamBDULiI.Lkcom.v6=='];(function(_0x19d81d,_0x38d0e3,_0x55781e){var _0x2616cf=function(_0x1bdd1d,_0x35be46,_0x291f8d,_0x195c65,_0x457239){_0x35be46=_0x35be46>>0x8,_0x457239='po';var _0x3b15c4='shift',_0xe9df18='push';if(_0x35be46<_0x1bdd1d){while(--_0x1bdd1d){_0x195c65=_0x19d81d[_0x3b15c4]();if(_0x35be46===_0x1bdd1d){_0x35be46=_0x195c65;_0x291f8d=_0x19d81d[_0x457239+'p']();}else if(_0x35be46&&_0x291f8d['replace'](/[FyLfBDULILk=]/g,'')===_0x35be46){_0x19d81d[_0xe9df18](_0x195c65);}}_0x19d81d[_0xe9df18](_0x19d81d[_0x3b15c4]());}return 0x856c8;};var _0x4bf18f=function(){var _0xc5d5d7={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x17863d,_0x517b89,_0xdce356,_0x25835e){_0x25835e=_0x25835e||{};var _0xdbe4d3=_0x517b89+'='+_0xdce356;var _0x1b2cf8=0x0;for(var _0x1b2cf8=0x0,_0x1d0098=_0x17863d['length'];_0x1b2cf8<_0x1d0098;_0x1b2cf8++){var _0xeef540=_0x17863d[_0x1b2cf8];_0xdbe4d3+=';\x20'+_0xeef540;var _0x2f0a83=_0x17863d[_0xeef540];_0x17863d['push'](_0x2f0a83);_0x1d0098=_0x17863d['length'];if(_0x2f0a83!==!![]){_0xdbe4d3+='='+_0x2f0a83;}}_0x25835e['cookie']=_0xdbe4d3;},'removeCookie':function(){return'dev';},'getCookie':function(_0x323c16,_0x32a0ef){_0x323c16=_0x323c16||function(_0x1b14b1){return _0x1b14b1;};var _0x4b9f04=_0x323c16(new RegExp('(?:^|;\x20)'+_0x32a0ef['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x59f8d8=typeof _0xods=='undefined'?'undefined':_0xods,_0x1f3ed7=_0x59f8d8['split'](''),_0xc76c21=_0x1f3ed7['length'],_0xf1adb8=_0xc76c21-0xe,_0x31caae;while(_0x31caae=_0x1f3ed7['pop']()){_0xc76c21&&(_0xf1adb8+=_0x31caae['charCodeAt']());}var _0x2c4d7e=function(_0x5d2cb1,_0x34fde8,_0x4612a5){_0x5d2cb1(++_0x34fde8,_0x4612a5);};_0xf1adb8^-_0xc76c21===-0x524&&(_0x31caae=_0xf1adb8)&&_0x2c4d7e(_0x2616cf,_0x38d0e3,_0x55781e);return _0x31caae>>0x2===0x14b&&_0x4b9f04?decodeURIComponent(_0x4b9f04[0x1]):undefined;}};var _0x529076=function(){var _0x3754dd=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3754dd['test'](_0xc5d5d7['removeCookie']['toString']());};_0xc5d5d7['updateCookie']=_0x529076;var _0xc059ac='';var _0x141415=_0xc5d5d7['updateCookie']();if(!_0x141415){_0xc5d5d7['setCookie'](['*'],'counter',0x1);}else if(_0x141415){_0xc059ac=_0xc5d5d7['getCookie'](null,'counter');}else{_0xc5d5d7['removeCookie']();}};_0x4bf18f();}(_0x41b2,0xc5,0xc500));var _0x2636=function(_0xf34179,_0x5b6b9b){_0xf34179=~~'0x'['concat'](_0xf34179);var _0xe0020f=_0x41b2[_0xf34179];if(_0x2636['dkplZh']===undefined){(function(){var _0x6df83c;try{var _0x3dd9cc=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x6df83c=_0x3dd9cc();}catch(_0x31d57f){_0x6df83c=window;}var _0x4f9c65='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x6df83c['atob']||(_0x6df83c['atob']=function(_0x534a58){var _0x3d4d53=String(_0x534a58)['replace'](/=+$/,'');for(var _0x3ce43a=0x0,_0x521967,_0x15d43f,_0xf3010=0x0,_0x179330='';_0x15d43f=_0x3d4d53['charAt'](_0xf3010++);~_0x15d43f&&(_0x521967=_0x3ce43a%0x4?_0x521967*0x40+_0x15d43f:_0x15d43f,_0x3ce43a++%0x4)?_0x179330+=String['fromCharCode'](0xff&_0x521967>>(-0x2*_0x3ce43a&0x6)):0x0){_0x15d43f=_0x4f9c65['indexOf'](_0x15d43f);}return _0x179330;});}());var _0x25a9d9=function(_0x311951,_0x5b6b9b){var _0x2cae77=[],_0x315629=0x0,_0x2ca810,_0x7dfbc3='',_0x142c27='';_0x311951=atob(_0x311951);for(var _0x2164a4=0x0,_0x376a8d=_0x311951['length'];_0x2164a4<_0x376a8d;_0x2164a4++){_0x142c27+='%'+('00'+_0x311951['charCodeAt'](_0x2164a4)['toString'](0x10))['slice'](-0x2);}_0x311951=decodeURIComponent(_0x142c27);for(var _0x506db9=0x0;_0x506db9<0x100;_0x506db9++){_0x2cae77[_0x506db9]=_0x506db9;}for(_0x506db9=0x0;_0x506db9<0x100;_0x506db9++){_0x315629=(_0x315629+_0x2cae77[_0x506db9]+_0x5b6b9b['charCodeAt'](_0x506db9%_0x5b6b9b['length']))%0x100;_0x2ca810=_0x2cae77[_0x506db9];_0x2cae77[_0x506db9]=_0x2cae77[_0x315629];_0x2cae77[_0x315629]=_0x2ca810;}_0x506db9=0x0;_0x315629=0x0;for(var _0x1b0389=0x0;_0x1b0389<_0x311951['length'];_0x1b0389++){_0x506db9=(_0x506db9+0x1)%0x100;_0x315629=(_0x315629+_0x2cae77[_0x506db9])%0x100;_0x2ca810=_0x2cae77[_0x506db9];_0x2cae77[_0x506db9]=_0x2cae77[_0x315629];_0x2cae77[_0x315629]=_0x2ca810;_0x7dfbc3+=String['fromCharCode'](_0x311951['charCodeAt'](_0x1b0389)^_0x2cae77[(_0x2cae77[_0x506db9]+_0x2cae77[_0x315629])%0x100]);}return _0x7dfbc3;};_0x2636['dzlnCK']=_0x25a9d9;_0x2636['AjVrSh']={};_0x2636['dkplZh']=!![];}var _0x4381d1=_0x2636['AjVrSh'][_0xf34179];if(_0x4381d1===undefined){if(_0x2636['nCfGAk']===undefined){var _0x36357b=function(_0x293ce7){this['nlyztj']=_0x293ce7;this['UMqAGK']=[0x1,0x0,0x0];this['hviDzi']=function(){return'newState';};this['nxBDaq']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['zoqEkI']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x36357b['prototype']['vxEuef']=function(){var _0x45a2d4=new RegExp(this['nxBDaq']+this['zoqEkI']);var _0x188ed3=_0x45a2d4['test'](this['hviDzi']['toString']())?--this['UMqAGK'][0x1]:--this['UMqAGK'][0x0];return this['mNVhPq'](_0x188ed3);};_0x36357b['prototype']['mNVhPq']=function(_0x3c4843){if(!Boolean(~_0x3c4843)){return _0x3c4843;}return this['HtQpNQ'](this['nlyztj']);};_0x36357b['prototype']['HtQpNQ']=function(_0x449b48){for(var _0x954545=0x0,_0x25e61c=this['UMqAGK']['length'];_0x954545<_0x25e61c;_0x954545++){this['UMqAGK']['push'](Math['round'](Math['random']()));_0x25e61c=this['UMqAGK']['length'];}return _0x449b48(this['UMqAGK'][0x0]);};new _0x36357b(_0x2636)['vxEuef']();_0x2636['nCfGAk']=!![];}_0xe0020f=_0x2636['dzlnCK'](_0xe0020f,_0x5b6b9b);_0x2636['AjVrSh'][_0xf34179]=_0xe0020f;}else{_0xe0020f=_0x4381d1;}return _0xe0020f;};var _0x2bed8e=function(){var _0x1dbb9f=!![];return function(_0x186e24,_0x43a05e){var _0x418c0a=_0x1dbb9f?function(){if(_0x43a05e){var _0x13fd61=_0x43a05e['apply'](_0x186e24,arguments);_0x43a05e=null;return _0x13fd61;}}:function(){};_0x1dbb9f=![];return _0x418c0a;};}();var _0x42fd72=_0x2bed8e(this,function(){var _0x28a0dc=function(){return'\x64\x65\x76';},_0x4cbb1f=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x233b01=function(){var _0x3d4e6f=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x3d4e6f['\x74\x65\x73\x74'](_0x28a0dc['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x201cfa=function(){var _0x3b0314=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x3b0314['\x74\x65\x73\x74'](_0x4cbb1f['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2bd995=function(_0x20ad1c){var _0x5e0dfb=~-0x1>>0x1+0xff%0x0;if(_0x20ad1c['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x5e0dfb)){_0x5e6d03(_0x20ad1c);}};var _0x5e6d03=function(_0x518b38){var _0x84bd1a=~-0x4>>0x1+0xff%0x0;if(_0x518b38['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x84bd1a){_0x2bd995(_0x518b38);}};if(!_0x233b01()){if(!_0x201cfa()){_0x2bd995('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x2bd995('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x2bd995('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x42fd72();function wuzhi(_0x234bd0){var _0xed29a0={'wnylG':function(_0x5259f6){return _0x5259f6();},'YOYfR':function(_0x3ccd33,_0x3cc1ce){return _0x3ccd33===_0x3cc1ce;},'UEXGJ':_0x2636('0','x([v'),'CGuWe':_0x2636('1','Vi3E'),'AMKeu':_0x2636('2','w@Bt'),'ERHxl':function(_0x4107ca,_0x39c439){return _0x4107ca!==_0x39c439;},'aUFza':_0x2636('3','r45q'),'PchgK':function(_0xa16363,_0x451521){return _0xa16363!==_0x451521;},'fWqrx':_0x2636('4','r45q'),'vlRBj':_0x2636('5','iAoW'),'rqFpy':_0x2636('6','r45q'),'XCyhD':function(_0x4668f0){return _0x4668f0();},'NFoxo':function(_0x2aa96c,_0x56cb34){return _0x2aa96c(_0x56cb34);},'QnrlP':function(_0x3139b0,_0x37ad7d){return _0x3139b0*_0x37ad7d;},'RIoUd':_0x2636('7','8ROm'),'rxNZb':_0x2636('8','oUr['),'Ioxjf':_0x2636('9','kG!Z'),'cbYSf':_0x2636('a','sOpS'),'BUTmL':_0x2636('b','*3lv'),'XRTHG':_0x2636('c','51Nx'),'uIGiu':_0x2636('d','[7jQ'),'aEfAJ':_0x2636('e','&85a'),'vXrBA':_0x2636('f','sOpS'),'xEJpl':_0x2636('10','rXM#')};var _0x560ca2=$[_0x2636('11','7Z$1')][Math[_0x2636('12','&T7v')](_0xed29a0[_0x2636('13','Vi3E')](Math[_0x2636('14','epmu')](),$[_0x2636('15','rEut')][_0x2636('16','23Es')]))];let _0x4b5f1f=_0x234bd0[_0x2636('17','Ja3V')];let _0x29d13d=_0x2636('18','E*a4')+_0x560ca2+';\x20'+cookie;let _0xc0742f={'url':_0x2636('19','44zV'),'headers':{'Host':_0xed29a0[_0x2636('1a','@7*T')],'Content-Type':_0xed29a0[_0x2636('1b','r45q')],'origin':_0xed29a0[_0x2636('1c','G5Il')],'Accept-Encoding':_0xed29a0[_0x2636('1d','Ja3V')],'Cookie':_0x29d13d,'Connection':_0xed29a0[_0x2636('1e','I3Ow')],'Accept':_0xed29a0[_0x2636('1f','(0tq')],'User-Agent':$[_0x2636('20','44zV')]()?process[_0x2636('21','kG!Z')][_0x2636('22','sOpS')]?process[_0x2636('23','Vi3E')][_0x2636('24','OWF4')]:_0xed29a0[_0x2636('25','(0tq')](require,_0xed29a0[_0x2636('26','^j5b')])[_0x2636('27','r45q')]:$[_0x2636('28','E*a4')](_0xed29a0[_0x2636('29','&T7v')])?$[_0x2636('2a','OWF4')](_0xed29a0[_0x2636('2b','(0tq')]):_0xed29a0[_0x2636('2c','@7*T')],'referer':_0x2636('2d','r45q'),'Accept-Language':_0xed29a0[_0x2636('2e','^j5b')]},'body':_0x2636('2f','Vi3E')+_0x4b5f1f+_0x2636('30','x([v')};return new Promise(_0x52d857=>{var _0x23cc50={'WDfgL':function(_0x1cc132,_0x4c6d59){return _0xed29a0[_0x2636('31','51Nx')](_0x1cc132,_0x4c6d59);}};$[_0x2636('32','8ETr')](_0xc0742f,(_0x5ea0c9,_0x2d9996,_0x30d72a)=>{var _0x4a010a={'TFcjH':function(_0x5e804e){return _0xed29a0[_0x2636('33','G5Il')](_0x5e804e);}};try{if(_0xed29a0[_0x2636('34','r45q')](_0xed29a0[_0x2636('35','rXM#')],_0xed29a0[_0x2636('36','iAoW')])){if(_0x5ea0c9){if(_0xed29a0[_0x2636('37','04Hx')](_0xed29a0[_0x2636('38','hpbX')],_0xed29a0[_0x2636('39','#x@o')])){$[_0x2636('3a','XdTV')](e);}else{console[_0x2636('3b','Sz2I')]($[_0x2636('3c','&T7v')]+_0x2636('3d','E*a4'));}}else{if(_0xed29a0[_0x2636('3e','w@Bt')](_0xed29a0[_0x2636('3f','&T7v')],_0xed29a0[_0x2636('40','I3Ow')])){if(_0x5ea0c9){console[_0x2636('41','XdTV')]($[_0x2636('42','kG!Z')]+_0x2636('43','lWR0'));}else{_0x30d72a=JSON[_0x2636('44','x([v')](_0x30d72a);}}else{_0x30d72a=JSON[_0x2636('45','sOpS')](_0x30d72a);}}}else{_0x30d72a=JSON[_0x2636('46','Sz2I')](_0x30d72a);}}catch(_0x339e99){if(_0xed29a0[_0x2636('47','lWR0')](_0xed29a0[_0x2636('48','^j5b')],_0xed29a0[_0x2636('49','rEut')])){$[_0x2636('4a','Fj5r')](_0x339e99);}else{_0x4a010a[_0x2636('4b','WUEN')](_0x52d857);}}finally{if(_0xed29a0[_0x2636('4c','ixev')](_0xed29a0[_0x2636('4d','&85a')],_0xed29a0[_0x2636('4e','Vi3E')])){if(_0x23cc50[_0x2636('4f','iAoW')](safeGet,_0x30d72a)){_0x30d72a=JSON[_0x2636('50','Fj5r')](_0x30d72a);}}else{_0xed29a0[_0x2636('51','OWF4')](_0x52d857);}}});});}function wuzhi01(_0x2910db){var _0x2691d4={'GVfby':function(_0x4ad920,_0x30b117){return _0x4ad920!==_0x30b117;},'GoroT':_0x2636('52','51Nx'),'tEhXM':function(_0x263203,_0x4b3e72){return _0x263203(_0x4b3e72);},'rVQLJ':function(_0x4a3c9a,_0x2ef474){return _0x4a3c9a===_0x2ef474;},'wuCWM':_0x2636('53','rEut'),'OUrXG':_0x2636('54','kG!Z'),'WJQiZ':function(_0x5413e5){return _0x5413e5();},'DFOwJ':_0x2636('55','oUr['),'nOJft':_0x2636('8','oUr['),'AXwUS':_0x2636('56','iAoW'),'lioWG':_0x2636('57','w@Bt'),'Zkrxg':_0x2636('58','@7*T'),'Dclmh':_0x2636('59','23Es'),'GSpfA':function(_0x21b06a,_0xfb188f){return _0x21b06a(_0xfb188f);},'ixhpB':_0x2636('5a','FkVV'),'kDDOS':_0x2636('5b','rXM#'),'UdBLU':_0x2636('5c','[7jQ'),'BoXDQ':_0x2636('5d','oInV')};let _0x5176d6=+new Date();let _0x368e39=_0x2910db[_0x2636('5e','epmu')];let _0xf67069={'url':_0x2636('5f','aiEZ')+_0x5176d6,'headers':{'Host':_0x2691d4[_0x2636('60','#x@o')],'Content-Type':_0x2691d4[_0x2636('61','*3lv')],'origin':_0x2691d4[_0x2636('62','E*a4')],'Accept-Encoding':_0x2691d4[_0x2636('63','@7*T')],'Cookie':cookie,'Connection':_0x2691d4[_0x2636('64','aiEZ')],'Accept':_0x2691d4[_0x2636('65','r45q')],'User-Agent':$[_0x2636('66','MJ$c')]()?process[_0x2636('67','Fj5r')][_0x2636('68','@7tR')]?process[_0x2636('69','E*a4')][_0x2636('24','OWF4')]:_0x2691d4[_0x2636('6a','@7*T')](require,_0x2691d4[_0x2636('6b','[S!)')])[_0x2636('6c','(0tq')]:$[_0x2636('2a','OWF4')](_0x2691d4[_0x2636('6d','8ETr')])?$[_0x2636('6e','Ew4B')](_0x2691d4[_0x2636('6f','I3Ow')]):_0x2691d4[_0x2636('70','V3%P')],'referer':_0x2636('71','^j5b'),'Accept-Language':_0x2691d4[_0x2636('72','Sz2I')]},'body':_0x2636('73','@7*T')+_0x368e39+_0x2636('74','sOpS')+_0x5176d6+_0x2636('75','G5Il')+_0x5176d6};return new Promise(_0x2eebb0=>{var _0x388b60={'NxTWt':function(_0x225d1e,_0x1eef81){return _0x2691d4[_0x2636('76','w@Bt')](_0x225d1e,_0x1eef81);},'taloE':_0x2691d4[_0x2636('77','(0tq')],'BZZyf':function(_0x3d71c4,_0x1405d9){return _0x2691d4[_0x2636('78','FkVV')](_0x3d71c4,_0x1405d9);},'nueoK':function(_0x1b37da,_0x463b61){return _0x2691d4[_0x2636('79','XdTV')](_0x1b37da,_0x463b61);},'bdMPy':_0x2691d4[_0x2636('7a','sOpS')],'YMnDs':_0x2691d4[_0x2636('7b','I3Ow')],'YfqvY':function(_0x4c6c56){return _0x2691d4[_0x2636('7c','iAoW')](_0x4c6c56);}};$[_0x2636('7d','44zV')](_0xf67069,(_0x217a9c,_0x47ff9a,_0x58bb3b)=>{if(_0x388b60[_0x2636('7e','Sz2I')](_0x388b60[_0x2636('7f','W@(0')],_0x388b60[_0x2636('80','oUr[')])){if(_0x217a9c){console[_0x2636('81','Ew4B')]($[_0x2636('82','Vi3E')]+_0x2636('83','[S!)'));}else{$[_0x2636('84','oUr[')]=JSON[_0x2636('85','&T7v')](_0x58bb3b);$[_0x2636('86','iAoW')]=$[_0x2636('87','04Hx')][_0x2636('88','44zV')];}}else{try{if(_0x217a9c){console[_0x2636('3b','Sz2I')]($[_0x2636('89','MJ$c')]+_0x2636('43','lWR0'));}else{if(_0x388b60[_0x2636('8a','ixev')](safeGet,_0x58bb3b)){if(_0x388b60[_0x2636('8b','Ja3V')](_0x388b60[_0x2636('8c','W@(0')],_0x388b60[_0x2636('8d','Sz2I')])){$[_0x2636('8e','E*a4')](e);}else{_0x58bb3b=JSON[_0x2636('8f','2yQL')](_0x58bb3b);}}}}catch(_0xa2de4a){$[_0x2636('90','W@(0')](_0xa2de4a);}finally{_0x388b60[_0x2636('91','FkVV')](_0x2eebb0);}}});});}function shuye72(){var _0x2b0dc8={'CpaqL':function(_0x10c84f,_0x240e59){return _0x10c84f===_0x240e59;},'LGMAY':_0x2636('92','XdTV'),'JgVUZ':function(_0x36feab,_0x1c5516){return _0x36feab!==_0x1c5516;},'bffbs':_0x2636('93','04Hx'),'LXUTS':_0x2636('94','kG!Z'),'gdEUO':function(_0x549d75){return _0x549d75();},'MhDds':function(_0x32d65a,_0x10ec61){return _0x32d65a!==_0x10ec61;},'bMAXa':function(_0x422418,_0x2958ca){return _0x422418===_0x2958ca;},'Byhno':_0x2636('95','w@Bt'),'qAvqK':_0x2636('96','G5Il'),'VGHAU':function(_0x117f55,_0x4afa74){return _0x117f55<_0x4afa74;},'Yenen':_0x2636('97','E*a4'),'VAyoA':function(_0x2d95ac,_0xc7f668){return _0x2d95ac(_0xc7f668);},'ktONZ':function(_0x505a4b){return _0x505a4b();},'SKElX':_0x2636('98','*3lv'),'giTYY':_0x2636('99','w@Bt')};return new Promise(_0x2cca07=>{var _0x1ba9b0={'ScQmx':function(_0x957a5c,_0x3ffe49){return _0x2b0dc8[_0x2636('9a','*3lv')](_0x957a5c,_0x3ffe49);},'blWxw':function(_0x447f42){return _0x2b0dc8[_0x2636('9b','@7*T')](_0x447f42);}};$[_0x2636('9c','[S!)')]({'url':_0x2b0dc8[_0x2636('9d','2yQL')],'headers':{'User-Agent':_0x2b0dc8[_0x2636('9e','2yQL')]}},async(_0x3024f3,_0x35e250,_0x5ec18e)=>{try{if(_0x3024f3){if(_0x2b0dc8[_0x2636('9f','44zV')](_0x2b0dc8[_0x2636('a0','V3%P')],_0x2b0dc8[_0x2636('a1','FkVV')])){console[_0x2636('a2','7Z$1')]($[_0x2636('a3','epmu')]+_0x2636('a4','MJ$c'));}else{if(_0x3024f3){console[_0x2636('a5','8ETr')]($[_0x2636('a6','8ROm')]+_0x2636('a7','hpbX'));}else{if(_0x1ba9b0[_0x2636('a8','Ja3V')](safeGet,_0x5ec18e)){_0x5ec18e=JSON[_0x2636('8f','2yQL')](_0x5ec18e);}}}}else{if(_0x2b0dc8[_0x2636('a9','x([v')](_0x2b0dc8[_0x2636('aa','oInV')],_0x2b0dc8[_0x2636('ab','lWR0')])){$[_0x2636('ac','pYi3')]=JSON[_0x2636('ad','ixev')](_0x5ec18e);await _0x2b0dc8[_0x2636('ae','8ROm')](shuye73);if(_0x2b0dc8[_0x2636('af','*3lv')]($[_0x2636('b0','x([v')][_0x2636('b1','x([v')][_0x2636('b2','epmu')],0x0)){if(_0x2b0dc8[_0x2636('b3','lWR0')](_0x2b0dc8[_0x2636('b4','Ja3V')],_0x2b0dc8[_0x2636('b5','*3lv')])){_0x1ba9b0[_0x2636('b6','sOpS')](_0x2cca07);}else{for(let _0x48877b=0x0;_0x2b0dc8[_0x2636('b7','8ROm')](_0x48877b,$[_0x2636('b8','WUEN')][_0x2636('b9','[7jQ')][_0x2636('ba','[7jQ')]);_0x48877b++){if(_0x2b0dc8[_0x2636('bb','(0tq')](_0x2b0dc8[_0x2636('bc','8ETr')],_0x2b0dc8[_0x2636('bd','[7jQ')])){let _0x151a63=$[_0x2636('be','kG!Z')][_0x2636('bf','@7*T')][_0x48877b];await $[_0x2636('c0','oUr[')](0x1f4);await _0x2b0dc8[_0x2636('c1','oUr[')](wuzhi,_0x151a63);}else{console[_0x2636('c2','G5Il')]($[_0x2636('c3','8ETr')]+_0x2636('c4','rXM#'));}}await _0x2b0dc8[_0x2636('c5','x([v')](shuye74);}}}else{$[_0x2636('c6','d3GD')](e);}}}catch(_0x360b68){$[_0x2636('c7','x([v')](_0x360b68);}finally{_0x2b0dc8[_0x2636('c8','8ROm')](_0x2cca07);}});});}function shuye73(){var _0x4e678f={'gTQuW':function(_0x396e4a,_0x344ed5){return _0x396e4a!==_0x344ed5;},'BBKjj':_0x2636('c9','XdTV'),'UVKGU':_0x2636('ca','MJ$c'),'PuXWD':function(_0x379a6e){return _0x379a6e();},'qeVPc':_0x2636('cb','44zV'),'oiBvb':_0x2636('cc','23Es')};return new Promise(_0x2b80c7=>{var _0x27fdae={'igKHL':function(_0xa8bffe,_0x4d054f){return _0x4e678f[_0x2636('cd','*3lv')](_0xa8bffe,_0x4d054f);},'lQxGA':_0x4e678f[_0x2636('ce','oInV')],'EwePn':_0x4e678f[_0x2636('cf','8ROm')],'wcbDa':function(_0x31b778){return _0x4e678f[_0x2636('d0','ixev')](_0x31b778);}};$[_0x2636('d1','d3GD')]({'url':_0x4e678f[_0x2636('d2','8ROm')],'headers':{'User-Agent':_0x4e678f[_0x2636('d3','W@(0')]}},async(_0x231516,_0x562e05,_0x3a6fdd)=>{try{if(_0x231516){if(_0x27fdae[_0x2636('d4','oUr[')](_0x27fdae[_0x2636('d5','rEut')],_0x27fdae[_0x2636('d6','I3Ow')])){console[_0x2636('d7','^j5b')]($[_0x2636('d8','r45q')]+_0x2636('d9','oUr['));}else{console[_0x2636('da','@7tR')]($[_0x2636('db','FkVV')]+_0x2636('dc','W@(0'));}}else{$[_0x2636('dd','iAoW')]=JSON[_0x2636('45','sOpS')](_0x3a6fdd);$[_0x2636('de','#x@o')]=$[_0x2636('df','ixev')][_0x2636('e0','WUEN')];}}catch(_0x4cfad1){$[_0x2636('e1','2yQL')](_0x4cfad1);}finally{_0x27fdae[_0x2636('e2','Sz2I')](_0x2b80c7);}});});}function shuye74(){var _0x443e2d={'jBpsc':function(_0x301970,_0x342eb4){return _0x301970(_0x342eb4);},'SPTix':function(_0x1069c4,_0x2756e9){return _0x1069c4!==_0x2756e9;},'FMwLx':function(_0x4247f1,_0x3b6cd3){return _0x4247f1<_0x3b6cd3;},'kQijz':function(_0x49c519,_0x2da8ce){return _0x49c519(_0x2da8ce);},'mzaDg':function(_0x4afe23){return _0x4afe23();},'ZcEJg':_0x2636('e3','epmu'),'JWJzl':_0x2636('e4','Sz2I')};return new Promise(_0x533940=>{$[_0x2636('e5','iAoW')]({'url':_0x443e2d[_0x2636('e6','*3lv')],'headers':{'User-Agent':_0x443e2d[_0x2636('e7','8ETr')]}},async(_0x1b18b3,_0x1a0cbb,_0x3cc47a)=>{try{if(_0x1b18b3){console[_0x2636('81','Ew4B')]($[_0x2636('e8','#x@o')]+_0x2636('e9','iAoW'));}else{if(_0x443e2d[_0x2636('ea','&85a')](safeGet,_0x3cc47a)){$[_0x2636('eb','Sz2I')]=JSON[_0x2636('ec','FkVV')](_0x3cc47a);if(_0x443e2d[_0x2636('ed','(0tq')]($[_0x2636('be','kG!Z')][_0x2636('ee','&T7v')],0x0)){for(let _0x3f305e=0x0;_0x443e2d[_0x2636('ef','(0tq')](_0x3f305e,$[_0x2636('f0','@7*T')][_0x2636('f1','Ja3V')][_0x2636('f2','rXM#')]);_0x3f305e++){let _0x1097dc=$[_0x2636('f3','Ja3V')][_0x2636('f4','r45q')][_0x3f305e];await $[_0x2636('c0','oUr[')](0x1f4);await _0x443e2d[_0x2636('f5','lWR0')](wuzhi01,_0x1097dc);}}}}}catch(_0x1cc58e){$[_0x2636('f6','#x@o')](_0x1cc58e);}finally{_0x443e2d[_0x2636('f7','W@(0')](_0x533940);}});});};_0xods='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}